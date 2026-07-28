import { loadCanon, type CanonFile } from '@karwan/canon-schema';
import {
  buildFactIndex,
  canonVersion,
  queryFacts,
  renderBrief,
  reviewDraft,
  selectCanon,
  checkVoice,
  checkClaims,
  type Fact,
  type FactQuery,
  type Finding,
  type Role,
} from '@karwan/generator';

/// `@karwan/team-kit`
///
/// The canon as a library, for a build rather than an agent. Same data the MCP
/// serves, same rules, reached from code so a CI step can fail a PR that ships a
/// claim we have not earned.
///
/// Everything here is a thin wrapper over the generator on purpose. Two
/// implementations of "may we claim this" is one more than can stay correct.

export type { Fact, FactQuery, Finding, Role, CanonFile };
export { canonVersion };

let cache: CanonFile[] | null = null;

function files(): CanonFile[] {
  if (cache) return cache;
  const { files: loaded, issues } = loadCanon();
  if (issues.length > 0) {
    throw new Error(
      `canon does not parse cleanly (${issues.length} issues). Run canon:validate. First: ${issues[0]!.path}: ${issues[0]!.message}`,
    );
  }
  cache = loaded;
  return loaded;
}

/// The canon, scoped. Omit the role for the public canon only, which is what a
/// public build should use.
export function canon(role?: Role): CanonFile[] {
  return role
    ? selectCanon(files(), { visibility: 'team', role })
    : selectCanon(files(), { visibility: 'public' });
}

export function facts(role?: Role): Fact[] {
  return buildFactIndex(canon(role));
}

export function findFacts(query: FactQuery, role?: Role): Fact[] {
  return queryFacts(facts(role), query);
}

export function brief(role?: Role, compact = false): string {
  return renderBrief(canon(role), {
    canonVersion: canonVersion(),
    audience: role ?? 'public',
    compact,
  });
}

export interface BrandToken {
  name: string;
  value: string;
  note: string;
}

/// Brand tokens, parsed from the canon files tagged `tokens`.
///
/// The tokens live in a fenced block in prose rather than in frontmatter,
/// because that block is what a designer reads. Parsing it is a small risk, so
/// the kit's tests assert on known token names: if the block's shape changes,
/// that fails loudly instead of this quietly returning nothing.
export function brandTokens(): BrandToken[] {
  const out: BrandToken[] = [];

  for (const file of files()) {
    if (!file.frontmatter.tags.includes('tokens')) continue;

    for (const block of file.body.matchAll(/```[a-z]*\n([\s\S]*?)```/g)) {
      for (const line of (block[1] ?? '').split('\n')) {
        // The value anchors the parse: everything before it is the name,
        // everything after is the note. Names contain spaces and slashes, so
        // splitting on whitespace would mangle "ink / dark".
        const m = /^(.*?)\s{2,}(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\s*(.*)$/.exec(line);
        if (!m) continue;
        const name = m[1]!.trim();
        if (!name) continue;
        out.push({ name, value: m[2]!.trim(), note: m[3]!.trim() });
      }
    }
  }

  return out;
}

/// Check a draft against the voice rules.
///
/// Named `humanize` because that is the job: taking prose that reads as
/// generated and pointing at the specific tells. It reports rather than
/// rewrites, because a function that silently edits your copy is a function
/// nobody trusts twice.
export function humanize(draft: string): Finding[] {
  return checkVoice(draft);
}

/// Check a draft's claims against what the canon says has shipped.
export function factCheck(draft: string, role?: Role): Finding[] {
  return checkClaims(draft, facts(role));
}

/// Both checks, with a pass/fail an exit code can be built on.
export function review(draft: string, role?: Role) {
  return reviewDraft(draft, facts(role));
}

/// For a CI step. Throws with every finding listed when the draft would ship a
/// false claim or read as generated.
export function assertPublishable(draft: string, role?: Role): void {
  const result = review(draft, role);
  if (result.clean) return;

  const lines = result.findings
    .filter((f) => f.severity === 'error')
    .map((f) => `  line ${f.line} · ${f.rule}: ${f.excerpt}\n    ${f.fix}`);
  throw new Error(`${result.errors} problem(s) in this draft:\n${lines.join('\n')}`);
}
