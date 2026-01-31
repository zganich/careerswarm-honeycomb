# Update for Manus – CareerSwarm Honeycomb

**Copy everything below the line into a new Manus task.** Use this to bring Manus up to date with the latest changes (Resume Roast + lead magnet UX). Do not redo these changes.

---

## Repo and context

- **Repo:** `careerswarm-honeycomb`  
- **URL:** https://github.com/zganich/careerswarm-honeycomb  

**First:** Read `CLAUDE_MANUS_HANDOFF.md` in the project root. Then use this update for what’s new since the last handoff.

---

## What’s new since the last handoff (do not redo)

### 1. Resume Roast API and page (already in handoff)

- **API:** `public.roast({ resumeText })` in `server/routers.ts` (min 50 chars; no auth). Returns score, verdict, brutalTruth, 3 mistakes, characterCount, wordCount.
- **Page:** `/roast` – `client/src/pages/ResumeRoast.tsx`. Paste resume → Get Roasted → see results.
- **Build fix:** `server/services/pdfGenerator.ts` – outer `try` now has `catch` so `pnpm run build` passes.

### 2. Lead magnet UX (new)

Resume Roast is wired as a lead magnet and conversion path:

- **Home nav:** “Resume Roast” link in the top nav (with Technology, Evidence Engine, Enterprise) → `/roast`.
- **Hero CTAs:** `TransformationHero` now has wired buttons:
  - **Primary:** “Build My Master Profile” → `/onboarding/welcome`.
  - **Secondary:** “Get free feedback (Resume Roast)” → `/roast`.
- **Copy:** `client/src/components/ui/psych/CopyConstants.ts` – `ctaSecondary` is “Get free feedback (Resume Roast)”.
- **Conversion block on `/roast`:** After roast results, a dark CTA block appears:
  - Headline: “Turn these fixes into a resume that gets interviews”
  - Subtext: “Build one Master Profile. We’ll help you fix these mistakes and tailor every application.”
  - Button: “Build my Master Profile” → `/onboarding/welcome`.

**Files touched:** `client/src/pages/Home.tsx`, `client/src/components/ui/psych/TransformationHero.tsx`, `client/src/components/ui/psych/CopyConstants.ts`, `client/src/pages/ResumeRoast.tsx`.

---

## Your task

1. **Confirm repo:** You are using `careerswarm-honeycomb` and have read `CLAUDE_MANUS_HANDOFF.md`.
2. **Run:** `pnpm validate` (and `pnpm run build` if you want to confirm build).
3. **Optional – verify lead magnet flow:**
   - Home → click “Get free feedback (Resume Roast)” or nav “Resume Roast” → `/roast`.
   - Paste ≥50 chars, “Get Roasted” → see score, verdict, 3 mistakes.
   - After results, see conversion block and “Build my Master Profile” → `/onboarding/welcome`.
4. **Do the handoff testing phases** (Phase 1, 2, 3+, E2E) as in `CLAUDE_MANUS_HANDOFF.md`.
5. **Document findings** in `TEST_RESULTS.md` or the handoff format.

---

**Reply with:** (1) repo in use, (2) confirmation you read the handoff + this update, (3) result of `pnpm validate`, (4) what you will do next.
