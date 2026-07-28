import type { Fact } from './facts.ts';

/// Checking a draft against the voice rules and against what actually shipped.
///
/// Two failure modes, and the second is the expensive one. A draft that sounds
/// generated is embarrassing. A draft that claims a roadmap feature as live is a
/// false public claim, which is the thing the README did for months about
/// reputation counting distinct counterparties.
///
/// Every finding points at the offending text and says what to do instead.
/// "Consider tightening the prose" helps nobody.

export interface Finding {
  rule: string;
  severity: 'error' | 'warning';
  /// The offending text, verbatim, so it can be found in the draft.
  excerpt: string;
  /// 1-indexed.
  line: number;
  fix: string;
}

/// The mechanical voice rules.
///
/// These live in code rather than being parsed out of canon/team/voice, because
/// parsing rules out of prose is fragile in exactly the way that fails silently.
/// The canon file is the explanation for humans; this is the enforcement. They
/// are edited together.
const VOICE_RULES: Array<{
  rule: string;
  severity: Finding['severity'];
  re: RegExp;
  fix: string;
}> = [
  {
    rule: 'no-em-dash',
    severity: 'error',
    re: /—|--(?!\s*>)/g,
    fix: 'Use a period or a comma. This is the single clearest tell of generated prose.',
  },
  {
    rule: 'no-filler-opener',
    severity: 'error',
    re: /\b(in today's [a-z-]+ world|it'?s worth noting that|let'?s dive in|in the world of|when it comes to|at the end of the day|needless to say)\b/gi,
    fix: 'Delete it and start with the claim.',
  },
  {
    rule: 'no-ai-vocabulary',
    severity: 'error',
    re: /\b(delve into|leverage(?:s|d|ing)? the power|seamless(?:ly)?|robust solution|game[- ]chang(?:er|ing)|revolutioniz(?:e|es|ing)|unlock the potential|elevate your|supercharge|cutting[- ]edge|state[- ]of[- ]the[- ]art)\b/gi,
    fix: 'Say the specific thing this is standing in for.',
  },
  {
    rule: 'no-rule-of-three',
    severity: 'warning',
    re: /\b(\w+),\s+(\w+),?\s+and\s+(\w+)\b(?=[.!?,])/g,
    fix: 'Padding pretending to be rhythm. Say the one thing that is true.',
  },
  {
    rule: 'no-hedging',
    severity: 'warning',
    re: /\b(arguably|essentially|basically|quite possibly|it could be argued)\b/gi,
    fix: 'Make the claim or drop it.',
  },
];

/// Words a sentence-case heading may still capitalise.
const PROPER_NOUNS = new Set([
  'karwan', 'arc', 'circle', 'usdc', 'usyc', 'cctp', 'x402', 'solana', 'base',
  'ethereum', 'postgres', 'claude', 'gateway', 'net', 'po', 'kyc', 'api', 'mcp',
]);

function checkHeading(line: string, lineNumber: number): Finding | null {
  const match = /^#{1,6}\s+(.*)$/.exec(line.trim());
  if (!match) return null;
  const heading = match[1]!.trim();

  const words = heading.split(/\s+/).filter(Boolean);
  // A heading is Title Case when more than one word past the first is
  // capitalised and is not a proper noun or an acronym we use.
  const offenders = words.slice(1).filter((word) => {
    const bare = word.replace(/[^A-Za-z]/g, '');
    if (bare.length < 2) return false;
    if (PROPER_NOUNS.has(bare.toLowerCase())) return false;
    if (bare === bare.toUpperCase()) return false;
    return /^[A-Z]/.test(bare);
  });

  if (offenders.length < 2) return null;
  return {
    rule: 'sentence-case-headings',
    severity: 'error',
    excerpt: heading,
    line: lineNumber,
    fix: `Sentence case. Lowercase ${offenders.slice(0, 3).join(', ')}.`,
  };
}

export function checkVoice(draft: string): Finding[] {
  const findings: Finding[] = [];
  const lines = draft.split('\n');

  lines.forEach((line, i) => {
    const heading = checkHeading(line, i + 1);
    if (heading) findings.push(heading);

    for (const rule of VOICE_RULES) {
      // Fresh lastIndex per line: these are /g regexes reused across calls.
      rule.re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.re.exec(line)) !== null) {
        findings.push({
          rule: rule.rule,
          severity: rule.severity,
          excerpt: m[0],
          line: i + 1,
          fix: rule.fix,
        });
        if (m.index === rule.re.lastIndex) rule.re.lastIndex++;
      }
    }
  });

  return findings;
}

/// Does this draft claim something we have not shipped?
///
/// The check is deliberately blunt: it looks for a fact's title or id appearing
/// in the draft and flags it when that fact is not publishable. It will
/// occasionally flag a mention that was already careful about tense. That is the
/// right way round to be wrong, because the alternative is a false public claim
/// that nobody catches for months.
export function checkClaims(draft: string, facts: Fact[]): Finding[] {
  const findings: Finding[] = [];
  const lines = draft.split('\n');

  const risky = facts.filter((f) => f.capability && !f.publishable);

  for (const fact of risky) {
    // Match the title as a phrase, and the id with its hyphens as spaces, so
    // "purchase order financing" catches `po-financing`'s title either way.
    const needles = [fact.title, fact.id.replace(/-/g, ' ')].map((n) => n.toLowerCase());

    lines.forEach((line, i) => {
      const haystack = line.toLowerCase();
      if (!needles.some((n) => n.length > 3 && haystack.includes(n))) return;

      findings.push({
        rule: fact.blockedBy === 'stale-check' ? 'unverified-claim' : 'unshipped-claim',
        severity: 'error',
        excerpt: line.trim().slice(0, 160),
        line: i + 1,
        fix:
          fact.blockedBy === 'stale-check'
            ? `"${fact.title}" is a live claim whose check has gone stale. Re-verify it before repeating it.`
            : `"${fact.title}" is ${fact.status}, not live. Write it in the future tense or leave it out.`,
      });
    });
  }

  return findings;
}

export interface ReviewResult {
  findings: Finding[];
  errors: number;
  warnings: number;
  /// True when nothing would block publishing. Warnings do not block.
  clean: boolean;
}

export function reviewDraft(draft: string, facts: Fact[]): ReviewResult {
  const findings = [...checkVoice(draft), ...checkClaims(draft, facts)].sort(
    (a, b) => a.line - b.line,
  );
  const errors = findings.filter((f) => f.severity === 'error').length;
  return {
    findings,
    errors,
    warnings: findings.length - errors,
    clean: errors === 0,
  };
}
