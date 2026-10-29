---
id: po-financing
title: Getting paid early on a business order
status: shipping
visibility: public
audience: all
updated: 2026-10-29
capability: true
tags:
  - financing
  - testnet
sources:
  - url: https://github.com/Iziedking/Karwan/blob/main/docs/architecture/18-trade-finance.md
    date: 2026-10-29
---

A seller on a business order made on Karwan's newer escrow can be paid before
the buyer releases. Purchase-order financing and invoice factoring are the
same action, Get paid now, from the moment the order is accepted and paid in:
before delivery, or after it while the buyer reviews or Net terms run.

A financier offers an advance and what they are paid back. When the seller
takes the offer, one transaction pays the advance straight to them, assigns
the deal's payout to the financier up to the payback, and holds part of the
seller's deal guarantee, at least a tenth of the advance, until the financier
is repaid. When the buyer releases, the escrow pays the financier back first
and the seller the rest. If the deal settles short, the shortfall is paid to
the financier from the held guarantee.

A financier whose wallet Karwan holds is charged at the seller's tap. One who
pays from their own wallet has 24 hours to do it; until then nothing is held
and nothing moves. On Arc Testnet a financier run by Karwan offers on every
order that asks, alongside invited partners. Orders on the older escrows
finish as they are and take no new advances. This is built and not yet on
testnet or mainnet.
