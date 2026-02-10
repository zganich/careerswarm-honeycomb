# Add industry-related resume formats (with docs and web FAQ)

## Overview

Add industry-specific resume format personas and sectoral rules to the Tailor agent (Academic, Legal, Education/Nonprofit), document them in internal docs, and update web-facing docs and FAQs so users see that we support these industries.

---

## 1. Tailor agent: new personas and sectoral rules

**File:** [server/agents/tailor.ts](server/agents/tailor.ts)

- Add **Academic**, **Legal**, **Education/Nonprofit** to the PHASE 0 classification list.
- Add **sectoral rules** for each:
  - **Academic / Research:** CV-style; Education, then Publications/Research/Teaching (order by JD); grants, fellowships; 2–4 pages acceptable.
  - **Legal:** Education first (law school, undergrad), then Bar, then Experience; practice-area tailoring (litigation vs transactional); 1–2 pages.
  - **Education / Nonprofit:** Mission alignment, impact, teaching competency; 1 page preferred.
- Update the final instruction step 0 to list all personas (Federal, Tech, Creative, Healthcare, Skilled Trades, Corporate, Academic, Legal, Education/Nonprofit).
- **Page length by career level and industry:** Add a dedicated prompt block (see section below) so Tailor enforces length by inferred career level and persona. Replace the single "1-2 pages maximum" with these rules.

---

## 1b. Page length by career level and industry

**Source of truth for Tailor prompt and docs.** Infer career level from user profile (work history dates / number of roles); industry/persona from JD classification.

**By career level (private sector default):**

| Level              | Experience   | Target length | Cap                   |
| ------------------ | ------------ | ------------- | --------------------- |
| Entry              | 0–5 years    | 1 page        | Do not exceed 1 page  |
| Mid-career         | 5–10+ years  | 1–2 pages     | Do not exceed 2 pages |
| Senior / Executive | 10–20+ years | 2–3 pages     | Do not exceed 3 pages |

**By industry (overrides or tightens the above):**

| Persona                                               | Page rule                             | Notes                                  |
| ----------------------------------------------------- | ------------------------------------- | -------------------------------------- |
| Federal (USA)                                         | 2-page **max** (hard)                 | Policy; longer = ineligible            |
| Academic / Research                                   | 2–4+ pages acceptable                 | CV-style; senior faculty can be longer |
| Legal                                                 | 1–2 pages                             | 1 page preferred for many firms        |
| Education / Nonprofit                                 | 1 page preferred; 2 OK with 10+ years |                                        |
| Tech, Creative, Healthcare, Skilled Trades, Corporate | Use career-level table above          | 1 page entry, 1–2 mid, 2–3 senior/exec |

**Implementation in Tailor:** Add a "PHASE 0b" or bullet under PHASE 0: "3. Infer career level from user work history (total years / number of roles). Apply page length: Entry = 1 page max; Mid = 2 pages max; Senior/Executive = 3 pages max. Then apply industry override: Federal always 2-page max; Academic may use 2–4 pages; Legal and Education/Nonprofit prefer 1–2 (see sectoral rules)." Remove or replace the current global "Keeps to 1-2 pages maximum" in "Your Goal" with "Respects the page length for this career level and industry (see above)."

---

## 2. Internal documentation

**File:** [docs/TAILOR_AND_INDUSTRY.md](docs/TAILOR_AND_INDUSTRY.md)

- Update "Persona and format inference" to list all nine personas.
- Add sectoral rule rows for Academic, Legal, Education/Nonprofit (section order and key conventions).
- Note Academic = CV-style / 2–4 pages; Legal = Education-first; Education/Nonprofit = mission/impact, 1-page preference.
- **New subsection: "Page length by career level and industry."** Document the table: by level (Entry 1 page, Mid 1–2, Senior/Exec 2–3) and by industry (Federal 2 max, Academic 2–4+, Legal 1–2, Education/Nonprofit 1 preferred). State that Tailor infers level from work history and applies industry overrides.

**File:** [.cursor/rules/agent-prompts.mdc](.cursor/rules/agent-prompts.mdc)

- Update Tailor persona list to include Academic, Legal, Education/Nonprofit.

---

## 3. Docs for web and marketing

**File:** [docs/CAREERSWARM_SUMMARY_FOR_MARKETING.md](docs/CAREERSWARM_SUMMARY_FOR_MARKETING.md)

- In "Who It's For" or "Key Features," add a short bullet or line that we tailor by industry: tech, federal, creative, healthcare, skilled trades, corporate, **academic/research**, **legal**, **education/nonprofit** (and that we use role-appropriate formats: XYZ for tech, CAR for most, CV-style for academic, education-first for legal).
- Ensures marketing and any web copy derived from this doc stay aligned with the new formats.

**File:** [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)

- No change required unless you add a new doc; TAILOR_AND_INDUSTRY is already listed under Product and GTM.

---

## 4. Web FAQ updates

**File:** [client/src/pages/FAQ.tsx](client/src/pages/FAQ.tsx)

- **"How is this different from other resume builders?"**  
  Add that we tailor by industry: tech (XYZ), federal, creative, healthcare, skilled trades, corporate, academic, legal, education/nonprofit—each with the right format and section order (e.g. education-first for legal, CV-style for academic).

- **"What is the Google XYZ format?"**  
  Keep as-is; optionally add one sentence: "We also use industry-specific formats (e.g. CV-style for academic, education-first for legal)."

- **"Is this ATS-friendly?"**  
  Add that we optimize by role type: tech and engineering (XYZ), federal (USA format), academic (CV-style), legal (education-first), and others (CAR)—all ATS-safe.

- **Optional new FAQ:**  
  "What industries do you support?"  
  Answer: Tech & engineering, federal, creative, healthcare, skilled trades, corporate, academic/research, legal, education & nonprofit. We automatically detect the job type from the description and apply the right format (e.g. CV-style for academic, education-first for legal, federal 2-page rules).

- **Optional new FAQ:**  
  "How long should my resume be?"  
  Answer: We set length by your career level and the job type. Entry-level (0–5 years): 1 page. Mid-career: 1–2 pages. Senior/executive: 2–3 pages. Federal jobs: 2-page maximum. Academic CVs: 2–4+ pages as needed. Legal and education/nonprofit roles often prefer 1–2 pages. Our AI applies these rules when tailoring your resume.

This keeps the public FAQ accurate and discoverable for the new industries and page-length standards.

---

## 5. Optional: resume templates

**File:** [shared/resumeTemplates.ts](shared/resumeTemplates.ts)

- Extend `bestFor` on the **classic** template to include "Legal," "Academic," "Education & Nonprofit" so template picker aligns with new personas.

---

## 6. Out of scope

- Separate CV vs Resume export type (output remains one Markdown stream).
- New DOCX/PDF layouts per industry.
- Backend schema or API changes.

---

## Files summary

| File                                                                                   | Action                                                                                                      |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [server/agents/tailor.ts](server/agents/tailor.ts)                                     | Add Academic, Legal, Education/Nonprofit personas; sectoral rules; page length by career level and industry |
| [docs/TAILOR_AND_INDUSTRY.md](docs/TAILOR_AND_INDUSTRY.md)                             | Document all personas, sectoral rules, and page length by level/industry                                    |
| [.cursor/rules/agent-prompts.mdc](.cursor/rules/agent-prompts.mdc)                     | Update Tailor persona list                                                                                  |
| [docs/CAREERSWARM_SUMMARY_FOR_MARKETING.md](docs/CAREERSWARM_SUMMARY_FOR_MARKETING.md) | Add industry-tailoring line for web/marketing                                                               |
| [client/src/pages/FAQ.tsx](client/src/pages/FAQ.tsx)                                   | Update 2–3 existing answers; optionally add "What industries do you support?"                               |
| [shared/resumeTemplates.ts](shared/resumeTemplates.ts)                                 | Optional: extend classic template `bestFor`                                                                 |
