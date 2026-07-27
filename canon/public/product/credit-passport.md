---
id: credit-passport
title: The credit passport
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: true
tags:
  - reputation
sources:
  - url: https://karwan.site/docs/reputation
    date: 2026-07-27
check:
  kind: grep
  ref: backend/src/reputation/config.ts#tierCeilingForConcentration
  note: Concentration caps the tier, so a record built on one counterparty cannot buy standing.
---

A public page per business, built from settled deals, repayment behaviour and
counterparty concentration. It follows the wallet, not the platform.

Standing has to be earned in completed work. Stake, tenure and activity all raise
the score on their own, which is deliberate, but they cannot carry a tier without
settled deals behind it. Concentration caps the tier when most of those deals are
with a single counterparty, so trading in a circle cannot manufacture a record.

Both matter because the tier is not cosmetic. It decides financing eligibility
and how much collateral a supplier posts against an advance, and a ladder that is
cheap to climb makes the financing gate cheap to fake.

It is also a paid endpoint. Any lender can pay a fraction of a cent over x402 and
read a verifiable settled-deal record without asking Karwan for permission.
