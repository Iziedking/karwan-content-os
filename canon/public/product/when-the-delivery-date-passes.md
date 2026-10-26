---
id: when-the-delivery-date-passes
title: When the delivery date passes
status: shipping
visibility: public
audience: all
updated: 2026-10-26
capability: true
tags:
  - escrow
  - deadlines
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-26
---

Every Karwan deal has a delivery date. A day before it, Karwan reminds the
seller to deliver or to ask the buyer for more time. When the whole delivery
time is under two days, the reminder comes halfway.

If the date passes with nothing delivered, both sides are told. The seller
has one more day to deliver. After that, the buyer's money goes back to them
automatically, and the missed date counts against the seller's record.

The seller can ask for more time before the date, one request at a time, and
once more after it while that last day runs. A request the buyer has not
answered holds the refund: the money stays in the deal until the buyer
approves or declines, and Karwan reminds the buyer up to three times, a day
apart. If the buyer declines, the refund goes ahead. If they approve, the
extra days count from the later of the old date and the moment they approve.
