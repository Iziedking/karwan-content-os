# Hosting the team MCP

One server at `mcp.karwan.site`, one key per person, no checkout required.

## Why hosted

The stdio server needs this repository on every member's machine. That means
every member holds `canon/team` in full: positioning, the decisions log, the
roadmap. It also means revoking a key removes their permission to fetch the
canon, not the canon they already have. Somebody who leaves keeps a copy.

Hosted inverts it. The canon sits in one place, members hold a key and nothing
else, and revoking that key actually ends access.

## What a team member does

Ask an admin for a key at `/admin/team-keys`. Then, once:

```bash
claude mcp add --transport http karwan https://mcp.karwan.site/mcp \
  --header "Authorization: Bearer karwan_..."
```

Or in `.mcp.json`, keeping the key out of the file:

```json
{
  "mcpServers": {
    "karwan": {
      "type": "http",
      "url": "https://mcp.karwan.site/mcp",
      "headers": { "Authorization": "Bearer ${KARWAN_TEAM_KEY}" }
    }
  }
}
```

`claude mcp add` saves the configuration without checking the credential, so a
bad key shows up later as a server that fails to connect. Run `/mcp` and confirm
it says connected.

Seven tools, answering from the canon sliced to your role. A marketing key does
not receive the decisions log or the architecture notes. That is a relevance
boundary rather than a secrecy one, and it is enforced on the server, so it does
not depend on anyone's client being configured correctly.

## What the server does per request

Every request carries its own key. The server verifies it against
`karwan-api/api/team-mcp/verify`, resolves a role, builds a canon sliced to that
role, and tears the whole thing down when the response ends. Nothing about one
caller survives into the next request. That is what makes a shared endpoint safe
to expose, and there is a test that proves two keys on one process get two
different canons.

The server holds no key material. It stores nothing and it cannot mint access.
Revocation happens in the admin panel and takes effect here within the client's
fifteen minute cache window.

## Deploying it

The image is built from this repo by `.github/workflows/publish-mcp-image.yml`
and pushed to GHCR. The Karwan repo's `docker-compose.yml` pulls it.

**The image contains the team canon. Keep the GHCR package private.** Check the
visibility after the first push. A public image here is the whole canon
published, with no way to unpublish it.

On the VPS:

```bash
docker compose pull karwan-team-mcp
docker compose up -d karwan-team-mcp
docker compose logs -f karwan-team-mcp
curl -s https://mcp.karwan.site/health
```

Health reports the canon version and the number of files it parsed. A container
that booted on a broken canon fails its healthcheck rather than serving half of
one.

## Before the first deploy

1. `mcp.karwan.site` in Cloudflare pointing at the VPS, **DNS-only, grey cloud**.
   Proxied, Caddy cannot complete the ACME challenge and never gets a
   certificate. This is the same caveat as `api`.
2. Copy the updated `Caddyfile` to `~/karwan/Caddyfile` and
   `docker compose restart caddy`. The Caddyfile is pinned to the VPS and is not
   synced by the deploy workflow.
3. Confirm the GHCR package is private.

## What this does not solve

The canon now lives on the same box as the signing keys and the database.
Anyone with a shell there can read `canon/team` directly, without a key. The
hosted server raises the floor for everyone who does not have a shell; it does
not protect against someone who does.
