import { z } from 'zod';

/// The canon's typed frontmatter.
///
/// Content as data, not prose an agent has to interpret. Everything that
/// decides whether a claim may be published lives here, so a generator never
/// has to read a paragraph and guess whether a feature shipped.

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected an ISO date, YYYY-MM-DD');

/// Booleans from frontmatter, parsed rather than coerced.
///
/// z.coerce.boolean() would run Boolean("false"), which is TRUE, so every file
/// declaring `capability: false` would read as a capability claim. That is the
/// same class of bug the strict frontmatter parser exists to prevent, and it is
/// worth spelling out: coercion is not parsing. Only these six spellings are
/// accepted, and anything else fails loudly.
const boolish = z
  .union([z.boolean(), z.string()])
  .transform((value, ctx) => {
    if (typeof value === 'boolean') return value;
    const raw = value.trim().toLowerCase();
    if (raw === 'true' || raw === 'yes' || raw === '1') return true;
    if (raw === 'false' || raw === 'no' || raw === '0') return false;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `expected true or false, got "${value}"`,
    });
    return z.NEVER;
  });

export const STATUSES = ['live', 'shipping', 'roadmap', 'parked'] as const;
export const VISIBILITIES = ['public', 'team'] as const;
export const AUDIENCES = ['dev', 'marketing', 'all'] as const;
export const CHECK_KINDS = ['test', 'grep', 'contract', 'manual'] as const;

export type Status = (typeof STATUSES)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type CheckKind = (typeof CHECK_KINDS)[number];

/// Default recheck for a manual claim.
///
/// 180 days, not 90. The rule that keeps `manual` honest is that a fact needing
/// a SHORT expiry should not be manual at all: counts and addresses move fast
/// and belong in test, grep or contract. Manual is for what a machine cannot
/// reach and what does not decay on a schedule, like a Circle relationship or a
/// domain. Churn on stable facts trains people to click through, which is worse
/// than no expiry.
export const DEFAULT_RECHECK_DAYS = 180;

const sourceSchema = z.object({
  url: z.string().url('sources need a real url'),
  date: isoDate,
});

const checkSchema = z
  .object({
    kind: z.enum(CHECK_KINDS),
    /// A test name, a `path#symbol`, or a contract read. Absent only for manual.
    ref: z.string().min(1).optional(),
    /// One line on why this proves the claim. Future readers need the reasoning,
    /// not just the pointer.
    note: z.string().min(1).optional(),
    lastVerified: isoDate.optional(),
    recheckDays: z.coerce.number().int().positive().optional(),
  })
  .superRefine((check, ctx) => {
    if (check.kind === 'manual') {
      if (!check.lastVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'a manual check needs lastVerified: nobody can tell when it was last true',
        });
      }
      return;
    }
    if (!check.ref) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `a ${check.kind} check needs a ref to run against`,
      });
    }
  });

export type Check = z.infer<typeof checkSchema>;

export const frontmatterSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be lower-kebab-case'),
    title: z.string().min(1),
    status: z.enum(STATUSES),
    visibility: z.enum(VISIBILITIES),
    audience: z.enum(AUDIENCES).default('all'),
    updated: isoDate,
    sources: z.array(sourceSchema).default([]),
    check: checkSchema.optional(),
    tags: z.array(z.string()).default([]),
    /// Set on a file that asserts product behaviour. It is what makes `check`
    /// mandatory once the status is live. Brand tokens, voice rules and glossary
    /// entries are not capabilities and do not need one.
    capability: boolish.default(false),
  })
  .superRefine((fm, ctx) => {
    if (fm.visibility === 'public' && fm.sources.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a public file needs at least one source',
        path: ['sources'],
      });
    }
    // The rule the whole mechanism exists for. A live capability claim without a
    // check is a sentence nobody is testing, which is exactly how the README
    // claimed reputation counted distinct counterparties for months while the
    // layer that gated lending ignored concentration entirely.
    if (fm.capability && fm.status === 'live' && !fm.check) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'a live capability claim needs a check. If it cannot be checked, say so with kind: manual',
        path: ['check'],
      });
    }
  });

export type CanonFrontmatter = z.infer<typeof frontmatterSchema>;

export interface CanonFile {
  /// Path relative to the canon root, always with forward slashes.
  path: string;
  frontmatter: CanonFrontmatter;
  body: string;
}

/// Whether a fact may be rendered as a shipped claim. A roadmap item is never
/// spoken about in the present tense, and a stale manual check is barred until
/// somebody re-verifies it.
export function isPublishable(file: CanonFile, now = new Date()): boolean {
  if (file.frontmatter.status !== 'live') return false;
  const check = file.frontmatter.check;
  if (!check || check.kind !== 'manual') return true;
  return !isManualCheckStale(check, now);
}

export function isManualCheckStale(check: Check, now = new Date()): boolean {
  if (check.kind !== 'manual' || !check.lastVerified) return false;
  const verified = Date.parse(`${check.lastVerified}T00:00:00Z`);
  if (Number.isNaN(verified)) return true;
  const days = (now.getTime() - verified) / 86_400_000;
  return days > (check.recheckDays ?? DEFAULT_RECHECK_DAYS);
}
