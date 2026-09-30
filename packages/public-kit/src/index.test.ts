import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCanon } from '@karwan/canon-schema';
import { buildPublicSnapshot, serialisePublicSnapshot } from '@karwan/generator';
import {
  assertFactual,
  brandTokens,
  canonUpdated,
  canonVersion,
  docs,
  facts,
  faq,
  factCheck,
  features,
  findFacts,
  overview,
} from './index.ts';
import { SNAPSHOT_FILE, snapshot } from './snapshot.ts';

/// Two jobs here. Prove the snapshot still matches the canon it was cut from,
/// and prove nothing from canon/team is in it.

test('the committed snapshot matches the canon', () => {
  const { files, issues } = loadCanon();
  assert.equal(issues.length, 0, `canon does not parse: ${issues[0]?.message ?? ''}`);

  const fresh = serialisePublicSnapshot(buildPublicSnapshot(files, { canonVersion: canonVersion() }));
  const committed = readFileSync(SNAPSHOT_FILE, 'utf8');

  assert.equal(
    committed,
    fresh,
    'the public snapshot is stale. Run `pnpm generate` and commit packages/public-kit/canon.public.json',
  );
});

test('nothing from canon/team is in the public snapshot', () => {
  const { files } = loadCanon();
  const team = files.filter((f) => f.frontmatter.visibility === 'team');
  assert.ok(team.length > 0, 'no team canon to check against, so this test proves nothing');

  // The canon is hard wrapped, so a sentence spans lines in the source and
  // arrives as `\n` in the JSON. Flatten both sides or the sentence check
  // silently matches nothing and reads as coverage.
  const haystack = readFileSync(SNAPSHOT_FILE, 'utf8').replace(/\\n/g, ' ').replace(/\s+/g, ' ');

  let checked = 0;
  for (const file of team) {
    assert.equal(
      haystack.includes(file.frontmatter.id),
      false,
      `team fact "${file.frontmatter.id}" is in the public snapshot`,
    );

    // Ids are the cheap check. This is the real one: a sentence lifted out of a
    // team file and pasted into a public one carries the content across even
    // though the id never appears.
    for (const sentence of file.body.split(/(?<=[.!?])\s+/)) {
      const line = sentence.replace(/\s+/g, ' ').trim();
      if (line.length < 60) continue;
      checked++;
      assert.equal(
        haystack.includes(line),
        false,
        `a sentence from ${file.path} is in the public snapshot: "${line.slice(0, 80)}"`,
      );
    }
  }

  // Without this the loop above could be checking nothing and passing.
  assert.ok(checked > 20, `only ${checked} team sentences were long enough to check`);
});

test('every document in the snapshot is public', () => {
  for (const doc of docs()) {
    assert.ok(doc.path.startsWith('public/'), `${doc.id} sits outside canon/public`);
  }
  assert.ok(docs().length > 0);
  assert.match(canonUpdated(), /^\d{4}-\d{2}-\d{2}$/);
});

test('internal check refs never reach the public fact index', () => {
  for (const fact of facts()) {
    if (!fact.check) continue;
    assert.equal(
      Object.hasOwn(fact.check, 'ref'),
      false,
      `${fact.id} carries an internal check ref into the public index`,
    );
  }
  assert.equal(readFileSync(SNAPSHOT_FILE, 'utf8').includes('backend/src'), false);
});

test('features returns live capabilities and nothing else', () => {
  const live = features();
  assert.ok(live.length > 0, 'expected some live capabilities');

  const byId = new Map(facts().map((f) => [f.id, f]));
  for (const doc of live) {
    const fact = byId.get(doc.id);
    assert.ok(fact, `${doc.id} has no fact`);
    assert.equal(fact.capability, true, `${doc.id} is not a capability`);
    assert.equal(fact.publishable, true, `${doc.id} is not publishable but came back from features`);
    assert.equal(doc.status, 'live');
  }

  // A public file that is not a live capability must not appear, whatever else
  // it is. Brand and FAQ documents are the ones most likely to slip in.
  const ids = new Set(live.map((d) => d.id));
  assert.equal(ids.has('faq-money-safe'), false, 'an FAQ entry came back as a feature');
  assert.equal(ids.has('brand-colour'), false, 'a brand file came back as a feature');
});

test('overview and faq answer from the canon', () => {
  assert.ok(overview().some((d) => d.id === 'what-karwan-is'));
  assert.ok(faq().length > 0);
  assert.ok(faq().every((d) => d.path.startsWith('public/faq/')));
});

test('brand tokens parse out of the public snapshot', () => {
  const byName = Object.fromEntries(brandTokens().map((t) => [t.name, t.value]));
  assert.equal(byName['accent'], '#AFC95B');
  assert.equal(byName['ink / dark'], '#16202A');
});

test('findFacts narrows, and an unknown term returns nothing', () => {
  assert.ok(findFacts({ q: 'escrow' }).length > 0);
  assert.equal(findFacts({ q: 'escrow nonexistentterm' }).length, 0);
  assert.ok(findFacts({ publishableOnly: true }).every((f) => f.publishable));
});

test('assertFactual passes clean copy and names the fix on a bad claim', () => {
  assert.doesNotThrow(() => assertFactual('Karwan settles cross-border trade on Arc.'));

  const unshipped = facts().find((f) => f.capability && !f.publishable);
  if (!unshipped) {
    // Nothing in the public canon is currently unshipped, so there is no claim
    // to trip on. Say so rather than passing silently and looking like coverage.
    assert.equal(factCheck('Karwan settles cross-border trade on Arc.').length, 0);
    return;
  }

  try {
    assertFactual(`Today you can use ${unshipped.title.toLowerCase()} on Karwan.`);
    assert.fail('should have thrown');
  } catch (e) {
    assert.match((e as Error).message, /line 1/);
  }
});

test('the snapshot is the only canon this package reads', () => {
  // A cheap structural assertion: the kit's own source must not import the
  // loader. If somebody adds it, this fails before the leak does.
  const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
  assert.equal(source.includes('loadCanon'), false, 'the public kit imports the canon loader');
  assert.ok(snapshot().docs.length === docs().length);
});
