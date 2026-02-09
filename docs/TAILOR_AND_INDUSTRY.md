# Tailor agent: industry and format

The Tailor agent ([server/agents/tailor.ts](../server/agents/tailor.ts)) rewrites the user's resume to align with a target job description.

## Persona and format inference

**Job persona and resume format are inferred from the JD only.** Tailor does not receive a pre-set industry or format (e.g. from the opportunity or user preferences). The LLM is instructed to:

1. Classify the job as one of: **Federal, Tech, Creative, Healthcare, Skilled Trades, Corporate, Academic, Legal, Education/Nonprofit**
2. Select format: **A** (reverse-chronological), **B** (strategic hybrid), or **C** (functional)
3. Infer career level from user work history and apply page length; then apply industry overrides
4. Apply the matching sectoral and regional rules from the system prompt

So "appropriate to industry" depends on the model correctly classifying the job from the JD text. If structured industry or format were available elsewhere (e.g. opportunity metadata), they could be passed in to bias or enforce persona/format in a future change.

## Sectoral rules (summary)

- **Tech & Engineering:** Google XYZ formula, artifact links, Tech Stack before Experience
- **Creative & Design:** Portfolio mandatory, visual-strategic layout
- **Federal (USA):** 2-page max, hours/week + salary + supervisor, dates MM/DD/YYYY
- **Healthcare & Medical Sales:** GMP, Clinical Trials, Quota Attainment; certifications prominent
- **Skilled Trades:** Equipment, safety records, apprenticeship; reliability metrics
- **Corporate:** Format A, CAR (Context–Action–Result)
- **Academic / Research:** CV-style; Education, then Publications/Research/Teaching (order by JD); grants, fellowships; 2–4 pages acceptable
- **Legal:** Education first (law school, undergrad), then Bar, then Experience; practice-area tailoring (litigation vs transactional); 1–2 pages
- **Education / Nonprofit:** Mission alignment, impact, teaching competency; 1 page preferred (2 OK with 10+ years)

See the system prompt in `server/agents/tailor.ts` for the full rules.

## Page length by career level and industry

Tailor infers career level from the user's work history (total years and number of roles) and applies a default page length. Industry rules then override where applicable.

**By career level (private sector default):**

| Level | Experience | Target length | Cap |
|-------|------------|---------------|-----|
| Entry | 0–5 years | 1 page | Do not exceed 1 page |
| Mid-career | 5–10+ years | 1–2 pages | Do not exceed 2 pages |
| Senior / Executive | 10–20+ years | 2–3 pages | Do not exceed 3 pages |

**By industry (overrides or tightens the above):**

| Persona | Page rule | Notes |
|---------|-----------|-------|
| Federal (USA) | 2-page **max** (hard) | Policy; longer = ineligible |
| Academic / Research | 2–4+ pages acceptable | CV-style; senior faculty can be longer |
| Legal | 1–2 pages | 1 page preferred for many firms |
| Education / Nonprofit | 1 page preferred; 2 OK with 10+ years | |
| Tech, Creative, Healthcare, Skilled Trades, Corporate | Use career-level table above | 1 page entry, 1–2 mid, 2–3 senior/exec |

## Standalone STAR → XYZ template

A compressed prompt template for STAR-to-XYZ transformation lives in `server/promptCompression.ts` (`CompressedPrompts.STAR_TO_XYZ`). It is **not** currently used by any router or flow; the only place XYZ is explicitly applied is inside Tailor for Tech & Engineering roles. If you add a standalone "transform to XYZ" feature (e.g. an achievements API that returns an XYZ version of a STAR achievement), make it industry-aware or reuse the same sectoral rules as Tailor so that non-tech roles can get CAR or an appropriate variant instead of a one-size-fits-all XYZ.
