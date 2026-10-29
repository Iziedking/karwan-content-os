---
id: assistant-mode-and-help
title: Assistant mode and Help
status: roadmap
visibility: public
audience: all
updated: 2026-10-29
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
account. To change a card before you confirm it, say what to change, such as
a later due date, and the agent prepares it again with the rest kept. A card
from an earlier conversation shows whether it was done and can never be
confirmed again; ask, and the agent prepares a new one.

A deal is built the same way. Name the person and say what the deal is
for, or just say you want to make your first deal and the agent asks who it
is with; it asks only for what is missing, such as the amount and when it
is due, says the usual terms in one line, and shows one card with every term,
goods terms included. Sending it moves no money. Once the other person
accepts, the payment card appears in the same conversation and in your
alerts, and the money moves only when you confirm it.

Your deal guarantee works the same way. It is money you set aside to protect
your buyers, and on testnet it earns at the USYC rate, paid by Karwan. Ask to
put some up or take some out and the card shows the amount, the 7-day wait
and the day you can collect it; while it waits it no longer protects your
deals. You can ask to keep it instead, and to collect it once the wait ends.
Money still on an older Karwan contract is listed under Legacy contracts, and
the assistant can take each step there too.

Every step of a deal after it starts works the same way. You can change a
deal or counter it before money is in, take back a deal the seller has not
accepted, say the goods arrived, add review time, check a delivery yourself
when the delivery check has not answered, claim a payment the buyer left in
silence, ask a buyer to release, or answer that ask. On requests you can
make your own offer, withdraw it, take a seller's offer, and go ahead or pass
on a near match. You can edit your offer on the market, stop your agent
bidding on a request, and write in a deal's chat. Ask what is in demand and
it names the kinds of work requested most this week, the same list as the
Trending on Karwan card on Home. In Telegram, the steps
that pay out or pay in open the Karwan page, where you confirm them.

Money works the same way. You can pay someone's payment link from your
balance, get free test USDC on testnet, have a transfer between networks
that has not arrived checked again or carried on, retry or cancel a money
move, have a deal payment that did not confirm checked again, pause money
leaving your account, and remove a saved payout address. With your own
wallet, you can also put up a deal guarantee from the assistant; your
wallet asks you to sign. Resuming money out and adding a payout address stay
on the page, because they need your World ID.

Your account works the same way. You can change your settings, your name,
bio and skills, your X handle, how Karwan reaches you, whether your assistant
remembers, whether agents outside Karwan can check your record, and whether
your settled deals stay published. You can unlink Telegram, set up or rename
your agents, add research credit, send the team feedback, and run your
business workspace: add it, rename it, say what it trades and update its
company card.

A few steps stay on their page because they need your device, a code or a
document: choosing your profile photo, adding an email, linking Telegram,
registering your business and deleting your account.
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
