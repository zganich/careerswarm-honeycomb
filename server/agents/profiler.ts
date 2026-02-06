/**
 * Profiler Agent - Company Analysis & Strategic Reasoning
 *
 * Analyzes companies to identify:
 * - Strategic needs and pain points
 * - Why they need this role NOW
 * - How the candidate specifically fits
 * - Compelling narrative for outreach
 */

import { invokeLLM } from "../_core/llm";

export interface CompanyAnalysis {
  strategicNeeds: {
    whyNow: string;
    painPoints: string[];
    opportunityAreas: string[];
    candidateFit: string;
  };
  companyContext: {
    growthTrajectory: string;
    competitivePosition: string;
    partnershipMaturity: string;
  };
  strategicFitScore: number;
  compellingNarrative: string;
}

export class ProfilerAgent {
  constructor(
    private userId: number,
    private userProfile: any
  ) {}

  async execute(opportunity: any): Promise<CompanyAnalysis> {
    console.log(`[Profiler] 🔬 Analyzing ${opportunity.companyName}...`);

    // Extract user's top strengths from profile
    const userStrengths = this.extractUserStrengths();

    // Build analysis prompt
    const prompt = this.buildAnalysisPrompt(opportunity, userStrengths);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a strategic business analyst specializing in partnerships and business development. Analyze companies to identify why they need partnerships leadership NOW and how specific candidates fit.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "company_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                strategicNeeds: {
                  type: "object",
                  properties: {
                    whyNow: { type: "string" },
                    painPoints: {
                      type: "array",
                      items: { type: "string" },
                    },
                    opportunityAreas: {
                      type: "array",
                      items: { type: "string" },
                    },
                    candidateFit: { type: "string" },
                  },
                  required: [
                    "whyNow",
                    "painPoints",
                    "opportunityAreas",
                    "candidateFit",
                  ],
                  additionalProperties: false,
                },
                companyContext: {
                  type: "object",
                  properties: {
                    growthTrajectory: { type: "string" },
                    competitivePosition: { type: "string" },
                    partnershipMaturity: { type: "string" },
                  },
                  required: [
                    "growthTrajectory",
                    "competitivePosition",
                    "partnershipMaturity",
                  ],
                  additionalProperties: false,
                },
                strategicFitScore: { type: "number" },
                compellingNarrative: { type: "string" },
              },
              required: [
                "strategicNeeds",
                "companyContext",
                "strategicFitScore",
                "compellingNarrative",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const analysis = JSON.parse(typeof content === "string" ? content : "{}");

      console.log(
        `[Profiler] ✅ Analysis complete (fit score: ${analysis.strategicFitScore})`
      );

      return analysis;
    } catch (error) {
      console.error("[Profiler] Error analyzing company:", error);
      throw error;
    }
  }

  private extractUserStrengths(): string {
    // Extract superpowers and top achievements
    const superpowers = this.userProfile.superpowers || [];
    const achievements = this.userProfile.achievements || [];

    let strengths = "";

    if (superpowers.length > 0) {
      strengths += "**Superpowers:**\n";
      superpowers.forEach((sp: any, i: number) => {
        strengths += `${i + 1}. ${sp.title}: ${sp.description}\n   Evidence: ${sp.evidence}\n`;
      });
    }

    if (achievements.length > 0) {
      strengths += "\n**Top Achievements:**\n";
      achievements.slice(0, 5).forEach((ach: any, i: number) => {
        strengths += `${i + 1}. ${ach.description}`;
        if (ach.metricValue) {
          strengths += ` (${ach.metricType}: ${ach.metricValue} ${ach.metricUnit || ""})`;
        }
        strengths += "\n";
      });
    }

    return strengths || "No profile data available";
  }

  private buildAnalysisPrompt(opportunity: any, userStrengths: string): string {
    return `Analyze this company and determine why they need a ${opportunity.roleTitle} NOW.

**Company:** ${opportunity.companyName}
**Role:** ${opportunity.roleTitle}
**Location:** ${opportunity.location || opportunity.locationCity}
**Stage:** ${opportunity.companyStage || "Unknown"}
**Job Description:** ${opportunity.jobDescription || "Not provided"}

**Candidate Strengths:**
${userStrengths}

**Your Task:**
1. Identify why this company needs this role RIGHT NOW (timing, growth phase, market conditions)
2. List 3-5 specific pain points they're likely facing
3. Identify 3-5 opportunity areas where partnerships/BD can drive growth
4. Explain how THIS candidate specifically solves their needs (reference their achievements)
5. Assess overall strategic fit (0-100 score)
6. Write a compelling 2-3 sentence narrative about why this is perfect timing

Return your analysis in the specified JSON format.`;
  }
}
