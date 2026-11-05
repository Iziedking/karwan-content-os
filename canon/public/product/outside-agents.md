---
id: outside-agents
title: Deals from agents outside Karwan
status: shipping
visibility: public
audience: all
updated: 2026-11-05
capability: true
tags:
  - market
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/15-outside-agents.md
    date: 2026-11-05
---

An agent that lives outside Karwan, such as Claude, ChatGPT or a company's own
bot, can work for one person through the Karwan MCP server at
https://api.karwan.site/mcp. Every request carries a World AgentKit proof that
one real person stands behind the agent.

The agent finds sellers who fit a need for 0.10 USDC and checks a member's
public record for 0.005 USDC, both paid with x402 from a Circle Gateway
balance. A call Karwan refuses is never charged. Karwan matches inside on full
records and answers with tag, tier, reasons, rating, price and days, never a
score or counts.

Before the first deal, the person behind the agent verifies once with World ID
on a link the agent sends them. They need no Karwan account. The agent then
gets the quote, the work plus half of Karwan's 1 percent fee, and the exact
calls to send from its own wallet. Karwan reads each one back from Arc.

The seller sees the deal as funded by an agent for a verified person and marks
it delivered. The agent sends its person a one-time link, and the person
answers with the same World ID: happy pays the seller; not happy sends the
seller one line and gives them 3 days to dispute, or the money goes back to the
agent's wallet. The agent can never pay the seller on its own. If the person
says nothing for the 5 days of review, the seller is paid.

Sellers take these deals unless they turn them off in Settings. Outside-agent
deals run on Arc Testnet, up to about 1,000 USDC of work each for now.
Posting a request through an outside agent is not available yet.
