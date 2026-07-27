---
id: delivery-proof
title: What counts as delivery
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: true
tags:
  - delivery
  - goods
sources:
  - url: https://karwan.site/docs/deals
    date: 2026-07-27
check:
  kind: grep
  ref: backend/src/routes/deals.ts#shipment-required
  note: Goods deliveries are refused without a carrier and tracking reference.
---

Delivery has to be against something the buyer can check.

A service delivers a link, and the host has to resolve in DNS before the delivery
is accepted. Carrying an https scheme proved nothing on its own: an invented
domain satisfied every earlier check.

Physical goods deliver a carrier and a tracking reference that opens a page the
buyer can read. The buyer then confirms arrival as a separate act from releasing
the money, because arrival is a fact about the shipment and release is a decision
about the money.

Karwan does not verify the shipment with the carrier. What it requires is that
the claim is specific and on the record rather than absent.
