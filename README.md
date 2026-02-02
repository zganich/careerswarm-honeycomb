# CareerSwarm 🐝

**AI-Powered Career Evidence Platform**

Transform your job search from chaos to order with a 7-stage AI agent pipeline that analyzes, tailors, and optimizes every application.

**Taking over this repo?** → **[HANDOFF.md](./HANDOFF.md)**. **Giving to Manus?** → **[MANUS_PROMPT.md](./MANUS_PROMPT.md)** — prompt and steps so Manus knows exactly what to do.

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-127%20passing-green.svg)](./server)
[![E2E](https://img.shields.io/badge/e2e-20%20passing-green.svg)](./tests)

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run E2E tests
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
**Database:** MySQL/TiDB (14 tables)  
**Auth:** Manus OAuth  
**AI:** Manus Forge API (LLM integration)  
**Storage:** S3 for file uploads  
**Testing:** Vitest (127 tests) + Playwright (20 E2E tests)

---

## 📚 Documentation

- [**PROJECT_SUMMARY.md**](./PROJECT_SUMMARY.md) - Complete technical documentation
- [**CHANGELOG.md**](./CHANGELOG.md) - Version history and release notes
- [**todo.md**](./todo.md) - Current tasks and feature tracking
- [**docs/SHIP_STEP_BY_STEP.md**](./docs/SHIP_STEP_BY_STEP.md) - **Start here:** numbered steps to get running and ship (MySQL, migrate, OAuth, env)
- [**docs/SHIP_CHECKLIST.md**](./docs/SHIP_CHECKLIST.md) - Deploy checklist (migrations, OAuth whitelist, verify)

---

## 🧪 Testing

### Backend Tests (Vitest)

```bash
pnpm test                              # Run all tests
pnpm test server/pivot-analyzer.test.ts  # Run specific test
pnpm test --watch                      # Watch mode
```

**Coverage:** 127 passing tests across 17 test files

### E2E Tests (Playwright)

```bash
npx playwright install chromium  # One-time browser install
npx playwright test              # Run all tests (20 passing, 2 skipped)
npx playwright test --ui         # Interactive mode
npx playwright show-report       # View HTML report
```

**Features:**
- Auth bypass utility for reliable testing
- Video recording for all test runs
- Chromium-only configuration (no browser errors)

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

All required environment variables are pre-configured by Manus:

- `DATABASE_URL` - MySQL/TiDB connection
- `JWT_SECRET` - Session signing
- `OAUTH_SERVER_URL` - Manus OAuth
- `BUILT_IN_FORGE_API_KEY` - LLM access
- `STRIPE_SECRET_KEY` - Payment processing (test mode)

No manual configuration needed!

---

## 🚢 Deployment

**Manus Hosting (Recommended):**
1. Save checkpoint in development
2. Click "Publish" button in Management UI
3. Configure custom domain (optional)

**External Hosting:**
- Compatible with Vercel, Railway, Render
- May require environment variable configuration
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for details

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Update `todo.md` with tasks
3. Implement changes with tests
4. Update documentation (CHANGELOG.md, PROJECT_SUMMARY.md)
5. Create checkpoint with descriptive message
6. Push to GitHub and create PR

---

## 📝 License

Proprietary - All Rights Reserved

---

## 🔗 Links

- **GitHub**: https://github.com/zganich/careerswarm-honeycomb
- **Documentation**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

## 💡 Tech Stack Highlights

- **Type Safety**: End-to-end TypeScript with tRPC
- **Modern UI**: React 19 + Tailwind 4 with OKLCH colors
- **AI Integration**: Structured LLM responses with schema validation
- **Testing**: Comprehensive coverage with Vitest + Playwright
- **Auth**: Secure OAuth flow with session management
- **Database**: Type-safe queries with Drizzle ORM

---

Built with ❤️ using Manus
