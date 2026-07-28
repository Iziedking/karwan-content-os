import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanon } from '@karwan/canon-schema';
import { RateLimiter } from './rateLimit.ts';

/// The leak guard, run against the real server rather than against the data it
/// reads.
///
/// The plan's bar for this phase is a diff of public tool output against
/// canon/team that finds no overlap. So this spawns the server, calls every
/// tool it exposes, and checks the actual bytes that came back over stdio. A
/// test on the snapshot alone would miss a tool that reaches past it.

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const ENTRY = join(REPO_ROOT, 'packages', 'public-mcp', 'src', 'index.ts');
const TSX = join(REPO_ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.CMD' : 'tsx');

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
      const timer = setTimeout(
        () => reject(new Error(`${method} timed out. stderr: ${this.stderr}`)),
        20_000,
      );
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

  async call(name: string, args: Record<string, unknown> = {}): Promise<string> {
    const res = (await this.send('tools/call', { name, arguments: args })) as {
      result?: { content?: Array<{ text: string }>; isError?: boolean };
      error?: { message: string };
    };
    if (res.error) throw new Error(`${name}: ${res.error.message}`);
    return res.result?.content?.map((c) => c.text).join('\n') ?? '';
  }
}

async function start(env: Record<string, string> = {}) {
  const child = spawn(TSX, [ENTRY], {
    env: { ...process.env, ...env },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  }) as ChildProcessWithoutNullStreams;
  const client = new Client(child);
  const init = await client.send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1' },
  });
  assert.ok(init.result, `initialize failed: ${JSON.stringify(init)}. stderr: ${client.stderr}`);
  client.notify('notifications/initialized');
  return { child, client };
}

const TOOLS = [
  'karwan_brand_public',
  'karwan_facts',
  'karwan_faq',
  'karwan_features',
  'karwan_overview',
];

test('it serves the public canon with no key at all', async (t) => {
  // No KARWAN_TEAM_KEY, no backend url, nothing. The team server refuses to
  // start in exactly this situation, and this one must not.
  const { child, client } = await start({ KARWAN_TEAM_KEY: '', KARWAN_BACKEND_URL: '' });
  t.after(() => child.kill());

  const listed = (await client.send('tools/list')) as {
    result?: { tools: Array<{ name: string }> };
  };
  assert.deepEqual((listed.result?.tools ?? []).map((tl) => tl.name).sort(), TOOLS);

  const overview = await client.call('karwan_overview');
  assert.ok(overview.includes('What Karwan is'), overview);
  assert.ok(overview.includes('canon 0.1.0'), 'the response did not state its canon version');
});

test('no team content appears in any tool output', async (t) => {
  const { child, client } = await start();
  t.after(() => child.kill());

  const outputs: string[] = [];
  for (const name of TOOLS) outputs.push(await client.call(name));
  // Query forms too: a search tool can reach content the empty call does not.
  outputs.push(await client.call('karwan_facts', { q: 'escrow' }));
  outputs.push(await client.call('karwan_facts', { q: 'financing' }));
  outputs.push(await client.call('karwan_faq', { q: 'money' }));

  // Flatten whitespace before comparing. The canon is hard wrapped, so a
  // sentence spans lines in the source and would never match verbatim against
  // rendered output, which would make the sentence check look like coverage it
  // does not have.
  const served = outputs.join('\n').replace(/\s+/g, ' ');
  assert.ok(served.length > 500, 'the server returned almost nothing, so this proves nothing');

  const { files } = loadCanon();
  const team = files.filter((f) => f.frontmatter.visibility === 'team');
  assert.ok(team.length > 0, 'no team canon to diff against');

  let checked = 0;
  for (const file of team) {
    assert.equal(
      served.includes(file.frontmatter.id),
      false,
      `team fact "${file.frontmatter.id}" was served by the public MCP`,
    );
    assert.equal(
      served.includes(file.frontmatter.title),
      false,
      `the title of ${file.path} was served by the public MCP`,
    );

    for (const sentence of file.body.split(/(?<=[.!?])\s+/)) {
      const line = sentence.replace(/\s+/g, ' ').trim();
      if (line.length < 60) continue;
      checked++;
      assert.equal(
        served.includes(line),
        false,
        `a sentence from ${file.path} was served: "${line.slice(0, 80)}"`,
      );
      // The detector has to be able to find a sentence, or the loop above is a
      // long way of asserting nothing. Prove it on the same normalised text.
      assert.ok(`${served} ${line}`.includes(line), 'the sentence matcher cannot match');
    }
  }
  assert.ok(checked > 20, `only ${checked} team sentences were long enough to check`);

  // Internal source paths are not team canon, but they have no business in a
  // public answer either.
  assert.equal(served.includes('backend/src'), false, 'an internal source path was served');
  assert.equal(served.includes('contracts/src'), false, 'an internal source path was served');
});

test('features never returns anything that is not live', async (t) => {
  const { child, client } = await start();
  t.after(() => child.kill());

  const body = await client.call('karwan_features');
  const { files } = loadCanon();
  const notLive = files.filter(
    (f) => f.frontmatter.visibility === 'public' && f.frontmatter.status !== 'live',
  );

  for (const file of notLive) {
    assert.equal(
      body.includes(file.frontmatter.id),
      false,
      `${file.frontmatter.id} is ${file.frontmatter.status} and came back from karwan_features`,
    );
  }
});

test('the rate limit refuses rather than serving, and says how long', async (t) => {
  const { child, client } = await start({ KARWAN_MCP_RATE_LIMIT: '1' });
  t.after(() => child.kill());

  // Burst is at least 5, so the first few pass. Past that it has to refuse,
  // because a limit that never triggers is decoration.
  const bodies: string[] = [];
  for (let i = 0; i < 12; i++) bodies.push(await client.call('karwan_faq'));

  const refused = bodies.filter((b) => b.includes('Rate limited'));
  assert.ok(refused.length > 0, 'the limit never triggered');
  assert.match(refused[0]!, /Wait about \d+s/);
  assert.equal(bodies[0]?.includes('Rate limited'), false, 'the first call was refused');
});

test('the token bucket refills over time rather than resetting on a window', () => {
  let clock = 0;
  const limiter = new RateLimiter({ burst: 2, perMinute: 60, now: () => clock });

  assert.equal(limiter.take(), null);
  assert.equal(limiter.take(), null);
  assert.ok(limiter.take(), 'a third immediate call should be refused');

  clock += 1_000; // one second at 60/min is exactly one token
  assert.equal(limiter.take(), null);
  assert.ok(limiter.take(), 'the refill handed out more than it earned');

  // A long quiet period returns a full burst and no more.
  clock += 600_000;
  assert.equal(limiter.take(), null);
  assert.equal(limiter.take(), null);
  assert.ok(limiter.take(), 'the bucket refilled past its burst');
});
