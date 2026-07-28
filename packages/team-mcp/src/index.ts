#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TeamKeyVerifier } from '@karwan/team-auth';
import { buildServer, LOCAL_VERSION } from './server.ts';
import { versionNote } from './version.ts';

/// The Karwan team MCP over stdio.
///
/// One process, one person, one key from the environment. This is the local
/// path, for someone working in a checkout of this repo. The hosted path is
/// `http.ts`, where the key arrives per request instead.
///
/// Without a key it refuses to start, rather than starting and failing per
/// call, so a misconfiguration is visible immediately.

const KEY = process.env.KARWAN_TEAM_KEY;
const BACKEND = process.env.KARWAN_BACKEND_URL ?? 'https://api.karwan.site';

if (!KEY) {
  console.error(
    'KARWAN_TEAM_KEY is not set. Ask an admin for a key at /admin/team-keys, then set it in your MCP config.',
  );
  process.exit(1);
}

const verifier = new TeamKeyVerifier({ backendUrl: BACKEND, key: KEY });

async function main(): Promise<void> {
  // Verify once at startup so a bad key fails here, visibly, rather than
  // surfacing as a confusing error on whatever tool the member happens to
  // call first.
  try {
    const identity = await verifier.identify();
    console.error(
      `karwan-team-mcp: ${identity.member} (${identity.role}), canon ${LOCAL_VERSION}, backend ${identity.canonVersion}`,
    );
    const note = versionNote(LOCAL_VERSION, identity.canonVersion);
    if (note) console.error(`karwan-team-mcp: ${note}`);
  } catch (e) {
    console.error(`karwan-team-mcp: ${(e as Error).message}`);
    process.exit(1);
  }

  await buildServer(verifier).connect(new StdioServerTransport());
}

main().catch((e: Error) => {
  console.error(`karwan-team-mcp failed to start: ${e.message}`);
  process.exit(1);
});
