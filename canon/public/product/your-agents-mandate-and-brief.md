---
id: your-agents-mandate-and-brief
title: What your agent may do, and its morning brief
status: shipping
visibility: public
audience: all
updated: 2026-11-11
capability: true
tags:
  - agents
  - mandate
  - brief
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/52-an-agent-that-works-for-you.md
    date: 2026-11-05
check:
  kind: manual
  note: Built, not deployed yet. The mandate, the change card, the re-plan, the brief and the progress log read against their tests, which passed on 5 November 2026.
  lastVerified: 2026-11-05
---

Each person has one agent, and what it may do reads as one thing. Ask your
assistant and it tells you: what your agent sells and from what lowest and usual
price, the most it spends on a new request, whether it makes offers on its own
and asks you before any deal, asks you first about every request that fits, or
agrees to a buyer's price inside your limits, how much it may spend a week on
paid checks, the markets it watches, your goals, when your brief comes and your
quiet hours.

You change one part at a time, and only through a card you confirm. The card
shows the line before and after, and what the change does next: lowering your
lowest price says how many requests you passed on this week it opens again.
Once you confirm, your agent acts at once. A lower price looks again at those
requests; moving away from asking first closes those questions and looks at the
requests again. A request's budget is fixed once it is posted, so a new buying
limit applies to new requests, and the card says which open ones ask for more.
Changing limits moves no money; paying still needs you.

You can give your agent up to five goals in your own words, such as finding a
logo designer this week or selling 20 bags of rice this month. On the test
network goals are matched on their words, with no model.

Once a day, at 8:00 Lagos time unless you change it, your agent sends a short
brief built from your own data, with no model: new offers on your requests,
questions waiting on you and when the first decides itself, deals waiting on
you, up to three things it sees about how you trade, and a line for each goal.
There is no brief on a day with nothing to say. It goes to Telegram when you
have linked it, and otherwise to Karwan and by email. From 21:00 to 7:00 your
agent sends nothing but a question's own reminder; a note it would have sent
waits for the brief. You can change the hours or turn them off.

Your agent keeps a record of everything it told you for 30 days, so it never
sends the same brief twice. Ask your assistant what your agent did today.

Switching your agent off is built and switched off until it is tested. With it
open, one switch on the agent page, or "turn my agent off" to your assistant,
stops your agent altogether. It makes no offers, does not bargain, recommend or
agree on your requests, finds nobody, rests its market watches and paid
research, and sends no brief. Offers still arrive on your requests and you
choose by hand. Offers it already made stand until their date. You are
asked if a buyer chooses one, and a buyer's counter on one comes to you as a
question: take their price, hold at yours, or walk away. Deals already running, your money, direct deals,
payment links and your assistant are unchanged. Turning it back on starts from
now; it does not act on what it missed.
