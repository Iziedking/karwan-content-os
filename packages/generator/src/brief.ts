import type { CanonFile } from '@karwan/canon-schema';
import { partition } from './select.ts';

/// The canon rendered as a brief an agent reads before writing anything.
///
/// The structure is the safety mechanism. Shipped facts and unshipped ones are
/// not interleaved and left to the reader's judgement; they sit under headings
/// that say what may be claimed, and the unshipped section carries an explicit
/// instruction rather than a hint. An agent that reads only the headings still
/// cannot claim a roadmap item as live.

export interface BriefOptions {
  /// Shown at the top so a reader knows which canon they are holding.
  canonVersion?: string;
  /// Who this was rendered for. Appears in the header, not used for filtering:
  /// filtering already happened in selectCanon.
  audience?: string;
  /// Drop the body text and render titles plus summaries only. For contexts
  /// where the whole canon will not fit.
  compact?: boolean;
  now?: Date;
}

function section(title: string, files: CanonFile[], compact: boolean): string {
  if (files.length === 0) return '';
  const parts = [`## ${title}\n`];
  for (const file of files) {
    parts.push(`### ${file.frontmatter.title}\n`);
    parts.push(`\`${file.frontmatter.id}\` · updated ${file.frontmatter.updated}\n`);
    parts.push(`${compact ? summaryOf(file) : file.body.trim()}\n`);
  }
  return parts.join('\n');
}

function summaryOf(file: CanonFile): string {
  return (file.body.trim().split(/\n\s*\n/)[0] ?? '').replace(/\s+/g, ' ').trim();
}

export function renderBrief(files: CanonFile[], opts: BriefOptions = {}): string {
  const p = partition(files, opts.now ?? new Date());
  const compact = opts.compact ?? false;
  const out: string[] = [];

  out.push('# Karwan canon\n');
  const meta = [
    opts.canonVersion ? `canon ${opts.canonVersion}` : null,
    opts.audience ? `for ${opts.audience}` : null,
    `${files.length} files`,
  ]
    .filter(Boolean)
    .join(' · ');
  out.push(`${meta}\n`);

  out.push(
    'Everything under "What is shipped" may be stated in the present tense. ' +
      'Nothing under any other heading may be. If a claim is not in this ' +
      'document, it is not a claim we make.\n',
  );

  out.push(section('What is shipped', p.shipped, compact));

  if (p.future.length > 0) {
    out.push('## Not shipped\n');
    out.push(
      'These are real, and none of them are live. Write about them in the ' +
        'future tense, or leave them out. Never in the present tense, never as ' +
        'something a reader could go and use today.\n',
    );
    for (const file of p.future) {
      out.push(
        `- **${file.frontmatter.title}** (${file.frontmatter.status}) · \`${file.frontmatter.id}\`  \n  ${summaryOf(file)}\n`,
      );
    }
  }

  if (p.stale.length > 0) {
    out.push('## Unverified, do not use\n');
    out.push(
      'These were live claims whose manual check has gone past its recheck ' +
        'date. Nobody has confirmed they are still true, so they are barred ' +
        'until somebody does. Do not repeat them, and tell whoever asked that ' +
        'the fact needs re-verifying.\n',
    );
    for (const file of p.stale) {
      out.push(
        `- **${file.frontmatter.title}** · \`${file.frontmatter.id}\` · last verified ${
          file.frontmatter.check?.lastVerified ?? 'never'
        }\n`,
      );
    }
  }

  out.push(section('Reference', p.reference, compact));

  return out.filter(Boolean).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
