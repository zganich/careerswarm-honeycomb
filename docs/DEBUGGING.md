# Debugging Runbook

**Rule:** For **production-only** failures, check **platform limits and env first**. Do not add instrumentation or large code changes until you’ve done that.

**Quick status check:** `pnpm run monitor` — GitHub CI, Railway, app health, Cloudflare. See [MONITORING.md](./MONITORING.md).

---

## Order of operations (production-only bugs)

1. **Platform limits** – Request/timeout/keep-alive for your host (e.g. Railway: [public networking](https://docs.railway.app/reference/public-networking)).
2. **Env / config** – Missing or wrong vars in production (e.g. `OPENAI_API_KEY`). Use `railway variable list` / `railway logs`.
3. **Minimal code fix** – Cap timeouts, fix config, or surface a clear error. No logging/instrumentation until the fix is in.
4. **Instrumentation only if still stuck** – Then add targeted logs; prefer platform logs over local-only files.

---

## Quick reference: symptom → cause → fix

| Symptom                                                       | Likely cause                                                                                     | Fix / check                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resume Roast: "fetch failed"** in production, works locally | Railway proxy **keep-alive 60s**; request takes longer                                           | LLM timeout is capped at **55s** in `server/_core/llm.ts`. Do not increase above ~55s without checking Railway docs. If still failing: `railway logs` for OpenAI errors; confirm `OPENAI_API_KEY` set and redeploy.                                                                                                                                                                 |
| **Resume Roast: 404** on `/roast` in dev                      | Vite middleware mode doesn’t serve SPA routes                                                    | SPA fallback runs **before** Vite in `server/_core/vite.ts` (GET routes with no dot → index.html). Ensure you’re on the port the dev server prints.                                                                                                                                                                                                                                 |
| **Resume Roast / AI: 401 or "isn't available"**               | `OPENAI_API_KEY` missing or invalid in production                                                | `railway logs` will show "Incorrect API key provided" / invalid_api_key. Regenerate key at [platform.openai.com](https://platform.openai.com/api-keys), set in Railway → Variables, **redeploy**. See [CRITICAL_SETUP_CHECKLIST.md](./CRITICAL_SETUP_CHECKLIST.md) § OPENAI_API_KEY.                                                                                                |
| **ERR_ERL_UNEXPECTED_X_FORWARDED_FOR** in logs                | Express `trust proxy` not set; app behind Railway proxy                                          | Fixed: `app.set("trust proxy", 1)` in `server/_core/index.ts`. Redeploy.                                                                                                                                                                                                                                                                                                            |
| **Auth / login fails in production**                          | `DATABASE_URL` or `JWT_SECRET` wrong/missing                                                     | [CRITICAL_SETUP_CHECKLIST.md](./CRITICAL_SETUP_CHECKLIST.md) § Auth and env.                                                                                                                                                                                                                                                                                                        |
| **Auth 500 + "Unknown column 'applicationsThisMonth'"**       | Migration `0016_application_limits` not applied on production DB                                 | Migrations run on deploy (`pnpm db:migrate && pnpm start`). If this error appears: (1) Redeploy so the container runs migrate (DB hostname is only resolvable inside Railway). (2) If deploy already had 0016, check build logs that migrate ran; if it failed, run the two `ALTER TABLE` statements from `drizzle/0016_application_limits.sql` in Railway’s MySQL shell / one-off. |
| **CORS "Rejected origin: null"** on login / API               | Browser sent `Origin: null` (e.g. same-origin form POST); we only allowed missing origin         | Fixed in `server/_core/index.ts`: allow `origin === "null"` (string) in addition to falsy `origin`. Redeploy.                                                                                                                                                                                                                                                                       |
| **Railway healthcheck failure** (service unavailable)         | Probe used `/` which may not respond before timeout; or server not listening during `db:migrate` | Fixed: dedicated `GET /health` in `server/_core/index.ts` (returns 200 immediately); `railway.json` → `healthcheckPath`: `"/health"`. Start command runs migrate in background (`pnpm db:migrate & pnpm start`) so server listens immediately; server binds to `0.0.0.0`. Redeploy. If still failing, check deploy logs for migrate errors.                                         |
| **"Session verification failed" / JWT signature** in logs     | Old cookie (signed with previous `JWT_SECRET`) or secret changed                                 | Expected after deploy or secret rotation. User re-logs in; no code fix. Do not change `JWT_SECRET` in production unless you’re okay invalidating all sessions.                                                                                                                                                                                                                      |
| **Works locally, fails in prod** (generic)                    | Platform timeout, env, or host-specific behavior                                                 | 1) Check platform timeout/limit docs. 2) `railway logs`. 3) Compare prod env to local `.env`.                                                                                                                                                                                                                                                                                       |

---

## Key limits (Railway)

- **Proxy keep-alive:** 60s. The server must respond before the proxy closes the connection.
- **HTTP request max:** 15 min (irrelevant if keep-alive closes first).

Ref: [Railway Public Networking](https://docs.railway.app/reference/public-networking).

---

## Where things live

- **Roast API:** `server/roast.ts` → `server/_core/llm.ts` (`invokeLLM`). Timeout: `LLM_REQUEST_TIMEOUT_MS` in `llm.ts`.
- **Roast client:** `client/src/pages/ResumeRoast.tsx`. Errors: `client/src/lib/error-formatting.ts` (`getUserFriendlyMessage`).
- **Deploy handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](../RAILWAY_DEPLOYMENT_HANDOFF.md).
