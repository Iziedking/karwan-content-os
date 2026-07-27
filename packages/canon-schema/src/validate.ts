import { loadCanon } from './load.ts';
import { blocking, loadSnapshot, runChecks } from './checks.ts';
import { isPublishable } from './schema.ts';

/// `pnpm canon:validate`
///
/// Reports every problem in one pass rather than making an author fix one and
/// re-run to find the next. Exits non-zero when anything blocks.

const { files, issues } = loadCanon();
const snapshot = loadSnapshot();
const results = runChecks(files, snapshot);
const blocked = blocking(results);
const stale = results.filter((r) => r.status === 'stale');

const publicFiles = files.filter((f) => f.frontmatter.visibility === 'public');
const teamFiles = files.filter((f) => f.frontmatter.visibility === 'team');
const capabilities = files.filter((f) => f.frontmatter.capability);
const publishable = files.filter((f) => isPublishable(f));

console.log(`canon: ${files.length} files  (${publicFiles.length} public, ${teamFiles.length} team)`);
console.log(`capability claims: ${capabilities.length}  ·  checks run: ${results.length}`);
console.log(
  snapshot
    ? `snapshot: ${snapshot.commit} (${snapshot.environment}) from ${snapshot.generatedAt}`
    : 'snapshot: NONE. Every machine check reads as unproven.',
);
console.log(`publishable as shipped: ${publishable.length}\n`);

if (issues.length > 0) {
  console.log(`SCHEMA (${issues.length})`);
  for (const issue of issues) console.log(`  ${issue.path}\n    ${issue.message}`);
  console.log('');
}

if (blocked.length > 0) {
  console.log(`CHECKS FAILING (${blocked.length})`);
  for (const r of blocked) console.log(`  ${r.path}  [${r.status}]\n    ${r.message}`);
  console.log('');
}

if (stale.length > 0) {
  console.log(`STALE, not blocking the build but barred from content (${stale.length})`);
  for (const r of stale) console.log(`  ${r.path}\n    ${r.message}`);
  console.log('');
}

const failed = issues.length > 0 || blocked.length > 0;
console.log(failed ? 'canon:validate FAILED' : 'canon:validate ok');
process.exit(failed ? 1 : 0);
