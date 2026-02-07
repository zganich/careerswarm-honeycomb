# OpenClaw Development Team — Orchestration

**Purpose:** Coordinate OpenClaw agents to **debug and fix** one problem efficiently. Each agent works its lane, applies minimal fixes, and appends to OPENCLAW_HANDOFF.md. You or Cursor review handoffs and commit.

---

## How to run this orchestration (most efficient)

1. **Open WebChat:** Run `openclaw dashboard` (or open http://127.0.0.1:18789/ — if you see "gateway token missing," see OPENCLAW_INTEGRATION.md § gateway token).
2. **Open two docs:** This file + [OPENCLAW_INTEGRATION.md](./OPENCLAW_INTEGRATION.md) (Role brief table).
3. **Run agents in parallel:** In separate tabs or sessions, for each agent: select agent → paste **role brief** once → paste **that agent’s task** from the table below. All can run at the same time.
4. **Collect results:** Each agent appends to OPENCLAW_HANDOFF.md when done. You or Cursor read from the bottom up, merge fixes, run final checks, commit.

**Rule for agents:** You may **apply minimal fixes** and re-run to verify. **Do not commit.** Append one handoff block to OPENCLAW_HANDOFF.md (format in that file).

**Work until fixed:** When the user says "work on this until the solution is fixed," agents should **keep iterating** until the lead-magnet flow works in the live browser: run fixes → run human-style test or production E2E → if still broken, debug and fix again → append handoff each run. Stop only when Roast → Sign in → onboarding (or dashboard) works and you’ve recorded that in OPENCLAW_HANDOFF.md. Use the **“Work until fixed” prompt** below.

---

## Current focus: Lead-magnet sign-in (Roast → Sign in → stay signed in)

**Goal:** Sign-in must work reliably in the **live browser** so the product works as a lead magnet. If the current auth flow is too broken, agents may **rebuild** the Resume Roast → sign-in flow (minimal: Roast page → sign in → land and stay on dashboard or onboarding).

**Observed problem:** User gets stuck in a loop at sign-in (redirect to dashboard then back to login). Issue appears in **live browser**. May have started or worsened **after adding more master profile sections** (e.g. awards, profile sections) a few days ago — e.g. more tRPC calls on first load after login could trigger 401 before the session cookie is sent or established, causing the global redirect back to login.

**Hypotheses to check:**

- **Cookie/session:** Cookie not set or not sent on the request that follows the login redirect (domain, SameSite, secure, or form POST vs fetch).
- **Client 401 redirect:** After login we land on /dashboard; auth.me and/or profile.get, analytics.getOverview, etc. run; if **any** tRPC call returns 401 (e.g. cookie not yet sent in first batch), main.tsx redirects to /login → loop.
- **Profile sections:** New or heavier profile/dashboard queries on first load (getCompleteness, getAchievementStats, profile.get with more sections) might run before or in parallel with auth; one 401 triggers redirect.
- **Login flow:** DevLogin was switched to native form POST; confirm it’s correct and that no client-side redirect overwrites or races with the server redirect.

**Out of scope for this run:** E2E test flakiness only (Playwright API login). Focus is **live browser** behavior.

---

## Orchestration tasks (copy-paste per agent)

Use **after** pasting the agent’s role brief from OPENCLAW_INTEGRATION.md.

| Agent      | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server** | **Auth and session:** Read server/\_core/oauth.ts (test-login), server/\_core/cookies.ts, server/\_core/sdk.ts. Ensure cookie domain, SameSite, secure, and 302 redirect are correct for production (Railway). Ensure test-login accepts both JSON and form body. **Dashboard load:** Check which procedures run when dashboard/profile load (auth.me, profile.get, getCompleteness, getAchievementStats, analytics.getOverview, applications.list). Ensure all use the same session/cookie; no procedure should 401 if the cookie is present. If you find a bug (e.g. cookie not sent on redirect, or a procedure that can 401 on first load), apply a minimal fix and re-run `pnpm check` and `pnpm test`. Append to OPENCLAW_HANDOFF.md. |
| **Client** | **Login and redirect:** Read client/src/pages/DevLogin.tsx (native form POST to /api/auth/test-login?), client/src/main.tsx (redirectToLoginIfUnauthorized on any tRPC 401), client/src/const.ts (getLoginUrl). **Post-login:** Dashboard and DashboardLayout use useAuth() and trpc queries; any 401 from auth.me, profile.get, etc. triggers redirect to /login. Consider: (1) Not redirecting to login on 401 when we just landed from a full-page navigation (e.g. allow one retry or short delay for cookie to be sent), or (2) Ensuring the first request after login definitely sends the cookie. Apply minimal fix so live-browser sign-in stops looping. Re-run client build if you change code. Append to OPENCLAW_HANDOFF.md.    |
| **Ship**   | Run `pnpm run ship:check:full`. If anything fails, fix per docs/DEBUGGING.md and re-run until green (or document what’s blocked). Append result to OPENCLAW_HANDOFF.md. Do not commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Review** | Read the flow: Roast page → “Build my Master Profile” or Sign in → /login → POST test-login → 302 to /dashboard → dashboard loads and runs auth.me + profile.get + others. Identify the single most likely cause of the loop (cookie not sent, 401 on first batch, or redirect logic). Suggest one minimal change that would fix it (with file and change). Append to OPENCLAW_HANDOFF.md. Do not apply unless you’re sure; prefer Server/Client to apply.                                                                                                                                                                                                                                                                                  |
| **Docs**   | After other agents have run (or in parallel): Read OPENCLAW_HANDOFF.md and this file. Append to OPENCLAW_HANDOFF.md a short “Orchestration summary” (3–5 bullets): current focus (lead-magnet sign-in), hypothesis (profile sections / 401 on first load), what each agent was asked to do, and “Review handoff entries below and merge fixes; then run ship:check:full and commit.” Do not edit application code.                                                                                                                                                                                                                                                                                                                          |

---

## One-shot prompt (paste to main or to each agent after role brief)

You can paste this once into **main** if you prefer one agent to coordinate, or use the table above to run Server, Client, Ship, Review, Docs in parallel.

```
Current focus: Lead-magnet sign-in. Users get stuck in a sign-in loop in the live browser (dashboard → back to login). Hypothesis: after adding master profile sections (awards etc.), more tRPC runs on first load; one 401 triggers redirect to login. Goal: debug and fix so Roast → Sign in → stay on dashboard works. Rebuild Roast/sign-in if needed. Read docs/OPENCLAW_ORCHESTRATION.md and run your lane: Server (auth/cookie + dashboard procedures), Client (DevLogin + 401 redirect logic), Ship (ship:check:full), Review (single best fix suggestion), Docs (orchestration summary). Apply minimal fixes; do not commit. Append your result to OPENCLAW_HANDOFF.md.
```

## “Work until fixed” prompt (paste into OpenClaw main or Ship/Client)

Use this when you want **OpenClaw to keep working until the solution is fixed**, not just one pass.

```
Lead-magnet sign-in and onboarding must work for a real user in the live browser. Your job is to work on this until it’s fixed.

1. Read OPENCLAW_HANDOFF.md (from the bottom) and docs/OPENCLAW_ORCHESTRATION.md for current focus and what’s already been tried.
2. Current state is in OPENCLAW_HANDOFF.md under “OpenClaw: work until fixed — current state.” Apply any remaining fixes, then verify.
3. Verify by running the human-style test: npx playwright test tests/human-style-roast-signup-onboarding.spec.ts --config=playwright.production.config.ts --headed --project=chromium-desktop (or run production E2E and confirm auth + onboarding flow pass).
4. If anything still fails or the user would get stuck (no clear direction after login, loop, wrong redirect): debug, fix, re-run from step 3. Repeat until the flow works.
5. After each run, append to OPENCLAW_HANDOFF.md (format in that file). When the flow works, append “OpenClaw: lead-magnet flow verified working” and stop.
Do not commit. User or Cursor will commit after review.
```

---

## After the orchestration

- **You or Cursor:** Read OPENCLAW_HANDOFF.md from the bottom. Merge Server + Client + Review; run `pnpm run ship:check:full`; commit.
- **Update this doc:** Set “Current focus” to the next priority or “None” when done.

---

## References

- Role briefs: [OPENCLAW_INTEGRATION.md](./OPENCLAW_INTEGRATION.md) § Multiple agents → Role brief
- Handoff: [OPENCLAW_HANDOFF.md](../OPENCLAW_HANDOFF.md)
- Context: [CONTEXT_FOR_NEW_CHAT.md](../CONTEXT_FOR_NEW_CHAT.md), [todo.md](../todo.md)
- Debug order: [DEBUGGING.md](./DEBUGGING.md)
