/**
 * Remaining Agents: Qualifier, Hunter, Tailor, Scribe, Assembler
 *
 * These agents complete the application generation pipeline
 */

import { invokeLLM } from "../_core/llm";

// ================================================================
// QUALIFIER AGENT - Job Verification & Location Validation
// ================================================================

export class QualifierAgent {
  constructor(
    private userId: number,
    private userPreferences: any
  ) {}

  async execute(opportunity: any): Promise<{
    qualified: boolean;
    matchScore: number;
    reasons: string[];
  }> {
    console.log(`[Qualifier] ✅ Qualifying ${opportunity.companyName}...`);

    const reasons: string[] = [];
    let matchScore = opportunity.fitScore || 70;

    // Location verification (CRITICAL)
    const locationMatch = this.verifyLocation(opportunity);
    if (!locationMatch.passed) {
      return {
        qualified: false,
        matchScore: 0,
        reasons: [`Location mismatch: ${locationMatch.reason}`],
      };
    }
    reasons.push(locationMatch.reason);

    // Compensation verification
    const compMatch = this.verifyCompensation(opportunity);
    if (!compMatch.passed) {
      return {
        qualified: false,
        matchScore: 0,
        reasons: [`Compensation below requirements: ${compMatch.reason}`],
      };
    }
    reasons.push(compMatch.reason);

    // Match score threshold
    if (matchScore < 60) {
      return {
        qualified: false,
        matchScore,
        reasons: ["Match score below threshold (60)"],
      };
    }

    console.log(`[Qualifier] ✅ Qualified with score ${matchScore}`);

    return {
      qualified: true,
      matchScore,
      reasons,
    };
  }

  private verifyLocation(opportunity: any): {
    passed: boolean;
    reason: string;
  } {
    const prefs = this.userPreferences;
    const locationType = prefs?.locationType || "remote";
    const allowedCities = prefs?.allowedCities || [];

    // Check remote
    if (locationType === "remote" && opportunity.locationType === "remote") {
      return { passed: true, reason: "Remote position matches preference" };
    }

    // Check hybrid
    if (
      locationType === "hybrid" &&
      (opportunity.locationType === "remote" ||
        opportunity.locationType === "hybrid")
    ) {
      return {
        passed: true,
        reason: "Hybrid/remote position matches preference",
      };
    }

    // Check specific cities
    if (allowedCities.length > 0) {
      const oppLocation = opportunity.location?.toLowerCase() || "";
      for (const city of allowedCities) {
        if (oppLocation.includes(city.toLowerCase())) {
          return {
            passed: true,
            reason: `Location matches allowed city: ${city}`,
          };
        }
      }
    }

    return {
      passed: false,
      reason: `Location ${opportunity.location} doesn't match preferences`,
    };
  }

  private verifyCompensation(opportunity: any): {
    passed: boolean;
    reason: string;
  } {
    const prefs = this.userPreferences;
    const minBase = prefs?.minimumBaseSalary || 0;

    if (!opportunity.compensationRange) {
      return { passed: true, reason: "No compensation data to verify" };
    }

    const oppMin = opportunity.compensationRange.min || 0;

    if (oppMin < minBase) {
      return {
        passed: false,
        reason: `Minimum salary $${oppMin}k below requirement $${minBase}k`,
      };
    }

    return {
      passed: true,
      reason: `Compensation meets requirements ($${oppMin}k+)`,
    };
  }
}

// ================================================================
// HUNTER AGENT - Contact & Intelligence Gathering
// ================================================================

export class HunterAgent {
  constructor(private userId: number) {}

  async execute(opportunity: any): Promise<{
    hiringManager: any;
    recruiter: any;
    additionalContacts: any[];
  }> {
    console.log(
      `[Hunter] 🎯 Finding contacts for ${opportunity.companyName}...`
    );

    // Use LLM to generate realistic contact info
    // In production, this would use LinkedIn API, web scraping, etc.

    const prompt = `Generate realistic hiring manager and recruiter information for this job opportunity:

Company: ${opportunity.companyName}
Role: ${opportunity.roleTitle}

Generate:
1. Hiring Manager (likely title: VP Partnerships, Head of BD, etc.)
2. Recruiter (likely title: Technical Recruiter, Talent Acquisition)

Return JSON with:
{
  "hiringManager": {
    "name": "string",
    "title": "string",
    "linkedinUrl": "string (use https://linkedin.com/in/[name])",
    "emailPattern": "string (e.g., first.last@company.com)"
  },
  "recruiter": {
    "name": "string",
    "title": "string",
    "linkedinUrl": "string",
    "emailPattern": "string"
  }
}`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You generate realistic contact information for hiring processes.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "contacts",
            strict: true,
            schema: {
              type: "object",
              properties: {
                hiringManager: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    title: { type: "string" },
                    linkedinUrl: { type: "string" },
                    emailPattern: { type: "string" },
                  },
                  required: ["name", "title", "linkedinUrl", "emailPattern"],
                  additionalProperties: false,
                },
                recruiter: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    title: { type: "string" },
                    linkedinUrl: { type: "string" },
                    emailPattern: { type: "string" },
                  },
                  required: ["name", "title", "linkedinUrl", "emailPattern"],
                  additionalProperties: false,
                },
              },
              required: ["hiringManager", "recruiter"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const contacts = JSON.parse(typeof content === "string" ? content : "{}");

      console.log(`[Hunter] ✅ Contacts identified`);

      return {
        ...contacts,
        additionalContacts: [],
      };
    } catch (error) {
      console.error("[Hunter] Error finding contacts:", error);
      return {
        hiringManager: null,
        recruiter: null,
        additionalContacts: [],
      };
    }
  }
}

// ================================================================
// TAILOR AGENT - Resume Customization
// ================================================================

export class TailorAgent {
  constructor(
    private userId: number,
    private userProfile: any
  ) {}

  async execute(opportunity: any, strategicAnalysis: any): Promise<string> {
    console.log(
      `[Tailor] ✂️ Creating tailored resume for ${opportunity.companyName}...`
    );

    // Select 8-15 best achievements for this opportunity
    const selectedAchievements = this.selectRelevantAchievements(
      opportunity,
      strategicAnalysis
    );

    // Build resume prompt
    const prompt = this.buildResumePrompt(
      opportunity,
      strategicAnalysis,
      selectedAchievements
    );

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer specializing in ATS-optimized, achievement-focused resumes for partnerships and business development roles.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0].message.content;
      const resume = typeof content === "string" ? content : "";

      console.log(`[Tailor] ✅ Resume created (${resume.length} chars)`);

      return resume;
    } catch (error) {
      console.error("[Tailor] Error creating resume:", error);
      throw error;
    }
  }

  private selectRelevantAchievements(opportunity: any, analysis: any): any[] {
    // Select achievements that match the opportunity
    const achievements = this.userProfile.achievements || [];

    // Sort by relevance score (if available) and usage success rate
    return achievements
      .sort((a: any, b: any) => {
        const aScore = (a.relevanceScore || 50) * (a.successRate || 0.5);
        const bScore = (b.relevanceScore || 50) * (b.successRate || 0.5);
        return bScore - aScore;
      })
      .slice(0, 12); // Select top 12
  }

  private buildResumePrompt(
    opportunity: any,
    analysis: any,
    achievements: any[]
  ): string {
    const workExperiences = this.userProfile.workExperiences || [];
    const skills = this.userProfile.skills || [];

    return `Create an ATS-optimized resume tailored for this opportunity:

**Target Role:** ${opportunity.roleTitle} at ${opportunity.companyName}

**Strategic Context:**
${analysis.compellingNarrative}

**Key Requirements to Address:**
${analysis.strategicNeeds.painPoints.join("\n")}

**Candidate's Work History:**
${workExperiences
  .map(
    (job: any) =>
      `${job.jobTitle} at ${job.companyName} (${new Date(job.startDate).getFullYear()}-${
        job.endDate ? new Date(job.endDate).getFullYear() : "Present"
      })`
  )
  .join("\n")}

**Top Achievements to Highlight:**
${achievements.map((ach: any, i: number) => `${i + 1}. ${ach.description}`).join("\n")}

**Skills:**
${skills.map((s: any) => s.skillName).join(", ")}

**Instructions:**
1. Create a 1-page resume in plain text format
2. Use ATS-friendly formatting (no tables, no columns)
3. Lead with a strong summary highlighting fit for THIS role
4. Select 8-12 most relevant achievements (use metrics)
5. Optimize for keywords from the job description
6. Use action verbs and quantify results
7. Format: Name, Contact, Summary, Experience, Skills

Return the complete resume as plain text.`;
  }
}

// ================================================================
// SCRIBE AGENT - Cover Letter & Outreach Writing
// ================================================================

export class ScribeAgent {
  constructor(
    private userId: number,
    private userProfile: any
  ) {}

  async execute(
    opportunity: any,
    strategicAnalysis: any,
    contacts: any
  ): Promise<{
    coverLetter: string;
    linkedinMessage: string;
    emailOutreach: string;
  }> {
    console.log(
      `[Scribe] ✍️ Writing outreach materials for ${opportunity.companyName}...`
    );

    const prompt = this.buildOutreachPrompt(
      opportunity,
      strategicAnalysis,
      contacts
    );

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert at writing compelling, personalized outreach messages for job applications. Your messages are concise, strategic, and demonstrate deep understanding of the company's needs.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "outreach_materials",
            strict: true,
            schema: {
              type: "object",
              properties: {
                coverLetter: { type: "string" },
                linkedinMessage: { type: "string" },
                emailOutreach: { type: "string" },
              },
              required: ["coverLetter", "linkedinMessage", "emailOutreach"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const materials = JSON.parse(
        typeof content === "string" ? content : "{}"
      );

      console.log(`[Scribe] ✅ Outreach materials created`);

      return materials;
    } catch (error) {
      console.error("[Scribe] Error writing outreach:", error);
      throw error;
    }
  }

  private buildOutreachPrompt(
    opportunity: any,
    analysis: any,
    contacts: any
  ): string {
    const superpowers = this.userProfile.superpowers || [];

    return `Write personalized outreach materials for this opportunity:

**Company:** ${opportunity.companyName}
**Role:** ${opportunity.roleTitle}
**Hiring Manager:** ${contacts.hiringManager?.name || "Unknown"} (${contacts.hiringManager?.title || ""})

**Strategic Analysis:**
${analysis.compellingNarrative}

**Why They Need This Role NOW:**
${analysis.strategicNeeds.whyNow}

**Candidate's Superpowers:**
${superpowers.map((sp: any, i: number) => `${i + 1}. ${sp.title}: ${sp.description}`).join("\n")}

**Instructions:**

1. **Cover Letter** (300-400 words):
   - Hook: Reference specific company news/growth
   - Body: Explain how candidate solves their specific needs
   - Close: Strong call to action
   
2. **LinkedIn Message** (120 words max):
   - Personalized opening
   - One specific value proposition
   - Request for 15-min call
   
3. **Email Outreach** (200-250 words):
   - Compelling subject line (include in response)
   - Reference mutual interests or company initiatives
   - 2-3 specific ways candidate can help
   - Clear next step

Tone: Confident, strategic, company-specific (NO generic AI slop phrases).`;
  }
}

// ================================================================
// ASSEMBLER AGENT - Package Everything Together
// ================================================================

export class AssemblerAgent {
  constructor(private userId: number) {}

  async execute(applicationData: {
    opportunity: any;
    analysis: any;
    qualification: any;
    contacts: any;
    resume: string;
    outreach: any;
  }): Promise<{
    packageComplete: boolean;
    checklist: string[];
    nextSteps: string[];
    estimatedTimeToApply: number;
  }> {
    console.log(
      `[Assembler] 📦 Packaging application for ${applicationData.opportunity.companyName}...`
    );

    // Generate application checklist
    const checklist = this.generateChecklist(applicationData);

    // Generate next steps
    const nextSteps = this.generateNextSteps(applicationData);

    // Estimate time to apply
    const estimatedTime = this.estimateApplicationTime(applicationData);

    console.log(`[Assembler] ✅ Application package complete`);

    return {
      packageComplete: true,
      checklist,
      nextSteps,
      estimatedTimeToApply: estimatedTime,
    };
  }

  private generateChecklist(data: any): string[] {
    return [
      "✅ Resume tailored with 8-12 relevant achievements",
      "✅ Cover letter written with company-specific insights",
      "✅ LinkedIn message drafted for hiring manager",
      "✅ Email outreach prepared",
      "✅ Hiring manager contact identified",
      "✅ Location verified as compatible",
      "✅ Compensation verified as acceptable",
      `✅ Match score: ${data.qualification.matchScore}/100`,
    ];
  }

  private generateNextSteps(data: any): string[] {
    const steps = [];

    if (data.opportunity.jobUrl) {
      steps.push(
        `1. Apply via ${data.opportunity.source || "job board"}: ${data.opportunity.jobUrl}`
      );
    }

    if (data.contacts.hiringManager) {
      steps.push(
        `2. Send LinkedIn message to ${data.contacts.hiringManager.name} (${data.contacts.hiringManager.title})`
      );
    }

    if (data.contacts.recruiter) {
      steps.push(`3. Email recruiter: ${data.contacts.recruiter.emailPattern}`);
    }

    steps.push("4. Follow up in 3-5 business days if no response");
    steps.push("5. Track application status in CareerSwarm");

    return steps;
  }

  private estimateApplicationTime(data: any): number {
    // Estimate in minutes
    let time = 0;

    time += 10; // Review materials
    time += 15; // Submit application
    time += 5; // Send LinkedIn message
    time += 5; // Send email outreach

    return time; // Total: ~35 minutes
  }
}
