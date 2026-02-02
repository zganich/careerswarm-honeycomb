# CareerSwarm — Step-by-Step: Get It Running and Shipped

**Start here.** If other docs are confusing, follow this file only. Everything you can run is copy-paste below; the two things only you can do (MySQL and Manus whitelist) have exact step-by-step instructions.

---

## Two things that need you (plain English)

**1. A database for the app**

The app stores users, profiles, and jobs in a database. It uses a kind of database called **MySQL**. So you need:

- **A MySQL database running somewhere** (on your machine, in Docker, or a hosted one from Manus/your host), **and**
- A connection string (URL) that tells the app how to reach it. You put that in `.env` as `DATABASE_URL`.

If you don't have MySQL yet, **Step 2** below gives you a one-line Docker command to start one, or how to use a URL someone gave you. After that, **Step 3** runs the migration so the app's tables exist.

**2. Telling Manus "this app is allowed to handle sign-in"**

When someone clicks "Sign in" in CareerSwarm, they're sent to Manus to log in, then sent back to your app. Manus only sends them back to URLs you've said are allowed (for security). So you have to **add your app's callback URL to the list of allowed URLs in the Manus dashboard**. That's what "whitelisting the redirect URI" means.

If you skip this, "Sign in" can loop or fail. You can still use the app by going to **/login** and using "Dev Login" (no Manus). **Step 5** below tells you exactly where to add the URL in Manus.

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

### Option B — You already have a MySQL URL (e.g. from Manus/host)

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

- If it succeeds: you’re done with DB. Go to Step 4.
- If you see **ECONNREFUSED**: MySQL is not running or `DATABASE_URL` is wrong. Check Step 2 (start MySQL or fix the URL).
- If you see **DATABASE_URL is not set**: Make sure you saved `.env` in the project root and that the line `DATABASE_URL=...` has no spaces around `=`.

---

## Step 4: Set the rest of the required env vars in `.env`

Open `.env` and set these. Get the values from your Manus dashboard / team:

| Variable | What to put | Example |
|----------|------------------|--------|
| `JWT_SECRET` | A long random string (at least 32 characters). Used to sign session cookies. | `JWT_SECRET="my-super-secret-key-at-least-32-chars-long"` |
| `OAUTH_SERVER_URL` | Manus OAuth server URL. | `OAUTH_SERVER_URL="https://oauth.manus.im"` (or the URL Manus gives you) |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API key (for LLM/Resume Roast, etc.). | `BUILT_IN_FORGE_API_KEY="your-forge-api-key"` |

**Frontend (OAuth “Sign in” link):** So the app knows where to send users to log in:

| Variable | What to put | Example |
|----------|------------------|--------|
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth portal base URL (same “family” as OAUTH_SERVER_URL). | `VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"` |
| `VITE_APP_ID` | Your app id in Manus. | `VITE_APP_ID="careerswarm"` |

If you skip `VITE_OAUTH_PORTAL_URL`, the app still runs; “Sign in” will not go to Manus and users can use **Dev Login** at `/login` (see HANDOFF_AUTO_SESSION.md).

---

## Step 5: Whitelist the OAuth redirect URI in Manus (so “Sign in” works)

This fixes the OAuth redirect loop. Only you can do this in the Manus dashboard.

1. Log in to **Manus** (the place where you manage your app / OAuth).
2. Open the **app** or **project** that is CareerSwarm.
3. Find the **OAuth** or **Auth** or **Redirect URIs** / **Allowed callbacks** section (name may vary).
4. Add this **exact** URL (replace the domain with your real app URL):
   - **Production:** `https://YOUR_PRODUCTION_DOMAIN/api/oauth/callback`  
     Example: `https://careerswarm.example.com/api/oauth/callback`
   - **Preview (e.g. Manus preview):** `https://YOUR_PREVIEW_HOST/api/oauth/callback`  
     Example: `https://careerswarm-abc123.manus.app/api/oauth/callback`
   - **Local dev (optional):** `http://localhost:3000/api/oauth/callback` (use the port your app uses).
5. Save.

If you don’t whitelist: the app still runs; use **Dev Login** at `/login` to sign in without OAuth (see HANDOFF_AUTO_SESSION.md).

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

Then open the URL it prints (e.g. `http://localhost:3000`). Go to `/dashboard`; sign in with OAuth or use **Dev Login** at `/login` if OAuth isn’t set up yet.

**Production (after you’ve run `pnpm run build`):**

```bash
pnpm start
```

Use the same URL and port your server is configured for (e.g. `PORT=3000` in `.env`).

---

## Quick reference

| I want to… | Do this |
|------------|--------|
| Run the app locally | Step 1 → 2 → 3 → 4 → 6 → 8 (Step 5 when you want OAuth). |
| Fix “ECONNREFUSED” on migrate | Step 2: start MySQL or fix `DATABASE_URL`. |
| Fix OAuth redirect loop | Step 5: whitelist `https://YOUR_DOMAIN/api/oauth/callback` in Manus. |
| Sign in without OAuth (preview/local) | Use **Dev Login**: go to `/login`, enter any email. |
| See what env vars are required | Run `pnpm run verify-env` or read Step 4. |

---

## More detail (if you need it)

- **Database migration:** [MANUS_RUN_MIGRATION.md](./MANUS_RUN_MIGRATION.md)  
- **OAuth redirect URIs:** [OAUTH_WHITELIST_MANUS.md](./OAUTH_WHITELIST_MANUS.md)  
- **Dev Login and handoff context:** [HANDOFF_AUTO_SESSION.md](./HANDOFF_AUTO_SESSION.md)  
- **Short deploy checklist:** [SHIP_CHECKLIST.md](./SHIP_CHECKLIST.md)
