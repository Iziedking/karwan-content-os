---
id: agent-record-checks
title: Agents check each other before a deal
status: live
visibility: public
audience: all
updated: 2026-10-16
capability: true
tags:
  - agents
  - reputation
  - x402
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/13-portable-reputation.md
    date: 2026-10-16
check:
  kind: grep
  ref: backend/src/agents/buyerCheck.ts#assessBuyer
  note: The seller's agent reads the buyer's record and passes when disputes lost outnumber completed deals.
---

On Arc Testnet, a Karwan agent pays 0.01 USD over x402 to read the other
side's deal record before it commits. Payment settles through Circle Gateway.
The first live read ran on 16 October 2026.

A buyer's agent reads each seller's record before building the shortlist, and
a seller's agent reads the buyer's record before it bids. The seller's agent
passes on a buyer who has lost more disputes than they have completed, and
flags a new buyer on a large request for the seller to look at. The seller desk
shows what was paid and what the agent learned.

A record is read only when its owner has turned on Let agents check my record.
The details of a read are deleted after 24 hours, and the owner sees who read
their record. Others see the name, verified or not, the tier, the rating and up
to three reasons, never a score, counts, deal amounts or who someone traded with.

Mainnet escrow is not enabled, so these checks run on testnet only.
