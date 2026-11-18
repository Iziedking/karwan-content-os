---
id: faq-money-safe
title: What stops the other side taking my money
status: live
visibility: public
audience: all
updated: 2026-11-18
capability: false
tags:
  - faq
sources:
  - url: https://karwan.site/docs/deals
    date: 2026-07-27
---

The money sits in an escrow contract, not with Karwan and not with your
counterparty. A buyer funds it before work starts, so a supplier can see the
money exists before shipping. A supplier cannot take it early, and a buyer cannot
withdraw it once the deal is accepted.

The final tranche always needs an explicit buyer click. Nothing settles the last
portion on a timer.

If the two sides disagree, either can raise a dispute, which freezes the escrow.
On deals made on Karwan's newer escrow, a fixed set of rules first proposes an
outcome from the deal's record. Either side has 72 hours to ask for a person to
decide instead. A case sent to people is ruled by a Safe that needs two of its
signers, so no single person rules it; if they do not rule in 5 days, the share
written into the deal's terms applies. On the older escrow every dispute is
ruled by a 2-of-3 Safe.
