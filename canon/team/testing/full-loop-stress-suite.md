---
id: full-loop-stress-suite
title: Full-loop product stress suite
status: live
visibility: team
audience: all
updated: 2026-08-10
capability: false
tags:
  - testing
  - stress-suite
  - full-loop
---

# Operating rule

Test state, money and identity as separate ledgers. A green interface is not proof. For every money-moving action record the initiating identity, signing wallet, token source, recipient, transaction hash, receipt status, emitted transfers, contract state and database projection. Never mark a workflow complete from an application log alone.

# Core identities and wallets

Run every applicable scenario for email/Circle and external-wallet accounts. Distinguish the sign-in identity wallet, buyer agent, seller agent, deal escrow, financier wallet, vault and destination-chain wallet. Test insufficient balance, wrong chain, stale balance, wrong wallet selection and partial completion. An ordered assistant request must preserve the user's order.

# Complete trade loop

Onboard an individual and a verified business; confirm their surfaces and permissions differ. Create or import a brief, match buyer and supplier agents, negotiate, accept and fund escrow. Prove the buyer agent funded the correct job and the supplier can see funded escrow before work. Deliver two to five milestones with checkable evidence; exercise accept, review extension, partial release, final release, deadline reclaim, mutual cancellation and dispute resolution. Reconcile every release against escrow balance, counterparty balances, activity, receipts, notifications and the settled credit-passport projection.

# Invoice factoring loop

Open an accepted finance-lane invoice for early payout, set a supplier floor, submit competing offers, reprice one and accept exactly one. Prove the advance authorization pays the supplier identity wallet while the assignment transaction is sent by the recorded seller agent. Require a successful receipt, a USDC transfer equal to the advance, and registry payee equal to the financier before acceptance. Keep the position visible until escrow repays the financier. Exercise expired authorization, insufficient financier USDC, wrong signer, reverted receipt, zero payee, duplicate acceptance, partial milestone release, shortfall and default.

# Purchase-order financing loop

Fund only an accepted, buyer-funded purchase order before accepted delivery. Prove the financier is the sender, principal moves directly to the escrow-resolved supplier, the on-chain line matches financier, supplier, principal and repayment, collateral is reserved and payout assignment exists atomically. Test self-funding, inadequate allowance, insufficient financier USDC, insufficient seller stake, stake-floor drift, duplicate funding, reverted receipt and fabricated hash. Verify chain repayment before recording repaid and chain default before recording defaulted.

# Money movement and assistant ordering

Test deposits and withdrawals for identity, buyer-agent and seller-agent balances across Arc and every supported source chain. Include: bridge buyer-agent Arbitrum USDC to the same buyer agent on Arc, then transfer identity-wallet USDC to that buyer agent. The planner must discover the visible source balance, preserve order, quote fees, identify approvals, stop on insufficient funds and resume without replaying completed transfers.

# Reputation, credit and permissions

Close clean, late, disputed, cancelled and defaulted trades. Confirm tier movement, concentration, stake cooldown, claims and public credit-passport fields. Test public reads and paid x402 reads separately. Treat erc-8004 compatibility, imported credentials and zk proofs as roadmap unless canon status changes. Verify marketing and dev MCP scopes, invite expiry, reissue, cancellation, oauth reconnection, member disablement and immediate grant revocation.

# Failure injection and evidence pack

Inject timeout, duplicate request, stale nonce, RPC failure, webhook replay, database write failure and process restart. The evidence pack contains actors, wallet map, amount map, timestamps, request ids, receipts, decoded transfers, contract reads, database rows, screenshots, notifications and one pass/fail statement per invariant.
