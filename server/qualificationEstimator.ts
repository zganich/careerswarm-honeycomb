/**
 * Qualification Estimator — public API (Option A).
 * Uses LLM to estimate how well a current role qualifies for a target role (score, gaps, reasoning).
 */
import { invokeLLM } from "./_core/llm";

export type QualificationGap = {
  skill: string;
  importance: "critical" | "important" | "helpful";
  suggestion: string;
};

export type QualificationEstimate = {
  score: number;
  gaps: QualificationGap[];
  reasoning: string;
};

const SCHEMA = {
  type: "object" as const,
  properties: {
    score: {
      type: "number",
      description:
        "0-100 fit score: how well current role qualifies for target role",
    },
    reasoning: {
      type: "string",
      description: "Brief explanation of the assessment (2-4 sentences)",
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string", description: "Skill or area name" },
          importance: {
            type: "string",
            enum: ["critical", "important", "helpful"],
            description: "How important this gap is for the target role",
          },
          suggestion: {
            type: "string",
            description: "Actionable suggestion to close the gap",
          },
        },
        required: ["skill", "importance", "suggestion"],
        additionalProperties: false,
      },
      description:
        "3-5 gaps to address (critical first, then important, then helpful)",
    },
  },
  required: ["score", "reasoning", "gaps"],
  additionalProperties: false,
};

export type QualificationEstimateOutcome =
  | { ok: true; data: QualificationEstimate }
  | { ok: false; message: string };

export async function runEstimateQualification(context: {
  currentRole: string;
  targetRole: string;
}): Promise<QualificationEstimateOutcome> {
  const prompt = `You are a career transition advisor. Assess how well someone in the **current role** is qualified for the **target role**. Consider typical responsibilities, skills, and seniority.

Current role: ${context.currentRole}
Target role: ${context.targetRole}

Output JSON:
- score: 0-100 (how strong the qualification is; similar roles 60-90, adjacent 40-70, very different 10-50).
- reasoning: 2-4 sentences explaining the overall fit.
- gaps: 3-5 items. Each has: skill (short name), importance ("critical" | "important" | "helpful"), suggestion (one actionable sentence). Order by importance (critical first).`;

  let response: Awaited<ReturnType<typeof invokeLLM>>;
  try {
    response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You assess career role transitions. Output only valid JSON with score (0-100), reasoning, and gaps (array of { skill, importance, suggestion }).",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "qualification_estimate",
          strict: true,
          schema: SCHEMA,
        },
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Qualification estimate failed.";
    console.error("[QualificationEstimator]", msg);
    return {
      ok: false,
      message:
        "Estimate isn't available right now. Please try again in a moment.",
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
  let parsed: {
    score?: number;
    reasoning?: string;
    gaps?: Array<{
      skill?: string;
      importance?: string;
      suggestion?: string;
    }>;
  };
  try {
    parsed = JSON.parse(jsonStr || "{}");
  } catch {
    return { ok: false, message: "Could not parse estimate response." };
  }

  const rawScore = Number(parsed.score ?? 50);
  const score = Math.max(
    0,
    Math.min(100, Number.isFinite(rawScore) ? Math.round(rawScore) : 50)
  );
  const importanceSet = new Set(["critical", "important", "helpful"]);
  const gaps: QualificationGap[] = (
    Array.isArray(parsed.gaps) ? parsed.gaps : []
  )
    .slice(0, 5)
    .map((g: { skill?: string; importance?: string; suggestion?: string }) => ({
      skill: String(g?.skill ?? "Unknown").slice(0, 200),
      importance: importanceSet.has(String(g?.importance))
        ? (g!.importance as "critical" | "important" | "helpful")
        : "helpful",
      suggestion: String(g?.suggestion ?? "").slice(0, 500),
    }))
    .filter(g => g.skill && g.suggestion);

  // Ensure at least 3 gaps for API contract
  while (gaps.length < 3) {
    gaps.push({
      skill: "General experience",
      importance: "helpful",
      suggestion: "Gain more experience relevant to the target role.",
    });
  }

  return {
    ok: true,
    data: {
      score,
      gaps,
      reasoning:
        String(parsed.reasoning ?? "").trim() ||
        "Assessment based on typical requirements for the target role.",
    },
  };
}
