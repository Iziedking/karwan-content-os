#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { TeamKeyVerifier } from '@karwan/team-auth';
import { buildServer, LOCAL_VERSION } from './server.ts';
import { allFiles } from './canon.ts';

/// The team MCP, hosted.
///
/// The stdio server needs a checkout of this repo on every member's machine,
/// which means every member holds the raw canon forever, including whatever
/// they had when their key was revoked. Hosting inverts that: the canon lives
/// in one place, members hold only a key, and revoking it actually removes
/// access rather than removing permission to fetch what they already have.
///
/// Stateless by design. Every request carries its own bearer token, a verifier
/// and a server are built for that token, and both are torn down when the
/// response ends. Nothing about one caller survives into the next request,
/// which is the property that makes a shared endpoint safe to expose.

const PORT = Number(process.env.PORT ?? '8790');
const BACKEND = process.env.KARWAN_BACKEND_URL ?? 'https://api.karwan.site';
const MCP_PATH = '/mcp';

/// Per-key ceiling. The key is the real access control; this is the guard
/// against a client in a retry loop, or a leaked key being drained, doing it
/// quietly and at speed. Keyed on the token rather than the IP because team
/// members share office networks and a leaked key does not.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.KARWAN_MCP_RATE_LIMIT ?? '') || 120;

const buckets = new Map<string, { count: number; resetAt: number }>();

function overLimit(token: string, now = Date.now()): boolean {
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(token);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(token, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

function json(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) });
  res.end(payload);
}

/// JSON-RPC shaped, because an MCP client reads this as a protocol response
/// and a bare string leaves it reporting a parse failure instead of the reason.
function rpcError(res: ServerResponse, status: number, message: string) {
  json(res, status, { jsonrpc: '2.0', error: { code: -32001, message }, id: null });
}

function bearer(req: IncomingMessage): string | null {
  const header = req.headers.authorization ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (match?.[1]) return match[1].trim();
  // Some clients only allow a custom header rather than Authorization.
  const alt = req.headers['x-karwan-key'];
  return typeof alt === 'string' && alt.trim() ? alt.trim() : null;
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      bytes += Buffer.byteLength(chunk);
      // A tool call carries a draft, so the limit has to be generous. It still
      // has to exist: an unbounded body on a public endpoint is a way to fill
      // the box's memory from the outside.
      if (bytes > 2_000_000) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : undefined);
      } catch (e) {
        reject(new Error(`body is not valid JSON: ${(e as Error).message}`));
      }
    });
    req.on('error', reject);
  });
}

async function handleMcp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = bearer(req);
  if (!token) {
    rpcError(
      res,
      401,
      'This server needs a Karwan team key. Send it as "Authorization: Bearer karwan_...". Ask an admin for one.',
    );
    return;
  }

  if (overLimit(token)) {
    rpcError(res, 429, `Rate limited. This key may make ${MAX_PER_WINDOW} calls a minute.`);
    return;
  }

  let body: unknown;
  try {
    body = await readBody(req);
  } catch (e) {
    rpcError(res, 400, (e as Error).message);
    return;
  }

  // A verifier per request, so its cache belongs to this key and cannot hand a
  // cached identity to a different one.
  const verifier = new TeamKeyVerifier({ backendUrl: BACKEND, key: token });
  const server = buildServer(verifier);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  // Torn down when the response ends, whether it ended well or the client hung
  // up. Without this every request leaks a server and a transport.
  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}

const httpServer = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (url.pathname === '/health') {
    // Reports the canon it is actually serving, so a container that booted with
    // a broken canon fails its healthcheck rather than serving half of one.
    try {
      json(res, 200, { ok: true, canonVersion: LOCAL_VERSION, files: allFiles().length });
    } catch (e) {
      json(res, 503, { ok: false, error: (e as Error).message });
    }
    return;
  }

  if (url.pathname !== MCP_PATH) {
    rpcError(res, 404, `Nothing here. The MCP endpoint is ${MCP_PATH}.`);
    return;
  }

  if (req.method !== 'POST') {
    // Stateless, so there is no stream to resume and no session to delete.
    res.setHeader('allow', 'POST');
    rpcError(res, 405, 'This server is stateless and only accepts POST.');
    return;
  }

  handleMcp(req, res).catch((e: Error) => {
    if (!res.headersSent) rpcError(res, 500, `Server error: ${e.message}`);
    else res.end();
  });
});

httpServer.listen(PORT, () => {
  // Fail loudly at boot if the canon does not parse, rather than per request.
  const files = allFiles().length;
  // The BOUND port, not the configured one. With PORT=0 the OS picks an
  // ephemeral port, and logging the requested value prints ":0", which is a
  // number nothing can connect to and a log line that lies about where the
  // server is.
  const address = httpServer.address();
  const bound = typeof address === 'object' && address ? address.port : PORT;
  console.error(
    `karwan-team-mcp: listening on :${bound}${MCP_PATH}, canon ${LOCAL_VERSION}, ${files} files`,
  );
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    httpServer.close(() => process.exit(0));
  });
}
