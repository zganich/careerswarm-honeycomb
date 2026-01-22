/**
 * Scribe Agent - Cover Letter & Email Generation
 * 
 * Responsibilities:
 * - Generate personalized cover letters
 * - Create follow-up emails
 * - Write thank-you notes
 * - Draft networking messages
 */

import { invokeLLM } from "../_core/llm";
import { getModelForTask } from "../modelRouter";
import { CompressedPrompts, fillPromptTemplate } from "../promptCompression";
import { cacheGetOrSet, cacheKey, CachePrefix, CacheTTL } from "../cache";
import type { Achievement, Job, User } from "../../drizzle/schema";

/**
 * Generate cover letter
 */
export async function generateCoverLetter(
  user: User,
  job: Job,
  achievements: Achievement[]
): Promise<string> {
  const cacheKeyStr = cacheKey(
    CachePrefix.LLM_RESPONSE,
    "cover_letter",
    user.id.toString(),
    job.id.toString()
  );

  return cacheGetOrSet(
    cacheKeyStr,
    async () => {
      // Select top 3 most relevant achievements
      const topAchievements = achievements
        .slice(0, 3)
        .map((a) => a.xyzAccomplishment || `${a.action} ${a.result}`)
        .join("\n");

      const prompt = `${CompressedPrompts.COVER_LETTER}

Job: ${job.title} at ${job.companyName}
Candidate: ${user.name}
Top Achievements:
${topAchievements}

Write a compelling cover letter.`;

      const response = await invokeLLM({
        model: getModelForTask("COVER_LETTER_GENERATION"),
        messages: [
          {
            role: "system",
            content: "You are an expert at writing professional cover letters.",
          },
          { role: "user", content: prompt },
        ],
      });

      return String(response.choices[0]?.message?.content || "");
    },
    CacheTTL.LLM_RESPONSE
  );
}

/**
 * Generate follow-up email
 */
export async function generateFollowUpEmail(
  job: Job,
  daysSinceApplication: number
): Promise<string> {
  const prompt = `Write a professional follow-up email for a job application:

Job: ${job.title} at ${job.companyName}
Days since application: ${daysSinceApplication}

Keep it brief (3-4 sentences), polite, and express continued interest.`;

  const response = await invokeLLM({
    model: getModelForTask("EMAIL_PARSING"),
    messages: [
      {
        role: "system",
        content: "You are an expert at writing professional emails.",
      },
      { role: "user", content: prompt },
    ],
  });

  return String(response.choices[0]?.message?.content || "");
}

/**
 * Generate thank-you note after interview
 */
export async function generateThankYouNote(
  job: Job,
  interviewerName: string,
  keyDiscussionPoints: string[]
): Promise<string> {
  const prompt = `Write a thank-you email after an interview:

Job: ${job.title} at ${job.companyName}
Interviewer: ${interviewerName}
Discussion points: ${keyDiscussionPoints.join(", ")}

Keep it warm, specific, and reaffirm interest. 4-5 sentences.`;

  const response = await invokeLLM({
    model: getModelForTask("EMAIL_PARSING"),
    messages: [
      {
        role: "system",
        content: "You are an expert at writing professional thank-you notes.",
      },
      { role: "user", content: prompt },
    ],
  });

  return String(response.choices[0]?.message?.content || "");
}

/**
 * Generate networking message (LinkedIn, email)
 */
export async function generateNetworkingMessage(
  recipientName: string,
  recipientTitle: string,
  companyName: string,
  purpose: "informational_interview" | "referral" | "introduction"
): Promise<string> {
  const purposeText = {
    informational_interview: "request an informational interview",
    referral: "ask for a referral",
    introduction: "introduce yourself",
  };

  const prompt = `Write a professional networking message to ${purposeText[purpose]}:

Recipient: ${recipientName}, ${recipientTitle} at ${companyName}
Purpose: ${purposeText[purpose]}

Keep it concise (3-4 sentences), respectful of their time, and clear about your ask.`;

  const response = await invokeLLM({
    model: getModelForTask("EMAIL_PARSING"),
    messages: [
      {
        role: "system",
        content: "You are an expert at writing professional networking messages.",
      },
      { role: "user", content: prompt },
    ],
  });

  return String(response.choices[0]?.message?.content || "");
}
