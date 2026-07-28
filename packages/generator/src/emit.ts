import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadCanon, REPO_ROOT } from '@karwan/canon-schema';
import { buildPublicSnapshot, serialisePublicSnapshot } from './publicBundle.ts';
import { generateAllSkills, type SkillRole } from './skills.ts';
import { selectCanon } from './select.ts';
import { canonVersion } from './version.ts';

/// `pnpm generate`
///
/// Writes the skill bundles from the canon. Nothing here is hand editable: the
/// output directory is wiped and rebuilt every run, so an edit made in `dist/`
/// is gone at the next generate. That is the point. A bundle that can be edited
/// by hand is a bundle that drifts.
///
/// It also writes the public snapshot, and that one lands in the public kit's
/// own directory rather than dist/ because it is not build output, it is the
/// package's data. It is committed, it is reviewable in a diff, and it is the
/// only canon a published public package contains.

const OUT_ROOT = join(REPO_ROOT, 'dist');
const PUBLIC_SNAPSHOT = join(REPO_ROOT, 'packages', 'public-kit', 'canon.public.json');

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
  const generated = generateAllSkills(files, { canonVersion: version }, (role: SkillRole) =>
    role === 'public'
      ? selectCanon(files, { visibility: 'public' })
      : selectCanon(files, { visibility: 'team', role }),
  );

  rmSync(join(OUT_ROOT, 'skills'), { recursive: true, force: true });
  for (const file of generated) {
    const target = join(OUT_ROOT, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content, 'utf8');
  }

  const snapshot = buildPublicSnapshot(files, { canonVersion: version });
  writeFileSync(PUBLIC_SNAPSHOT, serialisePublicSnapshot(snapshot), 'utf8');

  console.log(`canon ${version}: wrote ${generated.length} files to dist/`);
  for (const file of generated) console.log(`  ${file.path}`);
  console.log(
    `  packages/public-kit/canon.public.json (${snapshot.docs.length} public docs, canon updated ${snapshot.canonUpdated})`,
  );
}

main();
