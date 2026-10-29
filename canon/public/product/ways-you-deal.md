---
id: ways-you-deal
title: The ways you deal
status: roadmap
visibility: public
audience: all
updated: 2026-10-29
capability: true
tags:
  - agents
  - escrow
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/26-agents-for-every-deal.md
    date: 2026-10-23
---

Your agents work from the ways you deal, for selling and for buying. Each way
is one kind of deal with its lowest and usual price and its time (there is no
highest): one-time, milestones paid in
stages, goods with delivery, where review starts when the item arrives, and a
refundable deposit, like a rental. A goods way also says where you ship and
how long it takes to arrive. Other kinds of escrow are added as they go live.

Your selling agent offers on a request inside the way of its kind. When a
buyer asks for a kind of deal you have not listed, or a request sits outside
your price or time, the agent does not offer on its own and never goes quiet:
it asks you, with a suggested answer, and you decide.

A goods way can be priced per item. A request that names a count, like 3
pairs, is then compared per item, and the buyer sees what each comes to.

Your agent learns from what you accept and only suggests, never changes a
setting on its own: a way to save after you said yes to a request of a kind you
had not set up, a new usual price after three agreed deals, or a level under
which it stops asking you after you said no three times. Each comes as the same
card you set things up with, and a no is remembered. Under a level you set, your
agent says no politely and keeps the door open instead of asking you.

Setup starts you with one way, from how your clients usually pay you. You
add, change or remove ways on your profile or by telling your agent, and
nothing is saved until you confirm. Money never moves without your
confirmation.

This is built for testnet and not live yet.
