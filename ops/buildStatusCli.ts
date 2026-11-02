/// Writes canon/team/roadmap/current-build.md from the Karwan repo beside this one.
///
///   pnpm status:sync --deployed "API e748f8f on testnet and mainnet."
///
/// Then `pnpm generate`, commit, and the published image carries it to the team.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderBuildStatus } from './buildStatus.js';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};

const deployed = flag('deployed');
if (!deployed) {
  console.error('--deployed is required: say what is running now, read from the servers.');
  process.exit(1);
}

const karwan = resolve(flag('karwan') ?? '../karwan');
const out = resolve('canon/team/roadmap/current-build.md');

writeFileSync(
  out,
  renderBuildStatus({
    date: flag('date') ?? new Date().toISOString().slice(0, 10),
    deployed,
    roadmap: readFileSync(resolve(karwan, 'docs/ROADMAP.md'), 'utf8'),
    flowView: readFileSync(resolve(karwan, 'docs/architecture/44-one-product-flow.md'), 'utf8'),
  }),
);
console.log(`wrote ${out}`);
