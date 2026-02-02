# Run the database migration (step-by-step)

Do these steps in order. Copy and paste the commands where it says to.

---

## Step 1: Open Terminal

- **Mac:** Press `Cmd + Space`, type **Terminal**, press Enter.
- **Windows:** Press `Win + R`, type `cmd`, press Enter.

---

## Step 2: Go to the project folder

Paste this and press Enter (use your real path if different):

```bash
cd /Users/jamesknight/GitHub/careerswarm-honeycomb
```

---

## Step 3: Check if you have MySQL

Paste this and press Enter:

```bash
mysql --version
```

- **If you see a version number** (e.g. `mysql  Ver 8.0.33`) → you have MySQL. Go to **Step 4**.
- **If you see "command not found"** → you need MySQL. Go to **Step 3b**.

### Step 3b: Install MySQL (Mac with Homebrew)

If you don’t have Homebrew, get it from https://brew.sh, then run:

```bash
brew install mysql
brew services start mysql
```

Wait until it says it’s started. Then run `mysql --version` again; you should see a version. Go to **Step 4**.

---

## Step 4: Create a database (one-time)

Paste this and press Enter. When it asks for a password, use your Mac login password if you’re not sure (often blank for a fresh install):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS careerswarm;"
```

If it says "Access denied", try without `-p`:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS careerswarm;"
```

If it still fails, skip to **Step 5** anyway; sometimes the app creates the DB or you already have one.

---

## Step 5: Make sure you have a `.env` file

Paste this and press Enter:

```bash
cp .env.example .env
```

That creates `.env` if it’s missing (if it already exists, that’s fine).

---

## Step 6: Set your database URL in `.env`

1. Open the project in your editor (e.g. Cursor / VS Code).
2. Open the file **`.env`** in the project root.
3. Find the line that starts with **`DATABASE_URL=`**.
4. Set it to one of these (pick the one that matches how you log in to MySQL):

**If you use a password with MySQL (you used `-p` in Step 4):**

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/careerswarm"
```

Replace `YOUR_MYSQL_PASSWORD` with your real MySQL password. If you don’t have one, try leaving it blank:

```env
DATABASE_URL="mysql://root:@localhost:3306/careerswarm"
```

**If you don’t use a password (you used `mysql -u root` without `-p`):**

```env
DATABASE_URL="mysql://root@localhost:3306/careerswarm"
```

5. Save the file.

---

## Step 7: Run the migration

Back in Terminal, paste this and press Enter:

```bash
pnpm db:migrate
```

- **If it runs and ends without an error** → you’re done. The migration ran.
- **If it says "ECONNREFUSED"** → MySQL isn’t running or the URL is wrong. Try:
  - **Mac:** `brew services start mysql` then run `pnpm db:migrate` again.
  - Check that `DATABASE_URL` in `.env` has no typos and the password is correct.
- **If it says "DATABASE_URL is not set"** → `.env` isn’t in the project root or the `DATABASE_URL` line is missing or commented out. Fix that and run `pnpm db:migrate` again.

---

## That’s it

After Step 7 succeeds, your database has the new Master Profile tables and columns. You don’t need to do anything else for the migration.
