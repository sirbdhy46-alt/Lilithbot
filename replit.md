# Workspace

## Overview

pnpm workspace monorepo. Contains a Discord bot (Lilith Protector) and a shared API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Discord Bot — Lilith Protector

Location: `artifacts/discord-bot/`

A premium Discord bot with moderation, fun, utility, and protection features.

### Key commands added:
- `/addemojis pack [blob|hype|cats|pepe]` — Install 50 emojis from a pack in one go
- `/addemojis steal [message_id]` — Clone all custom emojis from a message
- `/addemojis list` — View available packs and free emoji slots
- `/goodbye channel` — Set a dedicated goodbye channel
- Leave messages auto-delete after **23 seconds**

### Railway Deployment:
See `artifacts/discord-bot/DEPLOY_RAILWAY.md` for step-by-step Railway deploy instructions.

Required env vars: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`

### Bot Key Commands:
- `node src/index.js` — Start the bot
- `node src/deploy-commands.js` — Register slash commands with Discord

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
