# OpenClaw handoff

When an OpenClaw agent finishes work and hands off, it can append a short summary here so you or Cursor can review and commit without re-reading the chat.

**Format (agent fills in):**

- **When:** date/time
- **Agent:** ship | server | client | docs | main
- **What ran:** e.g. ship:check:full, monitor, server sweep
- **What failed (if any):** brief
- **What changed:** files and summary of edits
- **Ready for:** review and commit (or: needs env / human decision)

---

## Assigned by Cursor (2026-02-06 evening)

**Context:** User asked Cursor to (1) state the plan, (2) assign OpenClaw its jobs, (3) finish the project to completion. User signing off for the evening; will check back later.

**What Cursor did:**

- Ran full verification: `pnpm check` (0 errors), `pnpm test` (122 passed, 51 skipped), `pnpm build` (passed), `pnpm format:check` + `pnpm lint` (passed). `pnpm precommit` failed locally only because `git secrets` is not installed (CI may run it; rest of precommit passed).
- Updated this handoff with OpenClaw job assignments below.
- Updated CONTEXT_FOR_NEW_CHAT.md and todo.md; committed and pushed.

**OpenClaw job assignments (run per TASKS.md and IDEAL_WORKFLOW_AND_ASSIGNMENTS.md):**

| Agent               | Job                                       | Instructions                                                                                                                                                                 |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ship**            | monitor                                   | Run `pnpm run monitor`. On failure: investigate per docs/DEBUGGING.md, minimal fix, re-run. Append result to this file (what ran, what failed, what changed). Do not commit. |
| **Ship**            | ship:check                                | Run `pnpm run ship:check`. On failure: fix per DEBUGGING.md, re-run. Append result here. Do not commit.                                                                      |
| **Ship**            | ship:check:full (optional, before deploy) | Run `pnpm run ship:check:full` when preparing for deploy. Append result here.                                                                                                |
| **Business**        | future-shoestring                         | Read CONTEXT_FOR_NEW_CHAT.md, todo.md, docs/OPENCLAW_FUTURE_SHOESTRING.md. Suggest 3–5 shoestring improvements. Append summary to this file. Weekly cron or on-demand.       |
| **Docs** (optional) | sync-check                                | Read CONTEXT and todo; summarize current state + next steps. On-demand: "Summarize CONTEXT and todo."                                                                        |

**Cron (already configured):** monitor every 30m, ship:check every 6h, future-shoestring weekly. When cron runs, the assigned agent does the task and appends to this file.

**When you (OpenClaw) finish a run:** Append one short block below in the format above (When, Agent, What ran, What failed, What changed, Ready for). Cursor or user will review and commit.

**Autonomy:** Cursor and OpenClaw can discuss (via this file, CONTEXT, shared docs) and make the right call when review or a judgment is needed. Use it; don’t block on the human when the path is clear.

---

_(Entries below this line.)_
