/**
 * Pivot Analyzer — identifies bridge skills and strategy for career transitions.
 * Stores result in applications.pivotAnalysis. Tailor consumes it as pivotContext.
 */
import { invokeLLM } from "./_core/llm";

export type BridgeSkill = {
  skill: string;
  fromContext: string;
  toContext: string;
  strategicFrame: string;
};

export type PivotAnalysisResult = {
  bridgeSkills: BridgeSkill[];
  pivotStrategy: string;
  transferableStrengths: string[];
};

const SCHEMA = {
  type: "object" as const,
  properties: {
    bridgeSkills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          fromContext: { type: "string" },
          toContext: { type: "string" },
          strategicFrame: { type: "string" },
        },
        required: ["skill", "fromContext", "toContext", "strategicFrame"],
      },
      description: "3-5 bridge skills with from/to context and strategic frame",
    },
    pivotStrategy: {
      type: "string",
      description: "2-3 sentence overall pivot strategy",
    },
    transferableStrengths: {
      type: "array",
      items: { type: "string" },
      description: "3-5 unique value adds",
    },
  },
  required: ["bridgeSkills", "pivotStrategy", "transferableStrengths"],
  additionalProperties: false,
};

const FLUFF_WORDS =
  "synergy, leverage, utilize, robust, dynamic, innovative, cutting-edge, best-in-class, world-class, game-changing, disruptive";

export type PivotAnalyzerOutcome =
  | { ok: true; data: PivotAnalysisResult }
  | { ok: false; message: string };

export async function runPivotAnalysis(context: {
  roleTitle: string;
  companyName: string;
  jobDescription: string;
  achievementsSummary: string;
}): Promise<PivotAnalyzerOutcome> {
  const prompt = `You are a career transition strategist. Identify 3-5 Bridge Skills that connect the candidate's background to the target role. Be specific and concrete. Do NOT use these fluff words: ${FLUFF_WORDS}.

Target role: ${context.roleTitle}
Company: ${context.companyName}

Job description:
${context.jobDescription.slice(0, 4000)}

Candidate background (achievements/summary):
${context.achievementsSummary.slice(0, 2000)}

Output JSON:
- bridgeSkills: array of 3-5 items, each with: skill (name of the transferable skill), fromContext (how it appears in current role), toContext (how it applies to target role), strategicFrame (one sentence for interviews/resumes).
- pivotStrategy: 2-3 sentence overall strategy for this career pivot.
- transferableStrengths: 3-5 unique value adds the candidate brings.`;

  let response: Awaited<ReturnType<typeof invokeLLM>>;
  try {
    response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You identify bridge skills for career pivots. Output only valid JSON with bridgeSkills, pivotStrategy, transferableStrengths. No fluff words (e.g. ${FLUFF_WORDS}).`,
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pivot_analysis",
          strict: true,
          schema: SCHEMA,
        },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Pivot analysis failed.";
    console.error("[PivotAnalyzer]", msg);
    return {
      ok: false,
      message: "Pivot analysis isn't available right now. Please try again.",
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
    bridgeSkills?: Array<{
      skill?: string;
      fromContext?: string;
      toContext?: string;
      strategicFrame?: string;
    }>;
    pivotStrategy?: string;
    transferableStrengths?: unknown;
  };
  try {
    parsed = JSON.parse(jsonStr || "{}");
  } catch {
    return { ok: false, message: "Could not parse pivot analysis response." };
  }

  const bridgeSkills: BridgeSkill[] = (
    Array.isArray(parsed.bridgeSkills) ? parsed.bridgeSkills : []
  )
    .map(b => ({
      skill: String(b?.skill ?? "").trim(),
      fromContext: String(b?.fromContext ?? "").trim(),
      toContext: String(b?.toContext ?? "").trim(),
      strategicFrame: String(b?.strategicFrame ?? "").trim(),
    }))
    .filter(b => b.skill && b.fromContext && b.toContext && b.strategicFrame);
  const transferableStrengths = Array.isArray(parsed.transferableStrengths)
    ? parsed.transferableStrengths.map(String).filter(Boolean)
    : [];

  return {
    ok: true,
    data: {
      bridgeSkills: bridgeSkills.slice(0, 5),
      pivotStrategy:
        String(parsed.pivotStrategy ?? "").trim() || "Career pivot strategy.",
      transferableStrengths: transferableStrengths.slice(0, 5),
    },
  };
}
