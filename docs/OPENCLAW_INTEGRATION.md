# OpenClaw Integration

Use [OpenClaw](https://github.com/openclaw/openclaw) (personal AI assistant) in parallel with Cursor for **background tasks**, **debugging**, and **code sweeps**, with shared context so both stay aligned.

**Ideal workflow and who does what:** [docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md](./IDEAL_WORKFLOW_AND_ASSIGNMENTS.md) — what Cursor needs to be effective, and task/agent assignments (Ship, Server, Client, Docs, Review, Business, Cursor, you).

## What’s already done (this machine)

- **Installed:** `openclaw` CLI globally (Node ≥22).
- **Config:** `~/.openclaw/openclaw.json` — workspace = this repo (`/Users/jamesknight/GitHub/careerswarm-honeycomb`).
- **Daemon:** Gateway runs as LaunchAgent on port 18789; start/stop: `openclaw gateway start` / `openclaw gateway stop` (or use `status`).
- **Workspace skill:** `skills/careerswarm/SKILL.md` — instructions for monitor, code sweeps, debugging, and syncing with Cursor. Loaded when the agent runs in this workspace.

**One-time: add model auth** so the agent can reply (e.g. OpenAI for CareerSwarm):

```bash
openclaw configure
# Pick "Agent defaults" (or "Models") and add OpenAI API key, or use an existing profile.
# Alternatively set OPENAI_API_KEY in your environment before starting the gateway.
```

Then (re)start the gateway if it’s running: `openclaw gateway restart`.

**Talk to OpenClaw:** Open **WebChat** at [http://127.0.0.1:18789/](http://127.0.0.1:18789/) (or run `openclaw dashboard`). From there you can say e.g. “Run monitor and report,” “Sweep server/ and suggest fixes from DEBUGGING.md,” or “Summarize CONTEXT and todo.”

---

## What OpenClaw is

OpenClaw is a local-first AI assistant you run (Gateway + agent). It can:

- Run commands and scripts (e.g. `pnpm run monitor`, tests, lint)
- Read and edit files in a workspace
- Chat over WebChat, Slack, Telegram, etc.
- Execute tools (browser, cron, sessions) for autonomous background work

**Repo:** https://github.com/openclaw/openclaw  
**Docs:** [Getting started](https://docs.openclaw.ai), [Configuration](https://docs.openclaw.ai/configuration)

## Point OpenClaw at this repo

1. **Install and onboard** (if not already):

   ```bash
   npm install -g openclaw@latest
   openclaw onboard --install-daemon
   ```

2. **Set workspace to CareerSwarm** so OpenClaw operates on this codebase:
   - In `~/.openclaw/openclaw.json`, set:
     ```json
     {
       "agents": {
         "defaults": {
           "workspace": "/Users/jamesknight/GitHub/careerswarm-honeycomb"
         }
       }
     }
     ```
   - Or use a **named workspace** and open this repo when you want OpenClaw to work on CareerSwarm.

3. **Context file:** When the workspace is this repo, OpenClaw will see **OPENCLAW.md** in the repo root (project summary, key paths, and sync points). Use it as the main briefing for “work in careerswarm-honeycomb.”

## Staying in parallel with Cursor

Use **shared artifacts** so Cursor and OpenClaw don’t conflict and can coordinate:

| Artifact                    | Purpose                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **CONTEXT_FOR_NEW_CHAT.md** | Current state, last session summary, next steps. Cursor updates it; OpenClaw reads it to know what’s in progress. |
| **todo.md**                 | Priorities and quick commands. Single place for “what to do next.”                                                |
| **docs/DEBUGGING.md**       | Production debugging order-of-operations. OpenClaw can run checks and suggest fixes from here.                    |
| **docs/MONITORING.md**      | `pnpm run monitor` / `monitor:watch`. OpenClaw can run monitor in the background.                                 |

**Suggested workflow:**

- **Cursor:** Commits, deploys, and complex refactors. Updates CONTEXT and todo when wrapping up or at 50–60% context. **Receives handoff from OpenClaw** when OpenClaw has fixed errors and the change is ready to review and commit.
- **OpenClaw:** Runs checks (monitor, ship:check, lint, tests). **When it finds errors:** works through to a solution (investigate → minimal fix → re-run; per docs/DEBUGGING.md), then **stops and hands off to you** with a summary and “ready for you to review and commit.” OpenClaw does not commit; you (or Cursor) do the commit after reviewing.
- **You:** Brief OpenClaw in chat; when OpenClaw reports “ready for review and commit,” review the changes and commit (or hand to Cursor to commit). Use CONTEXT/todo to keep both aligned.

## Sections vs autonomous / parallel

**Recommendation: one workspace (this repo); either scope by prompt with one agent, or use multiple agents (Ship, Server, Client, Docs) for clear lanes and parallel work.** See **Multiple agents (by project area)** below.

- **One repo, one workspace** for all agents. The careerswarm skill tells OpenClaw to read CONTEXT and todo first.
- **Option A — One agent:** Scope by prompt (e.g. “Sweep **server/** only,” “Run ship:check:full”).
- **Option B — Multiple agents:** Add Ship, Server, Client, Docs; give each a role brief at the start of chat so each stays in its lane. Best for efficiency and parallel work.
- **Autonomous:** Schedule recurring tasks with OpenClaw **cron** (e.g. run `pnpm run monitor` every 30 min).
- **Parallel:** Cron + on-demand chat; with multiple agents you can run Ship (monitor) and Server (sweep) at the same time.

| If you want…         | Do this                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Focus on one area    | "Sweep **server/** only," "Check **drizzle/** and schema," "Docs consistency in **docs/**."                                          |
| Full deploy gate     | "Run `pnpm run ship:check:full` and report."                                                                                         |
| Background health    | Add an OpenClaw cron job: run `pnpm run monitor` every N minutes.                                                                    |
| Parallel with Cursor | Let cron run; use chat for ad-hoc (sweep, sync check, triage). OpenClaw fixes errors and hands off; you or Cursor review and commit. |

## Multiple agents (by project area)

**Individual agents for certain parts of the project are beneficial.** OpenClaw supports multiple agents (each with its own workspace, sessions, and identity). You can add one agent per “lane” so each stays focused, you can run tasks in parallel, and handoff is clear.

**Why use multiple agents:**

- **Clear lanes** — Ship only does CI/ship/monitor; Server only does server/ + drizzle/ + DEBUGGING; Client only does client/ + Playwright; Docs only does docs/ + CONTEXT/todo. No single agent has to hold the whole stack.
- **Parallel work** — Ask Ship to run monitor while you ask Server to sweep server/ in another chat (or another session).
- **Efficiency** — You say “run the full gate” to Ship and “sweep server” to Server; each does one job well and hands off when done.
- **Smaller context** — Each agent’s conversations stay scoped to its lane, so less noise and clearer “ready for commit” summaries.

**How to add agents (same repo, different roles):**

All agents use the **same workspace** (this repo). You add agents and give each a **role** by how you use it (and optionally a short first message).

```bash
# List current agents (you have 'main' by default)
openclaw agents list

# Add role-specific agents (same workspace as main)
openclaw agents add ship   --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
openclaw agents add server --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
openclaw agents add client --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
openclaw agents add docs   --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
openclaw agents add review  --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
openclaw agents add business --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
```

**Optional:** set identity so you can tell them apart in the UI:

```bash
openclaw agents set-identity --agent ship   --name "Ship"   --emoji "🚀"
openclaw agents set-identity --agent server --name "Server" --emoji "⚙️"
openclaw agents set-identity --agent client --name "Client" --emoji "🖥️"
openclaw agents set-identity --agent docs   --name "Docs"   --emoji "📄"
openclaw agents set-identity --agent review  --name "Review"  --emoji "🔍"
openclaw agents set-identity --agent business --name "Business" --emoji "📊"
```

**Role brief (first message when you start a chat with that agent):**  
Paste the line below so the agent stays in its lane. Then ask your question.

| Agent        | Role brief (paste once at start of chat)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **main**     | (default; general tasks, sync check, anything not below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **ship**     | You are the Ship agent. Only run monitor, precommit, ship:check, ship:check:full. When errors, work through to a solution then hand off for review and commit. Do not edit server/ or client/ features; only fix what’s needed for checks to pass.                                                                                                                                                                                                                                                                                                                                      |
| **server**   | You are the Server agent. Only work in server/, drizzle/, and docs/DEBUGGING.md. Run checks that touch server (pnpm check, pnpm test). Sweep, debug, migration safety. When done, hand off for review and commit. Do not change client/ or run Playwright.                                                                                                                                                                                                                                                                                                                              |
| **client**   | You are the Client agent. Only work in client/, tests/ (Playwright), and E2E/smoke. Run production smoke and E2E when asked. Sweep client code. When done, hand off for review and commit. Do not change server/ or drizzle/.                                                                                                                                                                                                                                                                                                                                                           |
| **docs**     | You are the Docs agent. Only work in docs/, CONTEXT_FOR_NEW_CHAT.md, todo.md, README, SHIP_CHECKLIST, CRITICAL_SETUP_CHECKLIST. Docs consistency, release notes, local dev checklist, sync summary. Do not edit application code. Report only or suggest edits for the human to apply.                                                                                                                                                                                                                                                                                                  |
| **review**   | You are the Review agent. Your job is to **identify better code and solutions** and **explain why**. Read the code or paths the user asks about; suggest improvements (readability, patterns, performance, consistency with DEBUGGING/docs, safety). For each suggestion: say what’s better, why it’s better, and (if useful) a short code or approach example. Do not apply changes unless the user explicitly asks you to; otherwise hand off a clear summary (what could be better, why, where) so the user or Cursor can decide what to adopt. You are the “explain the why” agent. |
| **business** | You are the Business agent. Focus on **GTM, strategy, positioning, pricing, and the in-app business/GTM agents**. Read docs/CAREERSWARM_GTM_STRATEGY.md, docs/GTM_PLAN.md, and server/agents/gtm/ when asked. Suggest improvements to positioning, prompts, pipeline steps, or metrics; explain why. Do not edit code unless the user asks; otherwise hand off a clear summary (what to improve, why, where) so the user or Cursor can decide. See docs/BUSINESS_AGENT_IMPROVEMENTS.md for improvement ideas.                                                                           |

**In WebChat:** switch or select the agent (Ship, Server, Client, Docs, Review, Business) then send the role brief once and your request. Each agent shares the same careerswarm skill but stays in its lane when you use the brief.

## How else OpenClaw can help (take the load off)

- **Cron for recurring work** — Schedule `pnpm run monitor` (e.g. every 30 min) or a weekly `pnpm run ship:check` so you don’t have to remember. OpenClaw reports only when something fails (if you configure notifications).
- **Handoff note in one place** — When an agent finishes and hands off, ask it to append a short summary to a file (e.g. `OPENCLAW_HANDOFF.md` in the repo) with: what failed, what it changed, what to verify. You or Cursor read that file and commit. No need to re-read the whole chat.
- **Update CONTEXT / todo when done** — Ask the agent: “When you’re done, add one line to CONTEXT_FOR_NEW_CHAT.md under Last Session: ‘OpenClaw (Ship): ran monitor at &lt;time&gt;, all green’ (or what failed).” So the next Cursor chat sees the latest.
- **Pre-defined prompts** — Keep a short list of “one-shot” prompts you use often (e.g. “Run ship:check:full; if fail, fix and hand off” for Ship; “Sweep server/ per DEBUGGING.md and hand off” for Server). Paste and go.
- **One agent per lane** — Use Ship for gate/monitor, Server for backend, Client for frontend/tests, Docs for docs and summaries, **Review** for “better code + explain why,” **Business** for GTM, strategy, positioning, and in-app business agents. You choose the right agent and get focused work and handoffs.
- **Review agent** — Ask Review to look at a file, dir, or PR-style diff; it suggests better solutions and **explains why** (readability, patterns, performance, alignment with docs). You or Cursor then decide what to apply. Great for learning and for handing a “here’s what could be better and why” note to Cursor.
- **Business agent** — Ask Business to align GTM prompts with CAREERSWARM_GTM_STRATEGY, suggest pipeline or content improvements, or recommend metrics. See docs/BUSINESS_AGENT_IMPROVEMENTS.md for how to improve the in-app business/GTM agents and how to use the OpenClaw Business agent.

**Most efficient pattern:** Ship agent on cron (monitor) + when you’re about to deploy you ask Ship for `ship:check:full` (fix and hand off). Server/Client/Docs on demand when you want a sweep, triage, or doc update. You or Cursor always do the commit after review.

## Tasks OpenClaw can run autonomously

- **Monitoring:** `pnpm run monitor` or `pnpm run monitor:watch`; report failures.
- **Checks:** `pnpm check`, `pnpm test`, `pnpm lint`, `pnpm format:check`; report results.
- **Production smoke:** `npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts`.
- **Debugging:** Read `docs/DEBUGGING.md` and `railway logs` (if Railway CLI and project are linked); suggest minimal fixes (env, timeouts, trust proxy).
- **Code sweep:** Read key paths (e.g. `server/`, `drizzle/`, `client/src/pages/`) and OPENCLAW.md; suggest consistency, dead code, or alignment with DEBUGGING.md.
- **Sync check:** Read CONTEXT_FOR_NEW_CHAT.md and todo.md; summarize “what Cursor is doing” and “what’s next” so you can align both assistants.

## Actions OpenClaw can do

| Category              | Actions                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Run commands**      | Execute shell commands in the workspace (e.g. `pnpm run monitor`, `pnpm check`, `pnpm test`, `pnpm lint`, Playwright, `railway logs`).                                                                             |
| **Read / edit files** | Read and modify repo files to fix errors; follows OPENCLAW.md and the careerswarm skill. When a solution is determined, hand off for human review and commit (OpenClaw does not commit unless you explicitly ask). |
| **Bash / scripts**    | Run one-off scripts or multi-step commands; can chain `check` → `test` → `build` or run `scripts/monitor.mjs`.                                                                                                     |
| **Cron / scheduled**  | Schedule recurring tasks (e.g. run monitor every N minutes) via OpenClaw cron.                                                                                                                                     |
| **Sessions**          | Keep context across turns; can do "run monitor, then if anything fails run railway logs and summarize."                                                                                                            |
| **Sync with Cursor**  | Read CONTEXT_FOR_NEW_CHAT.md and todo.md; produce a short summary you can paste into a new Cursor chat.                                                                                                            |
| **Debugging**         | Follow docs/DEBUGGING.md (platform limits → env → minimal fix); suggest env or code changes, no secrets in chat.                                                                                                   |
| **Code sweep**        | Read server/, drizzle/, key client paths; suggest consistency, dead code, or alignment with DEBUGGING.md.                                                                                                          |

## Best use cases to ship

Use OpenClaw for these so you and Cursor can ship faster and with fewer regressions:

| Use case                      | What to ask OpenClaw                                                                                                                                                                                   | Why it helps                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Pre-deploy gate**           | "Run the full ship checklist: `pnpm run ship:check:full` (or `pnpm precommit` then `pnpm run ship:check:full`). If anything fails, work through to a solution then hand off for review and commit."    | OpenClaw fixes what it can; when done it reports and you (or Cursor) commit.               |
| **Background monitor**        | "Run pnpm run monitor and tell me if anything fails." Or: "Run monitor:watch and notify me on failure."                                                                                                | CI, Railway, app health, Cloudflare in one place; you stay focused.                        |
| **Post-deploy sanity**        | "Run production smoke tests and summarize results."                                                                                                                                                    | Quick confirmation that careerswarm.com is up and critical paths work.                     |
| **Production debugging**      | "Read docs/DEBUGGING.md. [Paste symptom]. Suggest checks in order: platform limits, env, then minimal code fix."                                                                                       | Keeps fixes minimal and aligned with the runbook; no instrumentation until needed.         |
| **Code sweep before release** | "Sweep server/ and drizzle/ for consistency with docs/DEBUGGING.md and OPENCLAW.md; list suggested improvements, no edits yet."                                                                        | Surfaces tech debt or misalignment without Cursor context burn.                            |
| **Handoff / new chat**        | "Summarize CONTEXT_FOR_NEW_CHAT.md and todo.md so I can paste into a new Cursor chat."                                                                                                                 | One place for 'what's done, what's next'; Cursor and OpenClaw stay in parallel.            |
| **Env / Railway check**       | "From docs/CRITICAL_SETUP_CHECKLIST.md, list what we need in Railway for a deploy; I'll verify in dashboard."                                                                                          | Reminder of DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, SENTRY_DSN without opening docs.     |
| **Pre-commit guard**          | "Run pnpm precommit and report; if it fails, work through to a solution then hand off for review and commit."                                                                                          | OpenClaw fixes what it can (e.g. format, lint), then you review and commit.                |
| **Better code + explain why** | Ask the **Review** agent: "Review [file or path]; suggest better solutions and explain why (readability, patterns, performance, consistency)." Hand off a summary; you or Cursor decide what to apply. | Surfaces improvements and the reasoning so you learn and can hand a clear brief to Cursor. |

**Rule:** When OpenClaw finds errors it works through to a solution (investigate → minimal fix → re-run), then hands off to you with “ready for review and commit.” You (or Cursor) review and commit; OpenClaw does not commit unless you explicitly ask. Keep CONTEXT and todo updated so both stay aligned.

## Other use cases (we haven’t covered yet)

| Use case                      | What to ask OpenClaw                                                                                                                                          | Why it helps                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Regression triage**         | "Run production smoke and E2E; list which tests failed and which passed. Don’t fix, just report."                                                             | After a bad deploy or mystery bug, see exactly what broke without opening Cursor. |
| **Dependency / audit**        | "Run `pnpm audit` and summarize high/critical. List any deps with major updates (e.g. `pnpm outdated`). Don’t upgrade, just report."                          | Stay aware of vulns and major upgrades; decide in Cursor when to fix.             |
| **Docs consistency**          | "Read README, CONTEXT, SHIP_CHECKLIST, CRITICAL_SETUP_CHECKLIST; list contradictions or steps that look outdated."                                            | Keeps docs aligned without manual diffing.                                        |
| **Log analysis**              | "I’m pasting [railway logs / error]. Summarize errors and which DEBUGGING.md section or code path likely applies."                                            | You paste; OpenClaw maps to runbook and code. No secrets in paste.                |
| **Test coverage gaps**        | "List critical user flows from README or product (Roast, onboarding, login). For each, say if we have a smoke or E2E test."                                   | Surfaces missing tests before you ship.                                           |
| **Release notes / changelog** | "Read recent git log (last 10–20 commits); draft a short CHANGELOG or release summary I can edit."                                                            | Quick draft before tagging or releasing.                                          |
| **On-call runbook**           | "When I see [symptom], what should I do step-by-step?" OpenClaw uses DEBUGGING.md + MONITORING.md.                                                            | Middle-of-night or when you’re not in Cursor.                                     |
| **Migration safety**          | "Read the latest migration in drizzle/ and schema; list any new env vars or deploy steps needed before running in prod."                                      | Avoid surprise after `pnpm db:migrate` in production.                             |
| **API coverage check**        | "List public tRPC procedures from server/routers; then check production-smoke and production-e2e for which are exercised. List any critical API not covered." | Ensures critical API surface is tested.                                           |
| **Local dev checklist**       | "From README and CRITICAL_SETUP_CHECKLIST, produce a minimal 'local dev only' setup checklist for a new teammate (no deploy)."                                | Onboarding without overwhelming with prod env.                                    |
| **Rollback decision**         | "Summarize what CONTEXT says was last deployed or changed. If I rollback, what should I verify first?"                                                        | Quick state summary before rollback.                                              |
| **Sentry / error triage**     | "I’m pasting a [sanitized] Sentry error. Map to our code paths (server/, client/) and suggest DEBUGGING.md or next steps."                                    | Paste stack trace; get code location and runbook.                                 |

## Channel (optional)

Use one channel (e.g. **WebChat** in the OpenClaw Gateway, or Slack/Telegram if configured) to talk to OpenClaw and to paste summaries for Cursor. That way you can say “OpenClaw: run monitor and sweep server/” and “Cursor: here’s the summary from OpenClaw” in the same flow.

## Summary

- **OpenClaw:** Runs checks (monitor, ship:check, lint, tests). When it finds errors, works through to a solution (investigate → minimal fix → re-run), then hands off with “ready for review and commit”; does not commit unless you ask. Workspace = this repo; reads OPENCLAW.md + CONTEXT + todo + DEBUGGING/MONITORING.
- **Cursor:** Reviews OpenClaw’s changes and does commits/deploys; updates CONTEXT and todo.
- **You:** Use CONTEXT and todo to keep both in parallel and avoid duplicate work.

## Scheduled jobs (cron)

These run automatically so the product stays shippable and future work is scoped to a shoestring:

| Job                           | Schedule  | Agent    | What it does                                                                                                                                                              |
| ----------------------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| careerswarm-monitor           | Every 30m | Ship     | Runs `pnpm run monitor` (CI, Railway, app health, Cloudflare). On failure: fix per DEBUGGING.md, re-run, append handoff to OPENCLAW_HANDOFF.md.                           |
| careerswarm-ship-check        | Every 6h  | Ship     | Runs `pnpm run ship:check` (check + build + test). On failure: fix, re-run, append handoff. Does not commit.                                                              |
| careerswarm-future-shoestring | Weekly    | Business | Reads CONTEXT, todo, [docs/OPENCLAW_FUTURE_SHOESTRING.md](./OPENCLAW_FUTURE_SHOESTRING.md). Suggests 3–5 shoestring improvements; appends summary to OPENCLAW_HANDOFF.md. |

- **Manage:** `openclaw cron list`, `openclaw cron status`, `openclaw cron disable <id>`, `openclaw cron enable <id>`, `openclaw cron rm <id>`.
- **Future/shoestring brief:** [docs/OPENCLAW_FUTURE_SHOESTRING.md](./OPENCLAW_FUTURE_SHOESTRING.md) — what to prioritize and how to do it cheap. OpenClaw and Cursor both use it.

## Quick reference (this setup)

| Action                  | Command                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| CareerSwarm doctor      | `pnpm run doctor` — local sanity (verify-env, check, build; no secrets printed)                              |
| OpenClaw doctor         | `openclaw doctor` — gateway/channel health; run after gateway config changes                                 |
| Gateway status          | `openclaw gateway status`                                                                                    |
| Gateway restart         | `openclaw gateway restart`                                                                                   |
| Open WebChat            | [http://127.0.0.1:18789/](http://127.0.0.1:18789/) or `openclaw dashboard`                                   |
| Add model auth          | `openclaw configure`                                                                                         |
| Health check            | `openclaw health`                                                                                            |
| Run agent one-off (CLI) | `openclaw agent --message "Run pnpm run monitor and report"` (after auth is set)                             |
| List agents             | `openclaw agents list`                                                                                       |
| Add role agent          | `openclaw agents add ship --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb` (see Multiple agents) |

**Delegation:** From main (or any session) you can send a message to another agent via OpenClaw’s session tools (e.g. `sessions_send` so Ship runs monitor without opening Ship’s WebChat). See [Session tools](https://docs.openclaw.ai/concepts/session-tool).
