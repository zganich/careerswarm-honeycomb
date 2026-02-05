/**
 * Resume Roast – single responsibility: call OpenAI, return structured result or one error message.
 * Used by public.roast procedure only.
 */
import { invokeLLM } from "./_core/llm";

const ROAST_PROMPT = `You are a cynical VC recruiter. Roast the resume. Give 0-100 score and exactly 3 "Million-Dollar Mistakes" with title, explanation, and fix. No sugarcoating. Output JSON only: score, verdict (one sentence), brutalTruth (2-4 sentences), mistakes (array of 3 with title, explanation, fix).`;

const SCHEMA = {
  type: "object" as const,
  properties: {
    score: { type: "number" },
    verdict: { type: "string" },
    brutalTruth: { type: "string" },
    mistakes: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, explanation: { type: "string" }, fix: { type: "string" } },
        required: ["title", "explanation", "fix"],
        additionalProperties: false,
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ["score", "verdict", "brutalTruth", "mistakes"],
  additionalProperties: false,
};

export type RoastResult = {
  score: number;
  verdict: string;
  brutalTruth: string;
  mistakes: Array<{ title: string; explanation: string; fix: string }>;
  characterCount: number;
  wordCount: number;
};

export type RoastOutcome = { ok: true; data: RoastResult } | { ok: false; message: string };

const FALLBACK_RESULT: RoastResult = {
  score: 50,
  verdict: "Could not parse feedback.",
  brutalTruth: "The analysis could not be structured. Try again with plain text only.",
  mistakes: [
    { title: "Parse issue", explanation: "Response format was unexpected.", fix: "Retry with resume text only." },
    { title: "—", explanation: "—", fix: "—" },
    { title: "—", explanation: "—", fix: "—" },
  ],
  characterCount: 0,
  wordCount: 0,
};

export async function runRoast(resumeText: string): Promise<RoastOutcome> {
  const trimmed = resumeText.trim();
  const characterCount = trimmed.length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  let response: Awaited<ReturnType<typeof invokeLLM>>;
  try {
    response = await invokeLLM({
      messages: [
        { role: "system", content: ROAST_PROMPT },
        { role: "user", content: `Roast this resume:\n\n${trimmed}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "resume_roast", strict: true, schema: SCHEMA },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Resume roast failed.";
    console.error("[Roast]", msg);
    return { ok: false, message: "Resume roast isn't available right now. Please try again in a moment." };
  }

  if (!response?.choices?.[0]?.message) {
    console.error("[Roast] LLM returned empty or invalid response");
    return { ok: false, message: "Resume roast isn't available right now. Please try again in a moment." };
  }

  const raw = response.choices[0].message.content;
  const rawStr = typeof raw === "string" ? raw : "";
  const jsonStr = rawStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  let parsed: { score?: number; verdict?: string; brutalTruth?: string; mistakes?: Array<{ title?: string; explanation?: string; fix?: string }> };
  try {
    parsed = JSON.parse(jsonStr || "{}");
  } catch {
    return {
      ok: true,
      data: {
        ...FALLBACK_RESULT,
        characterCount,
        wordCount,
      },
    };
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) ?? 0)));
  const mistakes = (parsed.mistakes ?? []).slice(0, 3).map((m) => ({
    title: String(m.title ?? "").trim() || "Mistake",
    explanation: String(m.explanation ?? "").trim() || "",
    fix: String(m.fix ?? "").trim() || "",
  }));

  return {
    ok: true,
    data: {
      score,
      verdict: String(parsed.verdict ?? "").trim() || "See feedback below.",
      brutalTruth: String(parsed.brutalTruth ?? "").trim() || "Review the mistakes below.",
      mistakes,
      characterCount,
      wordCount,
    },
  };
}
