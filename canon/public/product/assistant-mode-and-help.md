---
id: assistant-mode-and-help
title: Assistant mode and Help
status: roadmap
visibility: public
audience: all
updated: 2026-10-25
capability: true
tags:
  - agents
  - assistant
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/19-simple-karwan.md
    date: 2026-10-20
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/24-assistant-builds-the-deal.md
    date: 2026-10-23
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/31-assistant-does-everything.md
    date: 2026-10-25
---

With Use assistant switched on, the whole account runs from one
conversation. You say what you want, your agent prepares it as a card, and
nothing moves until you confirm the card. Conversations are kept on your
account. A card from an earlier conversation shows whether it was done and
can never be confirmed again.

A deal is built the same way. Name the person and say what the deal is
for; the agent asks only for what is missing, such as the amount and when it
is due, says the usual terms in one line, and shows one card with every term,
goods terms included. Sending it moves no money. Once the other person
accepts, the payment card appears in the same conversation and in your
alerts, and the money moves only when you confirm it.

Deal insurance works the same way. Ask to take it out and the card shows the
amount, the 7-day wait and the day you can collect it; while it waits it no
longer protects your deals. You can ask to cancel the wait, and to collect it
once the wait ends.

Every step of a deal after it starts works the same way. You can change a
deal or counter it before money is in, take back a deal the seller has not
accepted, say the goods arrived, add review time, check a delivery yourself
when the delivery check has not answered, claim a payment the buyer left in
silence, ask a buyer to release, or answer that ask. On requests you can
make your own offer, withdraw it, take a seller's offer, and go ahead or pass
on a near match. You can edit your offer on the market, stop your agent
bidding on a request, and write in a deal's chat. In Telegram, the steps
that pay out or pay in open the Karwan page, where you confirm them.

Karwan is adding the remaining money and account actions to the assistant
the same way, so anything you can do on a page you can ask for.
The few steps that need your own device, such as a passkey, your Karwan PIN
or a World ID check, open their page instead.

A picture or PDF can be picked, pasted or dragged into the message box. It
waits there until you send, and shows in your message with the words you
typed beside it.

Help answers how things work and what went wrong, from what your account
shows. A person from the Karwan team joins the same conversation when you
ask for one, or when the assistant cannot do it, with the conversation so
far, so you do not repeat yourself.

This is built for testnet and not live yet.
