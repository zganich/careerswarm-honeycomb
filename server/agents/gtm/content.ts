/**
 * ContentAgent: channel-aware content (LinkedIn, Reddit, X, TikTok, email).
 */

import { invokeLLM } from "../../_core/llm";

export type ContentChannel = "linkedin" | "reddit" | "x" | "tiktok" | "email";

export interface ContentInput {
  channel: ContentChannel;
  theme: string;
  tone?: "professional" | "casual" | "helpful";
  wordLimit?: number;
}

export interface ContentOutput {
  title: string;
  body: string;
  cta: string;
}

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    cta: { type: "string" },
  },
  required: ["title", "body", "cta"],
  additionalProperties: false,
};

const CHANNEL_GUIDE: Record<ContentChannel, string> = {
  linkedin: "Professional, 2-4 short paragraphs. No hype. Value-first.",
  reddit: "Helpful, no marketing speak. Under 200 words. Add value to the community.",
  x: "Thread or single tweet. Under 280 chars per tweet. Hook + CTA.",
  tiktok: "Hook in first 3 seconds. Short script, 30-60 sec. Casual.",
  email: "Subject line + 2-3 short paragraphs. Clear CTA.",
};

export async function executeContent(input: ContentInput): Promise<ContentOutput> {
  const guide = CHANNEL_GUIDE[input.channel];
  const limit = input.wordLimit ?? (input.channel === "x" ? 50 : 150);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a content writer for CareerSwarm (job application + JD Builder). Write for the given channel. ${guide} Keep under ${limit} words. Output JSON: title, body, cta.`,
      },
      {
        role: "user",
        content: `Channel: ${input.channel}. Theme: ${input.theme}. Tone: ${input.tone ?? "professional"}. Write one piece of content.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "content_output", strict: true, schema: OUTPUT_SCHEMA },
    },
    model: "gpt-4o-mini",
  });

  const raw = response.choices?.[0]?.message?.content;
  const content = typeof raw === "string" ? raw : "";
  if (!content) throw new Error("Content: empty response");
  try {
    return JSON.parse(content) as ContentOutput;
  } catch {
    throw new Error("Content: invalid JSON");
  }
}
