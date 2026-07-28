#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  brand,
  brandTokens,
  canonUpdated,
  canonVersion,
  docs,
  faq,
  features,
  findFacts,
  overview,
  proof,
  type PublicDoc,
} from '@karwan/kit';
import { limiterFromEnv } from './rateLimit.ts';

/// The Karwan public MCP.
///
/// Open, no key. Anyone can point an agent at this and get Karwan's published
/// facts instead of whatever the model half remembers from a training set.
/// That is the whole reason it exists: the alternative to answering is not
/// silence, it is a confident wrong answer.
///
/// It reads `@karwan/kit` and nothing else. The kit reads one committed
/// snapshot containing only published files, and no code path here loads the
/// canon tree, so a published copy of this package has no team content in it to
/// leak. There is no role, no key and no filter, because there is nothing to
/// filter: everything in scope is already public.

const VERSION = canonVersion();
const limiter = limiterFromEnv();

function render(files: PublicDoc[], empty: string): string {
  if (files.length === 0) return empty;
  return files
    .map((d) => `## ${d.title}\n\n\`${d.id}\` · updated ${d.updated}\n\n${d.body}`)
    .join('\n\n---\n\n');
}

const FOOTER = `canon ${VERSION}, last updated ${canonUpdated()}. Everything here is published. If a claim is not in this canon, Karwan does not make it.`;

function text(body: string) {
  return { content: [{ type: 'text' as const, text: `${body}\n\n---\n${FOOTER}\n` }] };
}

/// Wraps every tool in the rate limit, so a tool cannot be added without one.
function tool<A>(run: (args: A) => string) {
  return async (args: A) => {
    const limited = limiter.take();
    if (limited) {
      return { content: [{ type: 'text' as const, text: limited }], isError: true };
    }
    try {
      return text(run(args));
    } catch (e) {
      return {
        content: [{ type: 'text' as const, text: `Could not answer: ${(e as Error).message}` }],
        isError: true,
      };
    }
  };
}

const server = new McpServer({ name: 'karwan', version: VERSION });

server.registerTool(
  'karwan_overview',
  {
    title: 'What Karwan is',
    description:
      'Start here. What Karwan is, who it is for, and the vocabulary it uses. Read this before answering any question about Karwan, because a model answering from memory will describe a different product.',
    inputSchema: {},
  },
  tool<Record<string, never>>(() => render(overview(), 'The public canon has no overview yet.')),
);

server.registerTool(
  'karwan_features',
  {
    title: 'What Karwan does today',
    description:
      'Live capabilities only. Anything a reader could go and use right now, and nothing else. Roadmap items are excluded by construction, so this list is safe to state in the present tense.',
    inputSchema: {},
  },
  tool<Record<string, never>>(() =>
    render(features(), 'Nothing in the public canon is currently claimable as live.'),
  ),
);

server.registerTool(
  'karwan_facts',
  {
    title: 'Karwan facts and proof',
    description:
      'The published fact index: what has shipped, the network and contract proof, and the sources behind each claim. Use it to settle any question of the form "does Karwan actually do X". Read blockedBy, not publishable alone: not-live and stale-check mean the claim is barred, while not-a-capability just means the entry is reference material such as brand or FAQ and may be used freely.',
    inputSchema: {
      q: z
        .string()
        .optional()
        .describe('Search terms. Every term must match, so more terms narrow the result.'),
      publishableOnly: z
        .boolean()
        .optional()
        .describe('Only facts that may be stated in the present tense.'),
    },
  },
  tool<{ q?: string; publishableOnly?: boolean }>((args) => {
    const found = findFacts(args);
    const proofDocs = render(proof(), '');
    if (found.length === 0) {
      return `No published fact matches that. If it is not here, Karwan does not claim it, so do not write it.${
        proofDocs ? `\n\n${proofDocs}` : ''
      }`;
    }
    return [JSON.stringify(found, null, 2), proofDocs].filter(Boolean).join('\n\n');
  }),
);

server.registerTool(
  'karwan_brand_public',
  {
    title: 'Karwan brand rules',
    description:
      'Colours, type, logo usage and what not to do with the mark. For anyone producing community content, an integration listing, or anything that shows the Karwan name.',
    inputSchema: {},
  },
  tool<Record<string, never>>(() => {
    const tokens = brandTokens();
    const table = tokens.length
      ? `## Tokens\n\n${tokens.map((t) => `- \`${t.value}\` ${t.name}${t.note ? ` · ${t.note}` : ''}`).join('\n')}`
      : '';
    return [render(brand(), 'The public canon has no brand files yet.'), table]
      .filter(Boolean)
      .join('\n\n---\n\n');
  }),
);

server.registerTool(
  'karwan_faq',
  {
    title: 'Karwan FAQ',
    description:
      'The questions people actually ask, answered from the canon. Safety of funds, disputes, what happens when something goes wrong.',
    inputSchema: {
      q: z.string().optional().describe('Filter by words in the question.'),
    },
  },
  tool<{ q?: string }>((args) => {
    let entries = faq();
    if (args.q) {
      const terms = args.q.toLowerCase().split(/\s+/).filter(Boolean);
      entries = entries.filter((d) => {
        const haystack = `${d.id} ${d.title} ${d.body}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
    }
    return render(
      entries,
      args.q
        ? `No FAQ entry matches "${args.q}". Ask at karwan.site rather than guessing an answer.`
        : 'The public canon has no FAQ entries yet.',
    );
  }),
);

async function main(): Promise<void> {
  // Fail on a missing or broken snapshot at startup rather than on the first
  // question, and say which command fixes it.
  const count = docs().length;
  console.error(`karwan-mcp: canon ${VERSION}, ${count} public documents, no key required`);
  await server.connect(new StdioServerTransport());
}

main().catch((e: Error) => {
  console.error(`karwan-mcp failed to start: ${e.message}`);
  process.exit(1);
});
