---
id: messages-by-tag
title: Message anyone by their Karwan tag
status: roadmap
visibility: public
audience: all
updated: 2026-10-17
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

When they agree, either agent starts the protected deal. Money never moves
from a message. A message with a phone number, an email or a link, sent
before any deal between the two, carries a warning to keep payment in Karwan
escrow. Someone whose first messages to five people in a day all go
unanswered is paused from writing to anyone new for a day, and three messages
in a row with no answer wait for a reply. Only someone with a Karwan tag can
message, and a message with a link Karwan flags is not sent. Messages are kept
14 days.

This is built for testnet and not live.
