# Full product usage

## Contents

- Financing selection
- Actors and wallet variants
- Buyer and seller trade loop
- Escrow, delivery, and settlement
- Invoice factoring
- Purchase-order financing
- Financier workflow
- Stake and collateral
- Deposit, bridge, transfer, and withdrawal
- Required verification
- Failure and recovery checks

Use placeholders for addresses, amounts, deal IDs, transaction hashes, and dates until they are discovered from the active environment. Preserve the user's requested order. Never claim completion from an application response alone.

## Financing selection

Choose invoice factoring when the supplier has already earned an accepted invoice or receivable and wants early payment. The supplier must explicitly request financing. Financiers bid a discount, the supplier may accept exactly one offer, and the maximum repayable amount is what the escrow can still pay after fees and prior releases.

Choose purchase-order financing when an accepted purchase order needs working capital before delivery. Require buyer-funded escrow before financing. In one atomic transaction, pay the principal directly to the escrow-resolved supplier and assign settlement to the financier. Require sufficient supplier stake for the applicable collateral rule.

Do not use factoring merely because a deal exists. Do not use PO financing after accepted delivery or without buyer-funded escrow. If the commercial stage is unclear, determine whether the supplier is financing future fulfilment or selling an existing receivable before proceeding.

## Actors and wallet variants

Record these separately:

- sign-in identity and account type;
- identity wallet;
- buyer agent and seller agent;
- deal escrow;
- financier wallet;
- stake or collateral vault;
- source-chain and destination-chain wallets.

For an external-wallet account, discover the connected address and chain, verify the wallet holds the funds, request the correct network, show approvals and fees, and require the user to sign each write.

For an email or passkey account using Circle-derived wallets, discover the identity-derived deposit address. Ethereum, Base, Arbitrum, and Polygon deposits use the displayed EVM address; Solana uses its separately displayed address. Do not ask the user to connect a wallet or choose a source chain when the passive deposit-address flow does not require it. Record which backend signer submits any later transaction.

## Buyer and seller trade loop

1. Onboard the buyer and seller. Confirm whether each is an individual or verified business and record their identity and agent wallets.
2. Create or import a brief. Record deliverables, two to five milestones, amounts, deadlines, and whether each delivery is a service or physical good.
3. Match buyer and supplier agents, negotiate terms, and record the accepted version.
4. Have the buyer accept and fund the correct escrow from the recorded buyer agent. Verify the supplier sees funded escrow before starting work.
5. Deliver, review, and release each milestone. Keep arrival or delivery confirmation separate from the decision to release money.
6. Require an explicit buyer action for the final milestone. Never describe the final release as timer-driven.
7. Reconcile the final settlement, balances, notifications, activity, and credit-passport projection.

Run the same loop once with external wallets and once with email/Circle accounts. Exercise insufficient balance, wrong network, wrong wallet, stale displayed balance, duplicate submission, and resume after partial completion.

## Escrow, delivery, and settlement

Before work, prove the buyer's funds reached the deal escrow and the escrow state names the correct buyer, supplier, milestones, and amounts.

For a service delivery, submit a specific URL and verify its host resolves. For physical goods, submit a carrier and a tracking reference whose page the buyer can open. Do not claim Karwan independently verified the carrier; it records a specific, checkable claim.

Exercise milestone acceptance, review extension, partial release, explicit final release, missed-deadline reclaim, mutual cancellation, and dispute resolution. After every money movement, compare the escrow balance, emitted USDC transfers, recipient balances, contract state, database state, activity, and notifications.

## Invoice factoring

1. Start from an accepted finance-lane invoice with remaining escrow value.
2. Have the supplier explicitly request early payment and optionally set a floor.
3. Submit competing financier offers, reprice one, and accept exactly one.
4. Verify the advance authorization pays the supplier identity wallet while the assignment transaction is sent by the recorded seller agent.
5. Require a successful receipt, an emitted USDC transfer equal to the accepted advance, and an on-chain registry payee equal to the financier before recording acceptance.
6. Keep the position open until escrow settlement repays the financier ahead of the supplier.

Test expired authorization, insufficient financier USDC, wrong signer, reverted receipt, zero payee, duplicate acceptance, partial milestone release, shortfall, and default.

## Purchase-order financing

1. Start from an accepted purchase order whose escrow the buyer has funded and whose delivery has not been accepted.
2. Verify the supplier's available stake satisfies the current collateral rule immediately before funding.
3. Have the financier approve and fund the principal.
4. In the same confirmed transaction, prove the principal moved directly to the escrow-resolved supplier and the payout assignment names the financier.
5. Read the on-chain financing line and match financier, supplier, principal, expected repayment, and reserved collateral to the database record.
6. On settlement, verify repayment from escrow. If settlement is short, verify only the shortfall is recovered from reserved supplier collateral.

Test self-funding, insufficient allowance or USDC, insufficient stake, stake-floor drift, duplicate funding, reverted receipt, fabricated transaction hash, chain default, and chain repayment.

## Financier workflow

Discover only financing opportunities the supplier has made eligible. Review deal stage, remaining escrow value, requested advance, supplier floor, reputation information, concentration, collateral, and expiry. Quote or bid without assuming acceptance. After acceptance, verify the exact financing contract path and keep the position visible through repayment, shortfall, or default.

## Stake and collateral

Record total, available, reserved, and cooling-down stake separately. Before a financing write, re-read available stake and the current floor instead of trusting a prior screen. After reservation, settlement, shortfall recovery, release, or withdrawal request, reconcile vault events, contract balances, database projections, cooldown timestamps, and notifications. Never present reserved collateral as withdrawable.

## Deposit, bridge, transfer, and withdrawal

For an external wallet deposit or bridge, discover the wallet's visible USDC balance and current chain, quote fees, identify approvals, simulate, obtain the user's signature, and track the move to Arc. Example ordered request: bridge the buyer agent's Arbitrum USDC to the same buyer agent on Arc, then transfer identity-wallet USDC to that buyer agent. Complete and verify the bridge before starting the transfer.

For an email/Circle deposit, show the correct derived address and wait for the inbound transfer and balance projection. Do not manufacture a transaction on the user's behalf when copying the address is the intended flow.

For withdrawal, record the source ledger, destination chain and address, amount, fees, signer, and any cooldown. Supported destinations in the current canon are Ethereum, Base, Arbitrum, Optimism, Polygon, and Solana. Verify the source debit and destination receipt; receiving must not be described as requiring the destination chain's gas token.

## Required verification

For every money-moving step, collect and compare:

1. initiating identity and signing wallet;
2. request or idempotency ID;
3. simulation result where available;
4. transaction hash and successful receipt status;
5. decoded token transfers with token, sender, recipient, and amount;
6. relevant contract reads and emitted domain events;
7. matching database rows and state transitions;
8. source and destination balances;
9. user-visible activity and notifications;
10. one explicit pass or fail statement for each invariant.

Do not mark a step complete when the receipt reverted, the transfer recipient or amount differs, the contract state is stale, the database advanced without chain proof, or the notification claims success before reconciliation.

## Failure and recovery checks

Inject wrong chain, insufficient or stale balance, wrong signer, stale nonce, duplicate request, timeout, RPC failure, webhook replay, database write failure, process restart, reverted receipt, and partial completion. On retry, reuse the workflow's idempotency boundary, rediscover terminal state, preserve completed steps, and never replay a confirmed transfer.
