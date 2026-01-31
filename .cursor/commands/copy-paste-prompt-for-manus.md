# Manus Task Prompt – CareerSwarm Honeycomb

**Copy everything below the line into a new Manus task.**

---

## Repo and context

- **Use this repo only:** `careerswarm-honeycomb`  
- **URL:** https://github.com/zganich/careerswarm-honeycomb  
- Do **not** use any repo named "CareerSwarm" or "careerswarm" without `-honeycomb` (that is the old repo).

**First steps:**

1. **Clone or connect** to `careerswarm-honeycomb` from the URL above. Confirm it is this repo (path or URL includes `careerswarm-honeycomb`).

2. **Read** `CLAUDE_MANUS_HANDOFF.md` in the project root. Follow its testing and validation instructions. **Do not redo** the fixes it describes (TypeScript and package-generation fixes are already applied).

3. Use **this repo** for all work—code changes, validation, and tests.

---

## Recent changes (Tailor Agent addendum)

The Tailor Agent has been updated with **Dynamic Format Selection Logic (2026 Standards)** from `PROJECT_SUMMARY.md` Appendix A:

- **Job persona classification:** Federal, Tech, Creative, Healthcare, Skilled Trades, Corporate
- **Format selection:** A (Reverse-Chronological), B (Strategic Hybrid for pivots), C (Functional, high risk)
- **Sectoral rules:** Tech (GitHub/portfolio, XYZ formula), Creative (portfolio required), Federal (2-page max, MM/DD/YYYY), Healthcare, Skilled Trades
- **Regional compliance:** North America/UK/Australia, Germany/DACH, France/Asia
- **ATS Safe Parse:** MM/YYYY dates, single-column, standard fonts, standard headers

**Unified flows:**
- **QuickApply** and **Generate Package** both use `tailorResume` from `server/agents/tailor.ts`
- When `application.pivotAnalysis` exists, the tailor uses Format B (Strategic Hybrid) with bridge skills at top

---

## Your task

1. **Confirm repo:** Reply with which repo you are using (should be `careerswarm-honeycomb`) and that you have read `CLAUDE_MANUS_HANDOFF.md`.

2. **Run validation:**  
   `pnpm validate`  
   If it fails (e.g. module resolution), see `DIAGNOSTIC_INVESTIGATION.md` for options.

3. **Do the handoff testing phases** (from `CLAUDE_MANUS_HANDOFF.md`):
   - Phase 1: Environment setup (`.env`, database, `pnpm validate`)
   - Phase 2: Application package generation (dev server, create application, trigger package, check DB/S3/notifications)
   - Phase 3+: Agent integration and E2E as described in the handoff

4. **Verify Tailor addendum:** When testing resume generation (Quick Apply or Generate Package), confirm the output:
   - Uses MM/YYYY or Month YYYY for dates (no "Summer 2026")
   - Uses standard headers ("Experience", "Education", "Skills")
   - For tech roles: includes Tech Stack / artifact links if in profile
   - For pivot applications: uses Strategic Hybrid (Skills/Summary at top) when `pivotAnalysis` is present

5. **Document findings** in `TEST_RESULTS.md` or the handoff's suggested format (pass/fail, errors, screenshots if useful).

---

**Reply with:** (1) repo in use, (2) confirmation you read the handoff, (3) result of `pnpm validate`, and (4) what you will do next (e.g. Phase 1 then Phase 2 from the handoff).
