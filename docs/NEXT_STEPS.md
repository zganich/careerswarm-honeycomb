# Next Steps (Post-Commit Feb 2, 2026)

**Latest commit:** Merge pushed to `origin/main` (Dev Login + OAuth conflict resolution + revalidation doc).

---

## For Manus

1. **OAuth whitelist (required for Phase 2 testing)**  
   In the Manus OAuth dashboard, add the redirect URI for the environment you use:
   - Preview/local: `http://localhost:3000/api/oauth/callback` (or your preview URL)
   - Production: `https://YOUR_DOMAIN/api/oauth/callback`

2. **Run app and validate**  
   Follow [MANUS_PROMPT.md](../MANUS_PROMPT.md): install, `.env`, **`pnpm db:migrate`** (do **not** use `db:push` — see [MANUS_TESTING_UPDATE.md](../MANUS_TESTING_UPDATE.md) and [docs/RESPONSE_MANUS_TESTING.md](RESPONSE_MANUS_TESTING.md)), `pnpm run verify-env`, `pnpm run build`, `pnpm start` (or `pnpm dev`). Use Dev Login at `/login` if OAuth isn’t whitelisted yet.

3. **Phase 2: Application package generation**  
   After auth works (OAuth or Dev Login), run the package-generation flow (e.g. `test-package-simple.mjs` or UI flow) and confirm Tailor/Scribe/Assembler and DB writes.

4. **Optional: full test run**  
   `pnpm test` (Vitest) and `npx playwright test` (increase timeout or use `--reporter=line`). See [TEST_RESULTS.md](../TEST_RESULTS.md) “Re-validation (Feb 2)” for current pass/fail summary.

---

## For Cursor / Local Dev

1. **Fix remaining TypeScript errors (optional)**  
   `pnpm run check` still reports errors from db/schema drift (GTM, JD builder, ParsedResume, `application.pivotAnalysis`, etc.). Align `server/db.ts` exports and types with `server/routers.ts` and related agents, or add stubs/types as needed.

2. **Optional: make Vitest failures green**  
   - Set `OPENAI_API_KEY` (or Forge key) and DB for agent-metrics and analytics tests.  
   - Set `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` for e2e-credentials, or skip that suite.  
   - Ensure `manus-md-to-pdf` is on PATH for assembler test, or mock it.  
   - Profile-sections tests expect DB methods like `createLanguage`, `getUserLanguages`; align with actual `db.ts` API or skip.

3. **Playwright**  
   Run with longer timeout or fewer workers if needed:  
   `npx playwright test --reporter=line` or increase timeout in `playwright.config.ts`.

---

## Reference

- **Handoff / run instructions:** [MANUS_PROMPT.md](../MANUS_PROMPT.md)  
- **Test status:** [TEST_RESULTS.md](../TEST_RESULTS.md) (including Re-validation Feb 2)  
- **Ship checklist:** [docs/SHIP_STEP_BY_STEP.md](SHIP_STEP_BY_STEP.md)
