---
id: hourly-work
title: Pay someone by the hour, or monthly
status: shipping
visibility: public
audience: all
updated: 2026-11-12
capability: true
tags:
  - market
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/32-kind-of-deal-and-hourly-work.md
    date: 2026-10-29
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/76-monthly-work-with-sessions.md
    date: 2026-11-11
---

A hirer can pay someone by the hour or monthly. A virtual assistant, for
example, might earn 15 USDC an hour for up to 20 hours a week, for 4 weeks.
There are two ways to start. The hirer can name someone they know by their
Karwan tag, or post the work on the market and let their agent find the best
fit.

The agent judges people by what they have actually done on Karwan: the skills
their finished work shows, the checks Karwan ran, delivering on time, and
ratings. Skill fit counts first, and reputation only breaks a tie. Nobody has
to upload samples to prove themselves. The hirer sees up to five people, the
best fit recommended, and hiring one pays for the first week; the worker
already offered those terms, so it starts as planned.

A seller can save an hourly rate or a monthly price in their ways of dealing:
the lowest they take, their usual rate and the most hours a week. When work
that fits is posted, their agent offers at once, at the usual rate lowered to
the hirer's most but never under their lowest. They are told and can change or
withdraw the offer.

The hirer pays one week (or month) at a time. The money is held on Karwan's
escrow on Arc until that week is settled. A worker new to Karwan is paid for
one week at a time. Once they have finished work on Karwan, the hirer can pay
up to four weeks ahead.

The worker logs hours by the minute, from the start of the week until 2 days
after it ends. The hirer then has 3 days to approve the hours or say which are
wrong. Approved hours are paid at once. If the hirer says nothing, the hours
are paid when the review ends. Unused budget goes back to the hirer every week.

Hours the hirer objects to wait for Karwan's review team, and the rest are paid
at once. If the team does not rule within 5 days, those hours are split half
and half. Either side can end the work with one week's notice, or one month's
for a retainer. When the work ends, it goes on both people's records.

Monthly work can be counted in sessions, which suits lessons, classes and
coaching. The two people agree how many sessions a month holds: three a week is
12. That month is four weeks, and a session is worth the month's price divided
by the sessions agreed. The worker records each session as it happens, with a
note and a link if they have one, and the hirer is told each time. If a session
did not happen the hirer can say so straight away; that is kept as a note and
no money moves. While the month is still open the hirer can take that note
back, and the session counts as held again; the worker is told. A session
carries one note at a time, so to change the words the hirer takes the note
back and sends a new one. After the month ends the hirer approves the recorded sessions
or says how many did not happen. If they say nothing, the recorded sessions are
paid when the review ends. Sessions not held come back to the hirer. Halfway
through the month, if fewer than half the sessions are recorded, both people
are told once that the month is behind the pace they agreed. Nothing else
changes. Sessions
are set up on the website when hiring monthly or posting monthly work, by
filling in Sessions a month, or through the assistant on the website and in
Telegram. On the work page each month lists its sessions with the note and
link; the worker records a session there, and the hirer says one did not happen,
takes that note back, or reviews the month there.

Work that repeats is not posted as a one-time request. When someone asks the
assistant for a tutor at a price a month, it sets up monthly work instead, and
asks one question when it cannot tell. The request form on the website asks how
you pay: a fixed price stays a request, and monthly or by the hour opens the
form for posting that work.

On the work page each week is its own card, and the one green button is the
step that is next. On posted work the offers sit in one card, best fit first.

Hourly work runs from the website, the assistant and Telegram. The hirer's
money steps are confirmed on Karwan itself. It runs on Arc Testnet, up to about
1,000 USDC held at once for now.
