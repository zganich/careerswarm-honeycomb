# CareerSwarm – Summary for Marketers & Stakeholders

**One-line:** CareerSwarm is an AI-powered career evidence platform that turns one Master Profile into tailored applications, so job seekers spend minutes per application instead of hours.

---

## What It Is

CareerSwarm helps job seekers **stop rewriting their resume for every job**. Users build **one Master Profile** (achievements, skills, work history). The platform then uses a **multi-agent AI pipeline** to tailor resumes, cover letters, and outreach for each opportunity—with ATS-friendly formatting and strategic hooks.

**Tagline:** _Build one Master Profile. Auto-apply to hundreds of jobs._

---

## Who It’s For

- **Active job seekers** who apply to many roles and want each application to feel custom without the manual work.
- **Career pivots** who need to reframe their experience (e.g., sales → strategy) with “bridge skills” and clear narrative.
- **Professionals** who want evidence-based career management (STAR achievements, impact metrics) instead of generic bullet points.

We tailor by industry and role type: tech (Google XYZ), federal, creative, healthcare, skilled trades, corporate, **academic/research** (CV-style), **legal** (education-first), and **education/nonprofit**—each with the right format, section order, and page length for that sector.

---

## Key Features (How to Talk About Them)

### 1. **Resume Roast (Lead Magnet – No Signup)**

- **What:** Free, no-login tool: paste resume text, get a “roast” (0–100 score, verdict, 3 “Million-Dollar Mistakes,” and how to fix them).
- **Why it matters:** Instant value, no commitment. Drives signups when we follow with: “Turn these fixes into a resume that gets interviews” → Build Master Profile.
- **Sound bite:** _“Get brutally honest resume feedback in seconds—no signup. Then turn that feedback into a Master Profile that powers every application.”_

### 2. **Master Profile**

- **What:** One place for work history, achievements (STAR format), skills, education, and “superpowers.” Used as the single source of truth for all tailored content.
- **Why it matters:** Upload/parse once; the AI reuses and reframes this for every job.
- **Sound bite:** _“One profile. Every application tailored from it.”_

### 3. **Application Package (Tailored Output)**

- **What:** For each job, the system generates: tailored resume (PDF/DOCX), cover letter, LinkedIn message—all aligned to the role and company.
- **Why it matters:** Saves 4+ hours per application; keeps messaging consistent and ATS-friendly.
- **Sound bite:** _“From one click to a full application package: resume, cover letter, and outreach—ready in minutes.”_

### 4. **7-Stage AI Pipeline**

- **What:** Scout (job analysis), Qualifier (fit score), Profiler (company/role hooks), Tailor (resume), Scribe (outreach), plus Success Predictor and Skill Gap Analyzer.
- **Why it matters:** Not a single generic prompt; each step has a defined role so output is relevant and consistent.
- **Sound bite:** _“Seven AI agents work together so every application is strategically tailored, not templated.”_

### 5. **Career Pivot & Bridge Skills**

- **What:** For people changing roles (e.g., Sales → Strategy), the system highlights “bridge skills” and suggests how to frame experience (e.g., “Applied R&D,” “Technical Product Leadership”).
- **Why it matters:** Reduces the “I don’t fit” feeling and gives a clear story for switchers.
- **Sound bite:** _“We help career pivots tell the right story—bridge skills and framing that make your move obvious to recruiters.”_

---

## Proof Points & Stats (When You Have Them)

- **Time saved:** “4+ hours per application” (positioning; refine with user feedback.)
- **Structure:** 7 specialized agents, 14-table schema, full application lifecycle (scout → offer).
- **Quality bar:** No fluff (forbidden words: orchestrated, spearheaded, synergy, leverage, etc.); emphasis on quantified results (%, $, numbers).
- **Lead magnet:** Resume Roast is free, no signup; conversion CTA to Master Profile after the roast.

---

## Current State (For Internal / Partner Use)

- **Product:** Resume Roast lead magnet live (LLM analysis, robust parsing, conversion block to onboarding). Master Profile onboarding (upload → extract → review → preferences). Application package generation (Tailor + Scribe + Assembler, PDF/DOCX/ZIP, S3, notifications). Package generation success/failure logged for monitoring.
- **Tech:** React 19, Tailwind 4, tRPC, Express, Drizzle ORM, MySQL/TiDB, email sign-in (optional OAuth), OpenAI for LLM. Vitest + Playwright tests; 90+ unit tests passing, E2E suite in place.
- **Readiness:** ~95% production-ready; no blocking issues. E2E credentials and optional metrics dashboard can be added when needed.

---

## Sound Bites for Copy & Conversations

| Use case                  | Line                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Hero / above the fold** | “Stop rewriting your resume. Build one Master Profile. Auto-apply to hundreds of jobs.”                           |
| **Lead magnet**           | “Get free, brutal resume feedback in 60 seconds—no signup. Then build the profile that powers every application.” |
| **Differentiator**        | “Seven AI agents tailor each application—resume, cover letter, outreach—so it feels custom without the grind.”    |
| **Pivot**                 | “Career pivot? We map your bridge skills and reframe your experience so recruiters see the fit.”                  |
| **Outcome**               | “From one Master Profile to a full application package in minutes—not hours.”                                     |

---

## Repo & Docs (Technical Stakeholders)

- **Repo:** `careerswarm-honeycomb` — https://github.com/zganich/careerswarm-honeycomb
- **Handoff / testing:** See `.archive/handoffs-feb-2026/` and docs for testing notes.
- **Product detail:** `README.md`, `CONTEXT_FOR_NEW_CHAT.md`

---

_Use this doc for pitch decks, one-pagers, sales conversations, and partner briefings. Update proof points and stats as you get real user data._
