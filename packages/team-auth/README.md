# Team access keys

How a member gets access to the Karwan canon, and how that access ends.

## Issuing

An admin issues a key at `/admin/team-keys` in the Karwan admin panel. One key
per person per machine, labelled so it can be recognised later. Pick the role at
issue: `marketing` sees positioning, claims and voice, `dev` also sees
architecture and contract facts.

The raw key is shown once, at issue, and never again. The backend stores a
scrypt hash and a salt, so a dump of the database does not hand anyone the
canon. If a key is lost the only remedy is to revoke it and issue another.

The key looks like `karwan_<id>_<secret>`. The id is in the key so verification
is a single lookup rather than hashing the candidate against every row, which
would turn the verify endpoint into a way to burn the server's CPU.

## Revoking, and the 15 minute window

**Revoking is not instant. Budget 15 minutes.**

Revoking at `/admin/team-keys` takes effect at the backend immediately. But a
team MCP that is already running caches its last successful check for 15
minutes, so a revoked key can keep working until that cache expires. This is a
deliberate trade: checking on every tool call would make the backend a hard
dependency of every keystroke.

If you need access gone faster than that, the member has to close the client, or
you take the backend's answer out of the loop some other way. Do not assume the
click was enough.

## What happens when the backend is unreachable

A rejection and an outage are not the same thing, and the client treats them
differently on purpose.

| The backend says            | What the client does                                  |
| --------------------------- | ----------------------------------------------------- |
| valid                       | Serves the canon. Caches for 15 minutes.               |
| revoked, or not accepted    | Access ends now. The cache is dropped.                 |
| nothing (network error, 5xx)| Keeps serving the cached identity, marked stale, for up to an hour past the last successful check. Then hard fails. |

The hour is a bound, not a feature. It exists so a network blip does not lock
the team out of their own canon, and it expires so that cutting the MCP off from
the network is not a way to keep using a revoked key indefinitely.

A stale identity is flagged as `stale: true`. A client that surfaces it should
say so rather than pretending the check just succeeded.

## Versioning

Every verify response carries `canonVersion`, set by `CANON_VERSION` on the
backend and bumped in lockstep with the canon package. A client more than one
minor version behind should tell the member to update rather than answering from
facts that have moved.

## Testing it

```
pnpm test
```

The suite pins each of the rules above, including the 15 minute window itself,
so the exposure cannot drift without a test going red. The backend half has its
own suite:

```
cd ../../../karwan/backend && pnpm test
```

That one proves the definition of done end to end: issue a key, use it, revoke
it, and watch access die.
