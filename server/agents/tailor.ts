import { invokeLLM } from '../_core/llm';
import { insertAgentMetric } from '../db';

interface TailorInput {
  userProfile: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    workExperience: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      achievements: string[];
    }>;
    skills: string[];
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      graduationYear: string;
    }>;
  };
  jobDescription: string;
  companyName: string;
  roleTitle: string;
}

interface TailorOutput {
  resumeMarkdown: string;
  keywordMatches: string[];
  confidence: number;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and split
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can']);
  
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Return unique keywords
  return Array.from(new Set(words));
}

export async function tailorResume(input: TailorInput, options?: { applicationId?: number; userId?: number }): Promise<TailorOutput> {
  const startTime = Date.now();
  
  try {
  const systemPrompt = `You are an expert Executive Recruiter and Resume Strategist.

Your task is to rewrite the user's resume to align perfectly with the target Job Description (JD).

**CRITICAL RULES - "Gold Standard":**

1. **CAR Framework Required:**
   - Context: Brief setup (1 sentence)
   - Action: What you did (specific, strong verbs)
   - Result: Quantified outcome (numbers, %, $, timeframe)

2. **Quantify Everything:**
   - Revenue numbers ($X million, X% growth)
   - Team sizes (X people, X partners)
   - Time saved (X hours, X% faster)
   - Contract values ($X ARR, X deals)

3. **No AI Fluff Words - BANNED:**
   - "orchestrated", "spearheaded", "leveraged", "synergized"
   - "visionary", "strategic thought leader", "game-changer"
   - "dynamic", "results-driven", "team player"
   
   **Use instead:** Built, Led, Created, Grew, Launched, Closed, Reduced, Increased

4. **Output Format:**
   - Markdown format
   - Contact info at top
   - Work experience in reverse chronological order
   - Bullet points only (no paragraphs)
   - Education at bottom

5. **Entrepreneurial Experience Framing:**
   - Frame startups as "Applied R&D" or "Technical Product Leadership"
   - Emphasize technical skills and product outcomes
   - Downplay equity/ownership, emphasize execution

**Your Goal:** Create a resume that:
- Passes ATS keyword matching (70%+ JD keyword coverage)
- Showcases relevant achievements in CAR format
- Removes irrelevant experience
- Keeps to 1-2 pages maximum`;

  const userPrompt = `**JOB DESCRIPTION:**
${input.jobDescription}

**COMPANY:** ${input.companyName}
**ROLE:** ${input.roleTitle}

**USER PROFILE:**
Name: ${input.userProfile.fullName}
Email: ${input.userProfile.email}
Phone: ${input.userProfile.phone}
Location: ${input.userProfile.location}
LinkedIn: ${input.userProfile.linkedIn}

**WORK EXPERIENCE:**
${input.userProfile.workExperience.map(exp => `
### ${exp.title} at ${exp.company}
${exp.startDate} - ${exp.endDate}
Achievements:
${exp.achievements.map(a => `- ${a}`).join('\n')}
`).join('\n')}

**SKILLS:**
${input.userProfile.skills.join(', ')}

**EDUCATION:**
${input.userProfile.education.map(edu => `
${edu.degree} in ${edu.field}
${edu.institution}, ${edu.graduationYear}
`).join('\n')}

---

**INSTRUCTIONS:**
1. Extract key requirements and keywords from the JD
2. Select the most relevant achievements from the user's experience
3. Rewrite each achievement in CAR format with quantified results
4. Order experience by relevance to this role
5. Include only skills mentioned in the JD or directly relevant
6. Output a complete resume in Markdown format

**REMEMBER:** No AI fluff words. Only quantified, specific achievements.`;

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
  const resumeMarkdown = typeof messageContent === 'string' ? messageContent : '';

  // Extract keyword matches
  const jdKeywords = extractKeywords(input.jobDescription);
  const resumeKeywords = extractKeywords(resumeMarkdown);
  const keywordMatches = jdKeywords.filter(keyword => 
    resumeKeywords.some(rk => rk.toLowerCase().includes(keyword.toLowerCase()))
  );

  // Calculate confidence based on keyword match rate
  const matchRate = jdKeywords.length > 0 
    ? (keywordMatches.length / jdKeywords.length) * 100 
    : 0;
  const confidence = Math.min(matchRate, 100);

    const duration = Date.now() - startTime;
    
    // Log success metric
    if (options?.applicationId || options?.userId) {
      await insertAgentMetric({
        agentType: 'tailor',
        duration,
        success: true,
        applicationId: options.applicationId,
        userId: options.userId,
        metadata: {
          keywordCount: keywordMatches.length,
          confidence: Math.round(confidence * 100) / 100,
          jdKeywordCount: jdKeywords.length,
        },
      });
    }
    
    return {
      resumeMarkdown,
      keywordMatches,
      confidence,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log error metric
    if (options?.applicationId || options?.userId) {
      await insertAgentMetric({
        agentType: 'tailor',
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
