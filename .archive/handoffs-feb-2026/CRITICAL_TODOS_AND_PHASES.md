# Critical Todos and Next Phases

**Purpose:** Must-dos before production, plus phased roadmap for updates and fixes.  
**See also:** [STATE_OF_CAREERSWARM.md](STATE_OF_CAREERSWARM.md), [CareerSwarm_Status_Report_2026-02-01.md](CareerSwarm_Status_Report_2026-02-01.md).

---

## Critical todos (do before production)

These are blocking or high-risk if skipped.

| #   | Todo                                 | Why critical                                                                                                              | How                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Run migration 0015**               | New Master Profile tables/columns are in code but not in DB until migration runs. App will error or miss data without it. | Set `DATABASE_URL` in `.env`, then run `pnpm db:migrate`. See [RUN_MIGRATION_STEP_BY_STEP.md](RUN_MIGRATION_STEP_BY_STEP.md).                                                                                                                                                                              |
| 2   | **Run full test suite**              | Confirms recent changes (Master Profile, parser, routers) don’t break existing behavior.                                  | `pnpm test`. Fix any failing tests before deploy.                                                                                                                                                                                                                                                          |
| 3   | **Smoke-test package generation**    | Quick Apply → Tailor/Scribe/Assembler flow is core revenue path. Must work end-to-end.                                    | Follow [CLAUDE_MANUS_HANDOFF.md](../CLAUDE_MANUS_HANDOFF.md) “Package Generation” or: run app, complete onboarding, run Quick Apply on one opportunity, confirm resume + cover letter + LinkedIn are generated and downloadable. See [SMOKE_TEST_PACKAGE_GENERATION.md](SMOKE_TEST_PACKAGE_GENERATION.md). |
| 4   | **Verify production env**            | Missing or wrong env vars cause runtime failures in production.                                                           | Run `pnpm verify-env` before deploy; production server runs the same check at startup and exits if required vars are missing. See [.env.example](../.env.example) for full checklist.                                                                                                                      |
| 5   | **Error handling on critical paths** | Unhandled errors in parseResumes or package generation leave users with no feedback and make debugging hard.              | Add try/catch and user-facing error messages (and optional logging) for: resume upload/process, `parseResumes`, Quick Apply / package generation. Log or report to Sentry instead of silent fail.                                                                                                          |

**Optional but recommended before launch:** Run E2E tests (`npx playwright test`) in a real or staging env to catch UI/flow regressions.

---

## Phase 1 – Immediate (pre-launch / launch week)

**Goal:** Safe, observable launch.

| Priority | Item                                                 | Notes                                                                                       |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| P0       | Run migration 0015                                   | See critical todo #1.                                                                       |
| P0       | Run tests and fix failures                           | `pnpm test`.                                                                                |
| P0       | Smoke-test package generation                        | Critical todo #3.                                                                           |
| P0       | Verify production env vars                           | Critical todo #4.                                                                           |
| P1       | Add error handling + user messages on critical paths | ParseResumes, Quick Apply, package generation. Show toast or inline error; log server-side. |
| P1       | Deploy to production (or staging)                    | Per your hosting (Manus, Vercel, Railway, etc.).                                            |
| P2       | Run E2E in staging                                   | `npx playwright test` against staging URL if available.                                     |

---

## Phase 2 – Short-term (1–2 weeks)

**Goal:** Better UX and production readiness.

| Priority | Item                                    | Notes                                                                                                                                         |
| -------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | **Real-time progress updates**          | WebSockets or polling for resume processing and Quick Apply so users see progress instead of a spinner. Reduces drop-off.                     |
| P1       | **Conversion-focused onboarding fixes** | Reduce steps or friction (e.g. optional steps, smarter defaults, “Save and continue later”) to improve completion rate.                       |
| P1       | **Structured error logging**            | Log errors (with request/context, no PII) to stdout or Sentry so you can debug production issues.                                             |
| P2       | Retry logic for LLM calls               | Transient failures: retry once or twice with backoff so Tailor/Scribe/Assembler don’t fail on first timeout.                                  |
| P2       | User-facing error copy                  | Replace generic “Something went wrong” with short, actionable messages (e.g. “Resume processing failed. Try again or use a different file.”). |

---

## Phase 3 – Medium-term (1–2 months)

**Goal:** Stronger product and maintainability.

| Priority | Item                          | Notes                                                                                                                                                    |
| -------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | **Master Profile builder UX** | Career Archaeology theme: bulk upload, live merge progress, profile reveal, “ready in 45 seconds” CTA. See Status Report “Master Profile Builder UI/UX”. |
| P1       | **Resume parser tests**       | Vitest tests for `parseResumeWithLLM` and `consolidateResumes` (fixtures: sample resume text → expected parsed shape).                                   |
| P1       | **Agent integration tests**   | Vitest or integration tests for Tailor, Scribe, Assembler (with mocked LLM) so refactors don’t break package generation.                                 |
| P2       | **E2E for Quick Apply**       | Playwright test: login → (or bypass) → create/use opportunity → Quick Apply → assert package generated.                                                  |
| P2       | **Performance**               | Caching for profile/completeness; pagination for applications and opportunities; lazy-load long achievement lists.                                       |
| P2       | **Pagination**                | Applications list and opportunities list paginated to avoid slow loads with many rows.                                                                   |

---

## Phase 4 – Long-term (3+ months)

**Goal:** Scale and new capabilities.

| Area          | Items                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------ |
| **Outreach**  | Email automation (SendGrid/SES); track opens/clicks.                                             |
| **LinkedIn**  | OAuth; auto-send messages; import profile data.                                                  |
| **Agents**    | Interview prep agent (questions + STAR answers); salary negotiation agent.                       |
| **Real APIs** | LinkedIn Jobs, Greenhouse, Lever (jobs); Crunchbase (funding); Glassdoor (reviews) where useful. |
| **Testing**   | Broader E2E coverage; run tests in CI on every push.                                             |

---

## Summary

- **Critical (before production):** Run migration 0015, run test suite, smoke-test package generation, verify env, add error handling on critical paths.
- **Phase 1:** Complete critical todos, deploy, add error handling and basic observability.
- **Phase 2:** Real-time progress, onboarding conversion, logging, retries, user-facing errors.
- **Phase 3:** Master Profile builder UX, parser and agent tests, E2E for Quick Apply, performance and pagination.
- **Phase 4:** Email, LinkedIn, new agents, real job/company APIs, CI and broader tests.

Use [todo.md](../todo.md) and [CareerSwarm_Status_Report_2026-02-01.md](CareerSwarm_Status_Report_2026-02-01.md) for the full backlog; this doc is the prioritized subset for updates and fixes.
