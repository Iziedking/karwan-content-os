---
id: disputes-heard-first
title: A dispute is heard before anything is decided
status: shipping
visibility: public
audience: all
updated: 2026-11-19
capability: true
tags:
  - escrow
  - disputes
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/90-disputes-settled-reliably.md
    date: 2026-11-19
---

On deals held by Karwan's escrow family, a dispute is heard before anything
is decided. Both sides answer three questions on the deal page: what arrived,
what is missing and whether anything was late. Nothing is decided until both
have answered or 72 hours have passed.

Karwan then reads both answers, the delivery with its check result and the deal
chat, and writes a finding. The delivery check is evidence, never a ruling on
its own. A person at Karwan confirms every finding before anything goes to the
escrow, and neither side sees a finding until it is confirmed.

A finding that pays the seller in full or refunds the buyer in full goes on the
escrow with 72 hours for either side to ask for a person to decide. If nobody
asks, it pays out as found. A part share, a finding not confirmed in time, or a
held delivery link goes straight to people: two people at Karwan must agree and
write their reasons, within 5 days. If they do not, the share written into the
deal's terms applies.

The deal page shows each step with its date and a countdown, and the assistant
says the same in Telegram and on the website. The money stays held in the
escrow the whole time.

Built and proven on an Arc fork; it is being switched on for Arc Testnet.
