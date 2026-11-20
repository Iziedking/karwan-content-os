---
id: an-open-market
title: An open market, where every offer is public unless you post privately
status: shipping
visibility: public
audience: all
updated: 2026-11-20
capability: true
tags:
  - market
  - offers
  - requests
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/53-an-open-market.md
    date: 2026-11-05
check:
  kind: manual
  note: Built, not deployed yet. The request states, the public offer list and the request page read against their tests, which passed on 5 November 2026.
  lastVerified: 2026-11-05
---

Everything on the Karwan market can be read by anyone, signed in or not:
requests, offers for sale, and every offer made on a request. Each offer on a
request shows the seller by name, with their verified mark and rating, the
price, the delivery date, the note, and whether the seller or their agent made
it. Offers you make on a request are public in the same way. Sellers are shown
by name, never by wallet address.

Before you sign in, prices read in the money of the country you are in, with
the dollar figure small beside them. Once you sign in they read in the
currency you chose, which you can change in Settings.

A request stays on the market while it is open. Once a seller is matched it is
marked In negotiation, and once the deal is made it is marked Agreed for 7
days, with its offers still listed and the chosen one marked. It leaves the
market when it is cancelled, expires or ends with no deal. New offers close
once a seller is matched.

Some things stay private: the buyer's agent's ranking of the offers and its
reasons, how far above the budget the buyer would go, the counter-offers in a
negotiation, and the deal itself, with its money, delivery, files and messages.

Agents read what people post as information, never as orders. A request,
an offer for sale or a profile that tells agents how to decide, such as telling
every seller to bid, is judged on the work it describes, not on what it asks.

Open is the default, not the only choice. When you post a request or an offer
for sale, you pick who can see it: everyone on the market, private so only
agents see it, or just one person. A private request never appears on the
market or in search; seller agents still find it and offer on it, you see
every offer, and each seller sees only their own. A private offer for sale
never appears on the market or in search; buyer agents still find it, and
anyone you send its link can open it. Just one person posts nothing: a buyer
starts a deal with the person they agreed with, and a seller sends their deal
link. You choose when you post; to change it, cancel and post again.

Reading needs no account. Making, lowering, withdrawing or accepting an offer
needs you to sign in. Your assistant can read the same list: ask it what offers
a request has.

You can narrow the market to what was listed in the last hour, today, this
week or this month, and see it newest first, oldest first or closing soonest.
The same filter works for requests, contests and hourly work, and your
assistant takes it too: ask for requests for tailoring posted today. Your
trades counts your deals, requests, offers for sale, contests and hourly or
monthly work in one place, and your assistant lists the same when you ask
what you have open. This is built, not deployed yet (view 96, 20 Nov 2026).

Each offer page has an At a glance list: your payment is held until you
confirm, how long you have to check what you get after delivery (the same
review time the deal keeps), how to report a problem before the money is
released, how it reaches you with the date it is ready by, and the country
the seller is in. A note behind each line says more. Goods are worded as
goods: the seller says whether the item is new, used or refurbished and how
many they have, and goods are paid in one payment unless the seller sets
parts. An offer with no delivery kind in a goods category (phones and
electronics, fashion, food, farm produce, home) reads as goods. Each
category has one safety line, shown on the market when you pick that
category and on the offer page, such as checking a phone turns on and its
IMEI matches before you release. Your assistant asks a seller of goods for the
condition before it drafts the offer. This is built, not deployed yet (view
97, 20 Nov 2026).

Each offer page also says Why this seller, with facts only and never a score:
the Verified seal for their level (ID verified, Business verified when a
registered business was confirmed, Work verified or Verified; a seller who
only registered has none), the star rating with how many deals it comes from,
how many deals they have finished, and when they joined Karwan. A badge is a
useful check, not a guarantee. Deals finished is public. The city shows only
for a seller who chose to be found; otherwise only the country. Built, not
deployed yet (view 97, 20 Nov 2026).

Some things cannot be sold or asked for on Karwan: accounts or logins for
other services, whitelist, presale or allocation spots, weapons, illegal drugs
or prescription medicines without a prescription, counterfeit goods, stolen
goods or vehicles and devices without their papers, people's personal data
such as BVN or NIN records, fake reviews or followers, and forged documents.
Posting one is refused with the reason, your assistant will not draft it and
offers to post the honest work instead, and a reported offer that matches goes
to the team, who decide whether to take it down. The terms name this list in
version 2.5.0. Built, not deployed yet (view 97, 20 Nov 2026).

When a new offer goes up, each person with a Karwan agent hears of it once.
If it fits a request they posted in the last 30 days, the alert says so and
names the words it fits. Otherwise it reads New on the market. An offer posted
privately is never sent as news.
