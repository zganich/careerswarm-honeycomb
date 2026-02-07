# CareerSwarm 🐝

**AI-Powered Career Evidence Platform**

Transform your job search from chaos to order with a 7-stage AI agent pipeline that analyzes, tailors, and optimizes every application.

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-122%20passing-green.svg)](./server)
[![TypeScript](https://img.shields.io/badge/typescript-0%20errors-green.svg)](./tsconfig.json)
[![Build](https://img.shields.io/badge/build-passing-green.svg)](./package.json)

---

## 🚀 Quick Start

When working in Cursor, the assistant runs setup and verification (install, dev server, tests, env) as needed; you are not expected to run these yourself.

Reference commands (for automation / CI):

```bash
pnpm install
pnpm dev
pnpm check
pnpm lint
pnpm precommit   # Before commit: secrets + check + format:check + lint
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

The assistant maintains `.env` for local dev (from `.env.example`) and uses Railway CLI for production where possible.

- **App boot:** `DATABASE_URL` (MySQL), `JWT_SECRET`. No OAuth required.
- **AI (Roast, Tailor, Scribe):** `OPENAI_API_KEY` in `.env` (local) and in Railway Variables (production); no placeholders in production.
- **Optional:** Stripe, S3, etc. (see `.env.example`).

**Checklist:** [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md).

---

## 🚢 Deployment

**Railway (Production):**

- See [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)
- DNS: [docs/CLOUDFLARE_DNS.md](./docs/CLOUDFLARE_DNS.md)

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Update `todo.md` with tasks
3. Implement changes with tests
4. Update documentation (CHANGELOG.md, CONTEXT_FOR_NEW_CHAT.md)
5. Create checkpoint with descriptive message
6. Push to GitHub and create PR

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
