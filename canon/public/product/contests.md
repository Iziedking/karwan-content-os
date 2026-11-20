---
id: contests
title: Contests with the prize held from the start
status: shipping
visibility: public
audience: all
updated: 2026-11-20
capability: true
tags:
  - market
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/40-contests-and-agent-jobs.md
    date: 2026-10-29
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/88-contests-that-protect-entrants.md
    date: 2026-11-17
---

A buyer can run a contest on Karwan instead of choosing one seller: the best
logo, three winners, 300 USDC, entries open for a week. The prize is put up
when the contest opens and held on Karwan's escrow on Arc, so everyone who
enters knows it is there.

The buyer chooses one to eight winners and how the prize is shared: the
suggested split (one winner takes it all; two share 70 and 30; three share 50,
30 and 20, and so on up to eight), equal shares, or their own amount for each
place in their own currency, adding up to the prize. There are three kinds: a design or writing contest (entries for
1 to 30 days, then 3 to 14 days of judging), a bug bounty (entries for 1 to 60
days, then 3 to 30 days of judging) and a hackathon (1 to 60 days of building,
then 3 to 30 days of review). Anyone except the buyer can enter with up to four
images or PDF files and a note, and enter again to replace their entry without
losing their place.

Before paying, the buyer sees each entry's first image and note, never the
full files. Picking pays each winner their share at once, less half of
Karwan's 1 percent fee on it, and only then do the winners' full files go to
the buyer. A contest nobody entered can be taken back with the prize and fee
returned.

Once someone has entered, the prize goes to entrants. If the buyer picks nobody
by the end of judging, they have 3 more days; after that the contract pays the
earliest valid entries, in the order they were first sent, and the buyer's
record shows the contest was not judged. The buyer can mark an entry not valid,
with a reason every entrant can read; a marked entry is never paid. If every
entry is marked, the prize goes back to the buyer. Contests opened before this
rule keep the earlier one: with nobody picked, the prize goes back to the
buyer.

Contests work from the market, the assistant on the website and Telegram.
Running a contest and paying the winners are confirmed on Karwan itself.
The assistant asks for the prize in the person's own currency, shows every
figure on its card in that currency, and draws the card itself rather than
sending the person to a form. Asked to prepare a post, it writes one ready to
copy, with the contest's link.
Contests run on Arc Testnet, up to about 1,000 USDC each for now.

When fit alerts are switched on (they are built and off until tested), a new
contest is told to the sellers whose work it fits, with the prize, how many
winners and when entries close, and they get one reminder a day before entries
close if they have not entered. An agent never enters a contest for anyone.
News about a contest, an entry coming in, an entry marked not valid, winners
paid, or the prize going back, reaches the people it concerns on Telegram and
by email.
