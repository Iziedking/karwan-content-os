---
id: your-karwan-record
title: Your Karwan record, set up once
status: roadmap
visibility: public
audience: all
updated: 2026-10-26
capability: true
tags:
  - reputation
  - agents
  - escrow
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-24
---

Deals held by Karwan's escrow family count on each side's Karwan record. A
person sets their record up once: before their first payment as a buyer,
and as a seller when they agree to their first deal's terms or before their
selling agent offers on a request. Setting it up links their buying and
selling agents to it. The buying agent can then pay up to 1,005 USDC at a
time and 10,000 USDC in total for one year, and asks to be renewed after
that.

A seller sets it up when they agree because the escrow notes each side's
record at the moment the buyer pays in. A deal paid in before the seller
had a record runs normally but does not count on the seller's record.
Until a seller has a record, their selling agent does not offer on new
requests and tells them once a day.

On Arc Testnet, when Karwan holds the person's wallets, Karwan sets the
record up itself the first time it is needed, with no step from them.
Otherwise it takes one confirmation with a passkey or a Karwan PIN, or, for
someone who signs in with their own wallet, signing in that wallet. In Telegram the
card shows in the chat and the confirmation happens on Karwan.

After each payment on a deal, the seller's earnings move from their selling
agent to their own wallet; a move that is still waiting shows in their
balance and is tried again. Once a deal settles, the deal page says when it
is on both records. Deals can be up to 1,000 USDC while Karwan is in beta.

This runs on Arc Testnet once new deals are switched over to the escrow
family; mainnet follows an external audit.
