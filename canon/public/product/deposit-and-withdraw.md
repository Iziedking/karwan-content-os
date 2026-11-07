---
id: deposit-and-withdraw
title: Deposit and withdraw
status: live
visibility: public
audience: all
updated: 2026-11-07
capability: true
tags:
  - money
  - deposit
sources:
  - url: https://karwan.site/docs/bridge
    date: 2026-08-05
check:
  kind: grep
  ref: backend/src/routes/deposit.ts#depositRoutes
  note: Returns at most two DISTINCT addresses and no Circle blockchain code, so the chain vocabulary cannot reach a user.
---

Money moves in and out of Arc on one screen. What that screen asks for depends on
who holds the funds, and the difference is the point rather than an inconsistency.

An account that signs in with email or a passkey gets one address. Copy it, send
USDC from Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche or Unichain,
and the balance updates itself.
There is no chain to choose, no amount to declare and no wallet to connect,
because Circle derives every deposit wallet from that user's identity anchor, so
the same address serves all seven. Solana has its own address on the same screen: a
different signature curve cannot share one.

An account that connects its own wallet keeps the explicit flow. It holds the
funds, so it picks the chain the USDC is on and signs the transfer.

Withdrawals reach Ethereum, Base, Arbitrum, Optimism, Polygon and Solana, and
never require that chain's gas token to receive.
Before a withdrawal moves, Karwan shows it once more: where it goes, on which
network, and that it cannot be undone. Nothing leaves until you confirm.
Withdrawing to a bank account or a card is coming soon. Both are listed on
the Withdraw screen and cannot be picked yet.
The Transfer balance holds your USDC from every network together, ready to
move to Arc in one step.

Adding money and withdrawing each have their own page, the same from Home
and from Money, on a phone and on a computer. A withdrawal starts with where it
goes, then the amount: only money that is ready leaves, and money in the
Transfer balance or with your agent is shown beside it with a way to bring it
here. When money lands or a withdrawal arrives, a card stays on the page with
the amount, where it came from or went, and how long it took, until you press
Done. The Deal guarantee sits on Money too, with Add and Withdraw.

Every move lands in Activity under its day with a plus or minus sign, not a
colour, and opens a receipt you can save as an image or a PDF.

A payment link opens a page anyone can pay, signed in or not. It shows who
asks, the amount and what it is for, follows the money step by step, and
ends with a receipt both sides see as Paid.

A link asks for money for 7 days unless the person who makes it picks
another length: 1 day, 30 days, or any date up to 90 days ahead, on the
request screen or by telling the assistant. The owner can end an open link
early from its page; money sent to it after that still reaches them. When a
deposit to someone's own address matches the amount of two or more of their
open requests, it is credited but none is marked paid, and Activity says so.

Only USDC is added to a balance. A token that is not USDC, sent to a deposit
address or a payment link, is never added and never swapped or moved by
itself. Activity shows it once as Token not added, with the amount, the token
and the network, and a person from the team sends it back to an address the
owner gives. Network coins such as ETH or SOL sent there are not shown.

A transfer between Arc and another network finishes even if Karwan restarts
partway. Once the USDC has left, Karwan reads Circle's record of the transfer
and marks it arrived when Circle has delivered it. If Circle reports that it
could not deliver, or the send was never confirmed, nothing is sent again by
itself: a person from the team checks it, and the move shows Needs attention
in Activity.

Every 15 minutes Karwan looks again at any money move that has not finished
after an hour. When the chain shows every part of it went through, Karwan
finishes the record, so the receipt and Activity read right without anyone
pressing anything. It never cancels a move or sends money again by itself.
Anything it cannot prove stays as it is, and the team is told. On a deal,
the buyer and the seller can both ask for a payment that needs attention to
be checked again.

When a payment to you could not be delivered at the time, the contract keeps
it for you as money owed, and only the wallet it was owed to can collect it.
Money shows it with the amount and a Collect button, and asking the assistant
whether anything is owed to you gives the same answer. Collect sends it to the
wallet it was owed to, never anywhere else, and a receipt lands in Activity.
Karwan collects it for a wallet it holds; a wallet you connected signs once.

A send to someone on Karwan can carry a note of up to 120 characters, such as
what it is for. The note is kept with the send, not on the chain, and both
people see it in Activity and on the receipt. Send also lists the people you
sent to recently, by their Karwan tag.

The word for this is Deposit and Withdraw. Not top up, not add money, not cash
out, and never the name of the transfer protocol underneath: which rail carries a
move is not something a person sending money needs to hold in their head.
