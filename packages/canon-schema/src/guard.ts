import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCanon, REPO_ROOT } from './load.ts';

/// `pnpm canon:guard`
///
/// The leak guard. Enforced by a build step, not by care.
///
/// Three separate failures it has to catch, because they are different
/// mistakes:
///
///   1. A team file that declares itself public, or sits in the wrong tree. The
///      loader already rejects a mismatch, so this asserts the tree is clean.
///   2. Team CONTENT reachable from a public file. A public file that quotes an
///      internal number, or references a team id, has leaked it just as surely
///      as if the file itself were public.
///   3. Team content in the committed public snapshot, which is the file the
///      public kit and the public MCP ship. The canon can be clean while the
///      artifact cut from it is not, if the cut went wrong.
///
/// Anything a public export can reach is public. That is the whole rule.

const PUBLIC_SNAPSHOT = join(REPO_ROOT, 'packages', 'public-kit', 'canon.public.json');

const { files, issues } = loadCanon();

const publicFiles = files.filter((f) => f.frontmatter.visibility === 'public');
const teamFiles = files.filter((f) => f.frontmatter.visibility === 'team');
const teamIds = new Set(teamFiles.map((f) => f.frontmatter.id));

const leaks: string[] = [];

// 1. Tree hygiene.
for (const file of files) {
  const underPublic = file.path.startsWith('public/');
  if (underPublic && file.frontmatter.visibility !== 'public') {
    leaks.push(`${file.path}: sits under canon/public but is not public`);
  }
  if (!underPublic && file.frontmatter.visibility === 'public') {
    leaks.push(`${file.path}: declares itself public but sits outside canon/public`);
  }
}

// 2. Public files must not reference a team id.
for (const file of publicFiles) {
  const haystack = `${file.body}\n${JSON.stringify(file.frontmatter)}`;
  for (const id of teamIds) {
    // Word-boundary match so a public id that merely contains a team id as a
    // substring does not trip the guard.
    if (new RegExp(`(^|[^a-z0-9-])${id}([^a-z0-9-]|$)`).test(haystack)) {
      leaks.push(`${file.path}: references team fact "${id}"`);
    }
  }
}

// 3. Nothing in a public file should look like a secret. Cheap, blunt, and it
// has to be here rather than in review, because review is where this gets
// missed.
const SECRET_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: 'private key', re: /\b0x[a-fA-F0-9]{64}\b/ },
  { label: 'bearer-ish token', re: /\b(sk|pk|api[_-]?key|secret)[_-]?[a-zA-Z0-9]{16,}\b/i },
  { label: 'postgres url', re: /postgres(ql)?:\/\/[^\s`)]+/i },
];
for (const file of publicFiles) {
  for (const { label, re } of SECRET_PATTERNS) {
    if (re.test(file.body)) leaks.push(`${file.path}: looks like it contains a ${label}`);
  }
}

// 4. The shipped artifact. Checked against the same team ids, plus whole
// sentences: a paragraph copied across carries the content even when the id
// never does.
if (!existsSync(PUBLIC_SNAPSHOT)) {
  leaks.push('packages/public-kit/canon.public.json is missing. Run `pnpm generate`');
} else {
  // Flatten the JSON's escaped newlines before comparing. The canon is hard
  // wrapped, so almost every sentence spans lines in the source and appears as
  // `\n` in the snapshot. Without this the sentence check would pass on
  // everything and look like coverage it does not have.
  const raw = readFileSync(PUBLIC_SNAPSHOT, 'utf8');
  const snapshot = raw.replace(/\\n/g, ' ').replace(/\s+/g, ' ');
  for (const file of teamFiles) {
    if (snapshot.includes(file.frontmatter.id)) {
      leaks.push(`public snapshot: contains team fact "${file.frontmatter.id}"`);
    }
    for (const sentence of file.body.split(/(?<=[.!?])\s+/)) {
      const line = sentence.replace(/\s+/g, ' ').trim();
      if (line.length < 60) continue;
      if (snapshot.includes(line)) {
        leaks.push(`public snapshot: contains a sentence from ${file.path}`);
        break;
      }
    }
  }
}

console.log(`guard: ${publicFiles.length} public, ${teamFiles.length} team`);

if (issues.length > 0) {
  console.log(`\ncanon does not parse cleanly (${issues.length}); run canon:validate`);
}
if (leaks.length > 0) {
  console.log(`\nLEAKS (${leaks.length})`);
  for (const leak of leaks) console.log(`  ${leak}`);
}

const failed = leaks.length > 0 || issues.length > 0;
console.log(failed ? '\ncanon:guard FAILED' : '\ncanon:guard ok');
process.exit(failed ? 1 : 0);
