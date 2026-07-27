---
id: internal-known-constraints
title: Known constraints
status: live
visibility: team
audience: dev
updated: 2026-07-27
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

**There is no legal entity yet.** No jurisdiction, governing law, liability cap
or arbitration clause in the terms, and no privacy route. Do not write copy that
implies otherwise.
