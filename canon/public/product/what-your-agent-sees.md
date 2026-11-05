---
id: what-your-agent-sees
title: What your agent tells you about how you trade
status: shipping
visibility: public
audience: all
updated: 2026-11-05
capability: true
tags:
  - agents
  - coaching
  - questions
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/52-an-agent-that-works-for-you.md
    date: 2026-11-05
check:
  kind: manual
  note: Built, not deployed yet. Thresholds, wording and the once-only default read against their tests, which passed on 5 November 2026.
  lastVerified: 2026-11-05
---

Your agent watches how your requests and offers are going and tells you what
it sees, with one thing you can do about it. Every number comes from Karwan's
own settled deals and offers. No model works any of it out, so it is there even
when no model answers.

It tells you when a request budget sits far from what deals of that kind settled
at. On the test network it says when your budget is above that range and gives
the middle price to use. It tells you when you missed requests because your
lowest price was above what buyers offered, when sellers with as good a record
charge less than an offer you are about to accept, and when a request has had
no offer for a day and allows fewer days than sellers asked for on similar ones.

You get at most three of these at a time, the ones that would change the most
first, and the same one not twice in a week unless its number moved. They come
in your weekly message and whenever you ask your assistant what your agent is
seeing. Nothing changes until you confirm. A request's budget and due date are
fixed once it is posted, so changing either means taking the request down and
posting it again.

When your agent needs you, it asks one question with the answer it would give,
and says what happens if you do not answer and by when, usually a day later.
Most questions decline politely by default. If no answer comes, that happens
once, and you are told. You can still make an offer from the request page. The
question and its one reminder, sent 30 minutes before the deadline, go to one
channel: the one you chose, or Telegram when you chose both and linked it.

When research your agent paid for does not finish, you are told once for that
request, with the amount if any was spent, and your agent carries on with
Karwan's own prices.
