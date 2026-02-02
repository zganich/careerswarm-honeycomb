# CareerSwarm TODO

**Last Updated:** February 2, 2026  
**Status:** Production-ready, all checks passing

---

## Current State

| Check | Status |
|-------|--------|
| TypeScript (`pnpm check`) | 0 errors |
| Build (`pnpm build`) | Passing |
| Tests (`pnpm test`) | 129 passed, 42 skipped |
| Migrations (`pnpm db:migrate`) | All 16 migrations applied |

---

## Completed (February 2, 2026)

- [x] Fixed 37 TypeScript errors
- [x] Added DB function aliases for new profile sections
- [x] Made migration 0015 idempotent (safe to re-run)
- [x] Fixed test setup (env loading, graceful skipping)
- [x] Improved error handling in resume parser
- [x] Fixed portfolioUrls type handling
- [x] Archived 45 outdated handoff/testing docs

---

## Production Checklist

Before deploying:

- [ ] Run `pnpm db:migrate` (applies all pending migrations)
- [ ] Verify `pnpm check` passes (0 TypeScript errors)
- [ ] Verify `pnpm build` passes
- [ ] Verify `pnpm test` passes
- [ ] Configure OAuth redirect URI in Manus dashboard

See [docs/SHIP_CHECKLIST.md](./docs/SHIP_CHECKLIST.md) for full deployment guide.

---

## Future Enhancements (Backlog)

### High Priority
- [ ] Real-time progress updates (WebSocket for resume processing)
- [ ] Retry logic for LLM calls (handle transient failures)
- [ ] Production metrics dashboard (see PRODUCTION_METRICS.md)

### Medium Priority
- [ ] Profile completeness indicator
- [ ] Achievement detail modal
- [ ] Superpower editing UI
- [ ] Activity feed page

### Low Priority
- [ ] Email automation (SendGrid/AWS SES)
- [ ] LinkedIn OAuth integration
- [ ] Interview Prep Agent
- [ ] Salary Negotiation Agent

---

## Architecture Notes

**Stack:**
- Frontend: React 19 + Tailwind 4 + tRPC + shadcn/ui
- Backend: Express 4 + tRPC 11 + Drizzle ORM
- Database: MySQL (16 migrations, 14+ tables)
- Auth: Manus OAuth
- AI: Manus Forge API

**7-Stage Agent Pipeline:**
1. Scout → Find jobs
2. Qualifier → Assess fit
3. Profiler → Analyze company
4. Tailor → Generate resume
5. Scribe → Write outreach
6. Assembler → Create package
7. Success Predictor → Calculate odds

---

## Quick Commands

```bash
pnpm dev          # Start dev server
pnpm check        # TypeScript check
pnpm build        # Production build
pnpm test         # Run tests
pnpm db:migrate   # Apply migrations
```
