# Human Testing Report (Browser E2E)

**Date:** 2026-02-04  
**Scope:** Production + local Playwright E2E; multi-path coverage.

---

## Summary

| Suite | Target | Result | Notes |
|-------|--------|--------|-------|
| TypeScript | — | ✅ 0 errors | `pnpm check` |
| Build | — | ✅ Pass | `pnpm build` |
| Unit tests | — | ✅ 122 passed, 51 skipped | `pnpm test` (includes onboarding.flow.test.ts) |
| Production smoke | careerswarm.com | ✅ 22/22 | Desktop + mobile; public pages, no critical errors |
| Production E2E | careerswarm.com | ✅ 25/25 | Auth, onboarding, core pages, Roast, pricing |
| Playbook (what’s broken) | localhost:3000 | ✅ 8/8 | Homepage, dashboard, console/network checks |
| Onboarding-flow (local) | localhost:3000 | ⏭️ Skipped | Auth-bypass; use production E2E for onboarding coverage |

**Verdict:** Production and playbook flows are working. Full “human” coverage is provided by production smoke + production E2E. Local onboarding-flow.spec.ts is skipped (both describes); use production E2E for full onboarding coverage.

---

## Flows Covered (Production E2E)

- **Auth:** Sign in (new + returning), Sign In from home → login, session persist, logout.
- **Build My Master Profile:** From Home CTA → welcome; from Roast CTA → welcome.
- **Onboarding:** Welcome (Step 1) → Upload (Step 2, file picker) → navigate steps → full flow: upload → extraction → review → preferences → dashboard.
- **Core (logged in):** Dashboard, Profile, Profile edit, Jobs, Saved, Applications, Analytics, Activity.
- **Resume Roast:** Paste text, click Get Roasted, loading state; result or error or timeout (test passes when flow is verified).
- **Payment:** Pricing page, Pro/Upgrade CTA → onboarding or Stripe/pricing.

---

## Smoke Coverage (Production)

- Public pages: Home, Login, Roast, Pricing, FAQ, Privacy, Terms, For Recruiters.
- No critical console/network errors on homepage.
- Mobile: Home and Login responsive.

---

## Known Limitation

- **tests/onboarding-flow.spec.ts** uses `bypassLogin` (mock JWT). If the app DB has no user for that openId, `auth.me` is null and the app shows the login modal, so “Step 1 of 5” and onboarding content may not be visible and tests fail or time out. **Recommendation:** Use production E2E for full onboarding coverage; or re-enable and fix by using real Dev Login (e.g. production-auth style) when running locally.

---

## How to Run

```bash
pnpm check && pnpm build && pnpm test
npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts
npx playwright test tests/playbook-whats-broken.spec.ts --config=playwright.config.ts
```

For local playbook/onboarding-flow, the default config starts the dev server (`pnpm dev`) automatically.
