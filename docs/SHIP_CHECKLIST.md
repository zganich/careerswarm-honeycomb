# Ship Checklist — CareerSwarm

**Use this when deploying or handing off to production.**

**New to this repo?** Use **[SHIP_STEP_BY_STEP.md](./SHIP_STEP_BY_STEP.md)** first — numbered steps with copy-paste commands and exact instructions for MySQL, migrate, and env.

---

## Before deploy

- [ ] **MySQL available** — App and migrations need a running MySQL instance and `DATABASE_URL` in `.env`.
- [ ] **Run migrations** — From repo root: `pnpm db:migrate`.
- [ ] **Auth** — Email-only sign-in at `/login`. No OAuth or Manus required. Optional: set `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` for OAuth.
- [ ] **Env vars** — Copy from `.env.example`. Required: `DATABASE_URL`, `JWT_SECRET`. For AI features (Roast, Tailor, Scribe): `OPENAI_API_KEY` (real key in Railway, no placeholder). Optional: `pnpm run verify-env`.

---

## Verify

- [ ] `pnpm check` — passes
- [ ] `pnpm run build` — passes
- [ ] `pnpm test` — Vitest passes (e.g. 122 passed, 51 skipped)
- [ ] `npx playwright test` — E2E passes (production smoke + E2E vs careerswarm.com; see [HUMAN_TESTING_REPORT.md](./HUMAN_TESTING_REPORT.md))

---

## After deploy

- [ ] Open production URL, hit `/dashboard` — redirects to login.
- [ ] Sign in at `/login` (email), confirm dashboard loads.
- [ ] Optional: hit `/roast`, submit a resume (≥50 chars), confirm result and feedback buttons.

---

## Quick refs

| Task | Doc / Command |
|------|----------------|
| DB migration when MySQL is up | `pnpm db:migrate` |
| Auth (email-only) | `/login`; no OAuth required |
| OPENAI_API_KEY | Set in Railway Variables; redeploy required |
| Dev login (preview / local) | `/login` (Dev Login enabled when `ENABLE_DEV_LOGIN=true` or non-production) |
| Full onboarding E2E | Use `tests/production-e2e.spec.ts`; `tests/onboarding-flow.spec.ts` is skipped (auth-bypass user not in DB). |
