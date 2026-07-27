---
id: release-timing
title: Review windows and release timing
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: true
tags:
  - escrow
  - timing
sources:
  - url: https://karwan.site/docs/deals
    date: 2026-07-27
check:
  kind: grep
  ref: backend/src/deals/releaseWindow.ts#termsFloorMs
  note: One window governs both the unattended release and the seller claim.
---

The review window is not one fixed number.

It grows with the size of the deal and shrinks as two parties build a settled
history together. On a goods deal it cannot expire while the shipment is still in
transit, and agreed Net terms hold it open for the full term. Marking goods
delivered means dispatched, not arrived.

The same window governs the unattended release and the seller's own claim. When
those two disagreed, the protection was one button wide: a Net 30 deal held off
the automatic release for thirty days while the seller could force the payout on
day one.

Nothing in the window keys off quality. The contract cannot observe whether the
work was any good, and a timer that pretended to would be a slower way of
guessing.
