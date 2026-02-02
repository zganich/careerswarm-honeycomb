# Copy-paste for Manus – CareerSwarm Honeycomb

**Copy everything below the line into a new Manus task.** Same content as `MANUS_UPDATE.md` in the project root—use either file.

---

## Repo and context

- **Use this repo only:** `careerswarm-honeycomb`
- **URL:** https://github.com/zganich/careerswarm-honeycomb
- Do **not** use any repo named "CareerSwarm" or "careerswarm" without `-honeycomb` (that is the old repo).

**First steps:**

1. **Clone or connect** to `careerswarm-honeycomb` from the URL above. If another project is open, confirm it is this repo (path or URL includes `careerswarm-honeycomb`). If you have the old CareerSwarm repo, switch to or clone `careerswarm-honeycomb` instead.

2. **Read** `CLAUDE_MANUS_HANDOFF.md` in the project root. Follow its testing and validation instructions. **Do not redo** the fixes it describes (TypeScript, package generation, Resume Roast, build fix, lead magnet UX are already applied).

3. Use **this repo** for all work—code changes, validation, and tests.

---

## Current state (do not redo)

- **TypeScript:** `pnpm check` passes (0 errors). Application package generation in `server/routers.ts` is fixed (assembleApplicationPackage, TailorInput/ScribeInput, resumeMarkdown, skills/education, Profiler).
- **Package generation:** Fetches skills and education via `db.getSkills()` / `db.getEducation()`; integrates Profiler agent for Scribe `strategicMemo`; fallback to empty memo if Profiler fails.
- **Download UI:** Applications list and Application detail page have Download (PDF/DOCX/ZIP) and "Generate package" with loading states.
- **Resume Roast:** Public API `public.roast({ resumeText })` in `server/routers.ts` (min 50 chars; no auth). Page at `/roast`. Robust parsing: markdown stripped, try/catch fallback. **public.estimateQualification** stub exists for tests.
- **Build:** `pnpm run build` passes; `server/services/pdfGenerator.ts` has try/catch fix.
- **Lead magnet UX:** Home nav has "Resume Roast" → `/roast`. Hero secondary CTA "Get free feedback (Resume Roast)" → `/roast`. After roast results, conversion block "Build my Master Profile" → `/onboarding/welcome`. Files: `Home.tsx`, `TransformationHero.tsx`, `CopyConstants.ts`, `ResumeRoast.tsx`.
- **Tailor (from handoff):** QuickApply and Generate Package use `tailorResume` from `server/agents/tailor.ts`; Format B (Strategic Hybrid) when `pivotAnalysis` exists. Dates MM/YYYY, standard headers.
- **Production metrics:** Package generation success/failure is logged to `agentExecutionLogs` (agentName: "PackagePipeline", executionType: "package_generation"). See `PRODUCTION_METRICS.md` for queries.
- **E2E credentials:** `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are documented in `.env.example` and `TESTING.md`. Optional; unset uses auth bypass.

---

## Your task

1. **Confirm repo:** Reply with which repo you are using (should be `careerswarm-honeycomb`) and that you have read `CLAUDE_MANUS_HANDOFF.md`.

2. **Run validation:**  
   `pnpm validate`  
   If it fails (e.g. module resolution), see `DIAGNOSTIC_INVESTIGATION.md` for options.

3. **Do the handoff testing phases** (from `CLAUDE_MANUS_HANDOFF.md`):
   - Phase 1: Environment setup (`.env`, database, `pnpm validate`).
   - Phase 2: Application package generation (dev server, create application, trigger package, check DB/S3/notifications).
   - Phase 3+: Agent integration and E2E as described in the handoff.

4. **Optional – verify lead magnet:** Home → "Get free feedback" or "Resume Roast" → `/roast` → paste ≥50 chars, "Get Roasted" → see score, verdict, 3 mistakes → see conversion block "Build my Master Profile" → `/onboarding/welcome`. Do not redo implementation.

5. **Document findings** in `TEST_RESULTS.md` or the handoff's suggested format (pass/fail, errors, screenshots if useful).

---

**Reply with:** (1) repo in use, (2) confirmation you read the handoff, (3) result of `pnpm validate`, and (4) what you will do next (e.g. Phase 1 then Phase 2; optionally verify `/roast`).
