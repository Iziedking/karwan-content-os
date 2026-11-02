import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFlowBatches, parseRoadmap, renderBuildStatus } from './buildStatus.js';

const ROADMAP = `# Karwan roadmap

## Milestone 1: one trade

| # | Item | Status | Done when |
|---|---|---|---|
| 1 | **Not a track row.** Text. | Active | Never read. |

## T1 Find and agree

| # | Item | Status | Done when |
|---|---|---|---|
| 1 | **One market, one entry.** Details follow. | Built 18 Oct | Both accounts covered. |
| 2 | **Choose the kind of deal.** Details. | Next | It asks. |

## Waiting

| 1 | **Parked idea** | Waiting | Later. |

## T5 Money like a bank

| # | Item | Status | Done when |
|---|---|---|---|
| 1 | **Plain words for money, and the guarantee.** Details. | Built 29 Oct | Plain. |
`;

const VIEW = `| Step | Status |
|---|---|
| Batch 1: home and profile | Built, 31 Oct 2026 |
| Batch 9, part B: the last moves (the old page gone) | Built, 1 Nov 2026 |
| Not a batch | Ignored |
`;

test('reads track rows only, with the bold title and the status', () => {
  assert.deepEqual(parseRoadmap(ROADMAP), [
    { track: 'T1 Find and agree', title: 'One market, one entry', status: 'Built 18 Oct' },
    { track: 'T1 Find and agree', title: 'Choose the kind of deal', status: 'Next' },
    { track: 'T5 Money like a bank', title: 'Plain words for money, and the guarantee', status: 'Built 29 Oct' },
  ]);
});

test('reads the flow batches and leaves other rows out', () => {
  assert.deepEqual(parseFlowBatches(VIEW), [
    { batch: 'Batch 1: home and profile', status: 'Built, 31 Oct 2026' },
    { batch: 'Batch 9, part B: the last moves (the old page gone)', status: 'Built, 1 Nov 2026' },
  ]);
});

test('renders a dated team-only canon file that names what is running', () => {
  const file = renderBuildStatus({ date: '2026-11-02', deployed: 'API e748f8f.', roadmap: ROADMAP, flowView: VIEW });
  assert.match(file, /^---\nid: roadmap-current-build\n/);
  assert.match(file, /visibility: team/);
  assert.match(file, /updated: 2026-11-02/);
  assert.match(file, /Running now: API e748f8f\./);
  assert.match(file, /- Choose the kind of deal: Next/);
  assert.match(file, /- Batch 1: home and profile: Built, 31 Oct 2026/);
});

test('refuses to write an empty status when a table format changes', () => {
  assert.throws(
    () => renderBuildStatus({ date: '2026-11-02', deployed: 'x', roadmap: '# nothing', flowView: VIEW }),
    /no roadmap rows/,
  );
  assert.throws(
    () => renderBuildStatus({ date: '2026-11-02', deployed: 'x', roadmap: ROADMAP, flowView: '# nothing' }),
    /no flow batches/,
  );
});
