# @karwan/kit

Karwan's published facts, as a library.

For anyone building on Karwan or writing about it: a site rendering the current
feature list without hardcoding it, an integration generating docs, a content
pipeline that should not publish a claim we have not earned.

```ts
import { features, findFacts, assertFactual, brandTokens } from '@karwan/kit';

features();                       // live capabilities only
findFacts({ q: 'escrow' });       // every term must match, so more terms narrow
assertFactual(post);              // throws with the line and the fix
brandTokens();                    // colour tokens, parsed from the canon
```

## What is in here

`canon.public.json`, a snapshot of Karwan's public canon, and the functions that
read it. Nothing else. The snapshot is generated, committed and diffable, and
the package contains no other canon, so there is no internal content for a
future function here to reach by accident.

Every fact carries `publishable` and a `blockedBy` reason. Read both.
`not-live` and `stale-check` mean the claim is barred. `not-a-capability` means
the entry is reference material, a brand rule or an FAQ answer, which claims no
product behaviour and may be used freely. `features()` returns only live
capabilities, so it is the safe list if you would rather not think about it.

Check references are reduced to the kind of check and when it last ran. You can
see a claim is tested. You cannot see the path to the test.

## What is not in here

The voice checker. Getting Karwan's facts right matters to everyone, and this
helps with that. Sounding like Karwan is a different thing, and it stays with
the team package.

## Regenerating

```
pnpm generate
```

Writes `canon.public.json` from the canon. A test compares the committed file
against a fresh cut, so editing the canon without regenerating fails the build
rather than shipping a stale snapshot.
