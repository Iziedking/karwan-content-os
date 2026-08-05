---
id: internal-known-constraints
title: Known constraints
status: live
visibility: team
audience: dev
updated: 2026-08-05
capability: false
tags:
  - internal
sources:
  - url: https://karwan.site
    date: 2026-07-27
---

Things that will bite whoever touches this next.

**The escrow is at its size ceiling.** There are a few hundred bytes free against
the EIP-170 limit. Anything added to it has to pay for itself in bytes, and the
optimiser already runs at minimum for size rather than gas.

**Duplicate keys in the production env have caused three incidents.** Last
definition wins silently. Grep for duplicates before trusting any env change.

**A full on-chain stats rescan will rate-limit the RPC.** Never call it from a
scheduled job. Read the cache, or read the chain for one specific thing.

**Docs drift from code and nothing used to catch it.** A public claim about
reputation counting distinct counterparties was true of the contract and false of
the layer that gated lending, and it survived for months across the README, the
site, the submission and the PDF simultaneously. This canon exists because of
that.

**The backend cannot run under tsx.** `npm run dev` used to die linking
`adapter-circle-wallets`, which imports `Blockchain` from the wallets SDK. npm
installs two copies of that SDK: 9.6.0 at the top level for our code and 10.8.0
nested under the adapter for the adapter. Node resolves the nested one, which has
an `exports` map naming an ES build that does export it. tsx resolves the
top-level 9.6.0, which has no `exports` map, so it loads as CommonJS and the named
export is never detected. Dev now compiles and runs `dist` the way production
does. Do not "fix" this by bumping the SDK major to satisfy a dev tool.

**A deposit is credited from a webhook and never trusted as a balance.** The
amount in the event is Circle's word for it; the balance is always read from
chain. That is deliberate, so a missed, duplicated or forged webhook can change
when the UI updates but never what the number says. Any change that starts
treating the webhook as the source of truth reintroduces a way to be told money
arrived when it did not.

**Deposit attribution is keyed on chain AND address.** Circle derives addresses
from a per-chain index, so one address can belong to different users on different
chains. The Arc balance watcher is keyed on address alone and carries a tripwire
saying why that is only safe there. There are ten legacy collisions in the wallet
set, two of them holding funds under two owners.

**There is no legal entity yet.** No jurisdiction, governing law, liability cap
or arbitration clause in the terms, and no privacy route. Do not write copy that
implies otherwise.
