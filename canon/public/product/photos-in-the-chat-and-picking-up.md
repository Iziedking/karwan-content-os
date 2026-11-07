---
id: photos-in-the-chat-and-picking-up
title: Photos the assistant understands, and picking up where you stopped
status: shipping
visibility: public
audience: all
updated: 2026-11-07
capability: true
tags:
  - assistant
  - telegram
  - photos
  - memory
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/66-photos-in-the-chat-and-picking-up.md
    date: 2026-11-07
check:
  kind: manual
  note: Built, not deployed yet. The file rules, the chat line, the kept conversations and the pick-up facts read against their tests, which passed on 7 November 2026.
  lastVerified: 2026-11-07
---

You can send the Karwan assistant a photo or a PDF on the website, in Telegram
or in WhatsApp without any special words. A clear caption such as "selling
this", "delivered", "my entry" or "invoice" puts it there straight away.
Otherwise the assistant looks at it once, says what it shows, and puts it where
your conversation is going: on the offer you are listing, on a delivery, on a
request or deal, or on a contest entry. It reads a file as an invoice for your
record only when you say it is one. When nothing says what the file is for, it
asks. If a photo does not match what you are listing, it tells you before
using it. Sent files wait an hour, four at most.

Your Telegram and WhatsApp chats are kept as conversations, like the ones on
the website, marked with where they came from. A new one starts after a day
without messages, and the assistant can search them later.

When you come back after six hours or more and something was left unfinished,
such as a card you never confirmed, a question you did not answer, or photos
held for an offer you have not posted, the assistant opens with one line that
picks it up. On the website the same line shows above the input with Continue.
This reads your past chats, so it stops when you turn the assistant's memory
off.
