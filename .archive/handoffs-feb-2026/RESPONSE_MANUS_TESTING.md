# Response to Manus Testing Update (Feb 2, 2026)

This doc answers the [MANUS_TESTING_UPDATE.md](../MANUS_TESTING_UPDATE.md) findings and questions.

---

## 1. Database migration – use `pnpm db:migrate` only

**Do not use `pnpm db:push` for initial setup.**

- **`pnpm db:push`** runs `drizzle-kit generate && drizzle-kit migrate` and prompts interactively for every table (“create or rename?”). That is why Manus saw 20+ prompts.
- **`pnpm db:migrate`** runs `scripts/run-migrate.mjs`, which:
  - Ensures `userProfiles` and `certifications` exist (if needed for migration 0015).
  - Runs `drizzle-kit migrate` with `DATABASE_URL?multipleStatements=true` (required for MySQL).
  - Uses the existing journaled migrations in `drizzle/` with **no interactive prompts**.

**Correct command for Manus (and any fresh deploy):**

```bash
pnpm db:migrate
```

Ensure `DATABASE_URL` in `.env` points to your MySQL database before running.

---

## 2. Schema note: `userProfiles` vs `masterProfiles`

The error referred to a table `masterProfiles`. This codebase does **not** use a table named `masterProfiles`. Profile data is stored in:

- **`userProfiles`** – contact, summary, portfolio, preferences
- **`workExperiences`** – jobs
- **`achievements`** – achievements per work experience
- **`skills`**, **`education`**, **`certifications`**, **`superpowers`**, etc.

So after migrations, the tables to expect include `userProfiles`, `workExperiences`, `achievements`, `skills`, etc. (see `drizzle/schema.ts`). If a query or old code still references `masterProfiles`, that should be updated to use the current schema.

---

## 3. Error handling in onboarding (parseResumes)

- **Already in place:** The `onboarding.parseResumes` procedure in `server/routers.ts` is wrapped in try/catch and throws a `TRPCError` with a user-facing message on failure.
- **Change made:** At the start of `parseResumes`, we now check that `getDb()` is not null. If the database is unavailable, the procedure throws immediately with a clear message instead of “succeeding” without persisting data.

So:

- **Missing or wrong tables** → DB calls will throw; the existing catch turns that into a user-visible error.
- **DB not connected** (e.g. `getDb()` null) → New check throws so the UI does not show success when nothing was saved.

---

## 4. Answers to Manus questions

**Database migration strategy**  
Use **`pnpm db:migrate`** for fresh deployment. Do not use `db:push` for initial setup. Preserve existing data by only running new journaled migrations (no `drizzle-kit push --force` unless you intend to overwrite the DB).

**Error handling**  
Onboarding save failures (including DB errors) are caught, logged, and surfaced as a TRPCError so the user sees a clear message instead of a silent success.

**Testing priority**  
After `pnpm db:migrate` and a successful onboarding run: run Phase 1 (onboarding end-to-end), then Phase 2 (package generation: Tailor → Scribe → Assembler). See MANUS_PROMPT.md and docs/NEXT_STEPS.md.

---

## 5. Quick checklist for Manus after pull

1. `pnpm install`
2. Copy `.env.example` → `.env`, set `DATABASE_URL` (and other vars per MANUS_PROMPT.md).
3. **Run `pnpm db:migrate`** (not `db:push`).
4. `pnpm run verify-env`
5. `pnpm run build` then `pnpm start` (or `pnpm dev`).
6. Test onboarding (upload resume → extract → review → preferences) and confirm data on profile/dashboard.

Reference: [MANUS_PROMPT.md](../MANUS_PROMPT.md), [docs/NEXT_STEPS.md](NEXT_STEPS.md).
