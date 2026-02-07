# Next Steps (Post-Commit Feb 2, 2026)

**Latest commit:** Merge pushed to `origin/main` (Dev Login + OAuth conflict resolution + revalidation doc).

---

## For Cursor / Local Dev

1. **Fix remaining TypeScript errors (optional)**  
   `pnpm run check` still reports errors from db/schema drift (GTM, JD builder, ParsedResume, `application.pivotAnalysis`, etc.). Align `server/db.ts` exports and types with `server/routers.ts` and related agents, or add stubs/types as needed.

2. **Optional: make Vitest failures green**
   - Set `OPENAI_API_KEY` (or Forge key) and DB for agent-metrics and analytics tests.
   - Set `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` for e2e-credentials, or skip that suite.
   - Ensure PDF tooling is on PATH for assembler test, or mock it.
   - Profile-sections tests expect DB methods like `createLanguage`, `getUserLanguages`; align with actual `db.ts` API or skip.

3. **Playwright**  
   Run with longer timeout or fewer workers if needed:  
   `npx playwright test --reporter=line` or increase timeout in `playwright.config.ts`.

---

## Reference

- **Test status:** [TEST_RESULTS.md](../TEST_RESULTS.md) (including Re-validation Feb 2)
- **Ship checklist:** [docs/SHIP_STEP_BY_STEP.md](SHIP_STEP_BY_STEP.md)
