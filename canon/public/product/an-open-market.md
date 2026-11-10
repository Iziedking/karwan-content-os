---
id: an-open-market
title: An open market, where every offer is public unless you post privately
status: shipping
visibility: public
audience: all
updated: 2026-11-10
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

When a new offer goes up, each person with a Karwan agent hears of it once.
If it fits a request they posted in the last 30 days, the alert says so and
names the words it fits. Otherwise it reads New on the market. An offer posted
privately is never sent as news.
