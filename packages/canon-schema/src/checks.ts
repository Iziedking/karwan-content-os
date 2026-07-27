import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './load.ts';
import { isManualCheckStale, type CanonFile, type Check } from './schema.ts';

/// Running the checks: the difference between a canon that records what we
/// believe and one that holds what is true.
///
/// Checks resolve against a FACT SNAPSHOT, not against a working copy of the
/// Karwan repo. The claim "goods deliveries require a carrier reference" has to
/// be true of what is DEPLOYED, and a submodule pinned to a commit can be green
/// while production is three deploys behind. The Karwan deploy pipeline writes
/// the snapshot; this reads it.
///
/// A sibling checkout is honoured as a dev convenience while authoring, but it
/// is never the thing CI trusts.

export const SNAPSHOT_PATH = join(REPO_ROOT, 'snapshot', 'karwan-facts.json');

/// Written by the Karwan deploy pipeline. `checks` maps a ref to whether that
/// ref held at deploy time.
export interface FactSnapshot {
  /// When the snapshot was produced.
  generatedAt: string;
  /// The commit and environment it describes, so a stale snapshot is obvious.
  commit: string;
  environment: string;
  /// Results keyed by check ref.
  checks: Record<string, { ok: boolean; detail?: string }>;
}

export type CheckStatus = 'pass' | 'fail' | 'stale' | 'unknown';

export interface CheckResult {
  path: string;
  id: string;
  status: CheckStatus;
  message: string;
}

export function loadSnapshot(path = SNAPSHOT_PATH): FactSnapshot | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as FactSnapshot;
  } catch {
    return null;
  }
}

function runOne(check: Check, snapshot: FactSnapshot | null, now: Date): { status: CheckStatus; message: string } {
  if (check.kind === 'manual') {
    if (isManualCheckStale(check, now)) {
      return {
        status: 'stale',
        message: `manual check last verified ${check.lastVerified}, past its recheck window. Barred from generated content until re-verified.`,
      };
    }
    return { status: 'pass', message: `manual, verified ${check.lastVerified}` };
  }

  const ref = check.ref!;
  if (!snapshot) {
    // Unknown, never pass. A missing snapshot means nothing has proved this
    // claim, and treating that as success would defeat the whole mechanism.
    return {
      status: 'unknown',
      message: `no fact snapshot at snapshot/karwan-facts.json, so "${ref}" is unproven`,
    };
  }

  const entry = snapshot.checks[ref];
  if (!entry) {
    return {
      status: 'unknown',
      message: `"${ref}" is not in the snapshot from ${snapshot.commit}. Either the ref is wrong or the deploy did not run it.`,
    };
  }
  if (!entry.ok) {
    return {
      status: 'fail',
      message: `"${ref}" did NOT hold at ${snapshot.commit}${entry.detail ? `: ${entry.detail}` : ''}`,
    };
  }
  return { status: 'pass', message: `${ref} held at ${snapshot.commit}` };
}

export function runChecks(
  files: CanonFile[],
  snapshot: FactSnapshot | null = loadSnapshot(),
  now = new Date(),
): CheckResult[] {
  const out: CheckResult[] = [];
  for (const file of files) {
    const check = file.frontmatter.check;
    if (!check) continue;
    const { status, message } = runOne(check, snapshot, now);
    out.push({ path: file.path, id: file.frontmatter.id, status, message });
  }
  return out;
}

/// A check that is unknown or failing blocks the build. Stale only blocks the
/// FACT, not the build: a manual claim going out of date is a prompt to
/// re-verify, not a reason nobody can ship anything.
export function blocking(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => r.status === 'fail' || r.status === 'unknown');
}
