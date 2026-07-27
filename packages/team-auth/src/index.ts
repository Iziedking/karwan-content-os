/// Client-side key checking for the team MCP.
///
/// The MCP is a long-running process. It cannot ask the backend on every tool
/// call without making the backend a hard dependency of every keystroke, and it
/// cannot ask once at startup either, because then revoking a key does nothing
/// until the member restarts their editor. So it caches, and the shape of that
/// cache is the whole security story.
///
/// Three rules, in order of how much they matter:
///
/// 1. A rejection is instant and total. If the backend says the key is invalid
///    or revoked, access ends now and the cache is dropped. There is no grace
///    period on a "no".
/// 2. A confirmation lasts 15 minutes. Revoking a key stops it within that
///    window, not immediately. This is stated in the admin panel and in the
///    docs, because an operator who assumes revocation is instant will make a
///    bad call during an incident.
/// 3. The backend being unreachable is not the same as the backend saying no.
///    A network blip should not lock the team out of their own canon, so a
///    confirmed key keeps working through an outage for up to an hour past its
///    last successful check, then hard fails. That bounds how long a revoked
///    key could survive if someone cut the MCP off from the network on purpose.

export type TeamRole = 'dev' | 'marketing';

export interface VerifiedIdentity {
  role: TeamRole;
  member: string;
  canonVersion: string;
  /// When the backend last confirmed this key.
  verifiedAt: number;
  /// True when serving from cache during an outage rather than a fresh check.
  stale: boolean;
}

export class AccessDeniedError extends Error {
  constructor(
    message: string,
    readonly reason: string,
  ) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

/// How long a confirmed key is trusted before the next check.
export const CACHE_TTL_MS = 15 * 60_000;

/// How long past the TTL a confirmed key survives while the backend is
/// unreachable. Beyond this, an MCP that cannot reach the backend stops
/// answering rather than serving the canon on an unverifiable key.
export const OFFLINE_GRACE_MS = 60 * 60_000;

export interface VerifierOptions {
  backendUrl: string;
  key: string;
  /// Injected in tests. Defaults to global fetch.
  fetchImpl?: typeof fetch;
  /// Injected in tests so the clock can be moved without waiting.
  now?: () => number;
  cacheTtlMs?: number;
  offlineGraceMs?: number;
}

interface CacheEntry {
  identity: Omit<VerifiedIdentity, 'stale'>;
}

/// Verifies a team key against the backend and caches the answer.
///
/// One instance per running MCP. Call `identify()` before serving any tool; it
/// either returns who the caller is or throws.
export class TeamKeyVerifier {
  private cache: CacheEntry | null = null;
  private inFlight: Promise<VerifiedIdentity> | null = null;

  private readonly backendUrl: string;
  private readonly key: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly ttl: number;
  private readonly grace: number;

  constructor(opts: VerifierOptions) {
    this.backendUrl = opts.backendUrl.replace(/\/+$/, '');
    this.key = opts.key;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    this.now = opts.now ?? Date.now;
    this.ttl = opts.cacheTtlMs ?? CACHE_TTL_MS;
    this.grace = opts.offlineGraceMs ?? OFFLINE_GRACE_MS;
  }

  /// Who the caller is, or a throw. Never returns a partial answer.
  async identify(): Promise<VerifiedIdentity> {
    const cached = this.cache;
    if (cached && this.now() - cached.identity.verifiedAt < this.ttl) {
      return { ...cached.identity, stale: false };
    }

    // Collapse concurrent calls onto one request. Without this, an MCP serving
    // several tool calls at once would fire a verify per call the moment the
    // cache expires.
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.refresh(cached).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  /// Drop the cache so the next call re-checks. For an explicit "log out".
  reset(): void {
    this.cache = null;
  }

  private async refresh(cached: CacheEntry | null): Promise<VerifiedIdentity> {
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.backendUrl}/api/team-mcp/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: this.key }),
      });
    } catch (e) {
      return this.serveOffline(cached, (e as Error).message);
    }

    // A 5xx is the backend failing, not the backend refusing. Treat it like an
    // outage. A 4xx is an answer, and the answer is no.
    if (res.status >= 500) {
      return this.serveOffline(cached, `backend returned ${res.status}`);
    }

    let body: { valid?: boolean; role?: TeamRole; member?: string; canonVersion?: string; reason?: string };
    try {
      body = (await res.json()) as typeof body;
    } catch {
      return this.serveOffline(cached, 'backend returned a response we could not read');
    }

    if (!res.ok || !body.valid) {
      // An explicit rejection ends access now, cache and all.
      this.cache = null;
      throw new AccessDeniedError(
        body.reason === 'revoked'
          ? 'This key has been revoked. Ask an admin to issue a new one.'
          : 'This key was not accepted.',
        body.reason ?? 'rejected',
      );
    }

    if (!body.role || !body.member) {
      // Valid but shapeless. Refuse rather than invent a role, because the role
      // is what decides which canon files this member can see.
      this.cache = null;
      throw new AccessDeniedError('The backend accepted the key but did not say who it belongs to.', 'incomplete');
    }

    const identity = {
      role: body.role,
      member: body.member,
      canonVersion: body.canonVersion ?? 'unknown',
      verifiedAt: this.now(),
    };
    this.cache = { identity };
    return { ...identity, stale: false };
  }

  private serveOffline(cached: CacheEntry | null, detail: string): VerifiedIdentity {
    if (!cached) {
      throw new AccessDeniedError(`Could not reach the backend to check this key: ${detail}`, 'unreachable');
    }
    const age = this.now() - cached.identity.verifiedAt;
    if (age > this.grace) {
      this.cache = null;
      throw new AccessDeniedError(
        `The backend has been unreachable for over an hour, so this key can no longer be trusted: ${detail}`,
        'grace-expired',
      );
    }
    return { ...cached.identity, stale: true };
  }
}
