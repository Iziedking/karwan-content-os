---
id: invoice-factoring
title: Invoice factoring
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
  kind: grep
  ref: backend/src/routes/factoring.ts#factoringRequestedAt
  note: An invoice reaches no financier until the seller has asked.
---

The supplier asks to be paid early, naming a floor if they want one. Financiers
then bid a discount against the supplier's reputation tier, and the supplier
accepts one or ignores them all.

Nothing reaches a financier until that request exists. An invoice is never listed
for funding on the strength of the supplier having opened a deal, because that
would publish their counterparty, amount and timing to every approved financier
without anybody asking to be funded.

Offers are priced against what the escrow can still pay, not the invoice face.
Face includes the platform fee and every tranche already released, and the
financier is only ever repaid out of what is left. On settlement the escrow pays
the financier ahead of the supplier, so repayment is not something anyone chases.
