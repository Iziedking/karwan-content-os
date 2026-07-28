import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '@karwan/canon-schema';

/// The canon's version, read from the canon-schema package.
///
/// One source. The plan puts semver on the canon package, so everything that
/// stamps a version, the generated bundles, the MCP, the kit, reads it from
/// here rather than carrying its own copy to drift.
///
/// Its own module rather than living in emit.ts, because emit.ts generates on
/// import and importing a file for one function should not write to disk.
export function canonVersion(): string {
  const pkg = JSON.parse(
    readFileSync(join(REPO_ROOT, 'packages', 'canon-schema', 'package.json'), 'utf8'),
  ) as { version?: string };
  return pkg.version ?? '0.0.0';
}
