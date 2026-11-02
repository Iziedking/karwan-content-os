---
id: roadmap-current-build
title: Current build status
status: roadmap
visibility: team
audience: all
updated: 2026-11-02
capability: false
tags:
  - roadmap
  - status
---

Build status on 2026-11-02, generated from the roadmap and the product flow
view. This says what is being built. It does not say what may be claimed in
public: ask `karwan_facts` before writing a claim.

Running now: the API on testnet and mainnet runs e748f8f, deployed 1 Nov 2026, which holds all nine batches of the one product flow. The mainnet web deal rail stays closed.

## The one product flow

- Batch 1: dead ends and words (`GET /api/features`, hourly hidden while off, switched-off pages are a 404, not-found leads to your trades, Earlier deals, offer, Deposit): Built, 31 Oct 2026
- Batch 2: navigation and one Deals list (`/deals` ordered needs you, active, finished; phone bar Home, Market, Deals, Profile; desktop rail Home, Market, Deals with a...: Built, 31 Oct 2026
- Batch 3: the market (Buy and Sell, one search, categories, photo cards with the seller, rating and delivery, a marked sample photo when an offer has none, Sell shows...: Built, 31 Oct 2026
- Batch 4: the order flow (Order opens Review your order at `/order/<id>`, signing in first and coming back; Delivery, then Price, Karwan fee and You pay from `GET...: Built, 31 Oct 2026
- Batch 5: the deal page for every kind (the steps for one payment, stages, goods shipped and handed over, with the money paid out and held on a deal in stages; whose move...: Built, 31 Oct 2026
- Batch 6: request and offers (the newer request page for everyone, with its reference, Up to and Needed by; offers ranked and led by "Best fit, picked by your agent" with...: Built, 31 Oct 2026
- Batch 7: money (the newer money page for everyone: the balance, "held in your deals", Add money, Send and Withdraw, the agents under one row, deal references in recent...: Built, 31 Oct 2026
- Batch 8: profile and problems (Profile shows Your record with your own counts or New on Karwan, Share your record, Your offers, How your agent sells, and What others see...: Built, 31 Oct 2026
- Batch 9, part A: desktop and removals that lose nothing (on a wide screen a deal that needs you shows its move on its row, Home added a Telegram card until Telegram is...: Built, 31 Oct 2026
- Batch 9, part B: the last moves only the old deal page made, then that page goes (the deal page answers every proposal, saying how much moves; in a dispute either side...: Built, 1 Nov 2026

## T1 Find and agree

- One market, one entry: Built and committed 18 Oct (84814b50..d4732325); e2e covers both account types; Telegram reaches every action through the shared tools. Closes on deploy and...
- Choose the kind of deal: Next
- Ship the held work: Waiting
- Turn on the shortlist and search v2 on testnet: Waiting
- The negotiation, run from the assistant: Built 24 Oct
- Offers that move: Built 27 Oct 2026; not yet seen on testnet
- Photos on offers: Built 24 Oct
- Agents that always answer: Phase 1 built 29 Oct 2026; phases 2 to 6 (prices as a starting point, quantity, found in seconds, negotiating like people, what the agent learns) planned

## T2 Protected deals

- The contract family behind "choose the kind of deal": Active
- Delivery checks (CRE) on testnet: Waiting
- Mainnet escrow: Waiting

## T3 Reputation that travels

- Who sees what: Next (code)
- Record reads between agents on testnet: Waiting
- Ratings live: Waiting
- Unified reputation with partner platforms: Waiting
- Developer docs and the paid data API (`/developers`, `/x402`) on testnet: Built and committed (5e79be32)

## T4 Trade finance

- Architecture view for trade finance: Done (view agreed 18 Oct)
- Purchase-order financing works on testnet: Built 29 Oct 2026, not deployed: one action with T4.3 on the family, proven on an Arc fork
- "Get paid now" on any funded deal: Built 29 Oct 2026, not deployed: deal page, assistant and Telegram on the family; desk positions show Pay the seller; the rest of the desk to UI law v2 follows

## T5 Money like a bank account

- Plain words for money, and the Deal guarantee: Built 29 Oct 2026, not deployed: backend, website, assistant and five languages; collect proven on an Arc fork; testnet run waits for the deploy
- Money-path re-architecture: Waiting
- Mainnet sign-in with PIN or passkey confirmations: Waiting
- Local currency in and out, Nigeria first: Waiting

## T6 Channels

- Telegram on testnet, run on a phone end to end: Next
- Website assistant parity: Waiting
- WhatsApp: Waiting
- Assistant memory: Built
- The assistant does everything a person can: Building
