/**
 * Skill Gap Analyzer — identifies missing skills vs job requirements and suggests upskilling.
 * Stores result in applications.analytics.skillGap.
 */
import { invokeLLM } from "./_core/llm";

export type SkillGapResult = {
  missingSkills: string[];
  upskillingPlan: string[];
};

const SCHEMA = {
  type: "object" as const,
  properties: {
    missingSkills: {
      type: "array",
      items: { type: "string" },
      description: "1-8 critical skills missing from candidate profile",
    },
    upskillingPlan: {
      type: "array",
      items: { type: "string" },
      description: "Actionable steps with resources or time estimates",
    },
  },
  required: ["missingSkills", "upskillingPlan"],
  additionalProperties: false,
};

export type SkillGapOutcome =
  | { ok: true; data: SkillGapResult }
  | { ok: false; message: string };

export async function runSkillGapAnalysis(context: {
  roleTitle: string;
  companyName: string;
  jobDescription: string;
  userSkills: string[];
  achievementsSummary?: string;
}): Promise<SkillGapOutcome> {
  const skillsText =
    context.userSkills.length > 0
      ? context.userSkills.join(", ")
      : "None listed yet.";
  const prompt = `You are a career development advisor. Compare the job requirements to the candidate's current skills and produce a focused skill gap analysis.

Role: ${context.roleTitle}
Company: ${context.companyName}

Job description:
${context.jobDescription.slice(0, 4000)}

Candidate's current skills (from profile): ${skillsText}
${context.achievementsSummary ? `\nCandidate achievements summary: ${context.achievementsSummary.slice(0, 1500)}` : ""}

Output JSON:
- missingSkills: 1-8 critical skills the job requires that the candidate lacks or under-demonstrates. Be specific (e.g. "Python data analysis", "Agile ceremonies").
- upskillingPlan: 3-8 actionable steps to close the gap (e.g. "Complete Google Analytics certification (≈40 hrs)", "Practice system design with Pramp (2-3 sessions)"). Include rough time or resource hints where helpful.`;

  let response: Awaited<ReturnType<typeof invokeLLM>>;
  try {
    response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You analyze skill gaps and create upskilling plans. Output only valid JSON with missingSkills and upskillingPlan.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "skill_gap",
          strict: true,
          schema: SCHEMA,
        },
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Skill gap analysis failed.";
    console.error("[SkillGapAnalyzer]", msg);
    return {
      ok: false,
      message: "Analysis isn't available right now. Please try again.",
    };
  }

  const raw = (
    response as { choices?: Array<{ message?: { content?: unknown } }> }
  )?.choices?.[0]?.message?.content;
  const rawStr = typeof raw === "string" ? raw : "";
  const jsonStr = rawStr
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  let parsed: { missingSkills?: unknown; upskillingPlan?: unknown };
  try {
    parsed = JSON.parse(jsonStr || "{}");
  } catch {
    return { ok: false, message: "Could not parse skill gap response." };
  }

  const missingSkills = Array.isArray(parsed.missingSkills)
    ? parsed.missingSkills.map(String).filter(Boolean)
    : [];
  const upskillingPlan = Array.isArray(parsed.upskillingPlan)
    ? parsed.upskillingPlan.map(String).filter(Boolean)
    : [];

  return {
    ok: true,
    data: {
      missingSkills: missingSkills.slice(0, 8),
      upskillingPlan: upskillingPlan.slice(0, 8),
    },
  };
}
