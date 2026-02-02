# Prompt for Manus

**Give Manus this prompt (copy everything below the line):**

---

You are taking over the CareerSwarm repo (careerswarm-honeycomb). The app is ready to deploy. Do the following in order. All commands are run from the repo root (where `package.json` is).

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` in the repo root.
   - In `.env`, set these (use your real values; get OAuth/Forge URLs and keys from your Manus dashboard):
     - `DATABASE_URL` — MySQL connection string (e.g. `mysql://user:password@host:3306/careerswarm`). Use your hosted MySQL or the URL Manus provides.
     - `JWT_SECRET` — Any long random string (min 32 characters). Used to sign session cookies.
     - `OAUTH_SERVER_URL` — Your Manus OAuth server URL (e.g. `https://oauth.manus.im`).
     - `BUILT_IN_FORGE_API_KEY` — Your Manus Forge API key (for LLM / Resume Roast).
     - `VITE_OAUTH_PORTAL_URL` — Same as OAuth portal base URL (e.g. `https://oauth.manus.im`). Must be set at **build time** so the frontend “Sign in” link works.
     - `VITE_APP_ID` — Your app id in Manus (e.g. `careerswarm`). Must be set at **build time**.
   - For production: set `NODE_ENV=production` and `PORT` (e.g. `3000`) in `.env` or in your runtime environment.

3. **Database**
   - Ensure MySQL is running and reachable at the host in `DATABASE_URL`.
   - Run migrations once:
     ```bash
     pnpm db:migrate
     ```
   - If you see ECONNREFUSED, MySQL is not running or `DATABASE_URL` is wrong. Fix and run again.

4. **OAuth redirect URI (required for “Sign in” to work)**
   - In the **Manus dashboard**, open the app/project for CareerSwarm.
   - Find **OAuth** / **Auth** / **Redirect URIs** (or “Allowed callbacks”).
   - Add this URL (replace with the actual URL where the app will be hosted):
     - Production: `https://YOUR_DEPLOYMENT_DOMAIN/api/oauth/callback`
     - Preview: `https://YOUR_PREVIEW_HOST/api/oauth/callback` (add each preview URL you use).
   - Save. If you skip this, “Sign in” will redirect-loop; users can still use **Dev Login** at `/login` if you set `ENABLE_DEV_LOGIN=true`.

5. **Verify env**
   ```bash
   pnpm run verify-env
   ```
   - It must print “Required env vars OK.” If not, add the missing vars to `.env`.

6. **Build**
   - Ensure `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` are set in the environment (or in `.env`) when you run the build.
   ```bash
   pnpm run build
   ```

7. **Run**
   ```bash
   pnpm start
   ```
   - The app serves the frontend and API. Set `PORT` if needed (default 3000).
   - Open the app URL; go to `/dashboard`. Sign in via OAuth or, if OAuth isn’t ready, use **Dev Login** at `/login` (any email). Set `ENABLE_DEV_LOGIN=true` in production to allow Dev Login on preview URLs.

**Optional**
- Run tests: `pnpm test` (Vitest), `npx playwright test` (E2E). Auth E2E tests may skip without MySQL.
- Dev Login on preview: set `ENABLE_DEV_LOGIN=true` so users can sign in at `/login` without OAuth when the redirect URI isn’t whitelisted yet.

**If something fails**
- See `docs/SHIP_STEP_BY_STEP.md` for detailed steps (including Docker MySQL and OAuth whitelist).
- See `docs/OAUTH_WHITELIST_MANUS.md` for redirect URI format and whitelist details.

---

## Full step-by-step (same content, for reference in-repo)

The prompt above is the single source of truth for Manus. The steps are also listed here so Manus can follow them from this file.

| Step | Action |
|------|--------|
| 1 | `pnpm install` |
| 2 | Copy `.env.example` → `.env`. Set `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`. For production set `NODE_ENV=production`, `PORT`. |
| 3 | MySQL running. Run `pnpm db:migrate`. |
| 4 | In Manus dashboard: whitelist `https://YOUR_DEPLOYMENT_DOMAIN/api/oauth/callback` (and preview URLs if needed). |
| 5 | `pnpm run verify-env` → must say “Required env vars OK.” |
| 6 | `pnpm run build` (with `VITE_*` set). |
| 7 | `pnpm start`. Open app URL, use OAuth or Dev Login at `/login`. |

**Required env vars (see `.env.example`):**
- `DATABASE_URL` — MySQL URL
- `JWT_SECRET` — min 32 chars
- `OAUTH_SERVER_URL` — Manus OAuth server
- `BUILT_IN_FORGE_API_KEY` — Manus Forge API key
- `VITE_OAUTH_PORTAL_URL` — OAuth portal (build-time)
- `VITE_APP_ID` — App id (build-time)

**OAuth redirect URI to whitelist:** `https://<your-app-domain>/api/oauth/callback`

**Stack:** React 19, TypeScript, tRPC 11, Express 4, Drizzle ORM, MySQL, Tailwind 4. Server loads `.env` via `dotenv/config` at startup.
