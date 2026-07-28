import type { CanonFile } from '@karwan/canon-schema';
import { renderBrief } from './brief.ts';
import { buildFactIndex } from './facts.ts';
import { buildPublicSnapshot } from './publicBundle.ts';
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

/// The audiences a bundle can be cut for. `public` is not a team role: it is
/// the bundle a community builder installs, cut from the public canon only, and
/// it carries the claim rules without the house voice. Our voice is ours.
export type SkillRole = Role | 'public';

export interface GeneratedFile {
  /// Relative to the output root, always forward slashes.
  path: string;
  content: string;
}

export interface SkillOptions {
  role: SkillRole;
  canonVersion: string;
  now?: Date;
}

/// The instruction block every target shares. This is the part that has to be
/// right; the wrappers are packaging.
function instructions(files: CanonFile[], opts: SkillOptions): string {
  const p = partition(files, opts.now ?? new Date());
  const notLive = [...p.future, ...p.stale];

  if (opts.role === 'public') return publicInstructions(p.shipped.length, notLive.length, opts);

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

Check every capability sentence against \`facts.json\` in this bundle, and read
\`blockedBy\` rather than \`publishable\` on its own:

- \`not-live\` or \`stale-check\`: barred. Future tense, or leave it out.
- \`not-a-capability\`: brand, voice, glossary and FAQ entries. These do not
  claim product behaviour, so nothing is barred. Use them freely.

If you cannot find a fact backing a sentence, the sentence is not a claim Karwan
makes, so cut it or ask.
`;
}

/// The public bundle.
///
/// Written for somebody outside the team: an integrator, a community writer, a
/// judge reading a submission. The claim rule is identical because a false
/// claim is just as false in somebody else's post, and a wrong number written
/// by a community builder is a wrong number the internet now attributes to us.
/// The house voice rules are absent on purpose. We do not need strangers
/// sounding like us, we need them getting the facts right.
function publicInstructions(shipped: number, notLive: number, opts: SkillOptions): string {
  const unshipped =
    notLive === 0
      ? 'Nothing else here is a capability claim.'
      : `${notLive} further entries are real but not live, and the brief marks them so.`;

  return `# Writing about Karwan

This is Karwan's public canon, version ${opts.canonVersion}. Everything in this
bundle is published and may be repeated. Nothing outside it is a claim Karwan
makes, so if you cannot find something here, do not write it. Ask instead.

## The rules

1. **Only what has shipped, in the present tense.** ${shipped} capabilities are live.
   ${unshipped} If a reader could not go and use it today, do not write it as
   though they could.
2. **Do not invent numbers.** No volumes, no user counts, no fee figures, no
   addresses beyond the ones in \`facts.json\`. If a number is not in this
   bundle, we have not published it.
3. **Karwan runs on a testnet.** Never imply that real money is at stake unless
   the canon says otherwise. Getting this wrong is not a wording problem.
4. **Follow the brand rules in the brief** when you use the name or the mark.

## Checking your work

\`facts.json\` is the machine-readable version of everything above. Check each
capability sentence against it, and read \`blockedBy\` rather than \`publishable\`
on its own:

- \`not-live\` or \`stale-check\`: do not write it in the present tense.
- \`not-a-capability\`: brand rules, glossary and FAQ answers. These do not claim
  product behaviour, so nothing is barred. Repeat them freely.
`;
}

/// The public bundle carries the public fact index, with internal check refs
/// stripped. Same call the public kit and public MCP make, so a fact cannot
/// arrive in a community builder's editor richer than it arrives over the wire.
function factsFor(files: CanonFile[], opts: SkillOptions): string {
  const index =
    opts.role === 'public'
      ? buildPublicSnapshot(files, { canonVersion: opts.canonVersion, now: opts.now }).facts
      : buildFactIndex(files, opts.now ?? new Date());
  return JSON.stringify(index, null, 2);
}

const DESCRIPTIONS: Record<SkillRole, string> = {
  dev: 'Write for Karwan in the house voice, using only facts the canon says have shipped.',
  marketing: 'Write for Karwan in the house voice, using only facts the canon says have shipped.',
  public: 'Write about Karwan using only its published facts, never claiming anything unshipped.',
};

export function generateSkillBundle(files: CanonFile[], target: SkillTarget, opts: SkillOptions): GeneratedFile[] {
  const brief = renderBrief(files, {
    canonVersion: opts.canonVersion,
    audience: opts.role,
    now: opts.now,
  });
  const facts = factsFor(files, opts);
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
            `  ${DESCRIPTIONS[opts.role]}`,
            `  Use for any Karwan post, page, email, thread, or submission.`,
            `  Canon version ${opts.canonVersion}.`,
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
            `description: ${DESCRIPTIONS[opts.role]} Canon ${opts.canonVersion}.`,
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
export const SKILL_ROLES: SkillRole[] = ['dev', 'marketing', 'public'];

/// Every bundle, for every target and role.
///
/// `select` decides what each role may see, and it is the caller's job because
/// the selection rule is the security boundary. Passing it in means the public
/// bundle's inputs are chosen by the same lens the public MCP uses rather than
/// by a second rule written here.
export function generateAllSkills(
  files: CanonFile[],
  opts: { canonVersion: string; now?: Date },
  select: (role: SkillRole) => CanonFile[],
): GeneratedFile[] {
  const out: GeneratedFile[] = [];
  for (const role of SKILL_ROLES) {
    const scoped = select(role);
    for (const target of SKILL_TARGETS) {
      out.push(...generateSkillBundle(scoped, target, { role, canonVersion: opts.canonVersion, now: opts.now }));
    }
  }
  return out;
}
