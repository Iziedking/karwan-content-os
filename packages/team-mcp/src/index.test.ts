import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { versionNote, parseSemver } from './version.ts';

/// Starts the real server against a stub backend and speaks MCP to it over
/// stdio. Unit tests on the pieces would not catch a server that registers a
/// tool wrongly, refuses to boot, or answers before verifying a key, which are
/// the failures that matter here.

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const ENTRY = join(REPO_ROOT, 'packages', 'team-mcp', 'src', 'index.ts');
const TSX = join(REPO_ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.CMD' : 'tsx');

/// A stand-in for the Karwan backend. `reply` decides what /verify returns, so
/// a test can hand back a rejection as easily as an acceptance.
async function stubBackend(reply: () => { status: number; body: unknown }): Promise<{
  url: string;
  calls: () => number;
  close: () => Promise<void>;
}> {
  let calls = 0;
  const server: Server = createServer((req, res) => {
    if (req.url !== '/api/team-mcp/verify') {
      res.writeHead(404).end();
      return;
    }
    calls++;
    // Drain the body: leaving it unread can wedge the socket on some clients.
    req.resume();
    req.on('end', () => {
      const { status, body } = reply();
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (typeof address === 'string' || address === null) throw new Error('no port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    calls: () => calls,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
}

/// A minimal MCP client over the child's stdio. Enough to initialize, list and
/// call, which is all this needs to prove.
class Client {
  private buffer = '';
  private pending = new Map<number, (value: Record<string, unknown>) => void>();
  private nextId = 1;
  stderr = '';

  constructor(private child: ChildProcessWithoutNullStreams) {
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      this.buffer += chunk;
      let index: number;
      while ((index = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, index).trim();
        this.buffer = this.buffer.slice(index + 1);
        if (!line) continue;
        let msg: { id?: number };
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        if (typeof msg.id === 'number') {
          this.pending.get(msg.id)?.(msg as Record<string, unknown>);
          this.pending.delete(msg.id);
        }
      }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      this.stderr += chunk;
    });
  }

  send(method: string, params?: unknown): Promise<Record<string, unknown>> {
    const id = this.nextId++;
    const promise = new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`${method} timed out. stderr: ${this.stderr}`)), 20_000);
      this.pending.set(id, (value) => {
        clearTimeout(timer);
        resolve(value);
      });
    });
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    return promise;
  }

  notify(method: string): void {
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method })}\n`);
  }
}

async function start(env: Record<string, string>) {
  const child = spawn(TSX, [ENTRY], {
    env: { ...process.env, ...env },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  }) as ChildProcessWithoutNullStreams;
  return { child, client: new Client(child) };
}

const VALID = () => ({
  status: 200,
  body: { valid: true, role: 'marketing', member: 'aisha', canonVersion: '0.1.0' },
});

test('serves the canon to a valid key, and never before verifying it', async (t) => {
  const backend = await stubBackend(VALID);
  const { child, client } = await start({
    KARWAN_TEAM_KEY: 'karwan_id_secret',
    KARWAN_BACKEND_URL: backend.url,
  });
  t.after(async () => {
    child.kill();
    await backend.close();
  });

  const init = await client.send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1' },
  });
  assert.ok(init.result, `initialize failed: ${JSON.stringify(init)}`);
  client.notify('notifications/initialized');

  // The startup check runs before any tool call. If it did not, the key could
  // be wrong and nobody would know until the first question.
  assert.ok(backend.calls() >= 1, 'the server answered without verifying the key first');

  const listed = (await client.send('tools/list')) as {
    result?: { tools: Array<{ name: string; description: string }> };
  };
  const names = (listed.result?.tools ?? []).map((tl) => tl.name).sort();
  assert.deepEqual(names, [
    'karwan_brand',
    'karwan_brief',
    'karwan_draft_review',
    'karwan_facts',
    'karwan_playbook',
    'karwan_research',
    'karwan_test_scenarios',
    'karwan_voice',
  ]);

  const brief = (await client.send('tools/call', {
    name: 'karwan_brief',
    arguments: { compact: true },
  })) as { result?: { content: Array<{ text: string }>; isError?: boolean } };

  const body = brief.result?.content?.[0]?.text ?? '';
  assert.equal(brief.result?.isError, undefined);
  assert.ok(body.includes('# Karwan canon'), 'the brief did not render');
  assert.ok(body.includes('What is shipped'));

  // A marketing key must not receive dev-only canon.
  assert.equal(body.includes('decisions-log'), false, 'dev-only canon reached a marketing key');
});

test('a draft review reports real findings against the real canon', async (t) => {
  const backend = await stubBackend(VALID);
  const { child, client } = await start({
    KARWAN_TEAM_KEY: 'karwan_id_secret',
    KARWAN_BACKEND_URL: backend.url,
  });
  t.after(async () => {
    child.kill();
    await backend.close();
  });

  await client.send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1' },
  });
  client.notify('notifications/initialized');

  const res = (await client.send('tools/call', {
    name: 'karwan_draft_review',
    arguments: { draft: "In today's fast-paced world, Karwan is a seamless solution — really." },
  })) as { result?: { content: Array<{ text: string }> } };

  const body = res.result?.content?.[0]?.text ?? '';
  assert.ok(body.includes('no-em-dash'), body);
  assert.ok(body.includes('no-filler-opener'), body);
  assert.ok(body.includes('must be fixed'), body);
});

test('a revoked key gets a readable refusal, not the canon', async (t) => {
  const backend = await stubBackend(() => ({
    status: 401,
    body: { valid: false, reason: 'revoked' },
  }));
  const { child, client } = await start({
    KARWAN_TEAM_KEY: 'karwan_id_secret',
    KARWAN_BACKEND_URL: backend.url,
  });
  t.after(async () => {
    child.kill();
    await backend.close();
  });

  // The server refuses to start on a rejected key, so it exits rather than
  // serving. Watch for the exit and check what it said.
  const code = await new Promise<number>((resolve) => child.on('exit', (c) => resolve(c ?? -1)));
  assert.equal(code, 1);
  assert.ok(
    client.stderr.includes('revoked'),
    `expected a revocation message, got: ${client.stderr}`,
  );
});

test('no key at all refuses to start', async (t) => {
  const { child, client } = await start({ KARWAN_TEAM_KEY: '', KARWAN_BACKEND_URL: 'http://127.0.0.1:1' });
  t.after(() => child.kill());

  const code = await new Promise<number>((resolve) => child.on('exit', (c) => resolve(c ?? -1)));
  assert.equal(code, 1);
  assert.ok(client.stderr.includes('KARWAN_TEAM_KEY'), client.stderr);
});

test('version drift is stated, in both directions', () => {
  assert.equal(versionNote('0.1.0', '0.1.0'), '');
  assert.ok(versionNote('0.1.0', '0.2.0').includes('behind'));
  assert.ok(versionNote('0.2.0', '0.1.0').includes('ahead'));
  assert.ok(versionNote('0.1.0', '0.1.3').includes('slightly behind'));
  assert.ok(versionNote('0.1.0', 'unknown').includes('mismatch'));
  assert.deepEqual(parseSemver('1.2.3'), { major: 1, minor: 2, patch: 3 });
  assert.equal(parseSemver('nope'), null);
});
