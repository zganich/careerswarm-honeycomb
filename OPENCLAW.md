# CareerSwarm — OpenClaw workspace context

When your workspace is this repo, use this file plus the references below to stay in sync with Cursor and the human.

## Project

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline, **Resume Roast** (public), application tracker. Stack: React 19, Tailwind 4, tRPC, Express 4, Drizzle ORM, MySQL (Railway), OpenAI.

## Key paths

- **Server / env / LLM:** `server/_core/index.ts`, `server/_core/env.ts`, `server/_core/llm.ts`
- **Roast:** `server/roast.ts`, `client/src/pages/ResumeRoast.tsx`
- **Auth:** `server/_core/oauth.ts`, `client/src/pages/DevLogin.tsx`, `client/src/_core/hooks/useAuth.ts`
- **Database:** `drizzle/schema.ts`, `server/db.ts`
- **API:** `server/routers.ts`
- **Tests:** `pnpm test` (Vitest), `tests/production-smoke.spec.ts`, `tests/production-e2e.spec.ts`

## Sync with Cursor

- **CONTEXT_FOR_NEW_CHAT.md** — Current state, last session, next steps. Read before doing large edits so you don’t duplicate Cursor.
- **todo.md** — Priorities and quick commands. Single source for “what’s next.”
- **TASKS.md** — Named tasks (monitor, ship-check, future-shoestring, etc.) and handoff rule. Use in cron or chat.
- **TOOLS.md** — Agents (Ship, Server, …) and commands (doctor, monitor, ship:check, …). One-pager for Cursor and OpenClaw.
- **OPENCLAW_HANDOFF.md** — When you hand off after fixing errors, append a short note here so the human or Cursor can review and commit without re-reading the chat.

## Commands (run from repo root)

```bash
pnpm precommit              # Secrets + check + format + lint (before commit)
pnpm run ship:check         # check + build + test (local gate)
pnpm run ship:check:full    # ship:check + production smoke + E2E (full deploy gate)
pnpm run monitor           # GitHub CI, Railway, app health, Cloudflare
pnpm run monitor:watch     # Poll 60s, macOS notifications on failures
```

## Debugging and monitoring

- **Production debugging:** [docs/DEBUGGING.md](docs/DEBUGGING.md) — platform limits first, then env, then minimal code fix. No instrumentation until then.
- **Monitoring:** [docs/MONITORING.md](docs/MONITORING.md) — `pnpm run monitor` usage.

## Ideal workflow and assignments

[docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md](docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md) — what Cursor needs to be effective; task and agent assignments so OpenClaw gets you there.

## Full integration guide

[docs/OPENCLAW_INTEGRATION.md](docs/OPENCLAW_INTEGRATION.md) — setup, parallel workflow with Cursor, and suggested autonomous tasks.
