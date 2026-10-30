---
id: delivery-proof
title: What counts as delivery
status: shipping
visibility: public
audience: all
updated: 2026-10-30
capability: true
tags:
  - delivery
  - goods
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/33-delivery-proof-for-every-kind-of-deal.md
    date: 2026-10-26
check:
  kind: grep
  ref: backend/src/routes/deals.ts#shipment-required
  note: Goods deliveries are refused without a carrier and tracking reference or the buyer's handover code.
---

Delivery has to be against something the buyer can check, and what that is
depends on the kind of deal.

Anyone can sell goods on Karwan, a person or a business. When the deal is made
the seller says how the item reaches the buyer: shipped, with a carrier and
tracking number at delivery, or handed over in person, with the buyer's
one-time handover code. The kind of deal, one payment, stages or goods, is
saved on the deal, and the escrow follows it.

Work, such as a design, writing, code or a video, is delivered as a link to the
work, with a short note. The link has to point to a real site before the
delivery is accepted. Every link is checked for safety; one the check holds is
hidden from the buyer and never paid for, not even when the buyer's review time
ends, until a person at Karwan clears it or the seller sends another link.

Separately from links, the security agent screens each match when it is funded.
A match it holds shows Held for a look on the deal, with one shared line and
only the lines meant for that side. The money stays in escrow and release
follows the deal’s own rules; nothing is blocked. Either person can ask a
person at Karwan to check from that card, and a person at Karwan clears the
hold with a reason, after which both see one line in the deal chat. A person
at Karwan can also review an earlier delivery link, or one on a closed deal,
for the record: clearing it takes the offence off the seller and changes
nothing for the money.

Goods sent with a courier are delivered with the carrier and the tracking
number. Karwan builds the tracking link for DHL, FedEx, UPS and the main
shipping lines. For local couriers, such as GIG Logistics, Kwik, NIPOST,
Aramex, Emirates Post, Delhivery, India Post and Bosta, the seller adds the
courier's tracking page. The buyer confirms when the goods arrive, which
starts their review. Confirming arrival does not pay the seller.

Goods handed over in person end with a handover code. The buyer opens the deal
and shows a six-digit code only once they hold the item, and the seller enters
it. The code works once, counts as the item arriving, and starts the buyer's
review, so the buyer can still raise a problem they find later. Five wrong
tries lock the code for 15 minutes, and asking for a new code cancels the old
one.

Goods worth more than 50 USDC are delivered with a photo of the item. Any
delivery can carry up to four photos, added on the deal page or sent to the
assistant with a caption like "delivered" or "packed".

Both sides see every delivery on the deal page: the links to open, where the
goods are, what Karwan checked, the photos and the deliveries before this one.
The assistant answers "where is my order" from the same record.

Karwan does not inspect goods or judge the quality of work, and it does not
read the courier's own tracking status yet. What it requires is that each
delivery is specific, on the record and fingerprinted on chain with the
delivery.
