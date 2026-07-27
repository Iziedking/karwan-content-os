---
id: milestone-escrow
title: Milestone escrow
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: true
tags:
  - escrow
  - settlement
sources:
  - url: https://karwan.site/docs/deals
    date: 2026-07-27
check:
  kind: grep
  ref: contracts/src/KarwanEscrow.sol#releaseFinal
  note: The final release is a distinct buyer-called path, never reachable from a timer.
---

A deal splits into two to five milestones. The supplier marks a milestone
delivered, the buyer reviews and releases that portion.

The final milestone always needs an explicit buyer click and never releases on a
timer. That is the buyer protection the rest of the product rests on, and it is
enforced in the contract rather than in the interface.

A missed deadline lets the buyer reclaim, and the miss lands on the supplier's
record. A cancel or extension both sides agree to carries no penalty and refunds
in full. The platform fee is 1.5 percent of the deal, split evenly between the
two sides.
