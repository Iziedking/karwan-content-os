/// Telling a member their canon has moved on without them.
///
/// The backend returns the canon version it considers current. This server
/// serves whatever version is on disk. When those diverge, answers are stale in
/// a way that looks completely normal, so the divergence has to be said out
/// loud on every response rather than logged somewhere nobody reads.

export interface Semver {
  major: number;
  minor: number;
  patch: number;
}

export function parseSemver(value: string): Semver | null {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(value.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

/// A one-line warning, or empty when the local canon is current.
///
/// Being AHEAD is reported too. It usually means someone is running the server
/// from a working copy with unreleased canon in it, which is fine while
/// authoring and misleading if they forget.
export function versionNote(local: string, remote: string): string {
  if (local === remote) return '';
  const a = parseSemver(local);
  const b = parseSemver(remote);
  if (!a || !b) return `Canon version mismatch: this server has ${local}, the backend expects ${remote}.`;

  const behind =
    b.major > a.major || (b.major === a.major && b.minor > a.minor) ||
    (b.major === a.major && b.minor === a.minor && b.patch > a.patch);

  if (!behind) {
    return `This server is running canon ${local}, ahead of the released ${remote}. Facts here may not be published yet.`;
  }

  const minorsBehind = (b.major - a.major) * 1000 + (b.minor - a.minor);
  if (minorsBehind >= 1) {
    return `Canon ${local} is behind the current ${remote}. Update before writing anything factual.`;
  }
  return `Canon ${local} is slightly behind ${remote}. Worth updating.`;
}
