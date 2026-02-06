# Ideal Workflow: What Cursor Needs & How OpenClaw Gets There

**Purpose:** In a perfect world, Cursor (and you) can ship without friction. This doc states what Cursor needs, confirms OpenClaw can help get there, and assigns tasks and agents so nothing falls through the cracks.

---

## What Cursor Needs to Be Effective

1. **Current context** — CONTEXT_FOR_NEW_CHAT.md and todo.md reflect reality so a new chat doesn’t duplicate work or miss “what’s next.”
2. **Green gates** — Monitor and ship:check passing. When they fail, someone fixes and hands off so Cursor only reviews and commits.
3. **One place for “what’s ready”** — OPENCLAW_HANDOFF.md lists recent OpenClaw work; Cursor (or you) checks it before committing so OpenClaw’s fixes get merged.
4. **Clear ownership** — No ambiguity about who runs checks, who fixes, who commits. Cursor does not re-run monitor/ship:check in a loop; OpenClaw does that and hands off.
5. **Findable docs** — docs/DOCS_INDEX.md, TASKS.md, TOOLS.md so Cursor and OpenClaw know where to look.
6. **Scoped future work** — A short list of “what to do next on a shoestring” so we don’t overreach; Business agent can maintain it.

OpenClaw can get Cursor there by: (1) running monitor and ship:check on a schedule and fixing to green, (2) appending handoff notes so Cursor has one place to look, (3) doing weekly future/shoestring so priorities stay visible, (4) staying in its lanes (Ship/Server/Client/Docs/Review/Business) so Cursor isn’t doing grunt checks.

---

## Task & Agent Assignments

Use this when you ask OpenClaw to do something or when Cursor needs to know who owns what.

### OpenClaw agents (this repo)

| Agent        | Tasks                                                                                                           | Schedule / trigger                                                                                     | Handoff                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Ship**     | Run `pnpm run monitor`; run `pnpm run ship:check`. On failure: investigate (DEBUGGING.md), minimal fix, re-run. | **Cron:** monitor every 30m, ship:check every 6h. Or on-demand: “Run monitor” / “Run ship:check:full.” | Append to OPENCLAW_HANDOFF.md (what ran, what failed, what changed). Do not commit.     |
| **Business** | Read CONTEXT, todo, docs/OPENCLAW_FUTURE_SHOESTRING.md; suggest 3–5 shoestring improvements.                    | **Cron:** weekly. Or on-demand: “Future/shoestring suggestions.”                                       | Append summary to OPENCLAW_HANDOFF.md (date, “Future/shoestring,” list). Do not commit. |
| **Server**   | Sweep server/, drizzle/; suggest or apply minimal fixes per DEBUGGING.md. Run server-related checks.            | On-demand: “Sweep server/” / “Check migrations.”                                                       | Append to OPENCLAW_HANDOFF.md; do not commit unless user says “commit.”                 |
| **Client**   | Sweep client/, Playwright tests; run smoke/E2E when asked.                                                      | On-demand: “Sweep client/” / “Run production smoke.”                                                   | Append to OPENCLAW_HANDOFF.md; do not commit unless user says “commit.”                 |
| **Docs**     | Docs consistency (docs/, CONTEXT, todo, README). Summarize CONTEXT/todo for new chat.                           | On-demand: “Docs consistency” / “Summarize CONTEXT and todo.”                                          | Report or suggest edits; do not edit app code.                                          |
| **Review**   | Explain better code and why; suggest improvements. Do not apply unless asked.                                   | On-demand: “Review [path] and explain why.”                                                            | Hand off summary (what could be better, why, where).                                    |
| **main**     | General tasks, sync check, ad-hoc.                                                                              | On-demand.                                                                                             | Per task; do not commit unless user says “commit.”                                      |

### Cursor

| Task                                         | When                                                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Commit & push**                            | After reviewing OPENCLAW_HANDOFF.md and any OpenClaw changes.                                                                                   |
| **Deploy**                                   | When ready (Railway, etc.); use SHIP_CHECKLIST and RAILWAY_DEPLOYMENT_HANDOFF.                                                                  |
| **Complex refactors**                        | Multi-file or architectural changes; update CONTEXT and todo when done.                                                                         |
| **Update CONTEXT and todo**                  | At session end or at 50–60% context: “Last session” summary, “next steps,” and refresh todo so OpenClaw and next Cursor chat see current state. |
| **Check OPENCLAW_HANDOFF before committing** | So OpenClaw’s fixes are included in the same commit or a follow-up.                                                                             |

### You (human)

| Task                           | When                                                                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review and approve commits** | Before or after Cursor commits; you decide what ships.                                                                                                                      |
| **Product and priority calls** | What to build next; GTM/strategy; use Business agent for suggestions.                                                                                                       |
| **Brief OpenClaw**             | In WebChat: assign task by agent (e.g. Ship for monitor, Business for future/shoestring). Paste role brief once per chat if needed (see OPENCLAW_INTEGRATION § Role brief). |
| **Run OpenClaw**               | Keep gateway running (LaunchAgent); use cron for monitor/ship:check/future-shoestring so Cursor gets green gates and handoffs.                                              |

---

## Quick: “Who does what?”

- **Gates green?** → Ship (cron or on-demand).
- **What’s ready to commit?** → OPENCLAW_HANDOFF.md.
- **Who commits?** → You or Cursor (after review).
- **Review / judgment calls?** → Cursor and OpenClaw can discuss (handoff, CONTEXT, docs) and make the right call; autonomy for this project.
- **Context current?** → Cursor updates CONTEXT and todo at session end; OpenClaw reads them before big edits.
- **Future / shoestring?** → Business (weekly cron or on-demand).
- **Sweep server/client/docs?** → Server / Client / Docs (on-demand).
- **Explain why / review code?** → Review (on-demand).

---

## References

- **Setup and role briefs:** [OPENCLAW_INTEGRATION.md](./OPENCLAW_INTEGRATION.md)
- **Named tasks and commands:** [TASKS.md](../TASKS.md), [TOOLS.md](../TOOLS.md)
- **Sync points:** [CONTEXT_FOR_NEW_CHAT.md](../CONTEXT_FOR_NEW_CHAT.md), [todo.md](../todo.md), [OPENCLAW_HANDOFF.md](../OPENCLAW_HANDOFF.md)
