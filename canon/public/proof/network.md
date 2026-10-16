---
id: proof-network
title: Network and contracts
status: live
visibility: public
audience: all
updated: 2026-10-16
capability: true
tags:
  - proof
sources:
  - url: https://testnet.arcscan.app
    date: 2026-07-27
  - url: https://explorer.arc.io/address/0xa8E41F941b44CA091E3Ab7b600fe1484838aE27D
    date: 2026-10-16
  - url: https://explorer.arc.io/address/0x69eA60B6EFd13A126Eb00d25aB0f21A4AfC636eF
    date: 2026-10-16
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

On Arc mainnet, chain 5042, two Karwan contracts are live and verified on
Sourcify, both owned by a 2-of-3 Safe: KarwanReputation at
0xa8E41F941b44CA091E3Ab7b600fe1484838aE27D, which records completed deal
outcomes, and KarwanBusinessRegistry at
0x69eA60B6EFd13A126Eb00d25aB0f21A4AfC636eF, which records that a business's
documents were checked, storing only a document hash. Neither holds customer
money. Mainnet escrow is not enabled until the contracts and backend pass an
external audit.
