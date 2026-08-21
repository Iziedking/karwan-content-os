# Karwan build shape

Read this before acting on a bug report, a feedback item, or an "improve X"
request. It exists because a report names a **symptom on one screen**, and a
symptom on one screen is almost never one edit. The map below is so that nobody
has to tell the agent where else to look.

## The rule

> A user reports where they SAW it. Fix where it IS, then check every other
> surface that reads the same source.

Three questions, in this order, every time:

1. **What is the source of truth for this?** A contract, a database row, a
   projection, a message key, a CSS token. Fix it there.
2. **Who else reads that source?** Grep for it. Every reader gets the fix or an
   explicit reason why not.
3. **What proves it?** A test on the pure part, a measurement on the rendered
   part. "It looks right on my screen" is neither.

## The layers

```
contracts/src/*.sol            on-chain truth. immutable once deployed.
      ↓ events + getters
backend/src/chain/             reads and writes the chain (viem + Circle SDK)
backend/src/money/             money-movement lifecycle: references, legs, receipts
backend/src/db/                durable stores (postgres jsonb, flat-file fallback)
backend/src/routes/            HTTP, session-scoped, the ONLY place authz lives
      ↓ JSON
frontend/core/api.ts           one typed client. every request goes through it
frontend/features/*/           feature logic, hooks, presentation helpers
frontend/shared/               cross-feature components, i18n, tokens, motion
frontend/app/                  routes and page composition
```

Money crosses these layers in one direction and is recorded at every step. If a
change touches an amount, a status, or a receipt, it touches
`backend/src/money/` and it needs a test.

## Trace map: symptom to what changes

Walk the whole row before calling the work done.

### "A number is wrong, missing, or shows a dash"

1. Is it recorded at all? Check the writer for that movement kind actually
   passes the amount. A writer that omits it is the bug, not the renderer.
2. Is it recorded for BOTH sides? Every release has a payer row and a payee row.
3. Historical rows: fixing the writer does nothing to what is already stored.
   Ship a backfill script in the same change and say in the handover that it
   still has to be RUN.
4. Renderers: the ledger row and the receipt are separate files. Both, never
   one.

### "A receipt is wrong"

A receipt has four surfaces that drift independently. Fix all four: the ledger
row, the panel, the printed sheet (`@media print`), and the exported image.
Text written at record time goes through one shared presentation function so all
four say the same sentence. Never format a hash or redact an address at a call
site.

### "It says failed but it worked"

This is a confirmation-watcher bug, not a chain bug. A wait that runs out of
time says the watcher stopped, never that the transaction failed. Answer with
three states, not two: success, reverted, and PENDING. Pending must never be
rendered as an error, and the record keeps its transaction hash so the work can
be finished later.

Check too: does Retry re-SEND? It must reconcile the hash it already has. A
retry that re-sends a settled transfer spends the user's money twice.

### "The number changes when I reload"

Something is counting a WINDOW and presenting it as a total. Either state the
window in the interface or read a server aggregate. Do not "fix" it by
enlarging the window.

### "I cannot message my counterparty"

Chat access is a pure decision over the deal's two parties, and it is tested as
one. Escrow state is not permission: a thread that requires funded escrow cannot
be used to agree the terms that lead to funding. The gate is two real wallets on
a deal that exists, and closed deals stay readable but not writable.

### "It looks broken on my phone"

1. Load the UI skill first. It is law, not advice.
2. Measure, do not eyeball: drive Chrome over the DevTools Protocol with real
   device metrics and probe for elements wider than the viewport. A plain
   headless screenshot lays out wider than the window and resolves sticky
   elements at their static position, so it will lie to you.
3. Two traps worth knowing: a visible-ratio IntersectionObserver threshold can
   never fire for an element taller than the viewport, and a flex item with auto
   inline margins opts out of stretching and sizes to max-content.

### "Add a link, a label, or a word"

There are no hardcoded strings. Every user-visible string is a key in the
English messages file (typed interface AND value block, two separate places in
the same file) plus every other locale. Reuse an existing key before minting a
new one, run the i18n gate, and never mark a key optional.

### "This interaction is slow"

Anything that blocks the main thread inside a click handler is charged to that
click. `window.print()` is the worst offender: it blocks until the dialog
closes, so a user reading their own PDF for two minutes records a two-minute
INP. Hand that work to the next frame and paint a busy state.

## Before it ships

- Typecheck clean in the package you touched.
- i18n and route-shape gates pass.
- Tests for the pure part of the change. Presentation helpers, schedules,
  classifiers, pickers and access decisions are all pure; extract the logic to
  make it so rather than declaring it untestable.
- Backend money paths: run the backend test suite.
- A measurement, not an opinion, for anything visual.
- Git stays manual. Hand the user the exact commands; never commit or push.

## Product truths an agent must not contradict

- One wallet, one balance. Never surface a pooled balance as a separate place,
  never claim sponsored gas.
- USDC amounts are 6-decimal micros in escrow math; Arc's native gas is 18.
- Currency is always explicit: `12,400 USDC`, never `$12,400`.
- A Karwan reference is minted with the money movement. It cannot be
  backfilled, and inventing one puts an unmatched identifier on a shareable
  receipt. Use the transaction hash as the fallback identifier.
- Escrowed USDC must earn yield.
- Contracts are immutable: a fix is a deploy plus a migration, and the human
  runs deploys.
