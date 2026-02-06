/**
 * ReportAgent: GTM performance summary, lead counts, outreach stats, next priorities.
 */

import { invokeLLM } from "../../_core/llm";

export interface ReportInput {
  leadCount?: number;
  outreachDrafted?: number;
  outreachSent?: number;
  lastStrategy?: string;
  kpiSnapshot?: Record<string, number>;
}

export interface ReportOutput {
  summary: string;
  highlights: string[];
  risks: string[];
  nextPriorities: string[];
}

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" },
    highlights: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    nextPriorities: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "highlights", "risks", "nextPriorities"],
  additionalProperties: false,
};

export async function executeReport(input: ReportInput): Promise<ReportOutput> {
  const context = [
    input.leadCount != null && `Leads in DB: ${input.leadCount}`,
    input.outreachDrafted != null &&
      `Outreach drafted: ${input.outreachDrafted}`,
    input.outreachSent != null && `Outreach sent: ${input.outreachSent}`,
    input.lastStrategy && `Last strategy: ${input.lastStrategy}`,
    input.kpiSnapshot && `KPIs: ${JSON.stringify(input.kpiSnapshot)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a GTM analyst for CareerSwarm. Summarize performance, list highlights and risks, and suggest next priorities. Be concise. Markdown-friendly. JSON only.",
      },
      {
        role: "user",
        content: `Generate weekly GTM report. ${context || "No data yet."} Output: summary (2-4 sentences), highlights (3-5), risks (1-3), nextPriorities (3-5).`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "report_output",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
    model: "gpt-4o-mini",
  });

  const raw = response.choices?.[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "";
  if (!content) throw new Error("Report: empty response");
  try {
    return JSON.parse(content) as ReportOutput;
  } catch {
    throw new Error("Report: invalid JSON");
  }
}
