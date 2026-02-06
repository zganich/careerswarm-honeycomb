# Tools and agents (CareerSwarm)

One-pager for Cursor and OpenClaw: who does what, which commands exist.

## OpenClaw agents (this repo)

| Agent        | Role                              | Use for                                                                                                          |
| ------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **main**     | General, sync, anything not below | Ad-hoc chat, sync check, handoff summary.                                                                        |
| **Ship**     | Gate and monitor only             | monitor, precommit, ship:check, ship:check:full. Fix only what’s needed for checks to pass; hand off for commit. |
| **Server**   | server/, drizzle/, DEBUGGING      | Sweeps, migrations, server-side fixes. No client/ or Playwright.                                                 |
| **Client**   | client/, Playwright, E2E/smoke    | Client sweeps, production smoke/E2E. No server/ or drizzle/.                                                     |
| **Docs**     | docs/, CONTEXT, todo, README      | Doc consistency, release notes, checklists. No app code.                                                         |
| **Review**   | Better code + explain why         | Suggest improvements and rationale; don’t apply unless asked.                                                    |
| **Business** | GTM, strategy, in-app gtm agents  | Positioning, pipeline, metrics; see docs/BUSINESS_AGENT_IMPROVEMENTS.md.                                         |

## Commands (run from repo root)

| Command                    | What it does                                                      |
| -------------------------- | ----------------------------------------------------------------- |
| `pnpm run doctor`          | Local sanity: env presence, check, build. No secrets printed.     |
| `pnpm run verify-env`      | Required env vars present and non-placeholder (see .env.example). |
| `pnpm precommit`           | Secrets scan + check + format:check + lint.                       |
| `pnpm run ship:check`      | check + build + test.                                             |
| `pnpm run ship:check:full` | ship:check + production smoke + E2E.                              |
| `pnpm run monitor`         | GitHub CI, Railway, app health, Cloudflare.                       |
| `pnpm run monitor:watch`   | Same, poll every 60s + macOS notifications on failure.            |

## Named tasks

See **TASKS.md** for task names (monitor, ship-check, future-shoestring, sweep-server, etc.) and handoff rules.

## Sync and context

- **CONTEXT_FOR_NEW_CHAT.md** — Current state, last session, next steps.
- **todo.md** — Priorities, quick commands.
- **OPENCLAW_HANDOFF.md** — OpenClaw appends “what ran, what changed, ready for review” here; human or Cursor commits.

## More

- **OPENCLAW.md** — Project summary, key paths, sync points.
- **docs/OPENCLAW_INTEGRATION.md** — Full setup, cron, role briefs.
