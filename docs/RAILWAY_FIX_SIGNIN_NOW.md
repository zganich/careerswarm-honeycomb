# Fix sign-in 500 on production (run once)

Sign-in returns 500 because the production `users` table is missing columns added in migration 0016. The app expects them; the DB doesn't have them yet.

**Fastest fix:** Run this SQL against the production MySQL database (Railway dashboard → your MySQL service → **Data** or **Query** tab, or connect with any MySQL client using `DATABASE_URL` from Railway variables):

```sql
-- Migration 0016: application limits columns (run if sign-in returns 500)
ALTER TABLE `users` ADD `applicationsThisMonth` int DEFAULT 0 NOT NULL;
ALTER TABLE `users` ADD `applicationsResetAt` timestamp DEFAULT CURRENT_TIMESTAMP;
```

If you get "Duplicate column name", the columns already exist and you can skip.

After this, sign-in (POST `/api/auth/test-login`) should stop returning 500. Redeploying with the current repo will also run migrations on startup; this manual step fixes the current live deployment immediately.
