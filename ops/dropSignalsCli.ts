import { readFileSync } from 'node:fs';
import { countWithoutTake, parseSweep, send, type DropItem } from './dropSignals.ts';

/// `pnpm signals:drop --file sweep.json [--dry-run]`
///
/// The thin shell around dropSignals.ts. Split so importing the parser for a
/// test does not run a network call, the same reason emit.ts and version.ts are
/// separate in the generator.

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  const next = process.argv[i + 1];
  return i >= 0 && next && !next.startsWith('--') ? next : undefined;
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main(): Promise<void> {
  const file = arg('file');
  const raw = file ? readFileSync(file, 'utf8') : await readStdin();

  let items: DropItem[];
  try {
    items = parseSweep(raw);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }

  const withoutTake = countWithoutTake(items);
  if (withoutTake > 0) console.error(`note: ${withoutTake} of ${items.length} have no take`);

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ signals: items }, null, 2));
    console.log(`\n${items.length} signal(s) would be sent. Nothing was posted.`);
    return;
  }

  const token = process.env.KARWAN_INGEST_TOKEN;
  if (!token) {
    console.error('KARWAN_INGEST_TOKEN is not set. It is the write-only token for the pipeline.');
    process.exit(1);
  }

  const result = await send(items, {
    backendUrl: process.env.KARWAN_BACKEND_URL ?? 'https://api.karwan.site',
    token,
  });

  console.log(`${result.added} added, ${result.duplicate} already known`);
  for (const r of result.results) {
    const state = r.duplicate ? (r.merged ? 'merged' : 'known') : 'added';
    console.log(`  ${state.padEnd(6)} ${r.title}`);
  }
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});
