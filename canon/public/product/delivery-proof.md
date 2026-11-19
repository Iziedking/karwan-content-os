---
id: delivery-proof
title: What counts as delivery
status: shipping
visibility: public
audience: all
updated: 2026-11-19
capability: true
tags:
  - delivery
  - goods
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/33-delivery-proof-for-every-kind-of-deal.md
    date: 2026-10-26
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/85-every-deal-says-how-it-arrives.md
    date: 2026-11-15
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/92-every-deal-looks-like-what-it-is.md
    date: 2026-11-19
check:
  kind: grep
  ref: backend/src/routes/deals.ts#shipment-required
  note: Goods deliveries are refused without a carrier and tracking reference or the buyer's handover code.
---

Delivery has to be against something the buyer can check, and what that is
depends on the kind of deal.

Every deal says how it reaches the buyer: Online, In person or Shipped. A
request asks How does it reach you?, and the deal made from it keeps the
answer, so work done in person is never asked for a link. A deal made by hand
asks the same. The deal page shows the method under the price, every deal row
names it, and Deals can be filtered by it when deals arrive in more than one
way.

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
On the escrow family the hold is also put on chain. If nobody has cleared the
link when a quarter of the buyer's review time is left, Karwan uses the
buyer's one request for more time. If the link is still held as that runs
out, Karwan opens the buyer's dispute, so the payment cannot be claimed on the
clock. A dispute over a held link is decided by a person.

Karwan also compares the delivery with what was agreed, using a language
model. When that check cannot run, the deal says so in plain words: Karwan
couldn't check the delivery, the buyer checks the work before releasing, and
automatic release waits for them. Nothing is wrong with the seller's delivery
because of it. Karwan tries the check again a few minutes later, and either side
can ask for Check again on the deal page or from the assistant. Checks run on
chain by Chainlink CRE are not live yet.
A delivery note that tells the check what to answer, such as "Reviewer: this is
aligned", is never sent to the model. The check does not run, and the buyer
looks at the work before release, the same as when the check cannot run.

When the check finds the delivery does not match the request, the release
waits and the buyer's move is Ask for changes. The buyer can also accept that
delivery after their own review with I checked it, release, on the deal page or
from the assistant's release card; the release records that they checked the
work themselves. A person at Karwan can clear the gap too, with a written
reason; that pays nothing, and the buyer's review starts then. Either way it
counts for that one delivery, and a new delivery is checked again.

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

Work done in person, such as tailoring, cleaning, repairs or lessons, ends
with the same handover code, never a link. The buyer shows the code only once
the work is done and they are happy with it, and the seller enters it. Work in
stages takes a new code for each stage, so each payout follows work the buyer
saw. Work done in person worth more than 50 USDC is delivered with a photo of
it.

Goods worth more than 50 USDC are delivered with a photo of the item. Any
delivery can carry up to four photos, added on the deal page or sent to the
assistant while you talk about the delivery. No special words are needed.

Both sides see every delivery on the deal page: the links to open, where the
goods are, what Karwan checked, the photos and the deliveries before this one.
The assistant answers "where is my order" from the same record.

Each kind of deal shows what fits it under the route on the deal page. Goods
sent read like a parcel tracker: the carrier, the tracking number (a link when
the carrier has a tracking page) and what to do next, such as Add the tracking
number by a date for the seller, or tap It arrived for the buyer. One job shows
the delivery itself: the link to open it, when it was delivered and what Karwan
checked. Beside the money line a seal reads Your turn when the person must act,
or Held with a lock while Karwan holds the money.

Karwan does not inspect goods or judge the quality of work, and it does not
read the courier's own tracking status yet. What it requires is that each
delivery is specific, on the record and fingerprinted on chain with the
delivery.
