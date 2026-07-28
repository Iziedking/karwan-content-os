/// Post swept signals into Karwan's pipeline.
///
/// The Arc and Circle sources cannot be polled from the backend: both MCPs are
/// documentation search with no changelog and no dates, and they run in an
/// operator's editor rather than anywhere the container can reach. So the sweep
/// runs where the tools live and posts its findings here.
///
/// A script rather than a curl in a prompt, because the agent doing the sweep
/// should be spending its attention on what changed and why it matters, not on
/// escaping quotes inside a JSON body. Input arrives as a file or on stdin, so
/// nothing has to survive a shell.
///
///   pnpm signals:drop --file sweep.json
///   pnpm signals:drop --file sweep.json --dry-run

export type Origin = 'arc' | 'circle';
export type Importance = 'low' | 'normal' | 'high';

export interface DropItem {
  origin: Origin;
  source: string;
  title: string;
  url?: string;
  publishedOn?: string;
  summary?: string;
  rawExcerpt?: string;
  myTake?: string;
  tags?: string[];
  importance?: Importance;
  externalId?: string;
}

export class InvalidSweep extends Error {}

/// Validate here as well as at the endpoint.
///
/// Not redundant: the endpoint rejects a bad batch wholesale with a zod path,
/// and an agent reading that has to guess which of its fifteen items was wrong.
/// Failing locally names the index and the field.
export function parseSweep(raw: string): DropItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new InvalidSweep(`input is not valid JSON: ${(e as Error).message}`);
  }

  const list = Array.isArray(parsed)
    ? parsed
    : (parsed as { signals?: unknown })?.signals;
  if (!Array.isArray(list)) {
    throw new InvalidSweep('expected a JSON array of signals, or an object with a "signals" array');
  }
  if (list.length === 0) throw new InvalidSweep('no signals to send');
  if (list.length > 50) throw new InvalidSweep(`${list.length} signals, the endpoint takes at most 50`);

  return list.map((entry, i) => {
    const at = (field: string) => `signal ${i + 1}: ${field}`;
    const item = entry as Record<string, unknown>;

    if (item.origin !== 'arc' && item.origin !== 'circle') {
      // `karwan` is reserved for the release watcher reading a file that shipped
      // inside the image. A sweep must not be able to speak as our own release.
      throw new InvalidSweep(`${at('origin')} must be "arc" or "circle", got ${JSON.stringify(item.origin)}`);
    }
    for (const field of ['source', 'title'] as const) {
      if (typeof item[field] !== 'string' || !item[field].trim()) {
        throw new InvalidSweep(`${at(field)} is required`);
      }
    }
    if (item.url !== undefined) {
      if (typeof item.url !== 'string') throw new InvalidSweep(`${at('url')} must be a string`);
      try {
        new URL(item.url);
      } catch {
        throw new InvalidSweep(`${at('url')} is not a url: ${item.url}`);
      }
    }
    if (item.publishedOn !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(item.publishedOn))) {
      throw new InvalidSweep(`${at('publishedOn')} must be YYYY-MM-DD, got ${String(item.publishedOn)}`);
    }
    if (!item.url && !item.externalId) {
      // Without one of these the row has no identity, so next week's sweep
      // posts it again and the pipeline fills with copies of the same news.
      throw new InvalidSweep(`${at('url or externalId')} is required, or this cannot be deduped`);
    }

    return entry as DropItem;
  });
}

export interface DropResult {
  added: number;
  duplicate: number;
  results: Array<{ title: string; duplicate: boolean; merged: boolean }>;
}

export async function send(
  items: DropItem[],
  opts: { backendUrl: string; token: string },
): Promise<DropResult> {
  const res = await fetch(`${opts.backendUrl.replace(/\/$/, '')}/api/signals/ingest`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${opts.token}`,
    },
    body: JSON.stringify({ signals: items }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`ingest failed with ${res.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text) as DropResult;
}

/// How many arrived with nothing said about them. Not an error: a link with no
/// take is still worth capturing and somebody can write one from the admin
/// screen. Worth reporting though, because a sweep of pure links produces an
/// issue nobody wants to read.
export function countWithoutTake(items: DropItem[]): number {
  return items.filter((i) => !i.myTake?.trim()).length;
}
