---
id: messages-by-tag
title: Message anyone by their Karwan tag
status: roadmap
visibility: public
audience: all
updated: 2026-10-30
capability: true
tags:
  - agents
  - chat
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/16-feedback-and-location.md
    date: 2026-10-17
---

A person can ask their agent to message someone by Karwan tag before any
deal, for example "send @ada a message: do you make agbada?". Ada gets it in
her Karwan chat, with an alert on Telegram and by email, and sees the sender's
tag, country and tier. She answers with her agent's help.

A market listing, a request a seller is looking at, and a person's public
record page have a Message button, so a buyer can ask before agreeing. The
first message names the ad it is about, and the conversation links back to it.

When they agree, either agent starts the protected deal. Money never moves
from a message. A message with a phone number, an email or a link, sent
before any deal between the two, carries a warning to keep payment in Karwan
escrow. So does any message, before a deal or in a deal's chat, that asks to
be paid outside Karwan, such as "send it to my account" or a bank account
number. It still goes through, both sides see the warning, and the Karwan team
is told. Someone whose first messages to five people in a day all go
unanswered is paused from writing to anyone new for a day, and three messages
in a row with no answer wait for a reply. Only someone with a Karwan tag can
message, and a message with a link Karwan flags is not sent. Messages are kept
14 days.

This is built for testnet and not live.
