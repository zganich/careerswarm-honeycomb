# Manus: Run CareerSwarm DB migration

**Request:** Run the database migration so the app has the new Master Profile tables and columns. The app expects this migration to be applied before deploy.

---

## Where the migration file is

The migration file **is in the repo** at:

**`drizzle/0015_master_profile_new_sections.sql`**

It adds: 3 columns to `userProfiles`, 1 column to `certifications`, and 5 new tables (`languages`, `volunteerExperiences`, `projects`, `publications`, `securityClearances`). After pulling the latest `main`, it will be in the `drizzle/` folder. Drizzle’s `pnpm db:migrate` uses this file (and any other pending migrations in `drizzle/`) automatically.

---

## What to run

From the **CareerSwarm repo root** (where `package.json` and `.env` live), with **MySQL running** and **`DATABASE_URL`** set in `.env`:

```bash
pnpm db:migrate
```

That runs Drizzle’s migrate step (no generate, no prompt). It applies all pending migrations, including **0015_master_profile_new_sections**.

---

## Requirements

- **MySQL** must be running and reachable at the host/port in `DATABASE_URL`.
- **`.env`** in the repo root must contain `DATABASE_URL` (e.g. `mysql://user:password@host:3306/database`).
- **Node/pnpm** available so `pnpm db:migrate` runs (same as app runtime).

---

## If it fails

- **ECONNREFUSED** → MySQL isn’t running or `DATABASE_URL` host/port is wrong. Start MySQL or fix the URL.
- **DATABASE_URL is not set** → Load `.env` in the same directory where you run the command, or export `DATABASE_URL` before running.

---

## After it succeeds

No follow-up needed. The app can then use the new tables/columns. Optional: run `pnpm verify-env` before starting the app to confirm required env vars.
