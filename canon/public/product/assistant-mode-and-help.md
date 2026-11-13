---
id: assistant-mode-and-help
title: Assistant mode and Help
status: roadmap
visibility: public
audience: all
updated: 2026-11-12
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
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/42-deal-reference.md
    date: 2026-10-30
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/78-a-support-desk-for-money.md
    date: 2026-11-12
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/79-a-desk-in-plain-words-for-both-networks.md
    date: 2026-11-12
---

In assistant mode the whole account runs from one
conversation. You say what you want, your agent prepares it as a card, and
nothing moves until you confirm the card. Conversations are kept on your
account. To change a card before you confirm it, say what to change, such as
a later due date, and the agent prepares it again with the rest kept. A card
from an earlier conversation shows whether it was done and can never be
confirmed again; ask, and the agent prepares a new one. A photo or PDF sent with words about a request or a deal, such as "what we agreed", is kept for an hour and goes with the next request or deal you confirm.

Karwan also says your one next move. On the website a short note sits at the
bottom of the page with one line and one button, such as "Delivery is in for
your deal. Check it and approve." It picks the most urgent thing waiting on you:
a dispute that needs your side, a delivery to check, a request to cancel or for
more time, a deal to fund or agree to, a match to approve, offers to compare, a
delivery due soon. With nothing waiting and no money yet, it asks you to add
money; with nothing at all yet, it asks what you need or what you sell. It never
shows on the page it points to, while you type, or over a confirm, and it steps
aside rather than sit on top of a button. Once you close it, it stays closed for
the visit, and no other note follows on that page. Ask the assistant what to do next, here
or on Telegram, and it gives the same move.

A deal is built the same way. Name the person and say what the deal is
for, or just say you want to make your first deal and the agent asks who it
is with; it asks only for what is missing, such as the amount and when it
is due, says the usual terms in one line, and shows one card with every term,
goods terms included. Sending it moves no money. Once the other person
accepts, the payment card appears in the same conversation and in your
alerts, and the money moves only when you confirm it.

Your deal guarantee works the same way. It is money you set aside to protect
your buyers, and on testnet it earns at the USYC rate, paid by Karwan. Ask to
deposit or withdraw and the card shows the amount, the 7-day wait
and the day you can collect it; while it waits it no longer protects your
deals. You can ask to keep it instead, and to collect it once the wait ends.
Money still on an earlier Karwan deal is listed under Earlier deals, and
the assistant can take each step there too.

Every step of a deal after it starts works the same way. You can change a
deal or counter it before money is in, take back a deal the seller has not
accepted, say the goods arrived, add review time, check a delivery yourself
when the delivery check has not answered, claim a payment the buyer left in
silence, ask a buyer to release, or answer that ask. On requests you can
make your own offer, withdraw it, take a seller's offer, and go ahead or pass
on a near match. You can edit your offer on the market, stop your agent
offering on a request, and write in a deal's chat. Ask what is in demand and
it names the market categories requested most this week against last week,
which are rising, and what Karwan deals in them settled at, the same
categories as the Trending on Karwan card on Home. In Telegram, the steps
that pay out or pay in open the Karwan page, where you confirm them.

Money works the same way. You can pay someone's payment link from your
balance, get free test USDC on testnet, have a transfer between networks
that has not arrived checked again or carried on, retry or cancel a money
move, have a deal payment that did not confirm checked again, pause money
leaving your account, and remove a saved payout address. With your own
wallet, you can also deposit to your deal guarantee from the assistant; your
wallet asks you to sign. The same goes for the deposit a financier's offer
may need before you get paid now. Resuming money out and adding a payout address stay
on the page, because they need your World ID.

Your account works the same way. You can change your settings, your name,
bio and skills, your X handle, how Karwan reaches you, whether your assistant
remembers, whether agents outside Karwan can check your record, and whether
your settled deals stay published. You can unlink Telegram, set up or rename
your agents, ask your agent to research the market (it tells you the cost
first), sign you out on every device if a phone or computer is lost (the chat
stays connected), send the team feedback, and run your
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

Help and support is in your Profile. A help bot answers how things work and
what went wrong, from what your account shows. When you ask for a person, or
it cannot answer, it asks what you expected and what happened, then opens a
case with the Karwan team, with a reference such as KS-1042. Your assistant
does the same on Telegram. Your cases are listed there with where each one
stands. A reply from the team comes back where you last wrote, Telegram or
email, and is always on the case page. People reply from 8am to 10pm Lagos
time, the first reply within 2 hours. The help bot cannot move money or change
anything; a fix that moves money is done by the team with a second teammate.
The team answers from its own desk, on testnet and on mainnet, and signs in to
the mainnet desk with a code from their own authenticator app. Nobody from
Karwan ever asks you for a code, a password or a seed phrase.

Every deal has a short reference, such as D68F-E7D8, shown on the deal page
with a copy button. Give it to the assistant, on the website or in Telegram,
and it finds the deal among your own deals; you never need the long deal id.
Ask a person on a paused deal, and Get help with this on a transfer that has
not arrived, open Help and support already about that deal or transfer.

This is built for testnet and not live yet.

Every docs page has three buttons under its title. Copy for AI copies the page
as plain text. Ask Claude and Ask ChatGPT open that chat in a new tab with the
page link and a question already typed in.

On the landing page, the example questions open the assistant with the
question already asked, whether they are tapped, thrown into the chat bar or
typed. Talk to our team writes to admin@karwan.site.
