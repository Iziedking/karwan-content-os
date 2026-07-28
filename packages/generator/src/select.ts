import { isPublishable, type CanonFile, type Audience, type Visibility } from '@karwan/canon-schema';

/// Who is asking, and therefore what they may see.
///
/// Two filters, and they are not the same thing. VISIBILITY is a secrecy
/// boundary: a public export must never reach a team file. AUDIENCE is a
/// relevance boundary: a marketing member is not shown the decisions log
/// because it is noise for the job, not because it is secret.
///
/// Keeping them separate matters. Collapsing them would mean either leaking
/// team files to anyone with the right audience, or hiding marketing-relevant
/// public files from developers.

export type Role = 'dev' | 'marketing';

export interface Lens {
  /// 'public' returns only public files. 'team' returns both, because a team
  /// member reads the public canon too.
  visibility: Visibility;
  /// Omit for a purely public projection with no role attached.
  role?: Role;
}

/// A dev reads the whole landscape, including everything marketing sees. A
/// marketing member reads a deep product education without implementation
/// internals.
export function audiencesFor(role: Role): Audience[] {
  return role === 'dev' ? ['all', 'dev', 'marketing'] : ['all', 'marketing'];
}

/// The files this lens may see. Nothing here decides how they are RENDERED;
/// a roadmap item is selected, it just must never be spoken in the present
/// tense. That is `partition`'s job.
export function selectCanon(files: CanonFile[], lens: Lens): CanonFile[] {
  const audiences = lens.role ? new Set(audiencesFor(lens.role)) : null;

  return files
    .filter((f) => {
      // A public lens sees public files and nothing else. This is the secrecy
      // boundary, checked first and never conditional on anything below.
      if (lens.visibility === 'public' && f.frontmatter.visibility !== 'public') return false;
      if (audiences && !audiences.has(f.frontmatter.audience)) return false;
      return true;
    })
    .sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id));
}

export interface Partition {
  /// Safe to state in the present tense. Live, and where the check is manual,
  /// not stale.
  shipped: CanonFile[];
  /// Real work, not shipped. Must be spoken in the future tense or left out.
  future: CanonFile[];
  /// Live claims whose manual check has gone stale. Barred from generated
  /// content until somebody re-verifies them, and reported so that somebody
  /// knows to.
  stale: CanonFile[];
  /// Not a capability claim at all: brand, voice, glossary. No status gate
  /// applies, because "our headings are sentence case" does not ship.
  reference: CanonFile[];
}

/// Split a selection by what may be said about it.
///
/// This is the single place the shipped/roadmap distinction is decided. Every
/// renderer downstream reads the partition rather than re-deriving the rule,
/// so there is exactly one implementation of "may we claim this".
export function partition(files: CanonFile[], now = new Date()): Partition {
  const out: Partition = { shipped: [], future: [], stale: [], reference: [] };

  for (const file of files) {
    if (!file.frontmatter.capability) {
      out.reference.push(file);
      continue;
    }
    if (file.frontmatter.status !== 'live') {
      out.future.push(file);
      continue;
    }
    if (isPublishable(file, now)) out.shipped.push(file);
    else out.stale.push(file);
  }

  return out;
}
