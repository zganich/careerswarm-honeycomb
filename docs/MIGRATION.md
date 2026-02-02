# How to Run Database Migrations

**New to this?** Use the step-by-step guide: **[RUN_MIGRATION_STEP_BY_STEP.md](RUN_MIGRATION_STEP_BY_STEP.md)** — copy-paste commands, no prior knowledge needed.

This guide explains how to apply database migrations (including the Master Profile new sections migration) when you're not sure how.

## Prerequisites

1. **MySQL is running** – Either locally (e.g. `brew services start mysql` on macOS) or a remote MySQL/TiDB instance you can reach.
2. **`.env` file exists** – Copy from `.env.example` if needed:
   ```bash
   cp .env.example .env
   ```
3. **`DATABASE_URL` is set in `.env`** – Example:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/your_database
   ```
   Replace `user`, `password`, `localhost:3306`, and `your_database` with your actual values.

## Run Migrations (Recommended)

From the project root:

```bash
pnpm db:migrate
```

This:

- Loads variables from `.env` (including `DATABASE_URL`)
- Runs **only** the migrate step (no schema diff, no interactive prompts)
- Applies any **pending** migrations in order (e.g. `0015_master_profile_new_sections.sql` if 0000–0014 are already applied)

If you see **ECONNREFUSED**: MySQL is not reachable. Check that the database is running and that `DATABASE_URL` (host, port, user, password) is correct.

## Alternative: Full Push (Generate + Migrate)

```bash
pnpm db:push
```

This generates new migrations from schema changes **and** runs migrations. Drizzle may prompt you (e.g. “create table” vs “rename table”); choose the option that matches your intent. Use `pnpm db:migrate` if you only want to apply existing migrations without generating or prompting.

## Manual Run of One Migration (Advanced)

If you prefer to run only the Master Profile migration SQL file yourself:

```bash
# Replace with your connection details
mysql -u your_user -p -h localhost your_database < drizzle/0015_master_profile_new_sections.sql
```

This applies only that file; it does not update Drizzle’s migration journal, so use this only if you understand the implications.
