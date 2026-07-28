/// A token bucket over tool calls.
///
/// Be honest about what this defends. Over stdio, every caller runs their own
/// copy of the server, so this is not access control: it is a runaway guard,
/// the thing that stops an agent in a retry loop reading the same canon four
/// thousand times a minute. It earns its place when the same server is put
/// behind an HTTP transport for the registry listing, where one process does
/// serve many callers and a limit is the difference between a public endpoint
/// and an open one.
///
/// Steady refill rather than a fixed window, so a caller who has been quiet for
/// a minute gets a full burst and one who is hammering gets a steady trickle
/// instead of a cliff every sixty seconds.

export interface RateLimitOptions {
  /// Calls allowed in a burst.
  burst: number;
  /// Sustained calls per minute.
  perMinute: number;
  now?: () => number;
}

export class RateLimiter {
  private tokens: number;
  private last: number;
  private readonly now: () => number;

  constructor(private readonly opts: RateLimitOptions) {
    this.now = opts.now ?? (() => Date.now());
    this.tokens = opts.burst;
    this.last = this.now();
  }

  /// Take a token. Returns null when allowed, or the message to return to the
  /// caller when it is not. A message rather than a boolean because a caller
  /// that is being throttled deserves to be told why and for how long.
  take(): string | null {
    const at = this.now();
    const refill = ((at - this.last) / 60_000) * this.opts.perMinute;
    this.tokens = Math.min(this.opts.burst, this.tokens + refill);
    this.last = at;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return null;
    }

    const waitMs = ((1 - this.tokens) / this.opts.perMinute) * 60_000;
    return `Rate limited. This server allows ${this.opts.perMinute} calls a minute. Wait about ${Math.ceil(
      waitMs / 1000,
    )}s and try again, or read the same content from the karwan.site docs.`;
  }
}

/// Read the limit from the environment, falling back to a number that no human
/// working normally will ever reach.
export function limiterFromEnv(env: NodeJS.ProcessEnv = process.env): RateLimiter {
  const perMinute = Number(env.KARWAN_MCP_RATE_LIMIT ?? '') || 60;
  return new RateLimiter({ burst: Math.max(5, Math.ceil(perMinute / 2)), perMinute });
}
