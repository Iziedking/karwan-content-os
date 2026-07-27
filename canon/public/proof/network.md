---
id: proof-network
title: Network and contracts
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: true
tags:
  - proof
sources:
  - url: https://testnet.arcscan.app
    date: 2026-07-27
check:
  kind: contract
  ref: KarwanEscrow.arbiter#is-safe
  note: Reads the deployed escrow, so a stale address cannot pass.
---

Karwan runs on Arc Testnet, chain 5042002, where USDC is the gas token.

Every contract in the live bundle is verified on the explorer. The escrow's
arbiter is a 2-of-3 Safe, so a disputed escrow cannot be resolved by one key.

Contract addresses are published and readable by anyone. Treat the explorer as
the source of truth on any disagreement with a document: the chain is the record,
and a page describing it is a copy.
