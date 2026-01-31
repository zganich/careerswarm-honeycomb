/**
 * RecruiterFinderAgent: discover B2B leads from channel + optional raw text.
 * Uses LLM to extract recruiter/HR leads from pasted content (e.g. Reddit, LinkedIn export).
 */

import { invokeLLM } from "../../_core/llm";
import type { RecruiterFinderInput, RecruiterFinderOutput, RawB2BLead, SourceChannel } from "./types";

const EXTRACT_LEADS_SCHEMA = {
  type: "object" as const,
  properties: {
    leads: {
      type: "array",
      items: {
        type: "object",
        properties: {
          leadType: { type: "string", enum: ["recruiter_inhouse", "recruiter_agency", "hr_leader", "hiring_manager", "startup", "company"] },
          name: { type: "string" },
          title: { type: "string" },
          companyName: { type: "string" },
          companyDomain: { type: "string" },
          linkedinUrl: { type: "string" },
          email: { type: "string" },
          sourceUrl: { type: "string" },
          industry: { type: "string" },
          companySize: { type: "string" },
          geography: { type: "string" },
          signals: { type: "string" },
          vertical: { type: "string" },
          snippet: { type: "string" },
        },
        required: ["leadType"],
        additionalProperties: true,
      },
    },
  },
  required: ["leads"],
  additionalProperties: false,
};

export async function executeRecruiterFinder(input: RecruiterFinderInput): Promise<RecruiterFinderOutput> {
  const { channel, vertical, query, rawText } = input;

  if (rawText && rawText.trim().length > 100) {
    const extracted = await extractLeadsFromText(rawText, channel, vertical);
    return { leads: extracted };
  }

  // No raw text: return empty or placeholder (real discovery would use APIs/scraping)
  return { leads: [] };
}

async function extractLeadsFromText(
  text: string,
  sourceChannel: SourceChannel,
  vertical?: string
): Promise<RawB2BLead[]> {
  const systemPrompt = `You are a B2B lead extraction assistant. Given text from a recruiting/HR channel (e.g. Reddit, LinkedIn, Twitter), extract every person or company that could be a B2B lead for a Job Description Builder product. Focus on:
- Recruiters (in-house or agency)
- HR / Talent Acquisition leaders
- Hiring managers who post roles
- Startups/founders hiring
- Companies with career pages

For each lead output: leadType (recruiter_inhouse, recruiter_agency, hr_leader, hiring_manager, startup, company), name, title, companyName, linkedinUrl or email if visible, and a short signals/snippet. Use the given sourceChannel for sourceChannel.`;

  const userPrompt = `Source channel: ${sourceChannel}${vertical ? `\nVertical/industry focus: ${vertical}` : ""}\n\nExtract all recruiter/HR/hiring leads from this text:\n\n${text.slice(0, 12000)}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "extracted_leads",
        strict: true,
        schema: EXTRACT_LEADS_SCHEMA,
      },
    },
    model: "gpt-4o-mini",
  });

  const raw = response.choices?.[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "";
  if (!content) return [];

  try {
    const parsed = JSON.parse(content) as { leads: RawB2BLead[] };
    const leads = Array.isArray(parsed.leads) ? parsed.leads : [];
    return leads.map((l) => ({
      ...l,
      sourceChannel,
      vertical: l.vertical ?? vertical,
    }));
  } catch {
    return [];
  }
}
