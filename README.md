# Karwan content OS

The canon, and everything that reads from it.

One source of truth about what Karwan is and what it has shipped, projected into
the places people write: an MCP server for agents, a library for builds, and
skill bundles for editors. Nothing downstream is hand written, so nothing
downstream can drift from the canon.

## The shape

```
canon/            the spine. Markdown with typed frontmatter
  public/         anything that may be said to a stranger
  team/           positioning, roadmap, decisions, voice
packages/
  canon-schema/   frontmatter schema, loader, validate, leak guard
  generator/      selection, fact index, brief, draft review, skill bundles
  team-auth/      key verification with a documented cache window
  team-mcp/       MCP server over the canon, role scoped
  team-kit/       the canon as a library, for builds and CI
  public-mcp/     @karwan/mcp, open, no key, published facts only
  public-kit/     @karwan/kit, the same for community builders
dist/skills/      generated bundles for Claude, Codex and Cursor
```

Every projection goes through `generator`. There is one implementation of "may
we claim this", and everything else asks it.

The two public packages do not filter the canon at read time. They read
`packages/public-kit/canon.public.json`, a generated snapshot containing only
public files, and the team canon is not in either package. A filter can be
forgotten by whoever adds the next tool. A file that was never copied cannot be
served.

## The rule the whole thing exists for

A canon file that asserts product behaviour and claims `status: live` must carry
a `check`: a test, a grep, a contract read, or a dated manual verification. A
claim without one is a sentence nobody is testing.

This is not hypothetical. The README claimed reputation "counts distinct settled
counterparties, so volume with one repeat partner cannot inflate a score". It had
a real source, and it was false of the layer that actually gated lending, because
`concentrationRatio` was computed and never entered the composite. It survived
months because nothing tested the sentence against the code. Publishing that into
four channels on a schedule does not reduce the risk, it industrialises it.

So a roadmap item can never render as a shipped claim, and a manual check that
has gone past its recheck date is barred from generated content until somebody
re-verifies it.

## Commands

```
pnpm check           typecheck, tests, canon validate, leak guard, generate
pnpm canon:validate  parse every file and run its checks
pnpm canon:guard     fail if team content is reachable from a public export
pnpm generate        write the skill bundles to dist/
pnpm test            all packages
```

`dist/` is wiped and rebuilt on every generate. An edit made there is gone at the
next run, which is the point. `canon.public.json` is generated too, but it is
committed rather than thrown in `dist/`, because it is what the public packages
ship and a change to it belongs in a diff somebody reads.

CI runs all of it on every push and every release tag, and fails if the
committed snapshot differs from a fresh cut.

## Using the team MCP

Get a key from an admin at `/admin/team-keys` in the Karwan admin panel. It is
shown once. Then point your editor at the server:

```json
{
  "mcpServers": {
    "karwan-team": {
      "command": "npx",
      "args": ["tsx", "packages/team-mcp/src/index.ts"],
      "cwd": "/path/to/karwan-content-os",
      "env": {
        "KARWAN_TEAM_KEY": "karwan_...",
        "KARWAN_BACKEND_URL": "https://api.karwan.site"
      }
    }
  }
}
```

Seven tools: `karwan_brief`, `karwan_facts`, `karwan_brand`, `karwan_voice`,
`karwan_playbook`, `karwan_research`, `karwan_draft_review`. Each answers from
the canon sliced to your role, and nothing else. The server refuses to start
without a valid key rather than starting and failing per call.

**Revoking a key is not instant. Budget 15 minutes.** See
[`packages/team-auth/README.md`](packages/team-auth/README.md) for why, and for
what happens when the backend is unreachable.

## Using the kit in a build

```ts
import { assertPublishable, facts, brandTokens } from '@karwan/team-kit';

assertPublishable(post); // throws with line numbers and specific fixes
```

`humanize()` reports voice tells, `factCheck()` reports claims the canon does not
support, `review()` returns both with a pass/fail an exit code can use. They
report rather than rewrite: a function that silently edits your copy is one
nobody trusts twice.

## The public packages

`@karwan/mcp` is open, needs no key, and answers about Karwan from the published
canon. `@karwan/kit` is the same data as a library. Both are documented in their
own directories, and both are cut from the snapshot rather than from the canon
tree.

Skill bundles are generated for the public too, under `dist/skills/*/
karwan-public/`. They carry the claim rules and the brand rules. They do not
carry the house voice, because a stranger writing in our voice is not something
we need, and getting our facts right is.

## Installing the Karwan skill

The ZIP is for desktop apps that import skills directly. It contains only
`SKILL.md` and `references/` at its root, which is the layout expected by skill
importers.

[Download karwan-skill.zip](https://github.com/Iziedking/karwan-content-os/releases/latest/download/karwan-skill.zip)

### Codex desktop app

1. Download `karwan-skill.zip` from the link above.
2. Open the Codex desktop app's skill management or import screen.
3. Choose **Import skill** and select the ZIP without extracting it.
4. Confirm that the imported skill is named `karwan`.

### Claude Desktop

1. Download `karwan-skill.zip` from the link above.
2. Open **Settings > Capabilities > Skills**.
3. Upload the ZIP without extracting it.
4. Confirm that the imported skill is named `karwan`.

### Codex CLI and Claude Code

CLI users should use the npm installer rather than the ZIP:

```bash
npx @karwanbuild/skill install
npx @karwanbuild/skill doctor
```

The installer writes the skill to both `~/.codex/skills/karwan` and
`~/.claude/skills/karwan`. Run `update` to replace an installed copy or
`uninstall` to remove it.

### Building the ZIP locally

```bash
pnpm skill:validate
pnpm skill:test
pnpm skill:zip
```

The archive is written to `packages/skill/karwan-skill.zip`. It is a generated
GitHub Release asset and is intentionally ignored by Git.
## Roles

Two, and only two. `dev` reads the whole landscape including architecture, the
decisions log and the roadmap's reasoning. `marketing` reads a deep product
education without implementation internals, because that is noise for the job,
not because it is secret.

Files default to `audience: all` and are narrowed to `dev` only when the content
is genuinely implementation level. Visibility and audience are separate: a public
export never reaches a team file whatever role is asking.
