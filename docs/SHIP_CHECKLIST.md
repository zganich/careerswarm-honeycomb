# Ship Checklist — CareerSwarm

**Use this when deploying or handing off to production.**

**New to this repo?** Use **[SHIP_STEP_BY_STEP.md](./SHIP_STEP_BY_STEP.md)** first — numbered steps with copy-paste commands and exact instructions for MySQL, migrate, OAuth, and env.

---

## Before deploy

- [ ] **MySQL available** — App and migrations need a running MySQL instance and `DATABASE_URL` in `.env`.
- [ ] **Run migrations** — From repo root: `pnpm db:migrate`. See [MANUS_RUN_MIGRATION.md](./MANUS_RUN_MIGRATION.md).
- [ ] **OAuth redirect URIs** — Production (and preview, if needed) callback URL whitelisted on Manus. See [OAUTH_WHITELIST_MANUS.md](./OAUTH_WHITELIST_MANUS.md).
- [ ] **Env vars** — Copy from `.env.example`, set `DATABASE_URL`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, and any PostHog/AI keys. Optional: `pnpm run verify-env` (if script exists).

---

## Verify

- [ ] `pnpm check` — passes
- [ ] `pnpm run build` — passes
- [ ] `pnpm test` — Vitest passes (e.g. 90 passed, 35 skipped)
- [ ] `npx playwright test` — E2E passes (e.g. 27 passed, 4 skipped; auth tests may skip without MySQL)

---

## After deploy

- [ ] Open production URL, hit `/dashboard` — redirects to OAuth or login.
- [ ] Sign in (OAuth or Dev Login on preview), confirm dashboard loads.
- [ ] Optional: hit `/roast`, submit a resume, confirm result and feedback buttons.

---

## Quick refs

| Task | Doc / Command |
|------|----------------|
| DB migration when MySQL is up | [MANUS_RUN_MIGRATION.md](./MANUS_RUN_MIGRATION.md) — `pnpm db:migrate` |
| OAuth redirect loop / whitelist | [OAUTH_WHITELIST_MANUS.md](./OAUTH_WHITELIST_MANUS.md) |
| Dev login (preview / local) | [HANDOFF_AUTO_SESSION.md](./HANDOFF_AUTO_SESSION.md) — `/login` |
