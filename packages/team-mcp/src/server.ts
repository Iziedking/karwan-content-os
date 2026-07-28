import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TeamKeyVerifier, AccessDeniedError, type VerifiedIdentity } from '@karwan/team-auth';
import {
  buildFactIndex,
  canonVersion,
  queryFacts,
  renderBrief,
  reviewDraft,
  type Role,
} from '@karwan/generator';
import { scopedTo, underDir, withTags } from './canon.ts';
import { versionNote } from './version.ts';

/// The team canon as MCP tools.
///
/// Built per caller rather than per process. Over stdio that distinction does
/// not matter, because one process serves one person. Hosted, it is the whole
/// security model: the key arrives on each request, the role is resolved from
/// it, and the canon this server can see is sliced to that role before any tool
/// runs. A server built once and shared would answer the second caller with the
/// first caller's access.
///
/// No tool filters for itself. Each one reads a canon already narrowed, so no
/// tool can be written that forgets to.

export const LOCAL_VERSION = canonVersion();

interface Session {
  role: Role;
  identity: VerifiedIdentity;
  note: string;
}

function text(body: string, note: string) {
  return {
    content: [{ type: 'text' as const, text: note ? `${body}\n\n---\n${note}\n` : body }],
  };
}

function denied(e: unknown) {
  const message =
    e instanceof AccessDeniedError
      ? e.message
      : `Could not answer from the canon: ${(e as Error).message}`;
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

/// Render a set of canon files as-is. Used by the tools that serve reference
/// material, where the body IS the answer.
function asDocs(
  files: Array<{ frontmatter: { title: string; id: string; updated: string }; body: string }>,
  empty: string,
): string {
  if (files.length === 0) return empty;
  return files
    .map(
      (f) =>
        `## ${f.frontmatter.title}\n\n\`${f.frontmatter.id}\` · updated ${f.frontmatter.updated}\n\n${f.body.trim()}`,
    )
    .join('\n\n---\n\n');
}

/// All the tool layer needs from whatever checked the credential.
///
/// Structural rather than the concrete TeamKeyVerifier, because there are now
/// two ways in: a long-lived team key and an OAuth access token. Neither should
/// be visible from here. A tool asks who is calling and gets a role; how that
/// was established is the transport's problem.
export interface Verifier {
  identify(): Promise<VerifiedIdentity>;
}

export function buildServer(verifier: Verifier): McpServer {
  /// Verify, then hand back the role and any warning that belongs on the
  /// response. Throws when access is denied, which the tool wrappers turn into
  /// a readable error rather than a stack trace.
  async function session(): Promise<Session> {
    const identity = await verifier.identify();
    const notes = [versionNote(LOCAL_VERSION, identity.canonVersion)];
    if (identity.stale) {
      notes.push(
        'Could not reach the Karwan backend to re-check this key, so this is running on a cached verification.',
      );
    }
    return { role: identity.role, identity, note: notes.filter(Boolean).join(' ') };
  }

  /// Wraps a tool body in verification and error shaping, so no individual tool
  /// can be written without them.
  function tool<A>(run: (args: A, s: Session) => string | Promise<string>) {
    return async (args: A) => {
      let s: Session;
      try {
        s = await session();
      } catch (e) {
        return denied(e);
      }
      try {
        return text(await run(args, s), s.note);
      } catch (e) {
        return denied(e);
      }
    };
  }

  const server = new McpServer({ name: 'karwan-team', version: LOCAL_VERSION });

  server.registerTool(
    'karwan_brief',
    {
      title: 'Karwan brief',
      description:
        'What Karwan is, scoped to your role. Read this before writing anything about Karwan. Separates what has shipped from what has not, and only the shipped section may be written in the present tense.',
      inputSchema: {
        compact: z
          .boolean()
          .optional()
          .describe('Titles and summaries only, for when the full canon will not fit.'),
      },
    },
    tool<{ compact?: boolean }>((args, s) =>
      renderBrief(scopedTo(s.role), {
        canonVersion: LOCAL_VERSION,
        audience: s.role,
        compact: args.compact ?? false,
      }),
    ),
  );

  server.registerTool(
    'karwan_facts',
    {
      title: 'Karwan facts',
      description:
        'Look up what Karwan can and cannot claim. Returns each fact with its status, whether it may be stated in the present tense, and how it is checked. Use this to settle any question of the form "have we shipped X".',
      inputSchema: {
        q: z
          .string()
          .optional()
          .describe('Search terms. Every term must match, so more terms narrow.'),
        status: z.enum(['live', 'shipping', 'roadmap', 'parked']).optional(),
        tag: z.string().optional(),
        publishableOnly: z
          .boolean()
          .optional()
          .describe('Only facts that may be stated in the present tense.'),
      },
    },
    tool<{
      q?: string;
      status?: 'live' | 'shipping' | 'roadmap' | 'parked';
      tag?: string;
      publishableOnly?: boolean;
    }>((args, s) => {
      const facts = queryFacts(buildFactIndex(scopedTo(s.role)), args);
      if (facts.length === 0) {
        return 'No fact in the canon matches that. If it is not in the canon, it is not a claim Karwan makes. Do not write it.';
      }
      return JSON.stringify(facts, null, 2);
    }),
  );

  server.registerTool(
    'karwan_brand',
    {
      title: 'Karwan brand',
      description:
        'Colour tokens, typography, logo usage and the brand principles. Use before producing anything visual or anything that names the product.',
      inputSchema: {},
    },
    tool<Record<string, never>>((_args, s) =>
      asDocs(underDir(s.role, 'public/brand/'), 'The canon has no brand files yet.'),
    ),
  );

  server.registerTool(
    'karwan_voice',
    {
      title: 'Karwan voice',
      description:
        'How we write, with the rules stated as rules. Read this before drafting any prose, then check the draft with karwan_draft_review.',
      inputSchema: {},
    },
    tool<Record<string, never>>((_args, s) =>
      asDocs(underDir(s.role, 'team/voice/'), 'The canon has no voice files yet.'),
    ),
  );

  server.registerTool(
    'karwan_playbook',
    {
      title: 'Karwan playbooks',
      description:
        'The standing plays: launch, hackathon submission, incident, partnership outreach. Ask for one by name or get them all.',
      inputSchema: {
        name: z.string().optional().describe('Part of a playbook title or id, e.g. "launch".'),
      },
    },
    tool<{ name?: string }>((args, s) => {
      let files = underDir(s.role, 'team/playbooks/');
      if (args.name) {
        const needle = args.name.toLowerCase();
        files = files.filter(
          (f) =>
            f.frontmatter.id.includes(needle) || f.frontmatter.title.toLowerCase().includes(needle),
        );
      }
      return asDocs(
        files,
        args.name
          ? `No playbook in the canon matches "${args.name}".`
          : 'The canon has no playbooks yet. Do not invent one.',
      );
    }),
  );

  server.registerTool(
    'karwan_research',
    {
      title: 'Karwan research strategies',
      description:
        'Standing market survey strategies per platform and per competitor. What to look for and where, not a cached result.',
      inputSchema: {},
    },
    tool<Record<string, never>>((_args, s) =>
      asDocs(
        [...underDir(s.role, 'team/research/'), ...withTags(s.role, ['research'])].filter(
          (f, i, all) => all.findIndex((o) => o.frontmatter.id === f.frontmatter.id) === i,
        ),
        'The canon has no research strategies yet. Do not invent one.',
      ),
    ),
  );

  server.registerTool(
    'karwan_draft_review',
    {
      title: 'Review a Karwan draft',
      description:
        'Check a draft against the voice rules and against what has actually shipped. Returns specific edits with line numbers, not praise. Run this on anything before it goes out.',
      inputSchema: {
        draft: z.string().min(1).describe('The full draft text.'),
      },
    },
    tool<{ draft: string }>((args, s) => {
      const result = reviewDraft(args.draft, buildFactIndex(scopedTo(s.role)));
      if (result.findings.length === 0) {
        return 'No findings. Voice rules pass and every claim resolves to a shipped fact.';
      }

      const lines = result.findings.map(
        (f) =>
          `- line ${f.line} · **${f.rule}** (${f.severity})\n  found: ${f.excerpt}\n  fix: ${f.fix}`,
      );
      const verdict = result.clean
        ? `${result.warnings} warning(s), nothing blocking.`
        : `${result.errors} error(s) must be fixed before this goes out.`;
      return `${verdict}\n\n${lines.join('\n')}`;
    }),
  );

  return server;
}
