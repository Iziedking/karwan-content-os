/// A deliberately small, strict frontmatter parser.
///
/// Not YAML. YAML's implicit typing is a footgun for a canon: `status: no`
/// becomes boolean false, `date: 2026-07-27` becomes a Date, and a country code
/// of `NO` becomes false too. In a system whose entire job is holding claims
/// true, a parser that quietly changes what you wrote is the wrong tool.
///
/// This keeps every scalar a STRING and lets zod do the coercion, so what the
/// author typed is what the schema sees. It supports exactly what the canon
/// needs and rejects anything else loudly:
///
///   key: value
///   key:
///     - item
///     - item
///   key:
///     subkey: value
///   key:
///     - subkey: value
///       other: value
///
/// Two levels, no anchors, no multi-line scalars, no flow syntax. If a canon
/// file needs more than this, the file is doing too much.

export type Scalar = string;
export type FrontmatterValue =
  | Scalar
  | Scalar[]
  | Record<string, Scalar>
  | Record<string, Scalar>[];
export type Frontmatter = Record<string, FrontmatterValue>;

export interface ParsedFile {
  frontmatter: Frontmatter;
  body: string;
}

export class FrontmatterError extends Error {
  constructor(
    message: string,
    readonly line: number,
  ) {
    super(`line ${line}: ${message}`);
    this.name = 'FrontmatterError';
  }
}

const DELIMITER = '---';

export function parseFile(raw: string): ParsedFile {
  const normalised = raw.replace(/\r\n/g, '\n');
  const lines = normalised.split('\n');

  if (lines[0]?.trim() !== DELIMITER) {
    throw new FrontmatterError('file must open with a --- frontmatter block', 1);
  }
  const closing = lines.indexOf(DELIMITER, 1);
  if (closing === -1) {
    throw new FrontmatterError('frontmatter block is never closed', lines.length);
  }

  const frontmatter = parseBlock(lines.slice(1, closing), 2);
  const body = lines.slice(closing + 1).join('\n').trim();
  return { frontmatter, body };
}

function parseBlock(lines: string[], lineOffset: number): Frontmatter {
  const out: Frontmatter = {};
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i]!;
    const lineNo = lineOffset + i;

    if (raw.trim() === '' || raw.trimStart().startsWith('#')) {
      i++;
      continue;
    }
    if (raw.startsWith(' ')) {
      throw new FrontmatterError('unexpected indent at the top level', lineNo);
    }

    const colon = raw.indexOf(':');
    if (colon === -1) throw new FrontmatterError(`expected "key: value", got "${raw}"`, lineNo);

    const key = raw.slice(0, colon).trim();
    if (!key) throw new FrontmatterError('empty key', lineNo);
    if (key in out) throw new FrontmatterError(`duplicate key "${key}"`, lineNo);

    const inline = raw.slice(colon + 1).trim();
    if (inline !== '') {
      out[key] = unquote(inline);
      i++;
      continue;
    }

    // Nested block: gather the indented run that follows.
    const start = i + 1;
    let end = start;
    while (end < lines.length && (lines[end]!.startsWith('  ') || lines[end]!.trim() === '')) end++;
    const child = lines.slice(start, end);
    if (child.filter((l) => l.trim() !== '').length === 0) {
      throw new FrontmatterError(`"${key}" has no value and no indented block`, lineNo);
    }
    out[key] = parseNested(child, lineOffset + start);
    i = end;
  }

  return out;
}

function parseNested(lines: string[], lineOffset: number): FrontmatterValue {
  const meaningful = lines
    .map((l, idx) => ({ text: l, lineNo: lineOffset + idx }))
    .filter((l) => l.text.trim() !== '');

  const isList = meaningful[0]!.text.trimStart().startsWith('- ');

  if (!isList) {
    // A map of scalars.
    const map: Record<string, Scalar> = {};
    for (const { text, lineNo } of meaningful) {
      const colon = text.indexOf(':');
      if (colon === -1) throw new FrontmatterError(`expected "key: value", got "${text.trim()}"`, lineNo);
      const k = text.slice(0, colon).trim();
      const v = text.slice(colon + 1).trim();
      if (!k) throw new FrontmatterError('empty key', lineNo);
      if (v === '') throw new FrontmatterError(`"${k}" needs a value on the same line`, lineNo);
      map[k] = unquote(v);
    }
    return map;
  }

  // A list. Every entry is either a scalar or a map, never a mix.
  const scalars: Scalar[] = [];
  const maps: Record<string, Scalar>[] = [];
  let current: Record<string, Scalar> | null = null;

  for (const { text, lineNo } of meaningful) {
    const trimmed = text.trimStart();
    if (trimmed.startsWith('- ')) {
      const entry = trimmed.slice(2).trim();
      const colon = entry.indexOf(':');
      if (colon === -1) {
        if (maps.length > 0 || current) {
          throw new FrontmatterError('list mixes plain values and key/value entries', lineNo);
        }
        scalars.push(unquote(entry));
        continue;
      }
      if (scalars.length > 0) {
        throw new FrontmatterError('list mixes plain values and key/value entries', lineNo);
      }
      current = {};
      maps.push(current);
      const k = entry.slice(0, colon).trim();
      const v = entry.slice(colon + 1).trim();
      if (v === '') throw new FrontmatterError(`"${k}" needs a value on the same line`, lineNo);
      current[k] = unquote(v);
      continue;
    }

    // Continuation of the current map entry.
    if (!current) throw new FrontmatterError(`expected "- " to start a list entry`, lineNo);
    const colon = trimmed.indexOf(':');
    if (colon === -1) throw new FrontmatterError(`expected "key: value", got "${trimmed}"`, lineNo);
    const k = trimmed.slice(0, colon).trim();
    const v = trimmed.slice(colon + 1).trim();
    if (v === '') throw new FrontmatterError(`"${k}" needs a value on the same line`, lineNo);
    current[k] = unquote(v);
  }

  return scalars.length > 0 ? scalars : maps;
}

/// Strips one layer of matching quotes. Quoting is how an author writes a value
/// containing a colon; it is never how they change its type.
function unquote(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}
