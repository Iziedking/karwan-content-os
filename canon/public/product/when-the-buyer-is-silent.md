---
id: when-the-buyer-is-silent
title: When a buyer does not respond after delivery
status: shipping
visibility: public
audience: all
updated: 2026-10-25
capability: true
tags:
  - escrow
  - disputes
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-25
---

Every Karwan deal gives the buyer a set time to check each delivery, chosen
when the deal is agreed and never more than 30 days.

During that time the buyer can release the payment, ask once for more time
to check, or raise a problem with what is wrong. A day before the time runs
out, Karwan reminds them, on the website, by email and on Telegram.

If the time runs out with no release and no problem raised, that payment
goes to the seller. This works the same for a milestone and for the final
payment. A buyer cannot raise a problem after their time to check has ended.

Once either side raises a problem, the payment stays held and each side has
72 hours to give their side of what happened. A side that gives no account
loses. A person on Karwan's review team confirms every ruling before any
money moves.
