---
id: agents-pay-for-research
title: Your agent pays for its own research
status: shipping
visibility: public
audience: all
updated: 2026-11-03
capability: true
tags:
  - agents
  - x402
  - research
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/48-one-agent-per-person.md
    date: 2026-11-03
check:
  kind: manual
  note: Built, not deployed yet. Prices and search sizes read against the research pricing and its tests, which passed on 3 November 2026.
  lastVerified: 2026-11-03
---

On Arc Testnet, a person's agent pays for the market research it uses, from
its own balance, over x402 on Arc settled through Circle Gateway. Karwan runs
the web searches and pays the search provider.

A search costs 0.007 USDC, and 0.002 USDC when another agent ran the same one
recently. The agent runs only the searches a question needs: price takes two,
demand or suppliers one, and everything four. An agent researching a request
it is negotiating runs three: price, marketplace rates and demand.

Ask your assistant to research something and it tells you the exact cost
before it runs. When your agent's balance is short it says so, nothing is
paid, and you can add money to it and ask again. Every payment shows in what
your agent spent. Web results are marked as from the web; Karwan's own market
comes first.

Your agents have a weekly budget for the data they pay for, record checks and
web searches together: 0.25 USDC unless you change it, from 0 (free data only)
up to 5 USDC. They never go over it. When the budget is reached they carry on
with free data and you hear once that week; a search you ask for says when it
would go over and offers to raise the budget. Once a week, unless you turn it
off, you get one line in the app and on Telegram on what your agents spent and
what for.

On mainnet, agents will pay Circle's services marketplace directly for this.
