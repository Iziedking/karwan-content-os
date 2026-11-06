---
id: escrow-families-roadmap
title: Escrow families for every kind of trade
status: shipping
visibility: public
audience: all
updated: 2026-11-06
capability: true
tags:
  - escrow
  - contracts
  - roadmap
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/11-contracts.md
    date: 2026-10-23
  - url: https://github.com/Iziedking/Karwan/blob/main/cre/DEPLOY-SUITE.md
    date: 2026-10-31
---

Karwan's next escrow contracts are deployed on Arc Testnet and not on mainnet.
A timelock owns them, so every rule change waits a day in public, queued by a
multi-signature owner. On Arc Testnet, new deals have opened on the Agreement
family since 24 October 2026. A deal that opened before keeps the escrow it
started on and finishes there; all of them are listed together on the legacy
page so they can be reconciled. The other families are not used by the app
yet.

Arc limits each contract to 24,576 bytes, so escrow is split into families,
each holding only its own deals' money, so a fault in one cannot reach another
family's balance. Agreement covers fixed-price goods and services with up to 12
tranches, instalment plans and disputes that freeze only the disputed part.
Time covers hourly, daily and retainer work, cycle by cycle. Jobs covers
ERC-8183 jobs, bounties and contests.

Shared pieces sit behind them: a hub that holds no money, an identity registry
with 7-day recovery, one dispute clock, the deal guarantee contract and a timelock.

The deal guarantee contract is separate from the escrow, so a refusal from it
never blocks a deal. The escrow records the refusal instead. Every 10 minutes
Karwan reads each guarantee locked on a deal and checks it against what the
deal needs. It reserves the guarantee again if it would run out while the deal
can still run. It frees one left locked after its deal ended once its
reservation runs out, which anyone may do. A ruling's payment to the buyer
from the guarantee that did not go through cannot be retried by the contract,
so it goes to a person from the team, with the deal and the ruling.

Three Chainlink CRE workflows run on Chainlink's hosted network: one checks a
delivery against the agreed tests, one records verified GitHub work, and one
triggers the timeouts each family allows. The CRE adapter on Arc Testnet takes
a report only from the workflow bound to its job, and those bindings change
only through the same timelock. On 31 October 2026 a buyer's agent paid 0.25
USDC over x402 for a dry run of a deal's agreed checks; Chainlink's network
replayed them on GitHub, and its signed answer released the fee on Arc.

They go live on mainnet only after an external audit.
