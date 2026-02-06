# Contributing to CareerSwarm

Thanks for considering contributing. Here’s how to stay aligned with the project and open changes safely.

## Before you start

- **Context:** Read [CONTEXT_FOR_NEW_CHAT.md](./CONTEXT_FOR_NEW_CHAT.md) and [todo.md](./todo.md) so you know current state and priorities.
- **Tools:** See [TOOLS.md](./TOOLS.md) for agents and commands; [TASKS.md](./TASKS.md) for named tasks and handoff rules.

## Local setup

```bash
pnpm install
cp .env.example .env   # then fill in required vars (see .env.example and docs/CRITICAL_SETUP_CHECKLIST.md)
pnpm run doctor        # verify-env + check + build (no secrets printed)
pnpm dev               # start dev server
```

## Before opening a PR

1. Run **`pnpm run doctor`** — ensures env shape, TypeScript, and build pass.
2. Run **`pnpm precommit`** — secrets scan, check, format, lint.
3. Run **`pnpm test`** — unit tests.
4. If you changed schema or migrations: **`pnpm db:migrate`** (see [docs/SHIP_CHECKLIST.md](./docs/SHIP_CHECKLIST.md)).

## Submitting changes

- Open a PR against `main`. Describe what changed and why.
- CI runs check, lint, format, unit tests, and build. E2E runs on push to main and on PRs targeting main (see [.github/workflows/ci.yml](./.github/workflows/ci.yml)).
- After merge, the maintainer (or Cursor) may update [CONTEXT_FOR_NEW_CHAT.md](./CONTEXT_FOR_NEW_CHAT.md) and [todo.md](./todo.md) for the next session.

## Parallel work (OpenClaw + Cursor)

If you use OpenClaw alongside Cursor, keep [docs/OPENCLAW_INTEGRATION.md](./docs/OPENCLAW_INTEGRATION.md) in mind: CONTEXT and todo are shared sync points; OpenClaw hands off via [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md) and does not commit.

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities.
