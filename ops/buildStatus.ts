/// Turns the build's own records into the canon file agents read for build status.
///
/// The roadmap and the product flow view are where status is kept. Writing it a
/// second time by hand is how `roadmap/shipping.md` came to be three months old,
/// so this file is generated and nobody edits the result.

export interface BuildItem {
  track: string;
  title: string;
  status: string;
}

export interface BuildStatusInput {
  date: string;
  deployed: string;
  roadmap: string;
  flowView: string;
}

const MAX_STATUS = 160;
const MAX_BATCH = 170;

function clip(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const stop = cut.lastIndexOf(' ');
  return `${cut.slice(0, stop > 0 ? stop : max)}...`;
}

/// Every numbered row of every track table, with the bold title and the status cell.
export function parseRoadmap(markdown: string): BuildItem[] {
  const items: BuildItem[] = [];
  let track = '';
  for (const line of markdown.split('\n')) {
    const heading = /^## (T\d .+)$/.exec(line.trim());
    if (heading) {
      track = heading[1] ?? '';
      continue;
    }
    if (line.startsWith('## ')) {
      track = '';
      continue;
    }
    if (!track) continue;
    const row = /^\|\s*\d+\s*\|(.*?)\|(.*?)\|(.*)\|\s*$/.exec(line.trim());
    if (!row) continue;
    const title = /\*\*(.+?)\*\*/.exec(row[1] ?? '')?.[1] ?? row[1] ?? '';
    items.push({
      track,
      title: title.replace(/[.:,]+$/, '').trim(),
      status: clip(row[2] ?? '', MAX_STATUS),
    });
  }
  return items;
}

/// The batches of the one product flow view, each with its status cell.
export function parseFlowBatches(markdown: string): { batch: string; status: string }[] {
  const batches: { batch: string; status: string }[] = [];
  for (const line of markdown.split('\n')) {
    const row = /^\|\s*(Batch \d+.*)\|\s*([^|]+?)\s*\|\s*$/.exec(line.trim());
    if (row) batches.push({ batch: clip(row[1] ?? '', MAX_BATCH), status: (row[2] ?? '').trim() });
  }
  return batches;
}

export function renderBuildStatus(input: BuildStatusInput): string {
  const batches = parseFlowBatches(input.flowView);
  const items = parseRoadmap(input.roadmap);
  if (items.length === 0) throw new Error('no roadmap rows found: the table format changed');
  if (batches.length === 0) throw new Error('no flow batches found: the table format changed');

  const tracks = [...new Set(items.map((item) => item.track))];
  const sections = tracks.map((track) => {
    const rows = items
      .filter((item) => item.track === track)
      .map((item) => `- ${item.title}: ${item.status}`)
      .join('\n');
    return `## ${track}\n\n${rows}`;
  });

  return `---
id: roadmap-current-build
title: Current build status
status: roadmap
visibility: team
audience: all
updated: ${input.date}
capability: false
tags:
  - roadmap
  - status
---

Build status on ${input.date}, generated from the roadmap and the product flow
view. This says what is being built. It does not say what may be claimed in
public: ask \`karwan_facts\` before writing a claim.

Running now: ${input.deployed}

## The one product flow

${batches.map((row) => `- ${row.batch}: ${row.status}`).join('\n')}

${sections.join('\n\n')}
`;
}
