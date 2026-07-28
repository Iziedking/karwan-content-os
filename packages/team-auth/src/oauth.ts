import { AccessDeniedError, type TeamRole, type VerifiedIdentity } from './index.ts';

/// Validating an OAuth access token, for the resource-server side.
///
/// The team key path answers "is this key still live". This answers a stricter
/// question: is this token live, AND was it minted for this server. The second
/// half is not decoration. Without it, anyone who runs an MCP server your team
/// also connects to could collect their tokens and replay them here.
///
/// No caching, deliberately. A key is a long-lived credential where a fifteen
/// minute window is a reasonable trade. An access token lives an hour and is
/// revoked the instant an account is disabled, so caching would reintroduce
/// exactly the delay the OAuth path exists to remove. The call is to a
/// container on the same host.

export interface OAuthVerifierOptions {
  /// Where the authorization server lives. Internal address in production, so
  /// this never leaves the box.
  backendUrl: string;
  /// The shared credential the introspection endpoint demands. Without it the
  /// endpoint refuses everything, which is the correct failure.
  introspectToken: string;
  /// This server's canonical URI. Every token is checked against it.
  resource: string;
  timeoutMs?: number;
}

interface IntrospectionResponse {
  active: boolean;
  sub?: string;
  role?: TeamRole;
  client_id?: string;
  scope?: string;
  aud?: string;
  exp?: number;
}

export class OAuthVerifier {
  constructor(private readonly opts: OAuthVerifierOptions) {}

  /// Resolve a token to an identity, or throw.
  ///
  /// Throws AccessDeniedError for anything the authorization server rejects, so
  /// a caller cannot accidentally treat a refusal as an outage and serve
  /// content anyway. An outage throws a plain Error, which is a different
  /// failure with a different meaning: unknown, not denied.
  async identify(token: string, canonVersion: string): Promise<VerifiedIdentity> {
    const url = `${this.opts.backendUrl.replace(/\/$/, '')}/oauth/introspect`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.opts.introspectToken}`,
        },
        body: JSON.stringify({ token, resource: this.opts.resource }),
        signal: AbortSignal.timeout(this.opts.timeoutMs ?? 8000),
      });
    } catch (e) {
      throw new Error(`could not reach the authorization server: ${(e as Error).message}`);
    }

    if (res.status === 401 || res.status === 503) {
      // Our own credential is wrong or missing. That is a misconfiguration on
      // this side, not a judgement about the caller's token, so it must not be
      // reported as access denied.
      throw new Error(
        `this server cannot validate tokens right now (introspection returned ${res.status})`,
      );
    }
    if (!res.ok) {
      throw new Error(`introspection failed with ${res.status}`);
    }

    const body = (await res.json()) as IntrospectionResponse;
    if (!body.active) {
      throw new AccessDeniedError(
        'That access token is not valid. Sign in again from your app to reconnect.',
        'inactive',
      );
    }
    if (!body.role || !body.sub) {
      throw new AccessDeniedError('That token carries no identity.', 'malformed');
    }

    // Belt and braces: the authorization server already checked the audience,
    // and this checks it again on the resource server's own terms. The two
    // sides disagreeing is exactly the case worth catching.
    if (body.aud && body.aud !== this.opts.resource) {
      throw new AccessDeniedError('That token was issued for a different server.', 'wrong-audience');
    }

    return {
      role: body.role,
      member: body.sub,
      canonVersion,
      verifiedAt: Date.now(),
      stale: false,
    };
  }
}

/// A Karwan team key looks like `karwan_<id>_<secret>`. Anything else reaching
/// the bearer header is an OAuth token, so the shape decides which verifier
/// runs rather than a config flag somebody has to remember to set.
export function looksLikeTeamKey(token: string): boolean {
  return token.startsWith('karwan_');
}
