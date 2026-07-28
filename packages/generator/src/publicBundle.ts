import type { CanonFile, Check, Status } from '@karwan/canon-schema';
import { buildFactIndex, type Fact } from './facts.ts';
import { selectCanon } from './select.ts';

/// The public canon, frozen into one file.
///
/// The public MCP and the public kit read this snapshot, never the canon tree.
/// That is the whole leak defence, and it is structural rather than careful: an
/// npm package ships its own directory, so if the team canon is not IN the
/// package it cannot be served by the package, whatever a future tool does. A
/// filter can be bypassed by the next person who adds a tool. A file that was
/// never copied cannot be.
///
/// The cost is drift: edit the canon, forget to regenerate, and the snapshot is
/// stale. A test compares the committed snapshot against a freshly built one, so
/// that failure is loud and names the command to fix it.

/// A check as the public may see it.
///
/// `ref` is dropped. A public claim is worth more when a reader can see it is
/// checked and when it was last true, but `backend/src/reputation/config.ts#
/// tierCeilingForConcentration` is our source layout, and publishing an
/// inventory of internal paths in an npm package is a gift to nobody but an
/// attacker. The note survives because it is written for a reader, not a grep.
export interface PublicCheck {
  kind: Check['kind'];
  note: string;
  lastVerified: string;
}

export interface PublicDoc {
  id: string;
  title: string;
  status: Status;
  updated: string;
  tags: string[];
  /// Path within canon/public. Kept because it is how the tools group brand,
  /// product and faq, and it reveals nothing that is not already public.
  path: string;
  sources: Array<{ url: string; date: string }>;
  body: string;
}

/// A fact with the internal check ref removed. Same shape otherwise, so code
/// written against the team fact index reads the public one unchanged.
export type PublicFact = Omit<Fact, 'check'> & { check: PublicCheck | null };

export interface PublicSnapshot {
  canonVersion: string;
  /// The most recent `updated` across the included files. A date rather than a
  /// generation timestamp, so regenerating an unchanged canon produces a byte
  /// identical file and a diff means something changed.
  canonUpdated: string;
  docs: PublicDoc[];
  facts: PublicFact[];
}

function publicCheck(check: Check | null): PublicCheck | null {
  if (!check) return null;
  return {
    kind: check.kind,
    note: check.note ?? '',
    lastVerified: check.lastVerified ?? '',
  };
}

/// Build the snapshot from the WHOLE canon.
///
/// It takes every file and does its own selection rather than trusting a caller
/// to have filtered, then asserts the result. A caller that hands this the team
/// canon by mistake gets a public snapshot anyway, and a bug in selectCanon
/// fails here loudly instead of shipping.
export function buildPublicSnapshot(
  files: CanonFile[],
  opts: { canonVersion: string; now?: Date },
): PublicSnapshot {
  const selected = selectCanon(files, { visibility: 'public' });

  for (const file of selected) {
    if (file.frontmatter.visibility !== 'public' || !file.path.startsWith('public/')) {
      throw new Error(`refusing to build a public snapshot: ${file.path} is not public`);
    }
  }

  const docs: PublicDoc[] = selected.map((file) => ({
    id: file.frontmatter.id,
    title: file.frontmatter.title,
    status: file.frontmatter.status,
    updated: file.frontmatter.updated,
    tags: file.frontmatter.tags,
    path: file.path,
    sources: file.frontmatter.sources,
    body: file.body.trim(),
  }));

  const facts: PublicFact[] = buildFactIndex(selected, opts.now ?? new Date()).map((fact) => ({
    ...fact,
    check: publicCheck(fact.check),
  }));

  const canonUpdated = docs.reduce((latest, doc) => (doc.updated > latest ? doc.updated : latest), '');

  return { canonVersion: opts.canonVersion, canonUpdated, docs, facts };
}

/// One place decides the on-disk shape, so the writer and the reader cannot
/// disagree about trailing newlines and the freshness test compares like with
/// like.
export function serialisePublicSnapshot(snapshot: PublicSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}
