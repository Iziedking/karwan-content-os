---
id: your-karwan-record
title: Your Karwan record, set up on the way
status: roadmap
visibility: public
audience: all
updated: 2026-10-28
capability: true
tags:
  - reputation
  - agents
  - escrow
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-27
---

Deals held by Karwan's escrow family count on each side's Karwan record. The
record links a person's buying and selling agents to them, and their deals
and checks are written to it. Nothing ever waits for it: paying, agreeing to
a deal, making an offer and a selling agent's offers all go ahead with or
without a record.

When Karwan holds the person's wallets, as for email, passkey and Telegram
accounts, Karwan sets the record up itself the first time it is needed, with
no step from them, on Arc Testnet. On mainnet that takes one confirmation
with a passkey or a Karwan PIN.

Someone who signs in with their own wallet never takes a separate step either.
The record's steps ride along with the next transaction they sign on Arc in
Karwan, such as adding money to their agents or putting up deal insurance, in
the same wallet prompt. They are added only when the wallet's USDC covers the
small extra network fee, and never when the whole balance is being sent.
The person's own transaction always comes first and never fails because of
the record. Once it is set up, the result says so in one line. A transaction
signed on another chain, or from a smart-contract wallet, goes on its own and
the next one carries the record.

The escrow notes each side's record when the buyer pays in, so a deal paid
in before a side had a record runs normally but does not count on that
side's record. When that happens to someone with their own wallet, the
settled deal's receipt offers to count their next deals, with one signature.
It shows at most once a month and can be ignored.

The buying agent can pay up to 1,005 USDC at a time and 10,000 USDC in total
for one year. When it reaches its year or its total, it steps aside so a
payment still goes through, and it is linked again with the next setup.

After each payment on a deal, the seller's earnings move from their selling
agent to their own wallet; a move that is still waiting shows in their
balance and is tried again. Once a deal settles, the deal page says whether
it is on both records. On mainnet, deals can be up to 1,000 USDC while
Karwan is in beta; testnet allows larger deals. A deal over the limit is
refused before any money moves, with the largest amount allowed.

New deals on Arc Testnet have opened on the escrow family since 24 October
2026; mainnet follows an external audit.
