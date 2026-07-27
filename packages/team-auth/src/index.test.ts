import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TeamKeyVerifier, AccessDeniedError } from './index.js';

/// The caching rules are the security boundary, so each one is pinned here.
///
///   pnpm test

/// Just past the 15 minute cache, so the next identify() has to ask again.
const CACHE_WINDOW = 16 * 60_000;

/// A fetch stand-in with a movable clock and a call counter, so the tests can
/// assert on how often the backend is actually asked.
function harness(responses: Array<() => Response | Promise<Response>>) {
  let clock = 1_000_000;
  let calls = 0;
  const fetchImpl = (async () => {
    const next = responses[Math.min(calls, responses.length - 1)]!;
    calls++;
    return next();
  }) as unknown as typeof fetch;
  return {
    fetchImpl,
    now: () => clock,
    advance: (ms: number) => {
      clock += ms;
    },
    get calls() {
      return calls;
    },
  };
}

const ok = (over: Record<string, unknown> = {}) =>
  new Response(
    JSON.stringify({ valid: true, role: 'marketing', member: 'aisha', canonVersion: '0.1.0', ...over }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

const revoked = () =>
  new Response(JSON.stringify({ valid: false, reason: 'revoked' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });

function verifier(h: ReturnType<typeof harness>, over: Record<string, unknown> = {}) {
  return new TeamKeyVerifier({
    backendUrl: 'https://api.example',
    key: 'karwan_id_secret',
    fetchImpl: h.fetchImpl,
    now: h.now,
    ...over,
  });
}

test('a valid key identifies the member', async () => {
  const h = harness([ok]);
  const id = await verifier(h).identify();
  assert.equal(id.member, 'aisha');
  assert.equal(id.role, 'marketing');
  assert.equal(id.canonVersion, '0.1.0');
  assert.equal(id.stale, false);
});

test('the answer is cached for 15 minutes, then rechecked', async () => {
  const h = harness([ok]);
  const v = verifier(h);

  await v.identify();
  h.advance(14 * 60_000);
  await v.identify();
  assert.equal(h.calls, 1, 'rechecked inside the cache window');

  h.advance(2 * 60_000);
  await v.identify();
  assert.equal(h.calls, 2, 'did not recheck after the window closed');
});

test('revocation kills access at the next check, and the cache does not survive it', async () => {
  const h = harness([ok, revoked]);
  const v = verifier(h);

  assert.equal((await v.identify()).member, 'aisha');

  // Inside the window the revoked key still works. This is the documented
  // 15 minute exposure, asserted so it cannot drift silently.
  h.advance(60_000);
  assert.equal((await v.identify()).member, 'aisha');

  h.advance(CACHE_WINDOW);
  await assert.rejects(
    () => v.identify(),
    (e: unknown) => e instanceof AccessDeniedError && e.reason === 'revoked',
  );

  // And it stays dead. A rejection must not leave a usable cache behind.
  await assert.rejects(() => v.identify(), AccessDeniedError);
});

test('an outage serves the cached identity, marked stale', async () => {
  let fail = false;
  const h = harness([
    () => {
      if (fail) throw new Error('ECONNREFUSED');
      return ok();
    },
  ]);
  const v = verifier(h);

  await v.identify();
  fail = true;
  h.advance(CACHE_WINDOW);

  const id = await v.identify();
  assert.equal(id.member, 'aisha');
  assert.equal(id.stale, true, 'an unverified identity must announce itself as stale');
});

test('an outage with no cache fails closed', async () => {
  const h = harness([
    () => {
      throw new Error('ECONNREFUSED');
    },
  ]);
  await assert.rejects(
    () => verifier(h).identify(),
    (e: unknown) => e instanceof AccessDeniedError && e.reason === 'unreachable',
  );
});

test('the offline grace period is bounded', async () => {
  let fail = false;
  const h = harness([
    () => {
      if (fail) throw new Error('ECONNREFUSED');
      return ok();
    },
  ]);
  const v = verifier(h);

  await v.identify();
  fail = true;

  h.advance(50 * 60_000);
  assert.equal((await v.identify()).stale, true, 'gave up inside the grace period');

  h.advance(20 * 60_000);
  await assert.rejects(
    () => v.identify(),
    (e: unknown) => e instanceof AccessDeniedError && e.reason === 'grace-expired',
  );
});

test('a 500 is an outage, a 401 is an answer', async () => {
  const server500 = () => new Response('nope', { status: 500 });

  // 500 with a cache behind it: keep serving.
  const a = harness([ok, server500]);
  const va = verifier(a);
  await va.identify();
  a.advance(CACHE_WINDOW);
  assert.equal((await va.identify()).stale, true);

  // 401 with a cache behind it: stop.
  const b = harness([ok, revoked]);
  const vb = verifier(b);
  await vb.identify();
  b.advance(CACHE_WINDOW);
  await assert.rejects(() => vb.identify(), AccessDeniedError);
});

test('valid but missing a role is refused rather than guessed', async () => {
  const h = harness([() => ok({ role: undefined, member: undefined })]);
  await assert.rejects(
    () => verifier(h).identify(),
    (e: unknown) => e instanceof AccessDeniedError && e.reason === 'incomplete',
  );
});

test('concurrent calls collapse onto one request', async () => {
  const h = harness([ok]);
  const v = verifier(h);
  const [a, b, c] = await Promise.all([v.identify(), v.identify(), v.identify()]);
  assert.equal(h.calls, 1, 'fired a verify per concurrent call');
  assert.equal(a.member, b.member);
  assert.equal(b.member, c.member);
});

test('reset forces a recheck', async () => {
  const h = harness([ok]);
  const v = verifier(h);
  await v.identify();
  v.reset();
  await v.identify();
  assert.equal(h.calls, 2);
});
