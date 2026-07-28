import { loadCanon, type CanonFile } from '@karwan/canon-schema';
import { selectCanon, type Role } from '@karwan/generator';

/// Loading the canon once, and slicing it per role on every call.
///
/// The load is cached because reading two dozen files per tool call is waste.
/// The SLICE is not cached across roles, because a cache keyed on nothing is how
/// a dev-scoped answer ends up served to a marketing key.

let cached: CanonFile[] | null = null;

export function allFiles(): CanonFile[] {
  if (cached) return cached;
  const { files, issues } = loadCanon();
  if (issues.length > 0) {
    // Serving a canon that half-parsed means silently omitting whatever failed,
    // and the caller cannot tell the difference between "we do not claim that"
    // and "that file did not load".
    throw new Error(
      `canon does not parse cleanly (${issues.length} issues). Run canon:validate. First: ${issues[0]!.path}: ${issues[0]!.message}`,
    );
  }
  cached = files;
  return files;
}

/// What this role may see. Team visibility, because a team member reads the
/// public canon too, narrowed by audience.
export function scopedTo(role: Role): CanonFile[] {
  return selectCanon(allFiles(), { visibility: 'team', role });
}

/// Files under a canon directory, already scoped to the role.
export function underDir(role: Role, prefix: string): CanonFile[] {
  return scopedTo(role).filter((f) => f.path.startsWith(prefix));
}

/// Files carrying any of these tags, already scoped to the role.
export function withTags(role: Role, tags: string[]): CanonFile[] {
  const wanted = new Set(tags);
  return scopedTo(role).filter((f) => f.frontmatter.tags.some((t) => wanted.has(t)));
}
