/**
 * Qualifier Agent - Resume-Job Matching & Scoring
 * 
 * Responsibilities:
 * - Analyze job requirements vs user achievements
 * - Calculate qualification score (0-100)
 * - Identify matched and missing skills
 * - Provide reasoning for score
 */

import { invokeLLM } from "../_core/llm";
import { getModelForTask } from "../modelRouter";
import { CompressedPrompts, fillPromptTemplate } from "../promptCompression";
import { cacheGetOrSet, cacheKey, CachePrefix, CacheTTL } from "../cache";
import type { Achievement, Job } from "../../drizzle/schema";

export interface QualificationResult {
  score: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
  recommendation: "strong_match" | "good_match" | "weak_match" | "poor_match";
}

/**
 * Qualify user for a job based on achievements
 */
export async function qualifyForJob(
  job: Job,
  achievements: Achievement[]
): Promise<QualificationResult> {
  const cacheKeyStr = cacheKey(
    CachePrefix.JOB_LISTING,
    "qualify",
    job.id.toString(),
    achievements.map(a => a.id).join(",")
  );

  return cacheGetOrSet(
    cacheKeyStr,
    async () => {
      // Build achievement summary
      const achievementSummary = achievements
        .map((a) => {
          const xyz = a.xyzAccomplishment || `${a.action} ${a.result}`;
          return `- ${xyz} (${a.roleTitle} at ${a.company})`;
        })
        .join("\n");

      const prompt = fillPromptTemplate(CompressedPrompts.RESUME_MATCHING, {
        jobTitle: job.title,
        jobDescription: job.description || "",
        requiredSkills: (job.requiredSkills || []).join(", "),
        achievements: achievementSummary,
      });

      const response = await invokeLLM({
        model: getModelForTask("RESUME_MATCHING"),
        messages: [
          {
            role: "system",
            content: "You are an expert at matching candidates to job requirements.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "qualification_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                score: { type: "number", description: "0-100" },
                matchedSkills: { type: "array", items: { type: "string" } },
                missingSkills: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" },
              },
              required: ["score", "matchedSkills", "missingSkills", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = String(response.choices[0]?.message?.content || "{}");
      const parsed = JSON.parse(content);

      // Determine recommendation based on score
      let recommendation: QualificationResult["recommendation"];
      if (parsed.score >= 80) recommendation = "strong_match";
      else if (parsed.score >= 60) recommendation = "good_match";
      else if (parsed.score >= 40) recommendation = "weak_match";
      else recommendation = "poor_match";

      return {
        score: parsed.score,
        matchedSkills: parsed.matchedSkills,
        missingSkills: parsed.missingSkills,
        reasoning: parsed.reasoning,
        recommendation,
      };
    },
    CacheTTL.JD_ANALYSIS
  );
}

/**
 * Batch qualify multiple jobs
 */
export async function qualifyMultipleJobs(
  jobs: Job[],
  achievements: Achievement[]
): Promise<Map<number, QualificationResult>> {
  const results = new Map<number, QualificationResult>();

  // Process in parallel
  await Promise.all(
    jobs.map(async (job) => {
      const result = await qualifyForJob(job, achievements);
      results.set(job.id, result);
    })
  );

  return results;
}

/**
 * Get top N qualified jobs
 */
export function getTopQualifiedJobs(
  jobs: Job[],
  qualifications: Map<number, QualificationResult>,
  limit: number = 10
): Array<{ job: Job; qualification: QualificationResult }> {
  return jobs
    .map((job) => ({
      job,
      qualification: qualifications.get(job.id)!,
    }))
    .filter((item) => item.qualification)
    .sort((a, b) => b.qualification.score - a.qualification.score)
    .slice(0, limit);
}
