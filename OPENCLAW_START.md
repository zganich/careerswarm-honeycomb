# OpenClaw — Start here (work until fixed + code sweep + learn)

**Cursor:** When you start OpenClaw, tell the user to open WebChat (http://127.0.0.1:18789/), select the main (or Ship/Client) agent, and paste the prompt from the "Prompt to paste into OpenClaw" section below. The agent will read this file and do the work-until-fixed flow, code sweep, and record learnings.

Cursor: When you start OpenClaw, tell the user to open WebChat (http://127.0.0.1:18789/), select main or Ship/Client, and paste the prompt from the section below. The agent will do work-until-fixed, code sweep, and record learnings.

When Cursor or the user says "run the prompt when you start OpenClaw," do everything below. You are the agent.

---

## What the agent needs to do

1. **Read context** — OPENCLAW_HANDOFF.md (from bottom), section "OpenClaw: work until fixed — current state." Also docs/OPENCLAW_ORCHESTRATION.md and docs/DEBUGGING.md if needed.

2. **Code sweep (auth + onboarding)** — Sweep:
   - Server: server/_core/oauth.ts, server/_core/cookies.ts, server/_core/sdk.ts (cookie, session, test-login, redirect).
   - Client: client/src/pages/DevLogin.tsx, client/src/main.tsx, client/src/pages/onboarding/Welcome.tsx, Upload.tsx, Preferences.tsx, client/src/components/DashboardLayout.tsx.
   - Look for: wrong redirect, 401 loop, unclear "what to do next." Append a short "Code sweep" note to OPENCLAW_HANDOFF.md. Fix anything clearly wrong.

3. **Work until fixed** — Run: `npx playwright test tests/human-style-roast-signup-onboarding.spec.ts --config=playwright.production.config.ts --headed --project=chromium-desktop` (or production E2E auth+onboarding). If the flow fails or user would get stuck: debug, fix, re-run. Repeat until it works. Append handoff after each run. When it works, append "OpenClaw: lead-magnet flow verified working" and stop.

4. **Learn over time** — When you fix or discover something useful, append 1–2 lines under "OpenClaw: learnings" in OPENCLAW_HANDOFF.md (or docs/OPENCLAW_LEARN.md). Future runs use this.

5. **Do not commit** — User or Cursor commits.

---

## Prompt to paste into OpenClaw (for the human)

```
Read OPENCLAW_START.md. Do what it says: (1) Read OPENCLAW_HANDOFF and current state. (2) Code sweep server/_core (oauth, cookies, sdk) and client (DevLogin, main.tsx, onboarding Welcome/Upload/Preferences, DashboardLayout); append sweep note to OPENCLAW_HANDOFF. (3) Work until fixed: run human-style test or E2E auth+onboarding; fix and re-run until flow works; append handoff each run; when done append "OpenClaw: lead-magnet flow verified working." (4) Append learnings under "OpenClaw: learnings" in OPENCLAW_HANDOFF. Do not commit.
```

---

Refs: OPENCLAW_HANDOFF.md, docs/OPENCLAW_ORCHESTRATION.md, docs/DEBUGGING.md, tests/human-style-roast-signup-onboarding.spec.ts
