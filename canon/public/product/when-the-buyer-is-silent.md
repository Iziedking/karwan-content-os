---
id: when-the-buyer-is-silent
title: When a buyer does not respond after delivery
status: roadmap
visibility: public
audience: all
updated: 2026-10-24
capability: true
tags:
  - escrow
  - disputes
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-24
---

On deals held by Karwan's escrow family, no payment goes to a seller only
because the buyer's review time ran out, since a buyer may simply be away.

When review time ends without the buyer releasing the payment or raising a
problem, the seller is asked whether to ask for payment, in one tap on the
deal page or from their assistant in any chat. If they have not asked
within 24 hours, their selling agent asks for them and tells them.

The buyer then has 72 hours to answer by saying what is wrong with the
delivery. An answer sends the case to a person on Karwan's review team,
who rules within 5 days; if they do not, the deal's agreed fallback share
applies. With no answer, that payment goes to the seller. This works the
same for a milestone and for the final payment.

A buyer opens a dispute while their review time runs; after it ends they
answer the seller's instead.

On Arc Testnet this is how Karwan runs these deals once new deals are
switched over to the escrow family. The contract itself will carry the
rule in the mainnet release, before its external audit.
