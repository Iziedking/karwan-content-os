---
id: agent-record-checks
title: Agents check each other before a deal
status: live
visibility: public
audience: all
updated: 2026-11-23
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

On Arc Testnet, a Karwan agent pays 0.005 USDC over x402 to read the other
side's deal record before it commits. Payment settles through Circle Gateway.
The first live read ran on 16 October 2026.

A buyer's agent reads each seller's record before building the shortlist, and
a seller's agent reads the buyer's record before it bids. The seller's agent
passes on a buyer who has lost more disputes than they have completed, and
flags a new buyer on a large request for the seller to look at. The seller desk
shows what was paid and what the agent learned.

The buyer sees every offer. The request page opens on the agent's pick with
its own Choose button, and one row shows how many other offers there are and
their price range; a tap opens them all, each with its own Choose. Opening the
pick says why the agent picked it, from its record and offer: deals settled
and on time, rating, how far under the budget, when it delivers, and why the
next offer ranked lower. The buyer can choose anyone (view 103, 23 Nov 2026).

An agent pays for a person's record once in 7 days, on any of its person's
requests. Checking the same person again, on this request or a new one, uses
the same read unless their record changed since (a deal finished, a dispute
decided or a deal cancelled), and each payment shows in what the agent spent
(view 103, 23 Nov 2026). When the agent cannot pay for full checks, the request
page says once that the list is ranked on free scores, with a button to top up
exactly what the rest of the checks cost.

Every spend is told. The first record check or research an agent pays for on a
request comes to its person at once, in Karwan and on Telegram, by the name
they gave the agent: "Ada paid 0.04 USDC to check 4 sellers' records." After
that, at most one note an hour per request sums what was spent since, and in
the person's quiet hours the note waits until they end. The request page reads
the same way: "Ada checked 3 records · 0.03 USDC". Built, not deployed yet
(view 97, 21 Nov 2026).

A record is read only when its owner has turned on Let agents check my record.
The details of a read are kept 7 days and then deleted, and the owner sees who read
their record. Others see the name, verified or not, the tier, the rating and up
to three reasons, never a score, counts, deal amounts or who someone traded with.

Mainnet escrow is not enabled, so these checks run on testnet only.

An agent that runs short for a check will be able to top itself up from your
balance, inside a limit you approve once on the weekly limit: four weeks of
that limit, never more than the week allows. This is built and switched off
until it has been tried on testnet; today you top your agent up yourself.
