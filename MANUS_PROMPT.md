# Manus Task Prompt – CareerSwarm Honeycomb

**Copy everything below the line into a new Manus task. Manus will use the correct repo and follow the handoff.**

---

## Repo and context

- **Use this repo only:** `careerswarm-honeycomb`  
- **URL:** https://github.com/zganich/careerswarm-honeycomb  
- Do **not** use any repo named "CareerSwarm" or "careerswarm" without `-honeycomb` (that is the old repo).

**First steps:**

1. **Clone or connect** to `careerswarm-honeycomb` from the URL above. If another project is open, confirm it is this repo (path or URL includes `careerswarm-honeycomb`). If you have the old CareerSwarm repo, switch to or clone `careerswarm-honeycomb` instead.

2. **Read** `CLAUDE_MANUS_HANDOFF.md` in the project root. Follow its testing and validation instructions. **Do not redo** the fixes it describes (TypeScript and package-generation fixes are already applied).

3. Use **this repo** for all work—code changes, validation, and tests.

---

## Current state (as of handoff + follow-up)

- **TypeScript:** `pnpm check` passes (0 errors). Application package generation in `server/routers.ts` is fixed (assembleApplicationPackage, TailorInput/ScribeInput, resumeMarkdown, skills/education, Profiler).
- **Package generation:** Fetches skills and education via `db.getSkills()` / `db.getEducation()`; integrates Profiler agent for Scribe `strategicMemo`; fallback to empty memo if Profiler fails.
- **Download UI:** Applications list and Application detail page have Download (PDF/DOCX/ZIP) and “Generate package” with loading states.

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

4. **Document findings** in something like `TEST_RESULTS.md` or the handoff’s suggested format (pass/fail, errors, screenshots if useful).

---

## Optional: add handoff to Manus knowledge base

- In a Manus project, set a Master Instruction like:  
  *“When doing testing or validation, read CLAUDE_MANUS_HANDOFF.md first. Follow its phases and do not redo the fixes it describes.”*  
- Add `CLAUDE_MANUS_HANDOFF.md` to the project’s Knowledge Base so it’s available in every task.

---

**Reply with:** (1) repo in use, (2) confirmation you read the handoff, (3) result of `pnpm validate`, and (4) what you will do next (e.g. Phase 1 then Phase 2 from the handoff).
