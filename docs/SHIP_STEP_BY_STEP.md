# CareerSwarm — Step-by-Step: Get It Running and Shipped

**Start here.** If other docs are confusing, follow this file only. Everything you can run is copy-paste below. The one thing only you must do is **MySQL + DATABASE_URL**; OAuth is optional and only needed if you enable it.

---

## One thing that needs you (plain English)

**A database for the app**

The app stores users, profiles, and jobs in a database. It uses **MySQL**. You need:

- **A MySQL database running somewhere** (on your machine, in Docker, or a hosted one), **and**
- A connection string in `.env` as `DATABASE_URL`.

If you don't have MySQL yet, **Step 2** below gives you a one-line Docker command or how to use a URL someone gave you. **Step 3** runs the migration so the app's tables exist.

**Sign-in:** The app uses **email-only sign-in** at `/login` by default. You do **not** need OAuth. If you later set `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL`, you can use OAuth; then whitelist your callback URL in your OAuth provider (see Step 5, optional).

---

Everything else in this doc is copy-paste commands.

---

## Step 1: Copy environment file

In the project root (where `package.json` is):

```bash
cp .env.example .env
```

Then open `.env` in your editor. You will fill in values in the steps below.

---

## Step 2: Get MySQL and set DATABASE_URL

You need a running MySQL database and its connection URL in `.env`.

**If you have Docker:** run the two blocks below (start MySQL, then add one line to `.env`). Then go to Step 3.

### Option A — Docker (use this if you have Docker)

Run this once. It starts MySQL on port 3306 with a database named `careerswarm`:

```bash
docker run -d --name careerswarm-mysql \
  -e MYSQL_ROOT_PASSWORD=localdev \
  -e MYSQL_DATABASE=careerswarm \
  -p 3306:3306 \
  mysql:8
```

Then **open the file `.env`** in the project root (create it from `.env.example` if needed) and add or set this line — don't run it in the terminal:

```
DATABASE_URL="mysql://root:localdev@localhost:3306/careerswarm"
```

### Option B — You already have a MySQL URL (e.g. from a host)

In `.env` set:

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your real values. Example:

```bash
DATABASE_URL="mysql://myuser:mypass@db.example.com:3306/careerswarm"
```

### Option C — Install MySQL on your machine

- **macOS (Homebrew):** `brew install mysql` then `brew services start mysql`. Create a database: `mysql -u root -e "CREATE DATABASE careerswarm;"`  
  In `.env`: `DATABASE_URL="mysql://root:@localhost:3306/careerswarm"` (adjust user/password if you set one).
- **Windows:** Install MySQL from mysql.com, create a database, then set `DATABASE_URL` in `.env` with your user, password, host, and database name.

---

## Step 3: Run the database migration

From the project root:

```bash
pnpm db:migrate
```

- If it succeeds: you're done with DB. Go to Step 4.
- If you see **ECONNREFUSED**: MySQL is not running or `DATABASE_URL` is wrong. Check Step 2 (start MySQL or fix the URL).
- If you see **DATABASE_URL is not set**: Make sure you saved `.env` in the project root and that the line `DATABASE_URL=...` has no spaces around `=`.

---

## Step 4: Set the required env vars in `.env`

Open `.env` and set these **required** variables:

| Variable         | What to put                                                                  | Example                                                   |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| `JWT_SECRET`     | A long random string (at least 32 characters). Used to sign session cookies. | `JWT_SECRET="my-super-secret-key-at-least-32-chars-long"` |
| `OPENAI_API_KEY` | OpenAI API key (for Resume Roast, Tailor, Scribe).                           | `OPENAI_API_KEY="sk-..."`                                 |

**Optional — only if you want OAuth sign-in:** If you skip these, the app still runs and users sign in with **email at `/login`**.

| Variable                | What to put            | Example                                                  |
| ----------------------- | ---------------------- | -------------------------------------------------------- |
| `OAUTH_SERVER_URL`      | OAuth server URL.      | `OAUTH_SERVER_URL="https://your-oauth.example.com"`      |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal base URL. | `VITE_OAUTH_PORTAL_URL="https://your-oauth.example.com"` |
| `VITE_APP_ID`           | Your app id.           | `VITE_APP_ID="careerswarm"`                              |

Without OAuth vars, go to `/login` and sign in with any email (or use Dev Login when enabled).

---

## Step 5: (Optional) Whitelist the OAuth redirect URI

**Only if you set OAuth in Step 4.** If you're using email-only sign-in, skip this step.

When OAuth is configured, your provider only sends users back to URLs you've allowed. Add your app's callback URL in your OAuth provider's dashboard:

1. Log in to your **OAuth provider** (where you manage your app).
2. Open the **app** or **project** that is CareerSwarm.
3. Find **OAuth** / **Redirect URIs** / **Allowed callbacks**.
4. Add: `https://YOUR_DOMAIN/api/oauth/callback` (production), or `http://localhost:3000/api/oauth/callback` (local), with your real domain/port.
5. Save.

If you don't use OAuth: sign in at **/login** with email (or Dev Login).

---

## Step 6: Check that required env vars are set

From the project root:

```bash
pnpm run verify-env
```

- If it prints **Required env vars OK.** → go to Step 7.
- If it prints missing vars → add them to `.env` (see Step 4) and run again.

---

## Step 7: Build and test (optional but recommended)

From the project root:

```bash
pnpm check
pnpm run build
pnpm test
```

- All should pass (or only known skips). If something fails, fix the reported error (often env or DB).

---

## Step 8: Run the app

**Development (with hot reload):**

```bash
pnpm dev
```

Then open the URL it prints (e.g. `http://localhost:3000`). Go to `/dashboard`; you'll be sent to **/login**. Sign in with your email (or use **Dev Login** at `/login` if enabled).

**Production (after you've run `pnpm run build`):**

```bash
pnpm start
```

Use the same URL and port your server is configured for (e.g. `PORT=3000` in `.env`).

---

## Quick reference

| I want to…                               | Do this                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Run the app locally                      | Step 1 → 2 → 3 → 4 → 6 → 8. (Step 5 only if you use OAuth.)                        |
| Fix "ECONNREFUSED" on migrate            | Step 2: start MySQL or fix `DATABASE_URL`.                                         |
| Sign in (no OAuth)                       | Go to **/login**, enter your email (or use Dev Login when enabled).                |
| Fix OAuth redirect loop (if using OAuth) | Step 5: whitelist `https://YOUR_DOMAIN/api/oauth/callback` in your OAuth provider. |
| See what env vars are required           | Run `pnpm run verify-env` or read Step 4.                                          |

---

## More detail (if you need it)

- **Database migration:** `pnpm db:migrate`
- **OAuth (optional):** Step 5 above
- **Handoff context:** [CONTEXT_FOR_NEW_CHAT.md](../CONTEXT_FOR_NEW_CHAT.md)
- **Short deploy checklist:** [SHIP_CHECKLIST.md](./SHIP_CHECKLIST.md)
