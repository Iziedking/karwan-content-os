#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { TeamKeyVerifier, OAuthVerifier, looksLikeTeamKey } from '@karwan/team-auth';
import { buildServer, LOCAL_VERSION, type Verifier } from './server.ts';
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

/// This server's own identity, and the audience every OAuth token is checked
/// against. Canonical form: no trailing slash, because the spec asks for one
/// spelling and two spellings would mean two audiences.
const RESOURCE = (process.env.KARWAN_MCP_RESOURCE ?? 'https://mcp.karwan.site/mcp').replace(/\/$/, '');
/// The authorization server clients should go to. Its public address, not the
/// internal one: this value is handed to a browser.
const ISSUER = (process.env.KARWAN_OAUTH_ISSUER ?? 'https://api.karwan.site').replace(/\/$/, '');
const INTROSPECT_TOKEN = process.env.KARWAN_INTROSPECT_TOKEN ?? '';

const oauth = INTROSPECT_TOKEN
  ? new OAuthVerifier({ backendUrl: BACKEND, introspectToken: INTROSPECT_TOKEN, resource: RESOURCE })
  : null;

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

/// The 401 that starts an OAuth flow.
///
/// RFC 9728 section 5.1. Without `resource_metadata` a client has to guess
/// where to look, and the Claude app and ChatGPT will simply fail to connect
/// rather than probing. This header is the whole discovery mechanism.
function unauthorized(res: ServerResponse, message: string) {
  res.setHeader(
    'WWW-Authenticate',
    `Bearer resource_metadata="${RESOURCE_METADATA_URL}", scope="mcp"`,
  );
  rpcError(res, 401, message);
}

const RESOURCE_METADATA_URL = `${RESOURCE.replace(/\/mcp$/, '')}/.well-known/oauth-protected-resource${MCP_PATH}`;

/// RFC 9728. Served at both the path-suffixed location and the root, because
/// clients probe them in that order and supporting only one means the ones that
/// start at the other end never find it.
function protectedResourceMetadata() {
  return {
    resource: RESOURCE,
    authorization_servers: [ISSUER],
    scopes_supported: ['mcp'],
    bearer_methods_supported: ['header'],
  };
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
    unauthorized(
      res,
      'This server needs authorization. Sign in through your app, or send a Karwan team key as "Authorization: Bearer karwan_...".',
    );
    return;
  }

  if (overLimit(token)) {
    rpcError(res, 429, `Rate limited. This credential may make ${MAX_PER_WINDOW} calls a minute.`);
    return;
  }

  let body: unknown;
  try {
    body = await readBody(req);
  } catch (e) {
    rpcError(res, 400, (e as Error).message);
    return;
  }

  // The shape of the credential decides how it is checked. A `karwan_` key goes
  // to the key verifier that has always handled it, so Claude Code users are
  // untouched by any of this; anything else is an OAuth token.
  //
  // Either way a verifier is built PER REQUEST, so nothing about one caller can
  // reach the next.
  let verifier: Verifier;

  if (looksLikeTeamKey(token)) {
    verifier = new TeamKeyVerifier({ backendUrl: BACKEND, key: token });
  } else {
    if (!oauth) {
      rpcError(res, 503, 'This server is not configured to accept OAuth tokens.');
      return;
    }
    // Wrapped so both paths present the same interface to the tool layer, which
    // then does not need to know which one ran.
    verifier = { identify: () => oauth.identify(token, LOCAL_VERSION) };
  }

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

  // Both probe locations, because clients try the path-suffixed one first and
  // fall back to the root. Serving only one strands whichever client starts at
  // the other end.
  if (
    url.pathname === `/.well-known/oauth-protected-resource${MCP_PATH}` ||
    url.pathname === '/.well-known/oauth-protected-resource'
  ) {
    json(res, 200, protectedResourceMetadata());
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
