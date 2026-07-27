import { loadCanon } from './load.ts';

/// `pnpm canon:guard`
///
/// The leak guard. Enforced by a build step, not by care.
///
/// Two separate failures it has to catch, because they are different mistakes:
///
///   1. A team file that declares itself public, or sits in the wrong tree. The
///      loader already rejects a mismatch, so this asserts the tree is clean.
///   2. Team CONTENT reachable from a public file. A public file that quotes an
///      internal number, or references a team id, has leaked it just as surely
///      as if the file itself were public.
///
/// Anything a public export can reach is public. That is the whole rule.

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
