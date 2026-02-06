# Inspiration from the OpenClaw Org

Ideas taken from [github.com/openclaw](https://github.com/openclaw) and [docs.openclaw.ai](https://docs.openclaw.ai) that we can use for CareerSwarm (shipping fast, shoestring, parallel Cursor + OpenClaw).

---

## 1. Repo structure and agent context

**What they do:** [openclaw/openclaw](https://github.com/openclaw/openclaw) uses:

- **`.agent/workflows/`** — workflow definitions the agent can run.
- **`.agents/skills/`** and **`skills/`** — skills in-repo; workspace skills at `~/.openclaw/workspace/skills/<name>/SKILL.md`.
- **AGENTS.md**, **SOUL.md**, **TOOLS.md** — injected into the agent as prompt/context.

**Inspiration for us:**

- We already have **OPENCLAW.md** (project summary, key paths) and **skills/careerswarm/SKILL.md**. Consider adding a short **AGENTS.md** or **TOOLS.md** in repo root that lists “who does what” and “which commands/tools exist” so any agent (Cursor or OpenClaw) has one place to look.
- Optional: **`.agent/workflows/`** with one-file workflows (e.g. `monitor.yaml`, `ship-check.yaml`) that describe steps; OpenClaw or scripts can run them. Keeps “what to run” declarative.

---

## 2. ClawHub and skills registry

**What they do:** [openclaw/clawhub](https://github.com/openclaw/clawhub) is a **skill directory** (clawhub.ai): publish, version, and search skills (SKILL.md + metadata). Vector search, tags, changelogs. [onlycrabs.ai](https://onlycrabs.ai) does the same for SOUL.md (agent “soul” / system lore).

**Inspiration for us:**

- **Shoestring:** We don’t need to run ClawHub. We can:
  - Keep our **single CareerSwarm skill** in-repo and point OpenClaw at it (already done).
  - Optionally **publish** the careerswarm skill to ClawHub so others can discover/reuse it (“monitor + ship gate + handoff for a Node/Railway app”).
- **Future:** If we add more skills (e.g. “playwright-smoke”, “gtm-sweep”), document them in a small **docs/SKILLS.md** with name, purpose, and when to use — a mini internal registry.

---

## 3. Lobster: typed workflows and one-shot macros

**What they do:** [openclaw/lobster](https://github.com/openclaw/lobster) is a “workflow shell”: typed (JSON) pipelines, approval gates, composable steps. The agent invokes **one command** (e.g. `workflows.run --name github.pr.monitor`) instead of long ad-hoc instructions — saves tokens and makes behavior repeatable.

**Inspiration for us:**

- We already give OpenClaw **cron jobs** with fixed messages (“run pnpm run monitor…”, “run ship:check…”). That’s in the same spirit: one clear task per job.
- **Next step:** In our skill or in OPENCLAW.md, define a small set of **named tasks** (e.g. “full gate”, “monitor”, “future/shoestring”, “sweep server”) with exact commands and handoff rules. Then cron and ad-hoc chat can say “run task: full gate” instead of pasting a paragraph. No need to install Lobster; just a single source of truth (e.g. a table in OPENCLAW_FUTURE_SHOESTRING.md or a TASKS.md).

---

## 4. Cron + heartbeat and when to use which

**What they do:** [Cron jobs](https://docs.openclaw.ai/automation/cron-jobs) run on a schedule; [Cron vs Heartbeat](https://docs.openclaw.ai/automation/cron-vs-heartbeat) explains: use **cron** when timing is fixed and isolated; use **heartbeat** when you want the main session to do batched checks (e.g. inbox + calendar) in one turn.

**Inspiration for us:**

- We use **cron** for monitor (30m), ship:check (6h), future/shoestring (weekly). Good fit: we want “run this at this interval” without tying it to a chat.
- If we later want “daily summary for the human” (e.g. “what broke, what’s ready to commit”), we could add one **cron** that runs the Ship or main agent with a message like “Summarize OPENCLAW_HANDOFF.md and CONTEXT last 24h; append a one-paragraph summary to OPENCLAW_HANDOFF.md.” No heartbeat needed unless we move to a single “daily check-in” that does several things in one agent turn.

---

## 5. Doctor and health checks

**What they do:** OpenClaw has **`openclaw doctor`** — health checks and quick fixes for gateway, channels, config. Surfaces misconfig (e.g. risky DM policies) and can suggest migrations.

**Inspiration for us:**

- We have **docs/DEBUGGING.md** (platform limits → env → minimal fix) and **pnpm run monitor** (CI, Railway, app, Cloudflare). We could add a short “CareerSwarm doctor” section to DEBUGGING.md or a **scripts/doctor.mjs** that: checks `.env` presence (no values), `DATABASE_URL` format, `pnpm check` / `pnpm build` pass, and optionally Railway CLI link. One command for “is my local and deploy path sane?”
- **Shoestring:** Implement as a Node script in `scripts/` that runs before deploy or when someone says “run doctor.”

---

## 6. Session tools and agent-to-agent

**What they do:** **sessions_list**, **sessions_history**, **sessions_send** — one agent can discover other sessions, read history, or send a message to another session (e.g. “Ship, run monitor” from main). Enables coordination without the human switching chats.

**Inspiration for us:**

- Our **handoff** is file-based (OPENCLAW_HANDOFF.md, CONTEXT, todo). We don’t need session tools for that.
- **Future:** If we use multiple OpenClaw agents often, we could document “ask Ship to run X via sessions_send” in the integration doc so the human (or main agent) can delegate without opening Ship’s WebChat.

---

## 7. Security and pairing

**What they do:** DM pairing by default; allowlists; **`openclaw doctor`** to surface risky config. Docs stress “treat inbound DMs as untrusted.”

**Inspiration for us:**

- We run OpenClaw **local**, WebChat on loopback. No public DMs. Still: keep **gateway token** and any API keys out of repo; we already have secrets rules in `.cursorrules` and precommit.
- Optional: run **`openclaw doctor`** periodically (e.g. from a cron or “when you change gateway config”) and note it in OPENCLAW_INTEGRATION.md.

---

## 8. Nix and Docker

**What they do:** [nix-openclaw](https://github.com/openclaw/nix-openclaw), [openclaw-ansible](https://github.com/openclaw/openclaw-ansible) — declarative installs, Tailscale, UFW, Docker. Good for “run OpenClaw on a Linux box.”

**Inspiration for us:**

- **Shoestring:** We don’t need Nix/Ansible for CareerSwarm app (we use Railway). If we ever run the **OpenClaw gateway** on a small VPS (e.g. for 24/7 cron), their Docker or Nix patterns would be a good reference.
- For now: gateway on your Mac + LaunchAgent is enough; cron runs when the machine is on. Optional: note in docs that “for 24/7 cron, run gateway on a Linux server” and link to OpenClaw’s [Remote Gateway](https://docs.openclaw.ai/gateway/remote) and Docker docs.

---

## Summary: what to do next (on a shoestring)

| Idea                        | Action                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Named tasks (Lobster-style) | **TASKS.md** in repo root: task name → command + handoff rule. Use in cron messages and chat. ✅ Done.                                                                                  |
| Doctor script               | **scripts/doctor.mjs**: verify-env + check + build; never prints secrets. `pnpm run doctor`. ✅ Done.                                                                                   |
| AGENTS.md / TOOLS.md        | **TOOLS.md** in repo root: agents (Ship, Server, …), commands, link to TASKS.md. ✅ Done.                                                                                               |
| Session tools               | Document in OPENCLAW_INTEGRATION.md how to use sessions_send to delegate to Ship from main. ✅ Done.                                                                                    |
| OpenClaw doctor             | Run `openclaw doctor` after gateway config changes; mentioned in integration doc. ✅ Done.                                                                                              |
| Publish skill to ClawHub    | **Optional, human decision.** Publishing to [ClawHub](https://clawhub.ai) makes our skill public (paths, handoff flow). Only do if you want the skill discoverable; don’t auto-publish. |

## Sketchiness check (what we skipped or limited)

- **ClawHub publish** — External registry; would expose repo structure and handoff flow. Not sketchy per se, but opt-in only. We did **not** add any publish step; document as optional.
- **Doctor script** — Safe: only runs existing scripts (verify-env, check, build); no env values printed; read-only sanity check.
- **TASKS.md / TOOLS.md** — Docs only; no code execution, no secrets.
- **OpenClaw doctor** — Official CLI from OpenClaw; we only tell you to run it. Safe.
- **Session tools** — Documentation only; no new code or permissions.

All of the above are incremental and low-cost. Future needs: **docs/OPENCLAW_FUTURE_SHOESTRING.md**.

---

## From other well-documented repos (added)

| Idea                | What we added                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **SECURITY.md**     | How to report vulnerabilities (private; no public issues). Standard for open source.                                                |
| **CONTRIBUTING.md** | Local setup, `pnpm run doctor`, precommit, PR flow, link to CONTEXT/todo/TASKS/TOOLS.                                               |
| **Dependabot**      | [.github/dependabot.yml](../.github/dependabot.yml) — weekly npm + GitHub Actions updates; grouped PRs. Reduces supply-chain drift. |
| **Docs index**      | [docs/DOCS_INDEX.md](./DOCS_INDEX.md) — one-page index of all docs so humans and agents can find the right file.                    |

All safe: docs only or standard GitHub/Dependabot config; no secrets, no external publish.
