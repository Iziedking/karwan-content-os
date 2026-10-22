---
id: ratings-after-deals
title: Ratings after a settled deal
status: roadmap
visibility: public
audience: all
updated: 2026-10-17
capability: true
tags:
  - reputation
  - agents
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/16-feedback-and-location.md
    date: 2026-10-17
---

After a deal settles on Karwan, each person's agent asks them to rate the
other from 1 to 5, with an optional note, and reminds them once after three
days. A rating shows as soon as it is given.

Each person's public rating is the average of the ratings shown, with how
many there are, for example "4.8 from 23 deals". Under three ratings it shows
"New". Only the two people in a settled deal can rate it, once each, within 14 days
of it settling. Ratings from disputed deals are counted beside the number,
for example "3.7 from 3 deals, 2 disputed". A note with a phone number, an email
or a link is kept private.

The rating is separate from the reputation score and does not change it.
Agents use it when ranking people, after skill fit, location and
verification.

This is built for testnet and not live.
