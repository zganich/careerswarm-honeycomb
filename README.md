# CareerSwarm 🐝

**AI-Powered Career Evidence Platform**

Transform your job search from chaos to order with a 7-stage AI agent pipeline that analyzes, tailors, and optimizes every application.

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-122%20passing-green.svg)](./server)
[![TypeScript](https://img.shields.io/badge/typescript-0%20errors-green.svg)](./tsconfig.json)
[![Build](https://img.shields.io/badge/build-passing-green.svg)](./package.json)

---

## Who does what

**Cursor and OpenClaw do all technical work.** You are not expected to run terminal commands, edit code, or configure servers.

- **Cursor (this assistant):** Setup, code changes, tests, deploy, docs. Runs commands and uses the checklist so the app works in production.
- **OpenClaw (optional parallel agent):** Same workspace; can run Phase 4 config, monitor, ship checks, and sweeps when you ask. See [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md) and [docs/OPENCLAW_INTEGRATION.md](./docs/OPENCLAW_INTEGRATION.md).

**You only do what cannot be automated:** create accounts, copy keys from websites, and paste them when the assistant asks. No technical expertise required.

---

## What you need to do (no technical skill required)

Only these steps require you. Everything else (terminal, code, Railway, scripts) is done by Cursor or OpenClaw.

1. **Accounts** — Create (or already have) logins for: [OpenAI](https://platform.openai.com), [Stripe](https://dashboard.stripe.com), [Cloudflare](https://dash.cloudflare.com) (for R2), [Sentry](https://sentry.io), [Railway](https://railway.app), [GitHub](https://github.com) (this repo).
2. **When the assistant asks for a key or ID** — Open the link they give you (e.g. “Go to Stripe → Developers → API keys”), copy the value they name (e.g. “Secret key” or “Price ID”), and paste it in the chat (or into the file they specify). Never paste secrets in public places; the assistant will tell you where to put them.
3. **One-time logins in the browser** — If the assistant says “run this and paste the token,” they may open a webpage (e.g. Stripe or Sentry). Sign in there, copy the token the page shows, and paste it back into the terminal or chat when prompted.
4. **GitHub secrets (for CI)** — If the assistant asks: go to GitHub → this repo → Settings → Secrets and variables → Actions, click “New repository secret,” and add the name and value they give you (e.g. `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`).

That’s it. The assistant (or OpenClaw) will run all commands, set production variables (via script or instructions), and redeploy. If something needs your action, they will say exactly what to copy and where to paste it.

**Checklist for the assistant:** [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md). **Phase 4 (Stripe, S3, Sentry, Redis):** [docs/PHASE_4_CONFIG_WALKTHROUGH.md](./docs/PHASE_4_CONFIG_WALKTHROUGH.md); Phase 4 is finished when those vars are set in Railway and you run `railway redeploy`. OpenClaw can run the steps if you provide the keys (see OPENCLAW_HANDOFF.md § Phase 4).

---

## 🚀 Quick Start

When working in Cursor, the assistant runs setup and verification (install, dev server, tests, env) as needed; you do not run these yourself.

Reference commands (for automation / CI):

```bash
pnpm install
pnpm dev
pnpm check
pnpm lint
pnpm precommit     # Before commit: secrets + check + format:check + lint
pnpm run config:check   # Production config checklist (uses .env)
pnpm test
npx playwright test
```

---

## 🎯 Key Features

### 7-Stage AI Agent Pipeline

1. **Scout Agent** - Scrape and analyze job descriptions
2. **Qualifier Agent** - Assess job fit against your profile
3. **Profiler Agent** - Identify pain points and create strategic hooks
4. **Tailor Agent** - Generate customized resumes
5. **Scribe Agent** - Write personalized outreach messages
6. **Success Predictor** - Calculate offer probability with reasoning
7. **Skill Gap Analyzer** - Identify missing skills and upskilling paths

### Additional Intelligence

- **Pivot Analyzer** - Career transition guidance with bridge skills
- **ATS Compatibility** - Ensure resumes pass automated screening
- **Resume Roaster** - Get brutal honest feedback on your resume

### Career Management

- **Achievement Tracking** - Store accomplishments in STAR format
- **Application Tracker** - Kanban board from scouting to offer
- **Impact Meter** - Quantify the value of your achievements

---

## 🏗️ Architecture

**Frontend:** React 19 + Tailwind 4 + tRPC + shadcn/ui  
**Backend:** Express 4 + tRPC 11 + Drizzle ORM  
**Database:** MySQL (23 tables, see `drizzle/schema.ts`)  
**Auth:** Email-only sign-in at `/login` (no OAuth required)  
**AI:** OpenAI API (GPT-4o-mini default); requires `OPENAI_API_KEY` in production  
**Storage:** S3 optional for file uploads  
**Testing:** Vitest (122 passing / 51 skipped) + Playwright (smoke + E2E vs production)

---

## 📚 Documentation

| Doc                                                                                    | Purpose                                       |
| -------------------------------------------------------------------------------------- | --------------------------------------------- |
| [**CONTEXT_FOR_NEW_CHAT.md**](./CONTEXT_FOR_NEW_CHAT.md)                               | **Project context and handoff**               |
| [**docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md**](./docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md) | **What Cursor needs; task/agent assignments** |
| [**TASKS.md**](./TASKS.md)                                                             | Named tasks (monitor, ship-check, etc.)       |
| [**TOOLS.md**](./TOOLS.md)                                                             | Agents and commands (doctor, monitor)         |
| [**CONTRIBUTING.md**](./CONTRIBUTING.md)                                               | How to contribute (doctor, precommit, PR)     |
| [**SECURITY.md**](./SECURITY.md)                                                       | Reporting vulnerabilities                     |
| [**docs/DOCS_INDEX.md**](./docs/DOCS_INDEX.md)                                         | **Index of all docs**                         |
| [**RAILWAY_DEPLOYMENT_HANDOFF.md**](./RAILWAY_DEPLOYMENT_HANDOFF.md)                   | Deployment (Railway)                          |
| [**SETUP_GUIDE.md**](./SETUP_GUIDE.md)                                                 | Quick start (5 min setup)                     |
| [**docs/SHIP_CHECKLIST.md**](./docs/SHIP_CHECKLIST.md)                                 | Pre-deploy checklist                          |
| [**docs/MONITORING.md**](./docs/MONITORING.md)                                         | CLI monitoring (GitHub, Railway, Cloudflare)  |
| [**docs/OPTIONAL_INFRASTRUCTURE.md**](./docs/OPTIONAL_INFRASTRUCTURE.md)               | DNS, Sentry, Redis                            |
| [**CHANGELOG.md**](./CHANGELOG.md)                                                     | Version history                               |

---

## 🧪 Testing

The assistant runs tests when making changes. You do not need to run these yourself.

### Backend Tests (Vitest)

```bash
pnpm test                              # Run all tests
pnpm test server/pivot-analyzer.test.ts  # Run specific test
pnpm test --watch                      # Watch mode
```

**Coverage:** 122 passing, 51 skipped (env-dependent mocks)

### E2E Tests (Playwright)

```bash
npx playwright install chromium  # One-time browser install
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive mode
```

### Monitoring (CLI)

```bash
pnpm run monitor         # GitHub CI, Railway, app health, Cloudflare
pnpm run monitor:watch   # Poll 60s; macOS notifications on failures
```

Requires `gh` and `railway` CLI. See [docs/MONITORING.md](./docs/MONITORING.md).

---

## 🗂️ Project Structure

```
careerswarm/
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI
│   │   └── lib/trpc.ts      # tRPC client
├── server/          # Express + tRPC backend
│   ├── routers.ts           # API procedures
│   ├── db.ts                # Database helpers
│   └── *.test.ts            # Vitest tests
├── drizzle/         # Database schema
├── tests/           # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── achievements.spec.ts
│   └── utils/auth-bypass.ts
└── docs/            # Documentation
```

---

## 🔑 Environment Variables

**Handled by Cursor/OpenClaw:** They maintain `.env` for local dev and set production variables (Railway) via script or dashboard steps. You only provide the keys when asked (see “What you need to do” above).

- **App boot:** `DATABASE_URL` (MySQL), `JWT_SECRET`. No OAuth required.
- **AI (Roast, Tailor, Scribe):** `OPENAI_API_KEY` — you copy from OpenAI; the assistant adds it to `.env` and Railway.
- **Optional:** Stripe, S3, Sentry, Redis (see `.env.example` and [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md)).

---

## 🚢 Deployment

**Done by Cursor/OpenClaw:** Deploy, redeploy, and DNS steps are technical; the assistant runs them. You only create accounts or copy keys if asked.

- Details: [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md), DNS: [docs/CLOUDFLARE_DNS.md](./docs/CLOUDFLARE_DNS.md)

---

## 🤝 Contributing

Cursor/OpenClaw handle technical steps (branch, code, tests, docs, push). You only approve or request changes. See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 📝 License

Proprietary - All Rights Reserved

---

## 🔗 Links

- **GitHub**: https://github.com/zganich/careerswarm-honeycomb
- **Context**: [CONTEXT_FOR_NEW_CHAT.md](./CONTEXT_FOR_NEW_CHAT.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

## 💡 Tech Stack Highlights

- **Type Safety**: End-to-end TypeScript with tRPC
- **Modern UI**: React 19 + Tailwind 4 with OKLCH colors
- **AI Integration**: Structured LLM responses with schema validation
- **Testing**: Comprehensive coverage with Vitest + Playwright
- **Auth**: Email sign-in with session cookie; optional OAuth if configured
- **Database**: Type-safe queries with Drizzle ORM

---

Built with ❤️ | Deployed on Railway
