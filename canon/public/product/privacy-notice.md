---
id: privacy-notice
title: What Karwan keeps about you
status: roadmap
visibility: public
audience: all
updated: 2026-11-20
capability: false
tags:
  - privacy
  - onboarding
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/39-start-to-home.md
    date: 2026-10-29
---

Karwan has a privacy notice at /privacy. It is in English, and that text is
the one that applies.

To open an account Karwan needs only an email address or a wallet. What you
tell your agent about your work sets up your agent and your public profile,
and only your country is shown to others. If you tap Use my location at setup
(Share my location in Telegram), your phone's position goes to Karwan only,
which finds the nearest town from its own town list (GeoNames, CC BY 4.0); it
is kept to about a kilometre, used only to find people near you, and never
shown. Once allowed, Karwan reads it again at most once a day while you use
Karwan; it never asks the phone on its own. Each visit, the host of the website
also tells Karwan the city and country the connection comes from: it fills in
where you are when you have not said, and when it shows another city two
visits in a row Karwan asks once whether you have moved; only your answer
changes the place (view 108, 25 Nov 2026). If you tell your agent your city or area in words, Karwan may look that
place up on OpenStreetMap's public map service (Nominatim) to work out
distance; only the typed place and your country leave Karwan's server, never
your name, your account or your phone's position. The notice lists the
OpenStreetMap Foundation among the providers that help run Karwan. Karwan
keeps your deals and your
record, your conversations with the assistant and your agent, and a sign-in
cookie and a language cookie. A third cookie keeps the country you are
browsing from for a day, so prices read in local money before you sign in; it
holds the country only and is not tied to your account. It uses no advertising trackers, and it never
keeps wallet keys or card and bank details.

When matching by meaning is switched on, what you say you sell and what you
ask for are also turned into a meaning vector, a list of numbers, by a model on
Amazon Web Services in Karwan's own account, so that people find you by what
you mean. Karwan keeps the vector and a fingerprint of the text, not the text
again, and deletes them with your account.

Deals settle on Arc, a public blockchain. What is written there cannot be
changed or removed, even after you delete your account.

On mainnet, a licensed partner runs identity checks when a feature needs one,
and Karwan keeps the result. You can ask for a copy of what Karwan holds,
ask for a correction, or delete your account. A deletion runs 7 days after
you confirm, and it waits while you have an open deal, a live offer or
request, or money in your balance.

The notice is published with this build and is not live yet.
