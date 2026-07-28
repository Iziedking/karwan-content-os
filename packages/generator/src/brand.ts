/// Brand tokens, parsed out of the canon's prose.
///
/// The tokens live in a fenced block inside a markdown file rather than in
/// frontmatter, because that block is what a designer actually reads. Parsing
/// prose is a small risk, so it is done in one place and both kits call it. Two
/// parsers would drift, and a drifted parser returns an empty list quietly.

export interface BrandToken {
  name: string;
  value: string;
  note: string;
}

/// Any document carrying the `tokens` tag. Deliberately structural rather than
/// typed to CanonFile, so the public kit can pass its snapshot docs.
export interface TokenSource {
  tags: string[];
  body: string;
}

export function parseBrandTokens(sources: TokenSource[]): BrandToken[] {
  const out: BrandToken[] = [];

  for (const source of sources) {
    if (!source.tags.includes('tokens')) continue;

    for (const block of source.body.matchAll(/```[a-z]*\n([\s\S]*?)```/g)) {
      for (const line of (block[1] ?? '').split('\n')) {
        // The value anchors the parse: everything before it is the name,
        // everything after is the note. Names contain spaces and slashes, so
        // splitting on whitespace would mangle "ink / dark".
        const m = /^(.*?)\s{2,}(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\s*(.*)$/.exec(line);
        if (!m) continue;
        const name = m[1]!.trim();
        if (!name) continue;
        out.push({ name, value: m[2]!.trim(), note: m[3]!.trim() });
      }
    }
  }

  return out;
}
