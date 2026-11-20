---
id: your-deal-record
title: Your deal record
status: shipping
visibility: public
audience: all
updated: 2026-11-20
capability: true
tags:
  - escrow
  - reputation
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/94-every-deal-leaves-proof.md
    date: 2026-11-20
---

When a deal ends, paid out, refunded or cancelled, Karwan writes one record of
it from what the deal already stored and signs it. The record never changes
after that. Deals that finished earlier get one too.

It has five parts. What was agreed and when each side agreed. The money held
and when. How the work on each stage was confirmed. What was released, to whom,
and the fee. When Karwan signed it. The two money moves link to the Arc
explorer, so anyone can check the money moved.

How the work was confirmed is always one of these: the buyer confirmed it, the
handover code was entered at delivery, the buyer did not respond in time after
being asked, a dispute decided it, the review time ended with no problem raised,
both sides cancelled, or the money went back to the buyer. Where the deal did
not store something, the record says Not recorded instead of guessing.

Only the two sides see it, under the finished deal as Deal record, and from
their assistant on the website or in Telegram by the deal reference, such as
D68F-E7D8. The receipt for the last payout links to it. Until it is written the
deal page says it comes within the hour.

Either side can share it. Share the record gives a link to copy. Whoever opens
the link, signed in or not, sees the record with names and Karwan tags, never a
wallet address, and whether Karwan's signature checks out. Stop sharing ends the
link at once, and a later share makes a new one. Each side has one live link per
deal; sharing again gives the same link. In chat the assistant shows a confirm
card before it makes a link.

The public statement Karwan signs for a settled deal also says how the work was
confirmed, once Karwan switches on the new statement. Statements already signed
stay valid.

This is built for testnet and not live yet.
