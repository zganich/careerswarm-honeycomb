# Run the migration (quick)

The migration updates your database with the new Master Profile tables and columns. You need **MySQL running** and **DATABASE_URL** set in `.env`, then one command.

---

## 1. Start MySQL (Mac with Homebrew)

If MySQL isn’t running yet:

```bash
brew services start mysql
```

(If MySQL isn’t installed: `brew install mysql` then `brew services start mysql`.)

---

## 2. Create the database (one-time)

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS careerswarm;"
```

If that asks for a password, use: `mysql -u root -p` and enter your MySQL password, then run:

```sql
CREATE DATABASE IF NOT EXISTS careerswarm;
```

---

## 3. Set DATABASE_URL in `.env`

In the project root, open `.env` and set:

```env
DATABASE_URL="mysql://root@localhost:3306/careerswarm"
```

If your MySQL user has a password:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/careerswarm"
```

Save the file.

---

## 4. Run the migration

In the project root:

```bash
pnpm db:migrate
```

If it finishes with no error, you’re done. If you see **ECONNREFUSED**, MySQL isn’t running or the host/port in `DATABASE_URL` is wrong—go back to step 1 and check that MySQL is running (`brew services list`).

---

**More detail:** [RUN_MIGRATION_STEP_BY_STEP.md](RUN_MIGRATION_STEP_BY_STEP.md)
