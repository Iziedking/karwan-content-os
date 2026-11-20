---
id: be-found-and-be-reached
title: Be found and be reached
status: shipping
visibility: public
audience: all
updated: 2026-11-20
capability: true
tags:
  - agents
  - market
  - local-trade
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/72-your-agent-finds-the-people.md
    date: 2026-11-08
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/95-found-by-what-you-mean.md
    date: 2026-11-20
---

Someone new to a city who needs a tailor, a mechanic or a supplier should not
have to walk the streets asking around. On Karwan their agent finds people
whose record checks out, near them or online, and every deal is settled through
Karwan escrow, whether the work happens face to face or online. It runs both
ways: a seller's agent finds the customers who need what they sell.

It starts with choice. Nobody is found unless they turn on Let agents find me,
and a seller says how they meet people: at their shop or place, going to
people up to a distance they choose, or online. A buyer can turn on Let
sellers reach me and list what they regularly need, such as fresh tomatoes
every week for a restaurant, with a rough budget in their own currency. Each
need can be paused. Nothing is paid until the buyer says yes.

Where someone is stays private. Their agent turns it into a point on a map,
kept inside Karwan and never shown, even to them. Others see only how far
away someone is, rounded: nearby, about 3 km, in Abuja. Addresses are shared
in the chat once two people agree to meet.

Anyone can block a person. Neither then gets alerts or offers from the other,
and the person blocked is not told. Contact is limited so nobody is flooded.

What runs on Arc Testnet today is being found and reached, the settings, needs
and blocks, and finding people. A buyer tells their agent what they need, their
budget and whether it happens in person, online or by delivery, and gets up to
five people who chose to be found: best skill fit first, then verified, tier
and rating, then distance, with one recommended. Each shows how far away they
are, how they work, and a price inside the budget or "Asks for a quote". A
search costs nothing and contacts nobody. The buyer then picks one to three of
them and asks: the need is posted privately, seen only by the buyer and the
people asked, and each gets one deal alert, reminded at most three times and
never at night. They answer with their price or say no thanks, and the buyer
picks an offer as usual.

A seller's agent finds buyers the same way: open requests that fit what they
sell, and the regular needs of buyers who let sellers reach them, without
naming the buyer. For a need the seller sends one offer with a price and the
days it takes; the buyer is told once and reminded once, the next morning. Not
interested stops that seller for that need for good, not now for 30 days.
Interested posts the need privately to that seller with their offer on it, and
the buyer accepts it as any offer. Verification is not required on testnet; on
mainnet both sides must be verified, checked automatically through identity
and business verification partners.

People are found by the work they do, whatever words they use for it. Most
people who make clothes in Nigeria call themselves tailors, while a buyer may
ask for a fashion designer. Karwan keeps a word map of names for the same work,
such as tailor, fashion designer, dressmaker and seamstress, and every match
uses it without an AI model, so that request reaches the tailors. Work that is
related but different stays apart: a tailor is not a fabric seller. The word
map is built and comes to Arc Testnet with the next release.
