/**
 * StrategyAgent: weekly GTM tactics, themes, channels, next actions.
 */

import { invokeLLM } from "../../_core/llm";

export interface StrategyInput {
  lastRunSummary?: string;
  kpiSnapshot?: Record<string, number>; // e.g. { leadsFound: 50, outreachSent: 10 }
}

export interface StrategyOutput {
  themes: string[];
  channels: string[];
  nextActions: string[];
  suggestedContent: string[];
}

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    themes: { type: "array", items: { type: "string" } },
    channels: { type: "array", items: { type: "string" } },
    nextActions: { type: "array", items: { type: "string" } },
    suggestedContent: { type: "array", items: { type: "string" } },
  },
  required: ["themes", "channels", "nextActions", "suggestedContent"],
  additionalProperties: false,
};

export async function executeStrategy(input: StrategyInput): Promise<StrategyOutput> {
  const context = [
    input.lastRunSummary && `Last run: ${input.lastRunSummary}`,
    input.kpiSnapshot && `KPIs: ${JSON.stringify(input.kpiSnapshot)}`,
  ].filter(Boolean).join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a GTM strategist for CareerSwarm (job application + JD Builder). Output weekly tactics: content themes, channels to focus on, next actions, and suggested content topics. Be concise. JSON only.",
      },
      {
        role: "user",
        content: `Generate this week's GTM strategy. ${context || "No prior context."} Output: themes (3-5), channels (linkedin, reddit, x, etc.), nextActions (3-5), suggestedContent (3-5 topic ideas).`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "strategy_output", strict: true, schema: OUTPUT_SCHEMA },
    },
    model: "gpt-4o-mini",
  });

  const raw = response.choices?.[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "";
  if (!content) throw new Error("Strategy: empty response");
  try {
    return JSON.parse(content) as StrategyOutput;
  } catch {
    throw new Error("Strategy: invalid JSON");
  }
}
