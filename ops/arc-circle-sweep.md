# The Arc and Circle sweep

A weekly pass over what moved on Arc and Circle, written into Karwan's signal
pipeline so the newsletter has something to draft from.

## Why this is a routine and not a cron job

The obvious design is a backend watcher that polls the Arc and Circle MCPs on a
schedule. It cannot be built, for two reasons that are worth writing down so
nobody rediscovers them.

Neither MCP is time aware. Arc exposes documentation search and a read-only
filesystem over its docs; the whole tree is 23 pages and contains no changelog,
no release notes, and no dated content of any kind. Circle is the same shape.
Neither can answer "what changed since last Tuesday", so there is nothing for a
poller to diff.

And both servers run in an operator's editor, not on a host the Karwan container
can reach. A cron inside the backend has no path to them.

So the sweep runs where the tools actually live, and posts what it finds.

## Running it

Schedule a routine that follows the procedure below. It needs the Arc and Circle
MCPs available, plus web search, and a checkout of this repo.

```
KARWAN_INGEST_TOKEN=...            write-only, not the admin token
KARWAN_BACKEND_URL=https://api.karwan.site
```

## The procedure

**1. Find out what is already known.** Do this first. The endpoint deduplicates,
but a sweep that does not look will keep rediscovering the same three things and
report a busy week every week.

**2. Sweep Arc.** Use `search_arc_docs` and `query_docs_filesystem_arc_docs` for
areas Karwan actually depends on: unified balance, Gateway, CCTP, App Kit, gas
and fee behaviour, anything about USDC as the native token. Compare against what
the canon says we build on. A doc page that now describes something differently
is a signal. So is a page that did not exist before.

**3. Sweep Circle.** Same, with `search_circle_documentation` and
`get_circle_product_summary`, across CCTP, Gateway, developer-controlled wallets
and Paymaster.

**4. Search the open web** for Arc and Circle announcements in the window. This
is where dated news actually lives, since the docs carry none. Prefer primary
sources: a Circle blog post over somebody's summary of it.

**5. Write a take for each one.** This is the part that matters and the part
only a person or an agent that has read the canon can do. Not "Circle shipped
X", but what it changes for a supplier in Lagos waiting ninety days, or for
Karwan's own rail. If there is nothing to say beyond the fact of it, say so
briefly rather than padding.

**6. Check every claim against the canon.** Use the team MCP's `karwan_facts`.
If the take asserts something about Karwan, that assertion has to be a live fact.
A sweep is not an excuse to invent a capability.

**7. Write the file, dry run it, then send.**

```bash
pnpm signals:drop --file sweep.json --dry-run
pnpm signals:drop --file sweep.json
```

Each item needs a `url` or an `externalId`. Without one there is no identity, so
next week's sweep posts it again and the pipeline fills with copies.

```json
{
  "signals": [
    {
      "origin": "arc",
      "source": "Arc docs",
      "title": "Unified balance covers Solana",
      "url": "https://docs.arc.network/app-kit/unified-balance",
      "publishedOn": "2026-07-24",
      "summary": "One line on what changed.",
      "myTake": "What this changes for the people we build for.",
      "tags": ["arc", "gateway"],
      "importance": "high"
    }
  ]
}
```

## What a good week looks like

Two to five signals, each with a take. Zero is a legitimate result: a quiet week
should produce an empty sweep, not filler. The newsletter engine already refuses
to draft from a thin week, so padding here only makes a worse issue.

Fifteen signals means the sweep is capturing documentation noise rather than
news. Tighten step 2.

## What it cannot do

The token is write only, and `origin` accepts `arc` and `circle` and nothing
else. The sweep cannot speak as a Karwan release: that origin belongs to the
watcher reading `RELEASE_NOTES.md` from inside the deployed image, which is the
one source a reader should be able to treat as our own word.
