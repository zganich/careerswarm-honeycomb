# Named tasks (OpenClaw + Cursor)

Single source of truth for “what to run” and how to hand off. Use these names in cron messages or chat so agents don’t need long paragraphs.

**Handoff rule for all:** When a task fails, fix per docs/DEBUGGING.md (platform limits → env → minimal fix), re-run, then append a short note to **OPENCLAW_HANDOFF.md** (what ran, what failed, what you changed, ready for review and commit). Do not commit or push unless the user explicitly asks.

| Task                  | Command(s)                                                                                                                                            | Who           | When                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- |
| **monitor**           | `pnpm run monitor`                                                                                                                                    | Ship          | Every 30m (cron). CI, Railway, app health, Cloudflare.     |
| **ship-check**        | `pnpm run ship:check`                                                                                                                                 | Ship          | Every 6h (cron). check + build + test.                     |
| **ship-check-full**   | `pnpm run ship:check:full`                                                                                                                            | Ship          | Before deploy. Adds production smoke + E2E.                |
| **precommit**         | `pnpm precommit`                                                                                                                                      | Ship / Cursor | Before commit. Secrets scan + check + format + lint.       |
| **future-shoestring** | Read CONTEXT_FOR_NEW_CHAT.md, todo.md, docs/OPENCLAW_FUTURE_SHOESTRING.md; suggest 3–5 shoestring improvements; append summary to OPENCLAW_HANDOFF.md | Business      | Weekly (cron) or on demand.                                |
| **sweep-server**      | Read docs/DEBUGGING.md + server/, drizzle/; suggest minimal fixes (no edits unless asked)                                                             | Server        | On demand.                                                 |
| **sweep-client**      | Read client/, tests/ (Playwright); suggest minimal fixes (no edits unless asked)                                                                      | Client        | On demand.                                                 |
| **sync-check**        | Read CONTEXT_FOR_NEW_CHAT.md and todo.md; summarize current state + next steps                                                                        | main / any    | On demand.                                                 |
| **doctor**            | `pnpm run doctor`                                                                                                                                     | Any           | Local sanity: env shape, check, build. No secrets printed. |

See **OPENCLAW.md** for key paths and **docs/OPENCLAW_INTEGRATION.md** for cron and agents.
