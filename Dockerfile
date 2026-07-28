# The team MCP, hosted.
#
# What ships in this image is the canon. That is the whole point of hosting it:
# the alternative is every team member holding a checkout of this repo, which
# means every member holds `canon/team` forever, including after their key is
# revoked. Here the canon lives in one place and members hold only a key.
#
# Which also means: this image is sensitive. It carries positioning, the
# decisions log and the roadmap. Do not push it to a public registry.

FROM node:22-alpine AS base
WORKDIR /app

# pnpm via corepack, pinned to the version in packageManager so the lockfile
# resolves identically to a developer machine.
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/canon-schema/package.json packages/canon-schema/
COPY packages/generator/package.json packages/generator/
COPY packages/team-auth/package.json packages/team-auth/
COPY packages/team-mcp/package.json packages/team-mcp/
COPY packages/team-kit/package.json packages/team-kit/
COPY packages/public-kit/package.json packages/public-kit/
COPY packages/public-mcp/package.json packages/public-mcp/
RUN pnpm install --frozen-lockfile

FROM base AS runtime
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json pnpm-workspace.yaml ./

# Source runs through tsx rather than being compiled. The whole workspace is
# TypeScript with `allowImportingTsExtensions`, and adding a build step here
# would mean maintaining two ways of running the same code.
COPY packages ./packages
COPY canon ./canon

# Never root. If something does get through the key check, it should not be
# holding the box.
RUN addgroup -S karwan && adduser -S karwan -G karwan && chown -R karwan:karwan /app
USER karwan

ENV PORT=8790
EXPOSE 8790

# Reports the canon it actually parsed, so a container that booted with a broken
# canon fails here instead of serving half of one.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8790/health > /dev/null || exit 1

CMD ["./node_modules/.bin/tsx", "packages/team-mcp/src/http.ts"]
