# Wallets and identity

Keep these ledgers distinct: sign-in identity, identity wallet, buyer or seller agent wallet, escrow, financier, vault, and destination-chain wallet. A user may connect an external wallet or use an identity-derived Circle wallet; do not collapse those into one account.

For money movement, identify source chain, destination chain, token, signer, recipient, approvals, fees, and balance. Preserve user order. Simulate before execution, use an idempotency key, and reconcile terminal status with the receipt and database projection.