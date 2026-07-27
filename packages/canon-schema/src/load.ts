import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFile } from './frontmatter.ts';
import { frontmatterSchema, type CanonFile } from './schema.ts';

/// Repo root, four levels up from packages/canon-schema/src.
export const REPO_ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
export const CANON_ROOT = join(REPO_ROOT, 'canon');

/// Recursive walk. Hand-rolled rather than pulling in a glob dependency for a
/// dozen files in a directory we control.
function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

export interface LoadIssue {
  path: string;
  message: string;
}

export interface LoadResult {
  files: CanonFile[];
  issues: LoadIssue[];
}

/// Read and validate every canon file under `root`. Returns issues rather than
/// throwing, so validate can report ALL of them in one pass instead of making
/// an author fix one, re-run, and find the next.
export function loadCanon(root: string = CANON_ROOT): LoadResult {
  const files: CanonFile[] = [];
  const issues: LoadIssue[] = [];

  for (const absolute of walk(root)) {
    const path = relative(root, absolute).split(sep).join('/');
    let parsed;
    try {
      parsed = parseFile(readFileSync(absolute, 'utf8'));
    } catch (err) {
      issues.push({ path, message: (err as Error).message });
      continue;
    }

    const result = frontmatterSchema.safeParse(parsed.frontmatter);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const where = issue.path.length ? `${issue.path.join('.')}: ` : '';
        issues.push({ path, message: `${where}${issue.message}` });
      }
      continue;
    }

    // The directory decides visibility, not the frontmatter. A file under
    // canon/team that declares itself public is a mistake worth failing on
    // rather than quietly trusting, because that mistake leaks.
    const expected = path.startsWith('public/') ? 'public' : 'team';
    if (result.data.visibility !== expected) {
      issues.push({
        path,
        message: `sits under canon/${expected}/ but declares visibility: ${result.data.visibility}`,
      });
      continue;
    }

    files.push({ path, frontmatter: result.data, body: parsed.body });
  }

  // Ids are how every downstream shape refers to a fact, so a collision would
  // make a reference ambiguous.
  const seen = new Map<string, string>();
  for (const file of files) {
    const previous = seen.get(file.frontmatter.id);
    if (previous) {
      issues.push({ path: file.path, message: `duplicate id "${file.frontmatter.id}", also in ${previous}` });
    } else {
      seen.set(file.frontmatter.id, file.path);
    }
  }

  return { files, issues };
}
