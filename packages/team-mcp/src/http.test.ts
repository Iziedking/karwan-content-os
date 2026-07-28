import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/// The hosted server, over real HTTP.
///
/// The property that matters here does not exist in the stdio server at all:
/// two different keys hitting the same process must get two different canons.
/// A server built once and shared would answer the second caller with the
/// first caller's access, and that failure is invisible until somebody in
/// marketing quotes the decisions log.
///
/// The suite runs with `--test-force-exit`. Node's global `fetch` keeps pooled
/// sockets open with no supported way to drain them from here, so without it
/// the runner sits at the end of a fully green file waiting on handles this
/// test cannot close. The flag is for that, and the server itself shuts down
/// cleanly on SIGTERM.

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const ENTRY = join(REPO_ROOT, 'packages', 'team-mcp', 'src', 'http.ts');
const TSX = join(REPO_ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.CMD' : 'tsx');

/// Stands in for the Karwan backend. Answers per key, so one stub can play both
/// a dev and a marketing member, and can revoke one of them mid-test.
async function stubBackend(reply: (key: string) => { status: number; body: unknown }) {
  const calls: string[] = [];
  const server: Server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const key = (JSON.parse(raw || '{}') as { key?: string }).key ?? '';
      calls.push(key);
      const { status, body } = reply(key);
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    });
  });

  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const address = server.address();
  if (typeof address === 'string' || address === null) throw new Error('no port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    calls,
    close: () =>
      new Promise<void>((r) => {
        server.closeAllConnections?.();
        server.close(() => r());
      }),
  };
}

async function startMcp(backendUrl: string) {
  const child = spawn(TSX, [ENTRY], {
    env: { ...process.env, KARWAN_BACKEND_URL: backendUrl, PORT: '0' },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  }) as ChildProcessWithoutNullStreams;

  // PORT 0 would be ephemeral but the server logs the port it took, so read it
  // back rather than guessing a free one and racing another test.
  const port = await new Promise<number>((resolve, reject) => {
    let out = '';
    const timer = setTimeout(() => reject(new Error(`server never started. stderr: ${out}`)), 25_000);
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      out += chunk;
      const m = /listening on :(\d+)/.exec(out);
      if (m) {
        clearTimeout(timer);
        resolve(Number(m[1]));
      }
    });
  });

  return { child, url: `http://127.0.0.1:${port}` };
}

let nextId = 1;
async function rpc(url: string, key: string | null, method: string, params?: unknown) {
  const res = await fetch(`${url}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...(key ? { authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  });

  const text = await res.text();
  // Streamable HTTP may answer as SSE. Pull the JSON payload out either way.
  const line = text.split('\n').find((l) => l.startsWith('data: '));
  const parsed = line ? JSON.parse(line.slice(6)) : text ? JSON.parse(text) : null;
  return { status: res.status, body: parsed as Record<string, unknown> | null };
}

const INIT = {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'test', version: '1' },
};

const DEV = 'karwan_dev-id_secret';
const MARKETING = 'karwan_mkt-id_secret';

function identities(key: string) {
  if (key === DEV) {
    return {
      status: 200,
      body: { valid: true, role: 'dev', member: 'izie', canonVersion: '0.1.0' },
    };
  }
  if (key === MARKETING) {
    return {
      status: 200,
      body: { valid: true, role: 'marketing', member: 'aisha', canonVersion: '0.1.0' },
    };
  }
  return { status: 401, body: { valid: false, reason: 'unknown' } };
}

test('no key is refused, and the refusal says how to get one', async (t) => {
  const backend = await stubBackend(identities);
  const mcp = await startMcp(backend.url);
  t.after(async () => {
    mcp.child.kill();
    await backend.close();
  });

  const res = await rpc(mcp.url, null, 'initialize', INIT);
  assert.equal(res.status, 401);
  assert.match(String((res.body as { error?: { message?: string } })?.error?.message), /team key/i);
  assert.equal(backend.calls.length, 0, 'an unauthenticated request should never reach the backend');
});

test('two keys on one process get two different canons', async (t) => {
  const backend = await stubBackend(identities);
  const mcp = await startMcp(backend.url);
  t.after(async () => {
    mcp.child.kill();
    await backend.close();
  });

  const brief = async (key: string) => {
    await rpc(mcp.url, key, 'initialize', INIT);
    const res = await rpc(mcp.url, key, 'tools/call', {
      name: 'karwan_brief',
      arguments: { compact: true },
    });
    const result = res.body?.result as { content?: Array<{ text: string }> } | undefined;
    return result?.content?.[0]?.text ?? '';
  };

  const devBrief = await brief(DEV);
  const marketingBrief = await brief(MARKETING);

  assert.ok(devBrief.includes('# Karwan canon'), devBrief.slice(0, 200));
  assert.ok(marketingBrief.includes('# Karwan canon'));

  // The whole reason this server is built per request.
  assert.ok(devBrief.includes('decisions-log'), 'the dev canon lost its dev-only files');
  assert.equal(
    marketingBrief.includes('decisions-log'),
    false,
    'a marketing key was served dev-only canon',
  );
  assert.ok(devBrief.length > marketingBrief.length);
});

test('a key the backend rejects gets a readable refusal, not the canon', async (t) => {
  const backend = await stubBackend(identities);
  const mcp = await startMcp(backend.url);
  t.after(async () => {
    mcp.child.kill();
    await backend.close();
  });

  await rpc(mcp.url, 'karwan_nope_nope', 'initialize', INIT);
  const res = await rpc(mcp.url, 'karwan_nope_nope', 'tools/call', {
    name: 'karwan_facts',
    arguments: {},
  });

  const result = res.body?.result as { isError?: boolean; content?: Array<{ text: string }> };
  assert.equal(result?.isError, true, JSON.stringify(res.body));
  const text = result?.content?.[0]?.text ?? '';
  assert.equal(text.includes('what-karwan-is'), false, 'a rejected key was served canon');
});

test('health reports the canon, and a wrong path says where the endpoint is', async (t) => {
  const backend = await stubBackend(identities);
  const mcp = await startMcp(backend.url);
  t.after(async () => {
    mcp.child.kill();
    await backend.close();
  });

  const health = await fetch(`${mcp.url}/health`);
  assert.equal(health.status, 200);
  const body = (await health.json()) as { ok: boolean; files: number; canonVersion: string };
  assert.equal(body.ok, true);
  assert.ok(body.files > 0, 'health passed with an empty canon');
  assert.match(body.canonVersion, /^\d+\.\d+\.\d+$/);

  const wrong = await fetch(`${mcp.url}/`, { method: 'POST' });
  assert.equal(wrong.status, 404);
  assert.match(JSON.stringify(await wrong.json()), /\/mcp/);

  // Stateless: there is no stream to resume, so GET is not a thing here.
  const get = await fetch(`${mcp.url}/mcp`);
  assert.equal(get.status, 405);
});
