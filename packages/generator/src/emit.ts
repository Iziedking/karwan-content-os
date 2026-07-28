import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadCanon, REPO_ROOT } from '@karwan/canon-schema';
import { generateAllSkills } from './skills.ts';
import { selectCanon, type Role } from './select.ts';
import { canonVersion } from './version.ts';

/// `pnpm generate`
///
/// Writes the skill bundles from the canon. Nothing here is hand editable: the
/// output directory is wiped and rebuilt every run, so an edit made in `dist/`
/// is gone at the next generate. That is the point. A bundle that can be edited
/// by hand is a bundle that drifts.

const OUT_ROOT = join(REPO_ROOT, 'dist');

function main(): void {
  const { files, issues } = loadCanon();

  // Refuse to generate from a canon that does not parse. Half a canon produces
  // a bundle that looks complete and quietly omits whatever failed to load,
  // which is worse than no bundle.
  if (issues.length > 0) {
    console.error(`canon does not parse cleanly (${issues.length} issues). Run canon:validate.`);
    for (const issue of issues.slice(0, 10)) console.error(`  ${issue.path}: ${issue.message}`);
    process.exit(1);
  }

  const version = canonVersion();
  const generated = generateAllSkills(files, { canonVersion: version }, (role: Role) =>
    selectCanon(files, { visibility: 'team', role }),
  );

  rmSync(join(OUT_ROOT, 'skills'), { recursive: true, force: true });
  for (const file of generated) {
    const target = join(OUT_ROOT, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content, 'utf8');
  }

  console.log(`canon ${version}: wrote ${generated.length} files to dist/`);
  for (const file of generated) console.log(`  ${file.path}`);
}

main();
