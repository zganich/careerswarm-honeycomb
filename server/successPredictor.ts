/**
 * Success Predictor — Stage 7 of the agent pipeline.
 * Uses LLM to estimate probability of success and surface green/red flags.
 */
import { invokeLLM } from "./_core/llm";

export type SuccessPrediction = {
  probability: number;
  reasoning: string;
  greenFlags: string[];
  redFlags: string[];
};

const SCHEMA = {
  type: "object" as const,
  properties: {
    probability: {
      type: "number",
      description: "0-100 estimate of success likelihood",
    },
    reasoning: {
      type: "string",
      description: "Brief explanation of the assessment",
    },
    greenFlags: {
      type: "array",
      items: { type: "string" },
      description: "Positive indicators (2-5 items)",
    },
    redFlags: {
      type: "array",
      items: { type: "string" },
      description: "Concerns or gaps (2-5 items)",
    },
  },
  required: ["probability", "reasoning", "greenFlags", "redFlags"],
  additionalProperties: false,
};

export type SuccessPredictorOutcome =
  | { ok: true; data: SuccessPrediction }
  | { ok: false; message: string };

export async function runSuccessPrediction(context: {
  roleTitle: string;
  companyName: string;
  jobDescription: string;
  tailoredResume: string;
  coverLetter?: string;
  candidateSummary?: string;
}): Promise<SuccessPredictorOutcome> {
  const prompt = `You are an expert recruiter assessing a candidate's fit for a job. Estimate the probability (0-100) that this candidate will advance to interview or offer based on resume/cover letter vs job requirements.

Role: ${context.roleTitle}
Company: ${context.companyName}

Job description:
${context.jobDescription.slice(0, 4000)}

Candidate's tailored resume:
${context.tailoredResume.slice(0, 4000)}
${context.coverLetter ? `\nCover letter:\n${context.coverLetter.slice(0, 1500)}` : ""}
${context.candidateSummary ? `\nCandidate summary: ${context.candidateSummary}` : ""}

Output JSON: probability (0-100), reasoning (2-4 sentences), greenFlags (2-5 positive indicators), redFlags (2-5 concerns or gaps). Be specific and actionable.`;

  let response: Awaited<ReturnType<typeof invokeLLM>>;
  try {
    response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You assess job applications. Output only valid JSON with probability, reasoning, greenFlags, redFlags.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "success_prediction",
          strict: true,
          schema: SCHEMA,
        },
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Success prediction failed.";
    console.error("[SuccessPredictor]", msg);
    return {
      ok: false,
      message: "Prediction isn't available right now. Please try again.",
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
    probability?: number;
    reasoning?: string;
    greenFlags?: string[];
    redFlags?: string[];
  };
  try {
    parsed = JSON.parse(jsonStr || "{}");
  } catch {
    return { ok: false, message: "Could not parse prediction response." };
  }

  const probability = Math.max(
    0,
    Math.min(100, Math.round(Number(parsed.probability) ?? 50))
  );
  const greenFlags = Array.isArray(parsed.greenFlags)
    ? parsed.greenFlags.map(String).filter(Boolean)
    : [];
  const redFlags = Array.isArray(parsed.redFlags)
    ? parsed.redFlags.map(String).filter(Boolean)
    : [];

  return {
    ok: true,
    data: {
      probability,
      reasoning:
        String(parsed.reasoning ?? "").trim() || "Assessment completed.",
      greenFlags,
      redFlags,
    },
  };
}
