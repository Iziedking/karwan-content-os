---
id: contests
title: Contests with the prize held from the start
status: shipping
visibility: public
audience: all
updated: 2026-10-29
capability: true
tags:
  - market
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/40-contests-and-agent-jobs.md
    date: 2026-10-29
---

A buyer can run a contest on Karwan instead of choosing one seller: the best
logo, three winners, 300 USDC, entries open for a week. The prize is put up
when the contest opens and held on Karwan's escrow on Arc, so everyone who
enters knows it is there.

The buyer picks one to three winners; the prize splits 100, or 70 and 30, or
50, 30 and 20. Entries stay open for 1 to 30 days and the buyer then has 7 days
to pick. Anyone except the buyer can enter with up to four images or PDF files
and a note, and enter again to replace their entry.

Before paying, the buyer sees each entry's first image and note, never the
full files. Picking pays each winner their share at once, less half of
Karwan's 1 percent fee on it, and only then do the winners' full files go to
the buyer. A contest nobody entered can be taken back with the prize and fee
returned. If the buyer picks nobody by the date, the prize goes back to them,
and when there were entries their record shows the contest was not awarded.

Contests work from the market, the assistant on the website and Telegram.
Running a contest and paying the winners are confirmed on Karwan itself.
Contests run on Arc Testnet, up to about 1,000 USDC each for now.
