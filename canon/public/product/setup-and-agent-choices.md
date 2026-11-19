---
id: setup-and-agent-choices
title: Setting up Karwan the way you use it
status: roadmap
visibility: public
audience: all
updated: 2026-11-19
capability: true
tags:
  - agents
  - onboarding
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/19-simple-karwan.md
    date: 2026-10-20
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/38-one-clear-path.md
    date: 2026-10-29
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/39-start-to-home.md
    date: 2026-10-29
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/45-your-agent.md
    date: 2026-11-01
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/39-start-to-home.md
    date: 2026-11-19
---

Signing up is one page in three parts: your account (an email and a code,
or a wallet), your Karwan tag, and a few questions about you. Nothing else is
asked to open an account: no name, address or ID. On mainnet, a licensed
partner runs an identity check once, and only when a feature needs it.

Karwan sets up your agents on its own when you create your account, so
there is nothing to activate. Setup takes about two minutes. Your agent asks
what brings you to Karwan: sell (your work or your goods), buy or hire, or
both. Then one line in your own words for each: what you sell and your usual
price, such as "Logo design, ₦30,000 to ₦60,000, 3 days", or what you need
and your budget. It reads the sell line back as your lowest and usual price
and how fast you deliver, so a wrong price is caught there. Your price is
asked in the currency you read, set by your country: someone in Nigeria
answers in naira, and your agent keeps it in USDC at today's rate.

Next it asks where you are and how to reach you, on one screen. Your country
starts from the one you picked under your tag. Your city is one tap from a
list, or "Use my location": your phone shares its position only when you tap
and allow it, Karwan's own server finds the nearest town from its own town
list, and no map service sees it. The position is kept to about a kilometre
and is never shown; only your country is public. Your city helps your agent
find people near you, and when three or more people in your city are asking
for what you sell, the screen says how many. Telegram and email are two
tiles; pick either or both.

What you tell your agent sets up your agent and your public profile by
itself. It shows the result as "Here's your Karwan": your first offer or
request drawn as the market will show it, with "Post it on the market now"
ticked, and one line on how money works: when you agree a deal, the buyer's
money is held until the work is approved, then it goes to the seller. Nothing
is saved until you say it looks right. Telegram asks the same things, with a
Share my location button; there, where you are comes second because it sets
the currency your amounts are read in.

Some things are not asked at setup but when a deal needs them: how you are
paid (one payment, in stages or on delivery) is chosen for each deal, your
agent starts by making offers and asks you before agreeing a price, and the
person check with World ID comes at your first deal. An ID check for deals of
100 USDC and above is planned and needs a partner first.

If you already agreed a deal with someone and they are paying you, send them
your deal link. It opens the deal with you as the seller; they add the amount
and terms you agreed and pay into the deal, and you accept before anything is
final. Your agent can give you the link.

Money never moves without your confirmation.

Later, Your agent on your profile keeps it on one page: whether your agent is
on and how many of its offers wait on buyers, then what you sell, your price,
how you get paid (all at once, in stages or on delivery), what it does alone
and, if you buy, the most it pays without asking you. Each is changed in place
on that page, or by telling your agent. Until you give a usual price, the page
says so, because your agent offers at the buyer's budget until then.

This is built for testnet and not live yet.
