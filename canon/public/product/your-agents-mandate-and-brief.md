---
id: your-agents-mandate-and-brief
title: What your agent may do, and its morning brief
status: shipping
visibility: public
audience: all
updated: 2026-11-16
capability: true
tags:
  - agents
  - mandate
  - brief
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/52-an-agent-that-works-for-you.md
    date: 2026-11-05
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/87-your-agent-on-autopilot.md
    date: 2026-11-16
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

What your agent does alone is one switch each: make offers, bargain, agree a
price, lock money, find people, pay for checks and research, and the morning
brief. The switches are in Settings under Agent, and your assistant can turn
any of them on or off with a card you confirm. The budgets and rules for what
is on are on the Your agent page.

Lock money for me is built and switched off on every network until Karwan
opens it, on the test network first. While it is off the switch says Not open
yet, and no agent locks money without you. When it is open you type your own
limits, and turning it on or raising a limit is confirmed with your passkey on
Karwan, never in a chat. Then, on a request where you turned on Agree for me,
your agent may lock the money for the price it agreed, in a Karwan escrow and
nowhere else. Before it does, code checks your limit for one deal, your limit
for the week, how many locks you allow in a day, who the seller is, and
whether the price is far above the market. If a check fails, if the deal needs
World ID, or if the seller is not verified, it locks nothing and tells you why,
and you can lock it yourself. Where a seller has to say yes first, it waits for
them and checks your limits again when they answer. You are told at once each
time it locks, and releasing the money is always yours. When a day's locks are
used up, or locking fails three times in a row, it stops itself until you turn
it back on.

You can give your agent up to five goals in your own words, such as finding a
logo designer this week or selling 20 bags of rice this month. On the test
network goals are matched on their words, with no model.

A standing order is a goal your agent works every day. You say once what to
find or sell, the most you pay for one when buying, until when, and how many
people to ask a day, from one to five. You can keep up to five. Starting an
order lets your agent post that need privately, never on the market, and ask
people for it without a card each time. It moves no money. A buying order
keeps one private request open and each day asks the best people it has not
asked yet, inside the same limits as finding people by hand. Their offers come
to you as on any request, and whether your agent bargains, agrees a price or
locks the money follows the switches you set. A selling order offers your
work, at your usual price, to buyers who listed a regular need and let sellers
reach them. An order ends on its date, when you stop it, or when a deal on its
request is locked. You get one note on a day it did something, and you are
told once after three days with nobody new. Pause keeps the order; Stop
removes it. Orders rest while your agent is off or Find people is switched
off. You find them on Your agent, and you can start, pause or stop one from
the assistant or Telegram.

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
