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

Listing copy, for the MCP registry entry at release. It is most people's first
sentence about Karwan, so it reads as a claim rather than a summary.

> **Karwan** · Cross-border trade settlement on Arc. Money sits in milestone
> escrow and releases against delivery, and every settled deal writes to a credit
> record the business owns. This server answers from Karwan's published canon:
> what has shipped, what has not, the contract addresses, and the brand rules.
> No key. Use it before writing anything about Karwan, because a model answering
> from memory will describe a different product.

Verify the registry's current manifest schema against its own docs before
publishing. This file carries the copy, not the format.
