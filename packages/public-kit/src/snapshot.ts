import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PublicSnapshot } from '@karwan/generator';

/// The one file this package reads.
///
/// It sits inside the package, not in the repo's canon directory, and that is
/// the point: `canon/team` is not reachable from here by any path, so no future
/// tool added to the public surface can serve it by accident. Resolved relative
/// to this module so it works the same from a checkout and from node_modules.
///
/// Note there is no filter here. A filter is a thing you can forget to apply.

const SNAPSHOT_PATH = fileURLToPath(new URL('../canon.public.json', import.meta.url));

let cached: PublicSnapshot | null = null;

export function snapshot(): PublicSnapshot {
  if (cached) return cached;

  let raw: string;
  try {
    raw = readFileSync(SNAPSHOT_PATH, 'utf8');
  } catch {
    throw new Error(
      'the public canon snapshot is missing. Run `pnpm generate` and commit packages/public-kit/canon.public.json',
    );
  }

  const parsed = JSON.parse(raw) as PublicSnapshot;
  if (!Array.isArray(parsed.docs) || !Array.isArray(parsed.facts)) {
    throw new Error('the public canon snapshot is malformed. Run `pnpm generate` to rebuild it');
  }

  cached = parsed;
  return parsed;
}

export const SNAPSHOT_FILE = SNAPSHOT_PATH;
