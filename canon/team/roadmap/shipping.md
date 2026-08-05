---
id: roadmap-shipping
title: What is next
status: roadmap
visibility: team
audience: all
updated: 2026-08-05
capability: false
tags:
  - roadmap
sources:
  - url: https://karwan.site
    date: 2026-07-27
---

Not shipped. Nothing here may be written about in the present tense.

**Deposits delivering themselves.** A deposit is detected and the user is told,
and the USDC then sits on the source chain. It is not on Arc, so it cannot fund an
escrow. The automatic hop is written and tested and NOT deployed: until it is,
"send from any chain and use it" is only half true, and the half that is true is
the notification.

**Solana deposits routing automatically.** Written, and the least proven thing in
the money path. Its unit test only asserts the bridge row is built correctly; no
real devnet deposit has gone through it. If it throws Solana #5663012 then the
read on the adapter bug was wrong.

**One address for the Gateway balance.** Gateway needs an EOA to sign a burn
intent, so each user carries a second Gateway address that is not their wallet.
Circle announced ERC-1271 support on 2026-08-04, which would collapse it into the
identity wallet, but the live technical guide still says EOA only and the installed
provider has no support for it. Waiting on Circle, not on us. Do not describe the
pooled balance to a user in the meantime.

One line ships WITH that and only makes sense attached to it. The backend spend in
`gateway/spend.ts` pins its allocation to Arc, which is correct today because the
Gateway EOA is funded only from Arc wallets, so its balance can only be on Arc. The
moment the identity SCA can sign a burn intent, a user's unified balance can hold
funds on several chains and that pin starts failing with
`BALANCE_INSUFFICIENT_TOKEN` while the money is demonstrably there. The fix is to
delete the `allocations` array and let auto-allocation choose: it prefers the
destination chain first, so Arc to Arc keeps its zero crosschain fee. The web3 path
in `features/gateway/lib.ts` already omits allocations and needs no change.

Two numbers from Circle's auto-allocation write-up (2026-07-29) that bound this:
crosschain draws cost 0.5 bps, and only CONFIRMED balances count, so a spend made
against a still-pending deposit throws rather than waiting for it.

**Carrier verification.** Goods deliveries carry a carrier and tracking reference
today, but nothing calls a carrier API, so a seller can still enter a plausible
reference for a shipment that does not exist. Real verification needs a carrier
or freight-forwarder integration.

**Factoring priced off the net tenor.** A Net 90 receivable should cost more to
factor than a Net 30 one. Today they are priced the same.

**Shipment anchored on chain.** The tracking reference is off chain. The invoice
registry already supports a bill-of-lading document kind, so anchoring the hash
would make it tamper-evident.

**Reputation cap recalibration.** The saturation caps are testnet values. Raising
them re-tiers every live wallet on the next read, so it is a deliberate decision
for a quiet window.

**Mainnet.** Blocked on the legal shell, a custody pivot for email users, USYC
whitelisting, and stripping the faucets.
