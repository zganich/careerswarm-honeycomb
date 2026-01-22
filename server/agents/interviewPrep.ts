import { invokeLLM } from "../_core/llm";
import { getModelForTask } from "../modelRouter";
import { compressText } from "../promptCompression";
import { cacheGet, cacheSet, CachePrefix, CacheTTL } from "../cache";

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "company-specific";
  difficulty: "easy" | "medium" | "hard";
  suggestedAnswer?: string;
  relevantAchievements?: string[];
}

interface InterviewPrepResult {
  questions: InterviewQuestion[];
  preparationTips: string[];
  companyInsights?: string;
}

/**
 * Generate interview prep questions based on job description and user achievements
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  companyName: string,
  userAchievements: Array<{ title: string; description: string; impact?: string }>,
  options?: {
    questionCount?: number;
    includeCompanyResearch?: boolean;
  }
): Promise<InterviewPrepResult> {
  const questionCount = options?.questionCount || 10;
  
  // Try cache first
  const cacheKey = `${CachePrefix.JD_ANALYSIS}interview:${companyName}:${jobDescription.slice(0, 100)}`;
  const cached = await cacheGet<InterviewPrepResult>(cacheKey);
  if (cached) {
    console.log("[InterviewPrep] Cache hit for interview questions");
    return cached;
  }

  // Prepare achievements summary
  const achievementsSummary = userAchievements
    .map((a, idx) => `${idx + 1}. ${a.title}: ${a.description}${a.impact ? ` (Impact: ${a.impact})` : ""}`)
    .join("\n");

  const model = getModelForTask("complex");

  const systemPrompt = compressText(`You are an expert interview coach specializing in helping candidates prepare for technical and behavioral interviews. Your goal is to generate realistic, relevant interview questions based on the job description and match them to the candidate's achievements.

Guidelines:
- Generate ${questionCount} diverse questions covering behavioral, technical, situational, and company-specific topics
- Questions should be realistic and commonly asked in interviews for this role
- For each question, suggest which of the user's achievements would make a strong answer
- Provide specific, actionable preparation tips
- Consider the company culture and industry when generating questions`);

  const userPrompt = `Job Description:
${jobDescription}

Company: ${companyName}

Candidate's Key Achievements:
${achievementsSummary}

Generate ${questionCount} interview questions that:
1. Are relevant to this specific role and company
2. Cover a mix of behavioral (STAR method), technical, situational, and company-specific questions
3. Match to the candidate's achievements where applicable
4. Range from easy to hard difficulty
5. Help the candidate showcase their strengths

Also provide:
- 5-7 specific preparation tips for this interview
${options?.includeCompanyResearch ? "- Brief company culture insights and what interviewers likely value" : ""}

Return as JSON:
{
  "questions": [
    {
      "question": "string",
      "category": "behavioral|technical|situational|company-specific",
      "difficulty": "easy|medium|hard",
      "suggestedAnswer": "Brief framework for answering using STAR or relevant achievement",
      "relevantAchievements": ["achievement titles that apply"]
    }
  ],
  "preparationTips": ["tip 1", "tip 2", ...],
  "companyInsights": "optional company culture notes"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "interview_prep",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  category: { 
                    type: "string",
                    enum: ["behavioral", "technical", "situational", "company-specific"]
                  },
                  difficulty: { 
                    type: "string",
                    enum: ["easy", "medium", "hard"]
                  },
                  suggestedAnswer: { type: "string" },
                  relevantAchievements: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["question", "category", "difficulty", "suggestedAnswer", "relevantAchievements"],
                additionalProperties: false
              }
            },
            preparationTips: {
              type: "array",
              items: { type: "string" }
            },
            companyInsights: { type: "string" }
          },
          required: ["questions", "preparationTips"],
          additionalProperties: false
        }
      }
    }
  }, model);

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content in LLM response");
  }

  const result: InterviewPrepResult = JSON.parse(content);

  // Cache for 7 days (interview questions don't change often)
  await cacheSet(cacheKey, result, CacheTTL.COMPANY_PROFILE);

  return result;
}

/**
 * Evaluate a practice answer and provide feedback
 */
export async function evaluatePracticeAnswer(
  question: string,
  userAnswer: string,
  relevantAchievements: string[]
): Promise<{
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
  revisedAnswer?: string;
}> {
  const model = getModelForTask("complex");

  const systemPrompt = compressText(`You are an expert interview coach providing constructive feedback on practice answers. Evaluate answers based on:
- Structure (STAR method for behavioral questions)
- Specificity and quantifiable results
- Relevance to the question
- Clarity and conciseness
- Confidence and professionalism`);

  const userPrompt = `Interview Question:
${question}

Candidate's Answer:
${userAnswer}

Relevant Achievements:
${relevantAchievements.join("\n")}

Evaluate this answer and provide:
1. Score (0-100)
2. 2-3 specific strengths
3. 2-3 specific areas for improvement
4. An improved version of the answer (optional, only if score < 70)

Return as JSON:
{
  "score": number,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "revisedAnswer": "optional improved version"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "answer_evaluation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            improvements: {
              type: "array",
              items: { type: "string" }
            },
            revisedAnswer: { type: "string" }
          },
          required: ["score", "strengths", "improvements"],
          additionalProperties: false
        }
      }
    }
  }, model);

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content in LLM response");
  }

  return JSON.parse(content);
}

/**
 * Generate follow-up questions based on initial answer
 */
export async function generateFollowUpQuestions(
  originalQuestion: string,
  userAnswer: string
): Promise<string[]> {
  const model = getModelForTask("simple");

  const prompt = `Based on this interview exchange, generate 2-3 realistic follow-up questions an interviewer might ask:

Question: ${originalQuestion}
Answer: ${userAnswer}

Return as JSON array of strings:
["follow-up question 1", "follow-up question 2", "follow-up question 3"]`;

  const response = await invokeLLM({
    messages: [
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "follow_up_questions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["questions"],
          additionalProperties: false
        }
      }
    }
  }, model);

  const content = response.choices[0].message.content;
  if (!content) {
    return [];
  }

  const parsed = JSON.parse(content);
  return parsed.questions || [];
}
