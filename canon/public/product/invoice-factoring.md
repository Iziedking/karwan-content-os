---
id: invoice-factoring
title: Invoice factoring
status: live
visibility: public
audience: all
updated: 2026-10-30
capability: true
tags:
  - financing
sources:
  - url: https://karwan.site/financier
    date: 2026-07-27
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/31-assistant-does-everything.md
    date: 2026-10-25
check:
  kind: grep
  ref: backend/src/routes/factoring.ts#factoringRequestedAt
  note: An invoice reaches no financier until the seller has asked.
---

The supplier asks to be paid early, naming a floor if they want one. Financiers
then bid a discount against the supplier's reputation tier, and the supplier
accepts one or ignores them all.

A supplier who holds their own wallet gets their Karwan record with that first
ask: the website sends the record setup with their wallet signature before the
request goes out. From Telegram the assistant says to open the deal on the
website for that one step.

Nothing reaches a financier until that request exists. An invoice is never listed
for funding on the strength of the supplier having opened a deal, because that
would publish their counterparty, amount and timing to every approved financier
without anybody asking to be funded.

Offers are priced against what the escrow can still pay, not the invoice face.
Face includes the platform fee and every tranche already released, and the
financier is only ever repaid out of what is left. On settlement the escrow pays
the financier ahead of the supplier, so repayment is not something anyone chases.

All of it can also be done by asking the Karwan assistant, on the website or in
Telegram: the supplier asks to be paid early, reads the offers ranked as the deal
page ranks them, and takes or turns one down; a financier sees the requests they
may fund and makes an offer, which is refused before anything moves if their
wallet does not hold the advance. Taking an offer and making one are confirmed on
Karwan, where every figure is shown before money moves.

Being paid early is not yet open on deals made on Karwan's new escrow. Deals made
before it can use it now.
