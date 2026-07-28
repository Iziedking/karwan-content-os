import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage } from 'node:http';
import { countWithoutTake, parseSweep, send, InvalidSweep, type DropItem } from './dropSignals.ts';

/// The local validator earns its place by naming which item is wrong.
///
/// The endpoint validates too, but it rejects the whole batch with a zod path,
/// and an agent reading that has to guess which of fifteen items broke it. Every
/// message here names the position and the field.

const ONE: DropItem = {
  origin: 'arc',
  source: 'Arc docs',
  title: 'Unified balance lands on Arc',
  url: 'https://docs.arc.network/app-kit/unified-balance',
  myTake: 'This is the balance we already route through.',
};

function reject(input: unknown, expected: RegExp) {
  assert.throws(
    () => parseSweep(typeof input === 'string' ? input : JSON.stringify(input)),
    (e: Error) => {
      assert.ok(e instanceof InvalidSweep, `wrong error type: ${e.constructor.name}`);
      assert.match(e.message, expected);
      return true;
    },
  );
}

test('a bare array and a wrapped object both parse', () => {
  assert.equal(parseSweep(JSON.stringify([ONE])).length, 1);
  assert.equal(parseSweep(JSON.stringify({ signals: [ONE] })).length, 1);
});

test('a bad item is named by position and field', () => {
  reject([ONE, { ...ONE, title: '' }], /signal 2: title/);
  reject([{ ...ONE, source: '   ' }], /signal 1: source/);
  reject([ONE, ONE, { ...ONE, url: 'not-a-url' }], /signal 3: url is not a url/);
  reject([{ ...ONE, publishedOn: '27-07-2026' }], /signal 1: publishedOn must be YYYY-MM-DD/);
});

test('the sweep cannot claim to be a Karwan release', () => {
  // That origin belongs to the watcher reading a file that shipped in the
  // image. It is the one source a reader treats as our own word.
  reject([{ ...ONE, origin: 'karwan' }], /signal 1: origin must be "arc" or "circle"/);
  reject([{ ...ONE, origin: 'manual' }], /signal 1: origin/);
});

test('something with no identity is refused before it can duplicate weekly', () => {
  const { url, ...noUrl } = ONE;
  reject([noUrl], /signal 1: url or externalId is required/);

  // An external id is the alternative identity, so this is fine.
  assert.equal(parseSweep(JSON.stringify([{ ...noUrl, externalId: 'arc-gateway-2026-07' }])).length, 1);
});

test('junk in gives a message a human can act on', () => {
  reject('not json at all', /input is not valid JSON/);
  reject({ nope: true }, /expected a JSON array of signals/);
  reject([], /no signals to send/);
  reject(
    Array.from({ length: 51 }, (_, i) => ({ ...ONE, url: `https://e.com/${i}` })),
    /51 signals, the endpoint takes at most 50/,
  );
});

/// A server that records exactly what arrived. The parse tests prove the
/// validator; this proves the wire: the path, the bearer header, the envelope.
/// Those are the parts a unit test on the parser cannot see and the parts that
/// fail silently at 3am on a schedule.
async function stubIngest(reply: { status: number; body: unknown }) {
  const seen: Array<{ url: string; auth: string; body: unknown }> = [];
  const server = createServer((req: IncomingMessage, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      seen.push({
        url: req.url ?? '',
        auth: req.headers.authorization ?? '',
        body: raw ? JSON.parse(raw) : null,
      });
      res.writeHead(reply.status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(reply.body));
    });
  });

  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const address = server.address();
  if (typeof address === 'string' || address === null) throw new Error('no port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    seen,
    close: () =>
      new Promise<void>((r) => {
        server.closeAllConnections?.();
        server.close(() => r());
      }),
  };
}

test('send posts the batch to the ingest path with a bearer token', async (t) => {
  const stub = await stubIngest({
    status: 200,
    body: { added: 1, duplicate: 0, results: [{ title: ONE.title, duplicate: false, merged: false }] },
  });
  t.after(() => stub.close());

  // Trailing slash on the base url must not produce a double slash in the path.
  const result = await send([ONE], { backendUrl: `${stub.url}/`, token: 'sweep-token' });

  assert.equal(stub.seen.length, 1);
  assert.equal(stub.seen[0]!.url, '/api/signals/ingest');
  assert.equal(stub.seen[0]!.auth, 'Bearer sweep-token');
  assert.deepEqual(stub.seen[0]!.body, { signals: [ONE] });
  assert.equal(result.added, 1);
});

test('a refusal surfaces the status and the reason, not a silent zero', async (t) => {
  const stub = await stubIngest({ status: 401, body: { error: 'unauthorized' } });
  t.after(() => stub.close());

  await assert.rejects(
    () => send([ONE], { backendUrl: stub.url, token: 'wrong' }),
    /401.*unauthorized/s,
  );
});

test('missing takes are counted rather than rejected', () => {
  const { myTake, ...noTake } = ONE;
  const items = parseSweep(JSON.stringify([ONE, noTake]));
  assert.equal(items.length, 2, 'a missing take must not drop the signal');
  assert.equal(countWithoutTake(items), 1);
  assert.equal(countWithoutTake([{ ...ONE, myTake: '   ' }]), 1, 'whitespace is not a take');
});
