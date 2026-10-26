---
id: confirming-it-is-you
title: Confirming it is you, with a passkey or a Karwan PIN
status: roadmap
visibility: public
audience: all
updated: 2026-10-26
capability: true
tags:
  - money
  - agents
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/27-deals-on-the-escrow-family.md
    date: 2026-10-24
---

A person's agents run their deals for them: they pay into a deal, accept,
deliver and release inside the limits the person set, so a deal keeps moving
while the person is away. Karwan asks the person to be present for three
things only, and then they confirm with a passkey, which is their phone's
face or fingerprint check, or with a 6-digit Karwan PIN.

The three things: setting up their Karwan record and their buying agent's
limits (on Arc Testnet Karwan does this itself for accounts whose wallets
it holds), putting up deal insurance, and money leaving Karwan for an address
that is not one of their own Karwan wallets. Putting up deal insurance is
the consent for it to protect their buyers and back advances from
financiers on their deals, so taking an advance later is one tap.

Five wrong PINs lock the PIN for 15 minutes, and a passkey still works in
the meantime. A forgotten PIN is reset with a code sent to the person's
email. A PIN is never typed into a chat: the agent sends a one-time Karwan
link and the person confirms on that page. Someone who signs in with their
own wallet confirms by signing in that wallet.

Each confirmation fits one action and one amount, and works once.
