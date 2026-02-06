# CareerSwarm – Context for New Chat

**Purpose:** Copy or reference this file when starting a new chat to restore project context quickly. Update it as the project and handoff state change.

---

## Standing Instructions (ALWAYS FOLLOW)

1. **CLI-First:** Use CLI every time there is access (Railway CLI, Cloudflare API, curl, Sentry CLI, gh, git, etc.). Use dashboards only when CLI/API does not support the action.

2. **Context Window Management:** At **50-60% context usage**, proactively:
   - Summarize all work done in the session
   - Update this file with current state
   - Commit all changes
   - Inform user to start a new chat

3. **Autonomy:** Proceed with fixes, improvements, and implementations within project scope without asking permission.

4. **Do not hand off technical work:** Run commands, edit `.env`/config, run tests, and verify yourself. Do not ask the user to run steps or edit env; use Railway CLI where possible and keep README/CONTEXT accurate for what the assistant does.

---

## What It Is

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline (Scout → Qualifier → Profiler → Tailor → Scribe → Assembler → Success Predictor). **Resume Roast** (public, no auth), application tracker (Kanban), package generation (resume / cover letter / LinkedIn). Optional GTM pipeline worker (requires Redis).

## Stack

- **Frontend:** React 19, Tailwind 4, tRPC, shadcn/ui, wouter (routing)
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Railway). Schema: `drizzle/schema.ts` (23 tables); access via `server/db.ts`. Migrations: `drizzle/*.sql` + `drizzle/meta/_journal.json`.
- **Auth:** Email-only sign-in at `/login` (no OAuth/Manus). User enters email → session cookie; `returnTo` supported. Optional OAuth when `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are set. See `docs/CRITICAL_SETUP_CHECKLIST.md` § Auth.
- **AI:** OpenAI API only (`OPENAI_API_KEY`). GPT-4o-mini default. Roast: `server/roast.ts` → `server/_core/llm.ts` (`invokeLLM`).
- **Deploy:** Railway (Dockerfile, Node 20)

### Avoid cost/waste (production)

- **App boot** requires: `DATABASE_URL`, `JWT_SECRET` (validated in `server/_core/env.ts`). No OAuth required.
- **AI features (Roast, Tailor, Scribe)** require a **real** `OPENAI_API_KEY` in Railway (no placeholder). If missing or placeholder, AI calls fail and users see errors; fix: set variable in Railway → **redeploy** → verify with curl below.
- **Auth/onboarding** require a working MySQL DB (`DATABASE_URL`). Follow [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) so setup is done once and correctly.

## Live & Docs

- **App:** https://careerswarm.com
- **Checklist (env, auth, Sentry):** [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md)
- **Debugging (production-only, platform limits):** [docs/DEBUGGING.md](./docs/DEBUGGING.md)
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)
- **OpenClaw (parallel assistant):** [docs/OPENCLAW_INTEGRATION.md](./docs/OPENCLAW_INTEGRATION.md) — **installed and configured** (workspace = this repo, daemon on 18789, skill `skills/careerswarm/SKILL.md`). One-time: `openclaw configure` to add model auth. WebChat: http://127.0.0.1:18789/. Sync via this file and [todo.md](./todo.md). **Agents:** Ship (gate/monitor), Server, Client, Docs, **Review** (better code + explain why), **Business** (GTM, strategy, positioning, in-app `server/agents/gtm/`). **When the task is GTM, strategy, positioning, or improving the in-app business/GTM agents, recommend or hand off to the OpenClaw Business agent** for suggestions and reasoning; see [docs/BUSINESS_AGENT_IMPROVEMENTS.md](./docs/BUSINESS_AGENT_IMPROVEMENTS.md).

### Reference (for new chat)

- **[README.md](./README.md)** — Project overview, setup, commands, links to docs.
- **[todo.md](./todo.md)** — Current state, completed items, high-priority next steps, quick commands.

### Production-only failures

**Check [docs/DEBUGGING.md](./docs/DEBUGGING.md) first.** Rule: platform limits → env → minimal fix → instrumentation only if still stuck.

---

## Architecture: Resume Roast → Onboarding

- **Resume Roast** (`/roast`): Public. One page: textarea (min 50 chars), “Get Roasted”, “Build my Master Profile” (header + after result). API: `public.roast` → `server/roast.ts` → OpenAI; single error path → `SERVICE_UNAVAILABLE`. Client shows result (`data-testid="roast-result"`) or error (`data-testid="roast-error"`). **No DB persistence** for roast.
- **Build my Master Profile:** `setLocation("/onboarding/welcome")`.
- **Onboarding** (`/onboarding/welcome` → upload → extraction → review → preferences): Uses `useAuth()`. If not logged in → modal → `/login?returnTo=/onboarding/welcome`. After login, redirect to `returnTo`. All onboarding API procedures are `protectedProcedure`; DB: `users.onboardingStep` / `onboardingCompleted`, `uploadedResumes`, `userProfiles`, `targetPreferences` (see `server/db.ts`).
- **Auth:** `server/_core/oauth.ts` (email sign-in at `/api/auth/test-login`; optional OAuth callback when configured). Session cookie; `returnTo` in login body; redirect after login.

---

## Database Alignment

- **Schema source of truth:** `drizzle/schema.ts` (23 tables). All app access via `server/db.ts`; tables include `users`, `userProfiles`, `workExperiences`, `achievements`, `skills`, `uploadedResumes`, `superpowers`, `targetPreferences`, `opportunities`, `applications`, `savedOpportunities`, `applicationNotes`, `notifications`, `agentExecutionLogs`, `agentMetrics`, profile sections (`languages`, `volunteerExperiences`, `projects`, `publications`, `securityClearances`), `certifications`, `education`, `awards`.
- **Access:** All via `server/db.ts` (e.g. `getUserByOpenId`, `updateUserOnboardingStep`, `getUserProfile`, `upsertUserProfile`, resume upload/process, preferences save). Routers call `db.*` only; no raw SQL in routers.
- **Note:** `setUserReferredBy` in `db.ts` is a stub (no `referredBy` column on `users`); referral flywheel not persisted yet. Rest of schema and usage are aligned.

---

## Key Paths

| Area               | Paths                                                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resume Roast       | `server/roast.ts`, `server/routers.ts` (public.roast), `client/src/pages/ResumeRoast.tsx`                                                                                                                                                                                                                     |
| Onboarding         | `client/src/pages/onboarding/Welcome.tsx`, `Upload.tsx`, `Extraction.tsx`, `Review.tsx`, `Preferences.tsx`; API: `server/routers.ts` (onboarding.\*)                                                                                                                                                          |
| Auth               | `server/_core/oauth.ts`, `client/src/pages/DevLogin.tsx` (Sign in), `client/src/_core/hooks/useAuth.ts`                                                                                                                                                                                                       |
| Server / env / LLM | `server/_core/index.ts`, `server/_core/env.ts`, `server/_core/llm.ts`                                                                                                                                                                                                                                         |
| Database           | `drizzle/schema.ts`, `server/db.ts`, `drizzle/` migrations                                                                                                                                                                                                                                                    |
| Tests              | Unit: `pnpm test` (Vitest, 122 passing / 51 skipped). E2E: `tests/production-smoke.spec.ts` (22), `tests/production-e2e.spec.ts` (25), `tests/playbook-whats-broken.spec.ts` (8). Roast unit: `server/roaster.test.ts`. Human testing report: [docs/HUMAN_TESTING_REPORT.md](./docs/HUMAN_TESTING_REPORT.md). |
| Monitoring         | `scripts/monitor.mjs`, `scripts/test-cloudflare-api.mjs`. See [docs/MONITORING.md](./docs/MONITORING.md).                                                                                                                                                                                                     |
| CI/CD              | `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                    |
| Docs               | `docs/` (active); `.archive/` (obsolete)                                                                                                                                                                                                                                                                      |

---

## Production Status

| Item           | Status                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| Dockerfile     | ✅ Node 20                                                                                   |
| OPENAI_API_KEY | Set in Railway (roast works when key + egress OK)                                            |
| Dev Login      | ✅ Enabled (dev/preview)                                                                     |
| E2E / Smoke    | Run against production                                                                       |
| DNS            | ✅ careerswarm.com                                                                           |
| SENTRY_DSN     | ✅ Set in Railway (careerswarm-backend). See [docs/SENTRY_SETUP.md](./docs/SENTRY_SETUP.md). |
| Redis          | ⏭️ Optional (GTM worker)                                                                     |

## Verify (CLI)

```bash
railway status
railway logs
railway logs | grep -E "LLM|OpenAI"

# Roast API (resumeText ≥50 chars)
curl -s -X POST https://careerswarm.com/api/trpc/public.roast \
  -H "Content-Type: application/json" \
  -d '{"json":{"resumeText":"Software Engineer with 5 years experience at Google. Led team of 8. Increased performance by 40%."}}'
```

## Commands

```bash
pnpm dev
pnpm run monitor        # GitHub CI, Railway, app health, Cloudflare (CLI)
pnpm run monitor:watch  # Poll 60s, macOS notifications on failures
pnpm run sentry:login   # Authenticate Sentry CLI; pnpm run sentry:info to verify
pnpm run test:cloudflare
pnpm build
pnpm start
pnpm check
pnpm lint
pnpm format:check       # Prettier check only
pnpm precommit          # Before commit: secrets scan + check + format:check + lint
pnpm test

npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts
npx playwright test tests/playbook-whats-broken.spec.ts --config=playwright.config.ts

railway status | logs | variable list | redeploy | up | open
```

---

---

## Last Session Summary (2026-02-06)

### Most recent (this session)

- **Pre-commit & lint:** `pnpm precommit` runs `git secrets --scan`, `pnpm check`, `pnpm format:check`, `pnpm lint`. Scripts added: `format:check`, `lint`, `lint:fix`. ESLint 9 + typescript-eslint + React (flat config in `eslint.config.js`); browser-extension and `client/public` ignored. Many rules set to warn so CI passes; can tighten over time. CI: Lint step and `format:check` in lint-and-typecheck job.
- **Sentry:** Added @sentry/cli (devDep), `pnpm run sentry:login` and `pnpm run sentry:info`. Exact setup docs: [docs/SENTRY_SETUP.md](./docs/SENTRY_SETUP.md) and [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) — use project **careerswarm-backend**, DSN set in Railway via `railway variable set`. Fallback in docs if `sentry:info` fails. Source maps section added (optional upload for readable stack traces).
- **Monitor:** CI treated as OK when latest run is **success** or **in progress** (only fail when latest completed with failure). Error handling: consistent return shape from `githubStatus()`, notifications only for real failures.
- **CONTEXT:** Reference section added (README.md, todo.md). Production Status: SENTRY_DSN set in Railway; Redis optional. Commands: precommit, lint, format:check.
- **CI fix (earlier this period):** Stripe router test handles tRPC-wrapped errors (`e.cause?.message`) so CI passes when Stripe not configured.

### Changes Made (earlier):

1. **CLI monitoring (Feb 5):** `pnpm run monitor` / `monitor:watch`, `scripts/monitor.mjs`; `pnpm run test:cloudflare`, Cloudflare API script; MONITORING.md, README, CONTEXT updated. Duplicate Railway project removed.
2. **Auth: email-only** – Removed Manus/OAuth requirement. Sign-in at `/login` (email → session). `OAUTH_SERVER_URL` no longer required for app boot. Server: `server/_core/env.ts`, `oauth.ts`, `sdk.ts`. Client: DevLogin → “Sign in”, all Sign In links → `/login`; Welcome/Home/DashboardLayout updated. Docs and `.env.example` updated.
3. **Rules/docs** – “Do not hand off technical work” in `.cursorrules` and CONTEXT; README/todo/CONTEXT aligned; cost-avoidance and OPENAI_API_KEY steps clarified.
   **Roaster test** – 20s timeout for roast integration test in `server/roaster.test.ts`.
   **E2E** – "From Roast: Build my Master Profile → welcome" fixed (data-testid on Roast page, fallback if CTA not visible). Playwright production reporter outputFolder → `playwright-report-production` to avoid path clash.
   **Ship Readiness Plan** – Phase 1: SHIP_CHECKLIST updated. Phase 2: Activity in nav; Complete Your Profile links to /achievements; achievement modal and superpower save verified.

### Status:

- **pnpm check / pnpm test / pnpm build**: passing. **Production smoke**: 22. **Production E2E**: 25. Roast E2E may timeout but passes on flow.
- **Roast API**: After deploy, returns 503 + friendly message when LLM unavailable (not 500). If still 500: confirm deploy; `railway logs`; OPENAI_API_KEY/egress (see [docs/DEBUGGING.md](./docs/DEBUGGING.md)).

### Next Steps (for new chat)

- **Before commit:** Run `pnpm precommit` (secrets scan + typecheck + format check + lint). CI runs the same checks.
- **Before deploy:** Run `pnpm check`, `pnpm test`, `pnpm build`; then production smoke + E2E. See [docs/SHIP_CHECKLIST.md](./docs/SHIP_CHECKLIST.md).
- **Quick status:** `pnpm run monitor` (GitHub CI, Railway, app health, Cloudflare); `pnpm run test:cloudflare` to verify Cloudflare API.
- **When schema changes:** Run `pnpm db:migrate`; ensure migrations are committed and applied in Railway.
- **Optional:** Sentry alerts (see [docs/SENTRY_SETUP.md](./docs/SENTRY_SETUP.md)); Redis for GTM worker ([docs/OPTIONAL_INFRASTRUCTURE.md](./docs/OPTIONAL_INFRASTRUCTURE.md)).
- **Onboarding E2E:** Use `tests/production-e2e.spec.ts`; `onboarding-flow.spec.ts` is documented as skipped (see SHIP_CHECKLIST, HUMAN_TESTING_REPORT).
- **Backlog:** See [todo.md](./todo.md) for future enhancements (email automation, LinkedIn OAuth, agents, etc.).

### Production checklist

- OPENAI_API_KEY and DATABASE_URL in Railway; SENTRY_DSN set (careerswarm-backend). See [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md).

---

_Last updated: 2026-02-06. Start a new chat and use this file to restore context._
