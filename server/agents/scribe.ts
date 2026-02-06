import { invokeLLM } from "../_core/llm";
import { insertAgentMetric } from "../db";

interface ScribeInput {
  userProfile: {
    fullName: string;
    currentTitle: string;
    topAchievements: string[];
  };
  companyName: string;
  roleTitle: string;
  strategicMemo: string; // From Profiler agent
  jobDescription: string;
}

interface ScribeOutput {
  coverLetter: string;
  linkedInMessage: string;
}

export async function generateOutreach(
  input: ScribeInput,
  options?: { applicationId?: number; userId?: number }
): Promise<ScribeOutput> {
  const startTime = Date.now();

  try {
    const systemPrompt = `You are a peer-level candidate writing to a Hiring Manager.

**Your task:** Write a cover letter and LinkedIn connection message.

**CRITICAL RULES:**

1. **Cover Letter (Max 150 words):**
   - Hook: Reference company news or strategic memo insight
   - Relevance: Connect your specific project/achievement to their need
   - Question: End with a strategic question (NOT "coffee chat")
   - Tone: Confident peer, not supplicant

2. **LinkedIn Message (Max 300 characters):**
   - Open with Hook (company news or product launch)
   - Connect your relevant experience (one specific project)
   - End with question or value proposition
   - NO generic "I'd love to connect"

3. **Banned Phrases:**
   - "I am writing to express interest..."
   - "As a seasoned professional..."
   - "I would love the opportunity..."
   - "Please feel free to contact me..."
   - "I look forward to hearing from you..."

4. **Use Instead:**
   - Direct statements of value
   - Specific examples
   - Confident questions
   - Peer-to-peer tone

**Your Goal:** Sound like an equal who has something valuable to offer, not someone begging for a job.`;

    const userPrompt = `**COMPANY:** ${input.companyName}
**ROLE:** ${input.roleTitle}

**STRATEGIC MEMO (from company analysis):**
${input.strategicMemo}

**JOB DESCRIPTION:**
${input.jobDescription}

**YOUR PROFILE:**
Name: ${input.userProfile.fullName}
Current: ${input.userProfile.currentTitle}

Top Achievements:
${input.userProfile.topAchievements.map((a, i) => `${i + 1}. ${a}`).join("\n")}

---

**INSTRUCTIONS:**

1. Analyze the strategic memo to find the "Hook" (recent funding, product launch, expansion)
2. Select the most relevant achievement that addresses their pain point
3. Write a cover letter (150 words max) that:
   - Opens with the Hook
   - Connects your achievement to their need
   - Ends with a strategic question
4. Write a LinkedIn message (300 characters max) that:
   - References the Hook
   - Mentions one specific relevant project
   - Ends with value proposition or question

**Output Format:**
## COVER LETTER
[150 words max]

## LINKEDIN MESSAGE
[300 characters max]`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const output = typeof messageContent === "string" ? messageContent : "";

    // Parse output
    const coverLetterMatch = output.match(
      /## COVER LETTER\n([\s\S]*?)(?=## LINKEDIN MESSAGE|$)/
    );
    const linkedInMatch = output.match(/## LINKEDIN MESSAGE\n([\s\S]*?)$/);

    const coverLetter = coverLetterMatch ? coverLetterMatch[1].trim() : "";
    const linkedInMessage = linkedInMatch ? linkedInMatch[1].trim() : "";

    const duration = Date.now() - startTime;

    // Log success metric
    if (options?.applicationId || options?.userId) {
      await insertAgentMetric({
        agentType: "scribe",
        duration,
        success: true,
        applicationId: options.applicationId,
        userId: options.userId,
        metadata: {
          coverLetterLength: coverLetter.length,
          linkedInMessageLength: linkedInMessage.length,
        },
      });
    }

    return {
      coverLetter,
      linkedInMessage,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error metric
    if (options?.applicationId || options?.userId) {
      await insertAgentMetric({
        agentType: "scribe",
        duration,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        applicationId: options.applicationId,
        userId: options.userId,
      });
    }

    throw error;
  }
}
