---
id: milestone-escrow
title: Milestone escrow
status: live
visibility: public
audience: all
updated: 2026-10-26
capability: true
tags:
  - escrow
  - settlement
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-26
check:
  kind: grep
  ref: backend/src/deals/suiteReviewEnd.ts#reviewEndStep
  note: A delivered payment is sent to the seller only once the buyer's review time has ended with no release and no problem raised.
---

A deal is paid in one to five parts. The seller marks a part delivered, and
the buyer has the review time the deal set, at most 30 days, to check it.

During that time the buyer can release the payment, ask once for more time
to check, or raise a problem. Karwan reminds them a day before the time runs
out. If it ends with no release and no problem raised, that payment goes to
the seller. The final payment works the same way. A deposit is the one
exception: it goes back to the buyer.

Once either side raises a problem, the payment stays held and each side has
72 hours to give their side of what happened.

A missed delivery date lets the buyer take back what is left, and the miss
lands on the seller's record. A cancel or extra time both sides agree to
carries no penalty. The fee is 1 percent of the deal, half from each side.

Deals already open on Karwan's earlier escrow finish under its rules: when
the review ends with no release, the seller claims the payment.
