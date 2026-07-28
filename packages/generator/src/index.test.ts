import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CanonFile } from '@karwan/canon-schema';
import { selectCanon, partition, audiencesFor } from './select.ts';
import { buildFactIndex, queryFacts, summarise } from './facts.ts';
import { renderBrief } from './brief.ts';
import { reviewDraft, checkVoice, checkClaims } from './review.ts';
import { generateSkillBundle } from './skills.ts';

/// The generator decides what may be said in public. Every rule that keeps an
/// unshipped claim out of generated content is pinned here.

const NOW = new Date('2026-07-28T00:00:00Z');

function file(over: Partial<CanonFile['frontmatter']> & { id: string }, body = 'A summary line.\n\nMore detail.'): CanonFile {
  return {
    path: `${over.visibility === 'team' ? 'team' : 'public'}/x/${over.id}.md`,
    frontmatter: {
      title: over.id,
      status: 'live',
      visibility: 'public',
      audience: 'all',
      updated: '2026-07-27',
      sources: [{ url: 'https://karwan.site', date: '2026-07-27' }],
      tags: [],
      capability: false,
      ...over,
    } as CanonFile['frontmatter'],
    body,
  };
}

test('a public lens never returns a team file', () => {
  const files = [file({ id: 'pub' }), file({ id: 'sec', visibility: 'team' })];
  const got = selectCanon(files, { visibility: 'public' });
  assert.deepEqual(got.map((f) => f.frontmatter.id), ['pub']);
});

test('a public lens stays closed even when the role would allow the audience', () => {
  // Visibility is a secrecy boundary and audience is a relevance one. A dev role
  // must not widen what a public export can reach.
  const files = [file({ id: 'sec', visibility: 'team', audience: 'dev' })];
  assert.equal(selectCanon(files, { visibility: 'public', role: 'dev' }).length, 0);
});

test('marketing does not see dev-only files, dev sees everything', () => {
  const files = [
    file({ id: 'shared', visibility: 'team', audience: 'all' }),
    file({ id: 'deep', visibility: 'team', audience: 'dev' }),
    file({ id: 'copy', visibility: 'team', audience: 'marketing' }),
  ];

  const marketing = selectCanon(files, { visibility: 'team', role: 'marketing' }).map((f) => f.frontmatter.id);
  assert.deepEqual(marketing, ['copy', 'shared']);

  const dev = selectCanon(files, { visibility: 'team', role: 'dev' }).map((f) => f.frontmatter.id);
  assert.deepEqual(dev, ['copy', 'deep', 'shared']);
  assert.deepEqual(audiencesFor('dev').sort(), ['all', 'dev', 'marketing']);
});

test('a roadmap capability is never shipped, whatever else is true of it', () => {
  const p = partition([file({ id: 'later', status: 'roadmap', capability: true })], NOW);
  assert.equal(p.shipped.length, 0);
  assert.equal(p.future.length, 1);
});

test('a stale manual check bars a live claim', () => {
  const fresh = file({
    id: 'fresh',
    capability: true,
    check: { kind: 'manual', lastVerified: '2026-07-01' },
  } as never);
  const old = file({
    id: 'old',
    capability: true,
    check: { kind: 'manual', lastVerified: '2025-01-01' },
  } as never);

  const p = partition([fresh, old], NOW);
  assert.deepEqual(p.shipped.map((f) => f.frontmatter.id), ['fresh']);
  assert.deepEqual(p.stale.map((f) => f.frontmatter.id), ['old']);
});

test('non-capability files are reference, not claims', () => {
  // Voice rules and brand tokens do not ship, so a status gate would either
  // wrongly bar them or wrongly bless them.
  const p = partition([file({ id: 'voice', capability: false, status: 'live' })], NOW);
  assert.equal(p.reference.length, 1);
  assert.equal(p.shipped.length, 0);
});

test('the fact index says why a fact cannot be used', () => {
  const facts = buildFactIndex(
    [
      file({ id: 'live-one', capability: true }),
      file({ id: 'later', capability: true, status: 'roadmap' }),
      file({ id: 'voice', capability: false }),
    ],
    NOW,
  );

  const byId = Object.fromEntries(facts.map((f) => [f.id, f]));
  assert.equal(byId['live-one']!.publishable, true);
  assert.equal(byId['live-one']!.blockedBy, '');
  assert.equal(byId['later']!.publishable, false);
  assert.equal(byId['later']!.blockedBy, 'not-live');
  assert.equal(byId['voice']!.blockedBy, 'not-a-capability');
});

test('querying facts narrows rather than widens on extra terms', () => {
  const facts = buildFactIndex(
    [
      file({ id: 'po-financing', title: 'Purchase-order financing', capability: true, tags: ['financing'] }),
      file({ id: 'invoice-factoring', title: 'Invoice factoring', capability: true, tags: ['financing'] }),
    ],
    NOW,
  );

  assert.equal(queryFacts(facts, { q: 'financing' }).length, 2);
  assert.equal(queryFacts(facts, { q: 'purchase financing' }).length, 1);
  assert.equal(queryFacts(facts, { tag: 'financing' }).length, 2);
  assert.equal(queryFacts(facts, { status: 'roadmap' }).length, 0);
});

test('summarise takes the first paragraph, not the first N characters', () => {
  assert.equal(summarise('One two\nthree.\n\nSecond para.'), 'One two three.');
});

test('the brief separates shipped from unshipped and says so in words', () => {
  const md = renderBrief(
    [
      file({ id: 'shipped-thing', title: 'Shipped thing', capability: true }),
      file({ id: 'later-thing', title: 'Later thing', capability: true, status: 'roadmap' }),
    ],
    { canonVersion: '0.1.0', now: NOW },
  );

  assert.ok(md.includes('## What is shipped'));
  assert.ok(md.includes('## Not shipped'));
  assert.ok(md.includes('future tense'), 'the unshipped section must instruct, not hint');

  // The roadmap item must not appear above the "Not shipped" heading.
  assert.ok(md.indexOf('Later thing') > md.indexOf('## Not shipped'));
  assert.ok(md.indexOf('Shipped thing') < md.indexOf('## Not shipped'));
});

test('em dashes are an error', () => {
  const findings = checkVoice('This is a claim — and a continuation.');
  assert.equal(findings.length, 1);
  assert.equal(findings[0]!.rule, 'no-em-dash');
  assert.equal(findings[0]!.severity, 'error');
});

test('filler openers and AI vocabulary are caught', () => {
  const rules = checkVoice(
    "In today's fast-paced world, our seamless solution will revolutionize trade.",
  ).map((f) => f.rule);
  assert.ok(rules.includes('no-filler-opener'));
  assert.ok(rules.includes('no-ai-vocabulary'));
});

test('title case headings are caught, proper nouns are not', () => {
  assert.equal(checkVoice('## How A Deal Actually Moves').length, 1);
  assert.equal(checkVoice('## How Karwan moves USDC on Arc').length, 0, 'flagged proper nouns');
  assert.equal(checkVoice('## Release timing').length, 0);
});

test('a draft claiming an unshipped feature fails', () => {
  const facts = buildFactIndex(
    [file({ id: 'letters-of-credit', title: 'Letters of credit', capability: true, status: 'roadmap' })],
    NOW,
  );

  const findings = checkClaims('Karwan supports letters of credit today.', facts);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]!.rule, 'unshipped-claim');
  assert.ok(findings[0]!.fix.includes('future tense'));
});

test('a draft mentioning a shipped feature passes', () => {
  const facts = buildFactIndex([file({ id: 'po-financing', title: 'PO financing', capability: true })], NOW);
  assert.equal(checkClaims('Karwan does PO financing.', facts).length, 0);
});

test('warnings do not block, errors do', () => {
  const clean = reviewDraft('Karwan settles trade on Arc.', []);
  assert.equal(clean.clean, true);

  const warned = reviewDraft('It is fast, cheap, and safe.', []);
  assert.equal(warned.warnings, 1);
  assert.equal(warned.clean, true, 'a warning must not block publishing');

  const failed = reviewDraft('A claim — with a dash.', []);
  assert.equal(failed.clean, false);
});

test('skill bundles carry the canon and the fact index for every target', () => {
  const files = [file({ id: 'thing', title: 'Thing', capability: true })];

  for (const target of ['claude', 'codex', 'cursor'] as const) {
    const bundle = generateSkillBundle(files, target, { role: 'marketing', canonVersion: '0.1.0', now: NOW });
    const paths = bundle.map((f) => f.path);

    assert.ok(paths.some((p) => p.endsWith('brief.md')), `${target} bundle has no brief`);
    assert.ok(paths.some((p) => p.endsWith('facts.json')), `${target} bundle has no facts`);

    const entry = bundle.find((f) => /SKILL\.md|AGENTS\.md|\.mdc$/.test(f.path));
    assert.ok(entry, `${target} bundle has no entry point`);
    assert.ok(entry.content.includes('Never claim something we have not shipped'));

    // The fact index must be real JSON, since an agent parses it.
    const facts = JSON.parse(bundle.find((f) => f.path.endsWith('facts.json'))!.content);
    assert.equal(facts[0].id, 'thing');
  }
});

test('a skill bundle built for marketing contains no dev-only content', () => {
  const files = [
    file({ id: 'public-thing', title: 'Public thing', capability: true }),
    file({ id: 'internals', title: 'Internals', visibility: 'team', audience: 'dev' }),
  ];
  const scoped = selectCanon(files, { visibility: 'team', role: 'marketing' });
  const bundle = generateSkillBundle(scoped, 'claude', {
    role: 'marketing',
    canonVersion: '0.1.0',
    now: NOW,
  });

  for (const f of bundle) {
    assert.equal(f.content.includes('Internals'), false, `dev content leaked into ${f.path}`);
  }
});
