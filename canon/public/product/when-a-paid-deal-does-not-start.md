---
id: when-a-paid-deal-does-not-start
title: When a paid deal does not start
status: shipping
visibility: public
audience: all
updated: 2026-10-26
capability: true
tags:
  - escrow
  - refunds
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-26
---

A deal starts when the buyer's money is in the escrow and the seller's side
accepts it. Karwan does that accept for the seller right after the buyer pays.

If the accept does not go through, for example because the seller has not set
up their Karwan record yet, the money stays in the escrow and the buyer is
protected. Nobody pays twice. Karwan keeps trying the accept, and the deal
page tells the buyer the date by which the money comes back if the deal has
not started.

The buyer can take the money back at any time before the deal starts, from
Something is wrong on the deal page or by asking the assistant. If they do
nothing, the escrow returns it to them by itself three days after they paid,
once the seller's side can no longer accept. Neither side's record changes,
because the deal never started.
