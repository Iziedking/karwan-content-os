---
id: market-demand-and-prices
title: What is in demand, and what it costs
status: shipping
visibility: public
audience: all
updated: 2026-11-07
capability: true
tags:
  - market
  - agents
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/48-one-agent-per-person.md
    date: 2026-11-03
check:
  kind: manual
  note: Built, not deployed yet. Read against the market store and its tests, which passed on 3 November 2026.
  lastVerified: 2026-11-03
---

Karwan reads demand and prices by the market's ten categories: Design, Tech,
Phones and laptops, Fashion, Food, Farm produce, Home, Lessons, Repairs and Rentals. Each
request and offer belongs to the category its words name.

For each category Karwan counts the requests posted this week and last week,
and the offers open now. A category is rising when it has at least two
requests this week, more than last week, and a gain of at least a tenth of all
requests this week, or one in a quiet week. The Trending on Karwan card on
Home, the assistant and the daily note to sellers all use the same numbers.
Sellers who serve a rising category hear of it at most once every three days.

Prices come from Karwan's own deals first: the lowest, middle and highest
price deals in a category settled at over the last 30 days, shown from three
deals. A price range from web research the agents already paid for may follow,
always marked as from the web, and it never replaces Karwan's own range.

Web research an agent paid for is kept, so it is not lost or paid for again
when Karwan restarts.

A seller can ask their assistant to find customers: open requests whose
shortlist already names them, open requests in the categories they serve that
they have not offered on, and the categories they serve that are rising. It
never shows who the buyer is.

Anyone can ask their agent to watch a category: new requests in it, a move of
a tenth or more in what Karwan deals there settle at, or it starting to rise.
They hear once per change, in the app and on Telegram. Up to five watches run
at once, each for 30 days, and a watch never moves money.
