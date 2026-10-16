---
id: world-id-risk-checks
title: World ID only when the risk calls for it
status: live
visibility: public
audience: all
updated: 2026-10-16
capability: true
tags:
  - verification
  - agents
  - world-id
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/13-portable-reputation.md
    date: 2026-10-16
check:
  kind: grep
  ref: backend/src/trust/riskEngine.ts#partyReasons
  note: The four reasons that ask for World ID, and the pass that stops a busy new account being asked twice in a day.
---

On an agent deal on Arc Testnet, Karwan's trust rules ask a person to confirm
with World ID only for one of four reasons: their first deal, a deal of 1,000
USDC or more, many deals from a new account in one day, or a link they sent
earlier that was judged malicious.

The buyer confirms when choosing an offer. The seller confirms before escrow
funds, and escrow funds as soon as they pass. A person who already passed World
ID anywhere on Karwan is not asked again for a first deal.

A price far from the market, a low score or a link judged only suspicious never
asks for World ID. Replayed over 197 testnet deals, these rules asked on 55
deals, down from 97 under the earlier rules.

On testnet the check can be skipped so testing is never blocked. World ID is
not configured on mainnet, where escrow is not enabled yet.
