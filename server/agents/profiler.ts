/**
 * Profiler Agent - Company Research & Intelligence
 * 
 * Responsibilities:
 * - Research company background and culture
 * - Analyze tech stack and tools
 * - Find recent news and funding
 * - Identify hiring managers and key contacts
 */

import { invokeLLM } from "../_core/llm";
import { getModelForTask } from "../modelRouter";
import { CompressedPrompts } from "../promptCompression";
import { cacheGetOrSet, cacheKey, CachePrefix, CacheTTL } from "../cache";
import type { Company } from "../../drizzle/schema";

export interface CompanyProfile {
  industry: string;
  size: string;
  culture: string;
  recentNews: Array<{ title: string; url: string; date: string }>;
  techStack: string[];
  hiringTrends: string;
}

/**
 * Research company profile
 */
export async function researchCompany(companyName: string): Promise<CompanyProfile> {
  const cacheKeyStr = cacheKey(CachePrefix.COMPANY_PROFILE, companyName);

  return cacheGetOrSet(
    cacheKeyStr,
    async () => {
      const prompt = `${CompressedPrompts.COMPANY_RESEARCH}\n\nCompany: ${companyName}`;

      const response = await invokeLLM({
        model: getModelForTask("COMPANY_RESEARCH"),
        messages: [
          {
            role: "system",
            content: "You are an expert at researching companies.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "company_profile",
            strict: true,
            schema: {
              type: "object",
              properties: {
                industry: { type: "string" },
                size: { type: "string" },
                culture: { type: "string" },
                recentNews: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" },
                      date: { type: "string" },
                    },
                    required: ["title", "url", "date"],
                    additionalProperties: false,
                  },
                },
                techStack: { type: "array", items: { type: "string" } },
                hiringTrends: { type: "string" },
              },
              required: ["industry", "size", "culture", "recentNews", "techStack", "hiringTrends"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = String(response.choices[0]?.message?.content || "{}");
      return JSON.parse(content);
    },
    CacheTTL.COMPANY_PROFILE
  );
}

/**
 * Generate company-specific talking points for interview
 */
export async function generateTalkingPoints(
  companyName: string,
  jobTitle: string
): Promise<string[]> {
  const profile = await researchCompany(companyName);

  const prompt = `Based on this company profile, generate 5 talking points for a ${jobTitle} interview:

Company: ${companyName}
Industry: ${profile.industry}
Culture: ${profile.culture}
Tech Stack: ${profile.techStack.join(", ")}
Recent News: ${profile.recentNews.map((n) => n.title).join("; ")}

Return 5 specific, actionable talking points.`;

  const response = await invokeLLM({
    model: getModelForTask("INTERVIEW_PREP"),
    messages: [
      {
        role: "system",
        content: "You are an expert career coach.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "talking_points",
        strict: true,
        schema: {
          type: "object",
          properties: {
            points: { type: "array", items: { type: "string" } },
          },
          required: ["points"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = String(response.choices[0]?.message?.content || "{}");
  const parsed = JSON.parse(content);
  return parsed.points;
}
