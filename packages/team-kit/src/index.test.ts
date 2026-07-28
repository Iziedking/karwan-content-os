import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  brandTokens,
  canon,
  facts,
  findFacts,
  brief,
  humanize,
  factCheck,
  assertPublishable,
  canonVersion,
} from './index.ts';

/// The kit runs against the REAL canon, not fixtures. A kit that passes on
/// fixtures and breaks on the actual files is worth nothing to a build that
/// imports it.

test('the public canon reaches no team file', () => {
  const publicFiles = canon();
  assert.ok(publicFiles.length > 0);
  for (const f of publicFiles) {
    assert.equal(f.frontmatter.visibility, 'public', `${f.path} is not public`);
    assert.ok(f.path.startsWith('public/'), `${f.path} sits outside canon/public`);
  }
});

test('marketing sees less than dev, and both see more than the public', () => {
  const pub = canon().length;
  const marketing = canon('marketing').length;
  const dev = canon('dev').length;

  assert.ok(marketing > pub, 'a team role should reach the public canon plus team files');
  assert.ok(dev >= marketing, 'dev must see everything marketing sees');
});

test('brand tokens parse out of the canon', () => {
  const tokens = brandTokens();
  const byName = Object.fromEntries(tokens.map((t) => [t.name, t.value]));

  // Named tokens rather than a count, so a change to the block's shape fails
  // here instead of silently returning an empty list.
  assert.equal(byName['accent'], '#AFC95B', 'the accent token did not parse');
  assert.equal(byName['ink / dark'], '#0E0E0E', 'a token name containing spaces did not parse');
  assert.ok(tokens.some((t) => t.value.startsWith('rgba(')), 'rgba tokens did not parse');

  // The canon is explicit that the older bright lime is not the shipped value.
  assert.equal(Object.values(byName).includes('#D8FF3D'), false);
});

test('every fact says whether it may be claimed', () => {
  const all = facts('dev');
  assert.ok(all.length > 0);
  for (const fact of all) {
    if (fact.publishable) assert.equal(fact.blockedBy, '');
    else assert.notEqual(fact.blockedBy, '');
    // A live capability claim without a check is what this whole system exists
    // to prevent, and the schema should already have refused to load it.
    if (fact.capability && fact.status === 'live') assert.ok(fact.check, `${fact.id} has no check`);
  }
});

test('findFacts narrows on the real canon', () => {
  const financing = findFacts({ q: 'financing' }, 'marketing');
  assert.ok(financing.length > 0, 'expected financing facts in the canon');
  // Tags count as a match, which is how invoice-factoring answers to
  // "financing" without the word appearing in its title or first paragraph.
  assert.ok(
    financing.every((f) =>
      `${f.id} ${f.title} ${f.tags.join(' ')} ${f.summary}`.toLowerCase().includes('financing'),
    ),
  );
  assert.equal(findFacts({ q: 'financing nonexistentterm' }, 'marketing').length, 0);
});

test('the brief is not empty and labels its version', () => {
  const md = brief('marketing');
  assert.ok(md.includes('# Karwan canon'));
  assert.ok(md.includes(canonVersion()));
});

test('humanize catches the tells, factCheck catches the claims', () => {
  assert.equal(humanize('A clean sentence about settlement on Arc.').length, 0);
  assert.ok(humanize('A claim — with a dash.').some((f) => f.rule === 'no-em-dash'));

  // Nothing in the real canon should trip a claim check on neutral prose.
  assert.equal(factCheck('Karwan settles cross-border trade.', 'marketing').length, 0);
});

test('assertPublishable throws with the specific fix, not a vague failure', () => {
  assert.doesNotThrow(() => assertPublishable('Karwan settles trade on Arc.'));

  try {
    assertPublishable("In today's fast-paced world, our seamless rail is here.");
    assert.fail('should have thrown');
  } catch (e) {
    const message = (e as Error).message;
    assert.ok(message.includes('no-filler-opener'), message);
    assert.ok(message.includes('line 1'), message);
  }
});
