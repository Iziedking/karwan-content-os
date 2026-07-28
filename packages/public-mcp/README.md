# @karwan/mcp

Karwan's published facts, over MCP. Open, no key.

Point an agent at this and it answers about Karwan from the canon instead of
from whatever it absorbed during training. That is the whole reason it exists.
An agent asked about a product it half remembers does not say it is unsure, it
produces a confident description of a product that does not exist.

## Install

```json
{
  "mcpServers": {
    "karwan": {
      "command": "npx",
      "args": ["-y", "@karwan/mcp"]
    }
  }
}
```

## Tools

| Tool | Answers |
| --- | --- |
| `karwan_overview` | What Karwan is, who it is for, the vocabulary |
| `karwan_features` | Live capabilities only, safe to state in the present tense |
| `karwan_facts` | The fact index with sources, plus the network and contract proof |
| `karwan_brand_public` | Colours, type, logo usage, what not to do with the mark |
| `karwan_faq` | Safety of funds, disputes, what happens when something goes wrong |

Every response carries the canon version and the date the canon last changed.

`karwan_features` cannot return a roadmap item. It reads the fact index and
takes only what is marked publishable, which is decided by the same partition
the team tools use. There is no second implementation of the rule to fall out of
step.

## What it will not tell you

Anything Karwan has not published. There is no key and no role because there is
nothing here to gate: the server reads a snapshot of the public canon, cut at
build time, and the team canon is not in the package. Ask it something we have
not said publicly and it says so rather than guessing.

Internal check references are stripped from the fact index. You can see that a
claim is checked, what kind of check it is and when it was last verified. You
cannot see our source layout.

## Rate limit

60 calls a minute by default, with a burst, configurable with
`KARWAN_MCP_RATE_LIMIT`.

Over stdio this is a runaway guard rather than access control: you are running
your own copy, so the only caller it protects anything from is an agent stuck in
a retry loop. It matters when the same server sits behind an HTTP transport,
where one process does serve many callers.

## Registry listing

`server.json` is the manifest, written against the registry's
`2025-12-11` schema.

The registry's `description` is capped at **100 characters**, so the listing is
one line, not a paragraph:

> Karwan's published facts: what has shipped on this Arc trade settlement rail,
> and what has not.

The longer pitch lives at the top of this file, which is what npm renders on the
package page.

### Namespace

The manifest claims `site.karwan/mcp`, the reverse DNS form of `karwan.site`.
That requires DNS authentication: a TXT record on the **apex** of karwan.site,
not under a selector like `_mcp-auth`.

```bash
openssl genpkey -algorithm Ed25519 -out key.pem
PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
echo "karwan.site. IN TXT \"v=MCPv1; k=ed25519; p=${PUBLIC_KEY}\""
```

The alternative is GitHub auth, which forces the name into
`io.github.iziedking/*`. The domain namespace is worth the TXT record: the name
in the registry is the brand, and it should not read as a personal account.

Whichever you pick, `name` in `server.json` and `mcpName` in `package.json` have
to match it exactly, or the registry refuses the publish.

### Release checklist

The registry hosts metadata only, so npm comes first.

1. Own the `@karwan` scope on npm. Nothing below works without it.
2. Set `"private": false` in `package.json`. It is `true` today so an accidental
   `npm publish` fails loudly instead of shipping.
3. Decide what actually gets published. `@karwan/mcp` depends on `@karwan/kit`
   through a `workspace:*` link, so the kit has to be published first and the
   dependency rewritten to a real version range.
4. `npm publish --access public`, then bump `version` in both `package.json` and
   `server.json`. The registry rejects version ranges, so the two must be the
   same exact string.
5. Publish the listing, once the TXT record has propagated:

   ```bash
   PRIVATE_KEY="$(openssl pkey -in key.pem -noout -text | grep -A3 "priv:" | tail -n +2 | tr -d ' :\n')"
   mcp-publisher login dns --domain karwan.site --private-key "${PRIVATE_KEY}"
   mcp-publisher publish
   ```

   Keep `key.pem` out of the repo. It is the credential for the whole namespace,
   and anyone holding it can replace the listing.

The registry is in preview and resets its data during breaking changes, so treat
a listing as replaceable rather than permanent.
