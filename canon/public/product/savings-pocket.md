---
id: savings-pocket
title: The savings pocket and the deal guarantee
status: shipping
visibility: public
audience: all
updated: 2026-11-15
capability: true
tags:
  - money
  - protection
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/82-savings-pocket.md
    date: 2026-11-15
---

The savings pocket is money a person keeps aside on Karwan. It has its own page,
opened from the Savings pocket row in Profile, with Add to pocket and Take out.
It is not counted in the balance. It earns at the rate of US Treasury bills,
paid by Karwan on testnet. Taking money out waits a few days, then it is
collected back to the balance.

A buyer can ask the seller to back a deal with part of its value: a deal
guarantee. When starting a deal, the buyer turns on Ask for a deal guarantee and
picks 50, 75 or 100 percent. A deal guarantee comes only from the seller's
savings pocket.

The seller backs it when they agree to the deal, with Back it from my pocket.
If their pocket does not have enough free, Karwan says how much is missing and
nothing moves. The buyer cannot pay in until the seller has backed it. Once the
buyer pays in, the escrow keeps that part of the seller's pocket for the buyer
until the deal ends. It stays the seller's and keeps earning, and it frees when
the deal ends well. If the deal goes wrong and the ruling favours the buyer, the
buyer can be paid from it.

The assistant does the same in chat, on the website and in Telegram: it reads
the pocket, adds to it, takes money out, and shows a seller the guarantee on the
card when they agree to a deal.
