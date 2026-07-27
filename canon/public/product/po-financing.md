---
id: po-financing
title: Purchase-order financing
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: true
tags:
  - financing
sources:
  - url: https://karwan.site/financier
    date: 2026-07-27
check:
  kind: contract
  ref: KarwanPOFinancing.fund#atomic-advance
  note: fund() pays the seller and assigns the receivable in one transaction.
---

Working capital advanced against an accepted purchase order whose escrow the
buyer has already funded.

The advance goes straight to the supplier, in the same transaction that redirects
that deal's settlement to the financier. That atomicity is the whole design.
There is no state in which the redirect is live and the supplier has not been
paid, so nothing can strand the advance, and the supplier can spend the capital
immediately. An advance they cannot touch until after they deliver is not working
capital.

On settlement the escrow pays the financier ahead of the supplier. If the deal
settles short, the shortfall alone is recovered from the supplier's staked
collateral, and the rest of the bond returns to them.
