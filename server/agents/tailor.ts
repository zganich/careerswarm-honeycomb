/**
 * Tailor agent: rewrites the user's resume to align with a target job description.
 * Job persona (Federal, Tech, Creative, Healthcare, Skilled Trades, Corporate, Academic, Legal, Education/Nonprofit) and
 * format (A/B/C) are inferred from the JD only; no pre-set industry or format is passed in.
 * Page length is inferred from work history (career level) and industry rules.
 */
import { invokeLLM } from "../_core/llm";
import { insertAgentMetric } from "../db";
import { getKeywordHintsForPrompt } from "../atsKeywordScorer";

interface TailorInput {
  userProfile: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    workExperience: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      achievements: string[];
    }>;
    skills: string[];
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      graduationYear: string;
    }>;
  };
  jobDescription: string;
  companyName: string;
  roleTitle: string;
  /** When present (career pivot), force Format B (Strategic Hybrid) with bridge skills at top */
  pivotContext?: {
    bridgeSkills?: Array<{ skill: string; toContext: string }>;
    pivotStrategy?: string;
    transferableStrengths?: string[];
  };
}

interface TailorOutput {
  resumeMarkdown: string;
  keywordMatches: string[];
  confidence: number;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and split
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Return unique keywords
  return Array.from(new Set(words));
}

export async function tailorResume(
  input: TailorInput,
  options?: { applicationId?: number; userId?: number }
): Promise<TailorOutput> {
  const startTime = Date.now();

  try {
    const systemPrompt = `You are an expert Executive Recruiter and Resume Strategist.

Your task is to rewrite the user's resume to align perfectly with the target Job Description (JD).

**PHASE 0 - Classify Job Persona & Select Format (Do this first):**
1. Analyze the JD. Classify as: Federal, Tech, Creative, Healthcare, Skilled Trades, Corporate, Academic, Legal, or Education/Nonprofit.
2. Select base format:
   - **Format A (Enhanced Reverse-Chronological)**: Corporate, Finance, Legal, Operations. Default for 90% of roles. Avoid if user has >6 month employment gaps.
   - **Format B (Strategic Hybrid)**: Career changers, pivot roles, executives, squiggly paths. Put robust Skills/Summary section at top, then work history.
   - **Format C (Functional)**: ONLY for massive employment gaps returning to workforce. Mark as HIGH RISK for ATS.
3. Infer career level from user work history (total years and number of roles). Apply page length: Entry (0–5 years) = 1 page max; Mid (5–10+ years) = 2 pages max; Senior/Executive (10–20+ years) = 3 pages max. Then apply industry override below.

**Page length by industry (overrides career-level default):**
- **Federal (USA)**: Always 2-page maximum (hard limit; longer = ineligible).
- **Academic / Research**: 2–4 pages acceptable (CV-style); senior faculty may be longer.
- **Legal**: 1–2 pages (1 page preferred for many firms).
- **Education / Nonprofit**: 1 page preferred; 2 pages OK with 10+ years experience.
- **Tech, Creative, Healthcare, Skilled Trades, Corporate**: Use career-level table (1 page entry, 1–2 mid, 2–3 senior/exec).

**Sectoral Optimization Rules (apply based on job persona):**
- **Tech & Engineering**: Artifact links (GitHub, Portfolio), Tech Stack section before Experience, Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]), metrics (latency, scalability, uptime)
- **Creative & Design**: Portfolio link mandatory, Visual-Strategic layout (clean typography, no columns/tables), metrics (conversion, engagement)
- **Federal (USA)**: 2-page max, include hours/week + salary + supervisor, dates MM/DD/YYYY
- **Healthcare & Medical Sales**: Keywords: GMP, Clinical Trials, Quota Attainment; Hybrid format; certifications/licenses prominent
- **Skilled Trades**: Equipment proficiency, safety records, apprenticeship; quantify reliability (0 incidents, 100% pass rate)
- **Academic / Research**: CV-style. Sections: Education, then Publications OR Research/Teaching (order by JD: research-focused vs teaching-focused), then Experience. Include grants, fellowships, conferences; quantify impact (citations, students advised, funding). Length 2–4 pages acceptable.
- **Legal**: Education first (law school, undergrad), then Bar admission, then Experience. Tailor to practice area: litigation (courtroom, case outcomes, motions) vs transactional (deals, contracts, due diligence). 1–2 pages. Formal language; avoid fluff.
- **Education / Nonprofit**: Mission alignment and values; teaching or program impact; 1 page preferred. Highlight outcomes (student outcomes, program reach, grants). Skills relevant to education/social impact.
- **Corporate**: Format A, CAR (Context–Action–Result)

**Regional Compliance (infer from job location):**
- **North America / UK / Australia**: No photos, age, marital status, religion; achievement-driven "I" statements
- **Germany / DACH**: Professional headshot expected, strict chronological, explain timeline gaps
- **France / Asia**: Photos acceptable; education often higher (France)

**ATS Safe Parse Guardrails (enforce in output):**
- Dates: MM/YYYY or Month YYYY only; never "Summer 2026"
- Layout: Single-column, no text boxes, sidebars, or tables
- Fonts: Arial, Calibri, Helvetica only
- Headers: Use "Experience", "Education", "Skills" — not creative labels like "My Journey"

**CRITICAL RULES - "Gold Standard":**

1. **CAR Framework Required:**
   - Context: Brief setup (1 sentence)
   - Action: What you did (specific, strong verbs)
   - Result: Quantified outcome (numbers, %, $, timeframe)

2. **Quantify Everything:**
   - Revenue numbers ($X million, X% growth)
   - Team sizes (X people, X partners)
   - Time saved (X hours, X% faster)
   - Contract values ($X ARR, X deals)

3. **No AI Fluff Words - BANNED:**
   - "orchestrated", "spearheaded", "leveraged", "synergized"
   - "visionary", "strategic thought leader", "game-changer"
   - "dynamic", "results-driven", "team player"
   
   **Use instead:** Built, Led, Created, Grew, Launched, Closed, Reduced, Increased

4. **Output Format:**
   - Markdown format
   - Contact info at top
   - Work experience in reverse chronological order
   - Bullet points only (no paragraphs)
   - Education at bottom

5. **Entrepreneurial Experience Framing:**
   - Frame startups as "Applied R&D" or "Technical Product Leadership"
   - Emphasize technical skills and product outcomes
   - Downplay equity/ownership, emphasize execution

**Your Goal:** Create a resume that:
- Passes ATS keyword matching (70%+ JD keyword coverage)
- Showcases relevant achievements in CAR format
- Removes irrelevant experience
- Respects the page length for this career level and industry (see PHASE 0 and page-length rules above)`;

    const pivotBlock = input.pivotContext
      ? `

**CAREER PIVOT - FORCE FORMAT B (Strategic Hybrid):**
This application is a career pivot. Use Format B: place a robust Skills/Summary section at the top framing capabilities and bridge skills, then work history.${input.pivotContext.pivotStrategy ? ` Strategy: ${input.pivotContext.pivotStrategy}` : ""}${input.pivotContext.transferableStrengths?.length ? ` Highlight: ${input.pivotContext.transferableStrengths.join(", ")}` : ""}
`
      : "";

    const keywordHints = getKeywordHintsForPrompt(input.jobDescription);
    const keywordBlock =
      keywordHints.length > 0
        ? `

**KEYWORDS TO WEAVE IN (ATS optimization - use naturally in achievements):**
${keywordHints.slice(0, 30).join(", ")}
`
        : "";

    const userPrompt = `**JOB DESCRIPTION:**
${input.jobDescription}

**COMPANY:** ${input.companyName}
**ROLE:** ${input.roleTitle}
${pivotBlock}${keywordBlock}
**USER PROFILE:**
Name: ${input.userProfile.fullName}
Email: ${input.userProfile.email}
Phone: ${input.userProfile.phone}
Location: ${input.userProfile.location}
LinkedIn: ${input.userProfile.linkedIn}

**WORK EXPERIENCE:**
${input.userProfile.workExperience
  .map(
    exp => `
### ${exp.title} at ${exp.company}
${exp.startDate} - ${exp.endDate}
Achievements:
${exp.achievements.map(a => `- ${a}`).join("\n")}
`
  )
  .join("\n")}

**SKILLS:**
${input.userProfile.skills.join(", ")}

**EDUCATION:**
${input.userProfile.education
  .map(
    edu => `
${edu.degree} in ${edu.field}
${edu.institution}, ${edu.graduationYear}
`
  )
  .join("\n")}

---

**INSTRUCTIONS:**
0. Classify the job persona (Federal, Tech, Creative, Healthcare, Skilled Trades, Corporate, Academic, Legal, Education/Nonprofit) and select the appropriate format (A, B, or C) per the rules above. Infer career level from work history and apply the correct page length; then apply industry override if applicable. Apply the matching sectoral and regional rules to your output.
1. Extract key requirements and keywords from the JD
2. Select the most relevant achievements from the user's experience
3. Rewrite each achievement in CAR format with quantified results
4. Order experience by relevance to this role
5. Include only skills mentioned in the JD or directly relevant
6. Output a complete resume in Markdown format

**REMEMBER:** No AI fluff words. Only quantified, specific achievements.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const resumeMarkdown =
      typeof messageContent === "string" ? messageContent : "";

    // Extract keyword matches
    const jdKeywords = extractKeywords(input.jobDescription);
    const resumeKeywords = extractKeywords(resumeMarkdown);
    const keywordMatches = jdKeywords.filter(keyword =>
      resumeKeywords.some(rk =>
        rk.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // Calculate confidence based on keyword match rate
    const matchRate =
      jdKeywords.length > 0
        ? (keywordMatches.length / jdKeywords.length) * 100
        : 0;
    const confidence = Math.min(matchRate, 100);

    const duration = Date.now() - startTime;

    // Log success metric
    if (options?.applicationId || options?.userId) {
      await insertAgentMetric({
        agentType: "tailor",
        duration,
        success: true,
        applicationId: options.applicationId,
        userId: options.userId,
        metadata: {
          keywordCount: keywordMatches.length,
          confidence: Math.round(confidence * 100) / 100,
          jdKeywordCount: jdKeywords.length,
        },
      });
    }

    return {
      resumeMarkdown,
      keywordMatches,
      confidence,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error metric
    if (options?.applicationId || options?.userId) {
      await insertAgentMetric({
        agentType: "tailor",
        duration,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        applicationId: options.applicationId,
        userId: options.userId,
      });
    }

    throw error;
  }
}
