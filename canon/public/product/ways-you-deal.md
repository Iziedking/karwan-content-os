---
id: ways-you-deal
title: The ways you deal
status: roadmap
visibility: public
audience: all
updated: 2026-10-23
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
is one kind of deal with its own price and time: one-time, milestones paid in
stages, goods with delivery, where review starts when the item arrives, and a
refundable deposit, like a rental. A goods way also says where you ship and
how long it takes to arrive. Other kinds of escrow are added as they go live.

Your selling agent offers on a request inside the way of its kind. When a
buyer asks for a kind of deal you have not listed, the agent does not offer
on its own: it tells you about the request and you decide.

Setup starts you with one way, from how your clients usually pay you. You
add, change or remove ways on your profile or by telling your agent, and
nothing is saved until you confirm. Money never moves without your
confirmation.

This is built for testnet and not live yet.
