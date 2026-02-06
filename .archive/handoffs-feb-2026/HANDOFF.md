# CareerSwarm — Handoff

**This repo is ready to hand off.** No further changes needed from the previous owner.

---

## Give Manus this

**Send Manus the repo and tell them to follow [MANUS_PROMPT.md](MANUS_PROMPT.md).**

Or copy the prompt from the top of **MANUS_PROMPT.md** (the block under “Give Manus this prompt”) and send that to Manus. It tells Manus exactly what to do: install, env, migrate, OAuth whitelist, build, start.

---

## Next owner: start here

| Goal                   | Do this                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Manus / deploy**     | Follow **[MANUS_PROMPT.md](MANUS_PROMPT.md)** — one file with all steps and the prompt to give Manus.         |
| **Run locally**        | Follow **[docs/SHIP_STEP_BY_STEP.md](docs/SHIP_STEP_BY_STEP.md)** (Docker MySQL, `.env`, migrate, dev login). |
| **Run on your domain** | Same as Manus: [MANUS_PROMPT.md](MANUS_PROMPT.md) or [docs/SHIP_CHECKLIST.md](docs/SHIP_CHECKLIST.md).        |

- **OAuth redirect URI:** `https://<your-app-domain>/api/oauth/callback` — must be whitelisted in the Manus dashboard. See [docs/OAUTH_WHITELIST_MANUS.md](docs/OAUTH_WHITELIST_MANUS.md).
- **Dev Login:** If OAuth isn’t set up yet, use `/login` and enter any email (works in dev or when `ENABLE_DEV_LOGIN=true`).

---

## Repo state

- **Stack:** React 19, TypeScript, tRPC 11, Express 4, Drizzle ORM, MySQL, Tailwind 4.
- **Tests:** `pnpm test` (Vitest), `npx playwright test` (E2E).
- **Migrate:** `pnpm db:migrate` (requires MySQL and `DATABASE_URL` in `.env`; script creates `userProfiles`/`certifications` and uses `multipleStatements` for MySQL).

Previous owner is done. All further work is on the next owner.
