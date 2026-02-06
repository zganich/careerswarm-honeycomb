/**
 * JDBuilderAgent: generate ATS-friendly job descriptions for B2B (recruiters/corporations).
 */

import { invokeLLM } from "../../_core/llm";

export interface JDBuilderInput {
  roleTitle: string;
  companyName: string;
  department?: string;
  mustHaves?: string[];
  niceToHaves?: string[];
  level?: string; // e.g. Senior, Mid, Junior
  location?: string; // e.g. Remote, NYC, Hybrid
  compensationRange?: string;
}

export interface JDBuilderOutput {
  summary: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  fullText: string;
}

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" },
    responsibilities: { type: "string" },
    requirements: { type: "string" },
    benefits: { type: "string" },
    fullText: { type: "string" },
  },
  required: [
    "summary",
    "responsibilities",
    "requirements",
    "benefits",
    "fullText",
  ],
  additionalProperties: false,
};

export async function executeJDBuilder(
  input: JDBuilderInput
): Promise<JDBuilderOutput> {
  const mustHaves = (input.mustHaves ?? []).join(", ") || "Not specified";
  const niceToHaves = (input.niceToHaves ?? []).join(", ") || "None";
  const level = input.level ?? "Not specified";
  const location = input.location ?? "Not specified";
  const comp = input.compensationRange ?? "Competitive";

  const systemPrompt = `You are an expert HR and job description writer. Create ATS-friendly, inclusive, and clear job descriptions. Output:
- summary: 2-4 sentences about the role and team
- responsibilities: bullet list (markdown) of key responsibilities
- requirements: bullet list of must-haves and nice-to-haves
- benefits: short list of benefits (markdown)
- fullText: complete JD as a single markdown document (title, company, summary, responsibilities, requirements, benefits, EEO statement). Use clear headings.`;

  const userPrompt = `Create a job description for:
Role: ${input.roleTitle}
Company: ${input.companyName}
${input.department ? `Department: ${input.department}` : ""}
Level: ${level}
Location: ${location}
Compensation: ${comp}
Must-haves: ${mustHaves}
Nice-to-haves: ${niceToHaves}

Output JSON with summary, responsibilities, requirements, benefits, and fullText (full markdown JD).`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "jd_output",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
    model: "gpt-4o-mini",
  });

  const raw = response.choices?.[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "";
  if (!content) throw new Error("JD Builder: empty response");

  try {
    const parsed = JSON.parse(content) as JDBuilderOutput;
    return {
      summary: parsed.summary ?? "",
      responsibilities: parsed.responsibilities ?? "",
      requirements: parsed.requirements ?? "",
      benefits: parsed.benefits ?? "",
      fullText: parsed.fullText ?? "",
    };
  } catch {
    throw new Error("JD Builder: invalid JSON response");
  }
}
