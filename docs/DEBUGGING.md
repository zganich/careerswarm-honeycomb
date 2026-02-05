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

| Symptom | Likely cause | Fix / check |
|--------|----------------|-------------|
| **Resume Roast: "fetch failed"** in production, works locally | Railway proxy **keep-alive 60s**; request takes longer | LLM timeout is capped at **55s** in `server/_core/llm.ts`. Do not increase above ~55s without checking Railway docs. If still failing: `railway logs` for OpenAI errors; confirm `OPENAI_API_KEY` set and redeploy. |
| **Resume Roast: 404** on `/roast` in dev | Vite middleware mode doesn’t serve SPA routes | SPA fallback runs **before** Vite in `server/_core/vite.ts` (GET routes with no dot → index.html). Ensure you’re on the port the dev server prints. |
| **Resume Roast / AI: 401 or "isn't available"** | `OPENAI_API_KEY` missing or invalid in production | Set in Railway → Variables; **redeploy**. See [CRITICAL_SETUP_CHECKLIST.md](./CRITICAL_SETUP_CHECKLIST.md) § OPENAI_API_KEY. |
| **Auth / login fails in production** | `DATABASE_URL` or `JWT_SECRET` wrong/missing | [CRITICAL_SETUP_CHECKLIST.md](./CRITICAL_SETUP_CHECKLIST.md) § Auth and env. |
| **"Session verification failed" / JWT signature** in logs | Old cookie (signed with previous `JWT_SECRET`) or secret changed | Expected after deploy or secret rotation. User re-logs in; no code fix. Do not change `JWT_SECRET` in production unless you’re okay invalidating all sessions. |
| **Works locally, fails in prod** (generic) | Platform timeout, env, or host-specific behavior | 1) Check platform timeout/limit docs. 2) `railway logs`. 3) Compare prod env to local `.env`. |

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
