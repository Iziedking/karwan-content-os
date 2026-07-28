import type { CanonFile } from '@karwan/canon-schema';
import { renderBrief } from './brief.ts';
import { buildFactIndex } from './facts.ts';
import { partition, type Role } from './select.ts';

/// Skill bundles for the editors the team actually uses.
///
/// Generated, never hand written. A hand-written skill drifts from the canon the
/// moment the canon moves, and drift here means an agent confidently writing
/// last month's claims. The whole point of generating is that the bundles cannot
/// be individually wrong.
///
/// Each target wants a different file layout, so the CONTENT is shared and only
/// the wrapper differs.

export type SkillTarget = 'claude' | 'codex' | 'cursor';

export interface GeneratedFile {
  /// Relative to the output root, always forward slashes.
  path: string;
  content: string;
}

export interface SkillOptions {
  role: Role;
  canonVersion: string;
  now?: Date;
}

/// The instruction block every target shares. This is the part that has to be
/// right; the wrappers are packaging.
function instructions(files: CanonFile[], opts: SkillOptions): string {
  const p = partition(files, opts.now ?? new Date());
  const notLive = [...p.future, ...p.stale];

  // Read the count out in words that stay correct at zero. "0 are not, and are
  // listed under Not shipped" points a reader at a section that does not exist.
  const unshipped =
    notLive.length === 0
      ? 'Nothing else in this canon is claimable, so anything you cannot find here is not a claim Karwan makes.'
      : `${notLive.length} more are real but not live, listed under "Not shipped" and "Unverified" in the brief.`;

  return `# Writing as Karwan

You are writing for Karwan. Everything below comes from the canon at version
${opts.canonVersion}, generated for a ${opts.role} audience. Do not write from
memory of Karwan. Write from the brief in this bundle.

## The two rules that matter

1. **Never claim something we have not shipped.** ${p.shipped.length} capability claims are
   live and may be stated in the present tense. ${unshipped} If a reader could
   not go and use it today, do not write it as though they could.
2. **No em dashes.** Use a period or a comma. This one is absolute because it is
   the clearest tell of generated prose.

## The rest of the voice

Start with the claim, not a windup. Sentence case headings. Concrete over
abstract: "a supplier in Lagos waits ninety days" beats "payment delays affect
SMEs". Name the failure and what it cost. Short sentences carry weight, and a
long one is fine when the idea needs it. No rule of three, no hedging, no words
like seamless or robust or game-changing.

## Before you hand anything over

Check every capability sentence against \`facts.json\` in this bundle. A fact
with \`"publishable": false\` cannot be stated in the present tense, whatever its
\`blockedBy\` reason. If you cannot find a fact backing a sentence, the sentence
is not a claim Karwan makes, so cut it or ask.
`;
}

export function generateSkillBundle(files: CanonFile[], target: SkillTarget, opts: SkillOptions): GeneratedFile[] {
  const brief = renderBrief(files, {
    canonVersion: opts.canonVersion,
    audience: opts.role,
    now: opts.now,
  });
  const facts = JSON.stringify(buildFactIndex(files, opts.now ?? new Date()), null, 2);
  const body = instructions(files, opts);
  const root = `skills/${target}/karwan-${opts.role}`;

  const shared: GeneratedFile[] = [
    { path: `${root}/brief.md`, content: brief },
    { path: `${root}/facts.json`, content: `${facts}\n` },
  ];

  switch (target) {
    case 'claude':
      // Claude Code reads SKILL.md with YAML frontmatter naming the skill and
      // saying when to use it.
      return [
        {
          path: `${root}/SKILL.md`,
          content: [
            '---',
            `name: karwan-${opts.role}`,
            `description: >`,
            `  Write for Karwan in the house voice, using only facts the canon`,
            `  says have shipped. Use for any Karwan post, page, email, thread,`,
            `  or submission. Canon version ${opts.canonVersion}.`,
            '---',
            '',
            body,
            '',
            'Read `brief.md` in this directory for the full canon, and `facts.json`',
            'for the machine-checkable fact index.',
            '',
          ].join('\n'),
        },
        ...shared,
      ];

    case 'cursor':
      // Cursor reads .mdc rules with frontmatter. alwaysApply false so it is
      // pulled in when relevant rather than riding along on every request.
      return [
        {
          path: `${root}/karwan-${opts.role}.mdc`,
          content: [
            '---',
            `description: Write for Karwan in the house voice using canon ${opts.canonVersion}`,
            'globs:',
            'alwaysApply: false',
            '---',
            '',
            body,
            '',
            'The full canon is in `brief.md`, the fact index in `facts.json`.',
            '',
          ].join('\n'),
        },
        ...shared,
      ];

    case 'codex':
      // Codex reads plain AGENTS.md with no frontmatter.
      return [
        {
          path: `${root}/AGENTS.md`,
          content: `${body}\nThe full canon is in \`brief.md\`, the fact index in \`facts.json\`.\n`,
        },
        ...shared,
      ];
  }
}

export const SKILL_TARGETS: SkillTarget[] = ['claude', 'codex', 'cursor'];

/// Every bundle, for every target and role.
export function generateAllSkills(
  files: CanonFile[],
  opts: { canonVersion: string; now?: Date },
  select: (role: Role) => CanonFile[],
): GeneratedFile[] {
  const out: GeneratedFile[] = [];
  for (const role of ['dev', 'marketing'] as Role[]) {
    const scoped = select(role);
    for (const target of SKILL_TARGETS) {
      out.push(...generateSkillBundle(scoped, target, { role, canonVersion: opts.canonVersion, now: opts.now }));
    }
  }
  return out;
}
