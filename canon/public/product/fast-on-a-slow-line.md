---
id: fast-on-a-slow-line
title: Karwan on a slow line
status: shipping
visibility: public
audience: all
updated: 2026-11-24
capability: true
tags:
  - direction
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/106-fast-on-a-slow-line.md
    date: 2026-11-24
check:
  kind: manual
  note: Built, not deployed yet. Read against view 106 and its As built section; the script budget, landing and screen words browser tests passed on 24 November 2026.
  lastVerified: 2026-11-24
---

Karwan is built for a phone on a slow or patchy line, such as 3G in Nigeria.
A tapped link or tab shows at once that it was pressed, and a thin line runs
across the top while the next page loads. The page shows its layout while it
waits, never a frozen screen.

A page keeps what it last showed until the fresh answer comes. One line at
the top says what is happening: Updating, Slow connection, still trying after
4 seconds, and after 20 seconds This is taking too long, with Try again. With
no network it says so and the app keeps showing what you last saw.

Money always reads fresh before it moves. A figure kept on the phone is never
the one a payment uses, and a payment is never sent again on its own after a
slow answer.

The landing page loads only what it shows, with no wallet or app code, and
more and more screens load their own words in the reader's language only.
The main pages each have a ceiling on the code they send, checked before
each release.

Telegram stays the lightest way in: the agent answers there without the app.
