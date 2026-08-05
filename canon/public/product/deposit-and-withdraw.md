---
id: deposit-and-withdraw
title: Deposit and withdraw
status: live
visibility: public
audience: all
updated: 2026-08-05
capability: true
tags:
  - money
  - deposit
sources:
  - url: https://karwan.site/docs/bridge
    date: 2026-08-05
check:
  kind: grep
  ref: backend/src/routes/deposit.ts#depositRoutes
  note: Returns at most two DISTINCT addresses and no Circle blockchain code, so the chain vocabulary cannot reach a user.
---

Money moves in and out of Arc on one screen. What that screen asks for depends on
who holds the funds, and the difference is the point rather than an inconsistency.

An account that signs in with email or a passkey gets one address. Copy it, send
USDC from Ethereum, Base, Arbitrum or Polygon, and the balance updates itself.
There is no chain to choose, no amount to declare and no wallet to connect,
because Circle derives every deposit wallet from that user's identity anchor, so
the same address serves all four. Solana has its own address on the same screen: a
different signature curve cannot share one.

An account that connects its own wallet keeps the explicit flow. It holds the
funds, so it picks the chain the USDC is on and signs the transfer.

Withdrawals reach Ethereum, Base, Arbitrum, Optimism, Polygon and Solana, and
never require that chain's gas token to receive.

The word for this is Deposit and Withdraw. Not top up, not add money, not cash
out, and never the name of the transfer protocol underneath: which rail carries a
move is not something a person sending money needs to hold in their head.
