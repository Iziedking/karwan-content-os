import type { CanonFile, Check, Status } from '@karwan/canon-schema';
import { partition, type Partition } from './select.ts';

/// The canon as queryable data rather than prose.
///
/// A fact index exists so an agent can ask "is X shipped" and get an answer with
/// a status attached, instead of reading a paragraph and inferring one. Every
/// entry carries how it is checked, so "we do this" can always be traced to the
/// thing that would fail if we stopped.

export interface Fact {
  id: string;
  title: string;
  status: Status;
  /// True only when this may be stated in the present tense as a shipped claim.
  publishable: boolean;
  /// Why not, when it is not. Empty when it is.
  blockedBy: '' | 'not-live' | 'stale-check' | 'not-a-capability';
  capability: boolean;
  audience: string;
  tags: string[];
  /// First paragraph of the body. Enough to answer, not the whole file.
  summary: string;
  sources: Array<{ url: string; date: string }>;
  check: Check | null;
  updated: string;
  path: string;
}

/// The first paragraph, normalised to one line.
///
/// Deliberately not the first N characters: cutting mid-sentence produces a
/// summary that reads like a broken claim, and a broken claim is what this whole
/// system exists to prevent.
export function summarise(body: string): string {
  const paragraph = body.trim().split(/\n\s*\n/)[0] ?? '';
  return paragraph.replace(/\s+/g, ' ').trim();
}

function toFact(file: CanonFile, publishable: boolean, blockedBy: Fact['blockedBy']): Fact {
  const fm = file.frontmatter;
  return {
    id: fm.id,
    title: fm.title,
    status: fm.status,
    publishable,
    blockedBy,
    capability: fm.capability,
    audience: fm.audience,
    tags: fm.tags,
    summary: summarise(file.body),
    sources: fm.sources,
    check: fm.check ?? null,
    updated: fm.updated,
    path: file.path,
  };
}

export function buildFactIndex(files: CanonFile[], now = new Date()): Fact[] {
  const p: Partition = partition(files, now);
  return [
    ...p.shipped.map((f) => toFact(f, true, '')),
    ...p.future.map((f) => toFact(f, false, 'not-live')),
    ...p.stale.map((f) => toFact(f, false, 'stale-check')),
    ...p.reference.map((f) => toFact(f, false, 'not-a-capability')),
  ].sort((a, b) => a.id.localeCompare(b.id));
}

export interface FactQuery {
  /// Matched against id, title, tags and summary, case-insensitively. Every
  /// term must match somewhere, so "po financing" narrows rather than widens.
  q?: string;
  status?: Status;
  tag?: string;
  /// Only facts that may be stated in the present tense.
  publishableOnly?: boolean;
}

/// The fields a query actually reads. Stated structurally so the public fact
/// index, which carries a reduced `check`, goes through the same function
/// rather than a near-copy written for it.
export type QueryableFact = Pick<Fact, 'id' | 'title' | 'tags' | 'summary' | 'status' | 'publishable'>;

export function queryFacts<T extends QueryableFact>(facts: T[], query: FactQuery): T[] {
  const terms = (query.q ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return facts.filter((fact) => {
    if (query.status && fact.status !== query.status) return false;
    if (query.tag && !fact.tags.includes(query.tag)) return false;
    if (query.publishableOnly && !fact.publishable) return false;
    if (terms.length === 0) return true;

    const haystack = `${fact.id} ${fact.title} ${fact.tags.join(' ')} ${fact.summary}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
