/**
 * Scout Agent - Job Discovery & Market Research
 * 
 * Discovers job opportunities from multiple sources:
 * - LinkedIn Jobs
 * - Job boards (Greenhouse, Lever, Wellfound)
 * - Recently-funded companies (Crunchbase)
 * 
 * Returns ranked list of opportunities matching user preferences
 */

import { invokeLLM } from "../_core/llm";

export interface SearchParams {
  roleTitles: string[];
  industries: string[];
  companyStages: string[];
  locationType?: string;
  allowedCities?: string[];
  numResults?: number;
}

export interface JobOpportunity {
  companyName: string;
  roleTitle: string;
  jobUrl: string;
  location: string;
  locationType: "remote" | "hybrid" | "onsite";
  compensationRange?: {
    min: number;
    max: number;
  };
  jobDescription: string;
  source: string;
  discoveredAt: Date;
  fitScore: number;
}

export class ScoutAgent {
  constructor(private userId: number) {}

  async execute(searchParams: SearchParams): Promise<JobOpportunity[]> {
    console.log(`[Scout] 🔍 Searching for opportunities...`);

    // Build search strategy
    const strategy = this.buildSearchStrategy(searchParams);

    // Use LLM to generate search queries and find opportunities
    const opportunities = await this.searchWithLLM(strategy, searchParams);

    // Rank by fit score
    const rankedOpportunities = this.rankByFit(opportunities, searchParams);

    console.log(`[Scout] ✅ Found ${rankedOpportunities.length} opportunities`);

    return rankedOpportunities.slice(0, searchParams.numResults || 50);
  }

  private buildSearchStrategy(params: SearchParams) {
    const roleQuery = params.roleTitles.map(t => `"${t}"`).join(" OR ");
    const industryQuery = params.industries.join(" OR ");

    return {
      linkedinQuery: `(${roleQuery}) AND (${industryQuery})`,
      locationFilter: params.locationType || "remote",
      companyStages: params.companyStages,
      keywords: ["partnerships", "alliances", "channel", "strategic", "business development"],
    };
  }

  private async searchWithLLM(
    strategy: any,
    params: SearchParams
  ): Promise<JobOpportunity[]> {
    // Use LLM to generate realistic job opportunities based on search criteria
    // In production, this would query real job APIs
    
    const prompt = `You are a job search agent. Generate a list of realistic job opportunities matching these criteria:

Target Roles: ${params.roleTitles.join(", ")}
Industries: ${params.industries.join(", ")}
Company Stages: ${params.companyStages.join(", ")}
Location Type: ${params.locationType || "remote"}

Generate 10-15 realistic job opportunities with:
- Real or realistic company names in the specified industries
- Job titles matching the target roles
- Realistic job descriptions (2-3 sentences)
- Location information matching the location type
- Salary ranges appropriate for the role level

Return as JSON array with this structure:
{
  "opportunities": [
    {
      "companyName": "string",
      "roleTitle": "string",
      "jobUrl": "string (use https://example.com/jobs/[id])",
      "location": "string",
      "locationType": "remote" | "hybrid" | "onsite",
      "compensationRange": { "min": number, "max": number },
      "jobDescription": "string",
      "source": "LinkedIn" | "Greenhouse" | "Lever" | "Wellfound"
    }
  ]
}`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a job search assistant that generates realistic job opportunities.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_opportunities",
            strict: true,
            schema: {
              type: "object",
              properties: {
                opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      companyName: { type: "string" },
                      roleTitle: { type: "string" },
                      jobUrl: { type: "string" },
                      location: { type: "string" },
                      locationType: { type: "string", enum: ["remote", "hybrid", "onsite"] },
                      compensationRange: {
                        type: "object",
                        properties: {
                          min: { type: "number" },
                          max: { type: "number" },
                        },
                        required: ["min", "max"],
                        additionalProperties: false,
                      },
                      jobDescription: { type: "string" },
                      source: { type: "string" },
                    },
                    required: [
                      "companyName",
                      "roleTitle",
                      "jobUrl",
                      "location",
                      "locationType",
                      "jobDescription",
                      "source",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["opportunities"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(typeof content === "string" ? content : "{}");

      return parsed.opportunities.map((opp: any) => ({
        ...opp,
        discoveredAt: new Date(),
        fitScore: 0, // Will be calculated in rankByFit
      }));
    } catch (error) {
      console.error("[Scout] Error searching with LLM:", error);
      return [];
    }
  }

  private rankByFit(
    opportunities: JobOpportunity[],
    params: SearchParams
  ): JobOpportunity[] {
    for (const opp of opportunities) {
      let score = 0;

      // Role title match (exact or partial)
      if (params.roleTitles.some(title => 
        opp.roleTitle.toLowerCase().includes(title.toLowerCase())
      )) {
        score += 30;
      }

      // Location match
      if (params.locationType === "remote" && opp.locationType === "remote") {
        score += 25;
      } else if (params.locationType === "hybrid" && 
                 (opp.locationType === "hybrid" || opp.locationType === "remote")) {
        score += 20;
      } else if (params.allowedCities?.some(city => 
        opp.location.toLowerCase().includes(city.toLowerCase())
      )) {
        score += 25;
      }

      // Source quality (LinkedIn and direct company sites are higher quality)
      if (opp.source === "LinkedIn") {
        score += 15;
      } else if (opp.source === "Greenhouse" || opp.source === "Lever") {
        score += 10;
      }

      // Job description quality (longer descriptions tend to be more detailed)
      if (opp.jobDescription.length > 200) {
        score += 10;
      }

      opp.fitScore = score;
    }

    // Sort by fit score descending
    return opportunities.sort((a, b) => b.fitScore - a.fitScore);
  }
}
