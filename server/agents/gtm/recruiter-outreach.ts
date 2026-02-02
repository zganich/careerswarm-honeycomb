/**
 * RecruiterOutreachAgent: draft recruiter/corporate outreach (email, LinkedIn DM) for JD Builder.
 */

import { invokeLLM } from "../../_core/llm";

export type RecruiterOutreachAudience = "recruiter" | "hr";

export interface RecruiterOutreachInput {
  audience: RecruiterOutreachAudience;
  leadName?: string;
  leadTitle?: string;
  companyName?: string;
  channel: "email" | "linkedin";
  keyMessage?: string; // one key value prop to emphasize
}

export interface RecruiterOutreachOutput {
  subject?: string;
  body: string;
  cta: string;
}

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
    cta: { type: "string" },
  },
  required: ["body", "cta"],
  additionalProperties: false,
};

export async function executeRecruiterOutreach(input: RecruiterOutreachInput): Promise<RecruiterOutreachOutput> {
  const systemPrompt = `You are a B2B outreach writer for CareerSwarm's Job Description Builder. Write short, personal outreach to recruiters or HR. Value prop: ATS-friendly job descriptions in minutes at a fraction of the cost of Textio/Greenhouse. No fluff. One clear CTA (e.g. try 1 free JD, book a demo). Output JSON: subject (for email), body (2-4 short paragraphs), cta (single sentence).`;

  const audienceDesc = input.audience === "recruiter" ? "recruiter or talent acquisition" : "HR or hiring leader";
  const channelDesc = input.channel === "email" ? "email" : "LinkedIn DM (shorter, 2-3 sentences)";
  const context = [
    input.leadName && `Name: ${input.leadName}`,
    input.leadTitle && `Title: ${input.leadTitle}`,
    input.companyName && `Company: ${input.companyName}`,
    input.keyMessage && `Emphasize: ${input.keyMessage}`,
  ].filter(Boolean).join("\n");

  const userPrompt = `Write ${channelDesc} outreach to a ${audienceDesc}. ${context || "Generic outreach."} Keep it under 150 words for email, under 300 chars for LinkedIn. Output JSON with subject, body, cta.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recruiter_outreach",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
    model: "gpt-4o-mini",
  });

  const raw = response.choices?.[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "";
  if (!content) throw new Error("RecruiterOutreach: empty response");

  try {
    const parsed = JSON.parse(content) as RecruiterOutreachOutput;
    return {
      subject: parsed.subject ?? "",
      body: parsed.body ?? "",
      cta: parsed.cta ?? "",
    };
  } catch {
    throw new Error("RecruiterOutreach: invalid JSON response");
  }
}
