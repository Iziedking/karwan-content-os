---
id: internal-decisions-log
title: Decisions log
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

Decisions that shaped the product, kept because the reasoning is the valuable
part and it evaporates fastest.

**Contracts are immutable and the bundle is meant to be the last cascade.** Every
future capability lands via a settable repoint, never another redeploy of
everything. A leaf contract may be redeployed alone.

**Reputation tiers are computed off chain.** The composite reads on-chain counts
but the banding lives in the backend, derived on read. Reading a v2 composite on
chain would mean redeploying the reputation contract and cascading through
everything referencing it. Policy that changes often does not belong in a money
contract.

**Financing collateral policy is off chain, the floor is on chain.** The contract
enforces what protects funds. The tier ladder that decides how much a given
seller posts is env-tunable, because tier rules change far more often than a
money contract should be redeployed.

**One accent, one primary action.** Design decision with a product reason: the
surfaces where this matters are money surfaces, and a screen with three equally
loud buttons is a screen where somebody clicks the wrong one.

**Human approval gates every outbound publish.** The system drafts and waits.
That is a brand and accuracy decision, not a technical limitation.
