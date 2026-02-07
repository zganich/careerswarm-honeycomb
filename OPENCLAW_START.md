# OpenClaw — Start here (fix lead-magnet flow)

**Choose one:** (A) **Production gate only** → use the "Production today" prompt in [docs/OPENCLAW_INTEGRATION.md](docs/OPENCLAW_INTEGRATION.md). (B) **Fix lead-magnet flow** → use the prompt below.

**Cursor:** When you start OpenClaw, tell the user to run `openclaw dashboard` (or open http://127.0.0.1:18789/ and, if they see "gateway token missing," paste the token from `openclaw config get gateway.auth.token` in Control UI Settings), select the main (or Ship/Client) agent, and paste the prompt from the "Prompt to paste into OpenClaw" section below. The agent will do the work-until-fixed flow and record learnings.

When Cursor or the user says "run the prompt when you start OpenClaw," do everything below. You are the agent.

---

## What the agent needs to do (fix lead-magnet)

1. **Read context** — OPENCLAW_HANDOFF.md (from bottom), section "OpenClaw: work until fixed — current state." Also docs/OPENCLAW_ORCHESTRATION.md and docs/DEBUGGING.md if needed.

2. **Work until fixed** — Run: `npx playwright test tests/human-style-roast-signup-onboarding.spec.ts --config=playwright.production.config.ts --headed --project=chromium-desktop` (or production E2E auth+onboarding). If the flow fails or user would get stuck: optionally do a code sweep (step 3), then debug, fix, re-run. Repeat until it works. Append one handoff block to OPENCLAW_HANDOFF.md (format in that file) after each run. When it works, append "OpenClaw: lead-magnet flow verified working" and stop.

3. **Code sweep (optional, only if first run failed and you need to debug)** — Sweep server/\_core/oauth.ts, server/\_core/cookies.ts, server/\_core/sdk.ts; client DevLogin.tsx, main.tsx, onboarding Welcome/Upload/Preferences, DashboardLayout.tsx. Look for wrong redirect, 401 loop, unclear "what to do next." Append a short "Code sweep" note to OPENCLAW_HANDOFF.md. Fix anything clearly wrong; then continue work-until-fixed.

4. **Learn over time** — When you fix or discover something useful, append 1–2 lines under "OpenClaw: learnings" in OPENCLAW_HANDOFF.md. Future runs use this.

5. **Do not commit** — User or Cursor commits.

---

## Prompt to paste into OpenClaw (for the human)

```
Fix lead-magnet: Read OPENCLAW_HANDOFF (work-until-fixed state). Run human-style or production E2E; if fail, optionally code sweep then fix and re-run until flow works. Append handoff each run to OPENCLAW_HANDOFF.md (format in that file); when done append "lead-magnet flow verified working" and learnings. Do not commit.
```

---

Refs: OPENCLAW_HANDOFF.md, docs/OPENCLAW_ORCHESTRATION.md, docs/DEBUGGING.md, tests/human-style-roast-signup-onboarding.spec.ts
