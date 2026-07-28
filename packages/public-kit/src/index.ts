import {
  checkClaims,
  parseBrandTokens,
  queryFacts,
  type BrandToken,
  type FactQuery,
  type Finding,
  type PublicDoc,
  type PublicFact,
} from '@karwan/generator';
import { snapshot } from './snapshot.ts';

/// `@karwan/kit`
///
/// Karwan's published facts, as a library. For anyone building on Karwan or
/// writing about it: an integrator generating docs, a community writer checking
/// a post, a site rendering the current feature list without hardcoding it.
///
/// It reads one committed snapshot of the public canon and nothing else. The
/// team canon is not in this package, so no call here can reach it.
///
/// What it deliberately does not carry: the house voice checker. Getting the
/// facts right is everyone's problem and this helps with it. Sounding like us is
/// not something we need to hand out.

export type { BrandToken, FactQuery, Finding, PublicDoc, PublicFact };

export function canonVersion(): string {
  return snapshot().canonVersion;
}

/// The date of the most recently updated public file. Useful for a "last
/// updated" line on a page built from this.
export function canonUpdated(): string {
  return snapshot().canonUpdated;
}

/// Every public document.
export function docs(): PublicDoc[] {
  return snapshot().docs;
}

function under(prefix: string): PublicDoc[] {
  return docs().filter((d) => d.path.startsWith(prefix));
}

/// What Karwan is. The overview and glossary, which is what somebody arriving
/// cold needs before anything else.
export function overview(): PublicDoc[] {
  return [...under('public/product/'), ...under('public/glossary/')].filter(
    (d) => d.tags.includes('overview') || d.path.startsWith('public/glossary/'),
  );
}

/// Live capabilities only.
///
/// Not "product documents": a public file describing something on the roadmap is
/// legitimate, and it must never come back from a function called `features`.
export function features(): PublicDoc[] {
  const live = new Set(
    snapshot()
      .facts.filter((f) => f.capability && f.publishable)
      .map((f) => f.id),
  );
  return docs().filter((d) => live.has(d.id));
}

export function faq(): PublicDoc[] {
  return under('public/faq/');
}

export function proof(): PublicDoc[] {
  return under('public/proof/');
}

export function brand(): PublicDoc[] {
  return under('public/brand/');
}

export function brandTokens(): BrandToken[] {
  return parseBrandTokens(docs());
}

/// The fact index: every public claim with its status and whether it may be
/// stated in the present tense.
export function facts(): PublicFact[] {
  return snapshot().facts;
}

export function findFacts(query: FactQuery): PublicFact[] {
  return queryFacts(facts(), query);
}

/// Does this draft claim something Karwan has not shipped?
export function factCheck(draft: string): Finding[] {
  return checkClaims(draft, facts());
}

/// For a CI step, or a content pipeline that should not publish a false claim.
/// Throws with the line and the specific fix rather than a boolean.
export function assertFactual(draft: string): void {
  const findings = factCheck(draft);
  if (findings.length === 0) return;

  const lines = findings.map((f) => `  line ${f.line} · ${f.rule}: ${f.excerpt}\n    ${f.fix}`);
  throw new Error(
    `${findings.length} claim(s) in this draft are not supported by Karwan's public canon:\n${lines.join('\n')}`,
  );
}
