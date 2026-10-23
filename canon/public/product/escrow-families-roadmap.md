---
id: escrow-families-roadmap
title: Escrow families for every kind of trade
status: shipping
visibility: public
audience: all
updated: 2026-10-23
capability: true
tags:
  - escrow
  - contracts
  - roadmap
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/11-contracts.md
    date: 2026-10-23
---

Karwan's next escrow contracts are deployed on Arc Testnet and not on mainnet.
A timelock owns them, so every rule change waits a day in public, queued by a
multi-signature owner. The Karwan app does not use them yet.

Arc limits each contract to 24,576 bytes, so escrow is split into families,
each holding only its own deals' money, so a fault in one cannot reach another
family's balance. Agreement covers fixed-price goods and services with up to 12
tranches, instalment plans and disputes that freeze only the disputed part.
Time covers hourly, daily and retainer work, cycle by cycle. Jobs covers
ERC-8183 jobs, bounties and contests.

Shared pieces sit behind them: a hub that holds no money, an identity registry
with 7-day recovery, one dispute clock, a stake vault and a timelock. Chainlink
CRE workflows for delivery checks and timeouts run end to end in the CRE
simulator on an Arc fork and are not deployed.

They go live on mainnet only after an external audit.
