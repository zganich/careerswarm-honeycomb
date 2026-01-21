import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

/**
 * B2B Talent Intelligence Router
 * For recruiters and hiring managers to search candidate achievements
 */

export const b2bRouter = router({
  /**
   * Search candidates by natural language query
   * Returns anonymized profiles with achievement data
   */
  searchTalent: protectedProcedure
    .input(z.object({
      query: z.string(),
      skills: z.array(z.string()).optional(),
      yearsExperience: z.array(z.number()).optional(), // [min, max]
      verifiedOnly: z.boolean().optional(),
      limit: z.number().default(20),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a recruiter (in production, check user.role === 'recruiter')
      // For now, allow all authenticated users

      // Get all achievements (in production, only from users who opted into talent search)
      const allUsers = await db.getDb().then(db => 
        db?.select().from(require("../drizzle/schema").users) || []
      );

      const matches = [];

      for (const user of allUsers.slice(0, input.limit)) {
        const achievements = await db.getUserAchievements(user.id);
        
        if (achievements.length === 0) continue;

        // Calculate match score based on query
        const achievementTexts = achievements.map(a => 
          `${a.situation} ${a.task} ${a.action} ${a.result} ${a.xyzAccomplishment || ''}`
        ).join(' ').toLowerCase();

        const queryLower = input.query.toLowerCase();
        const matchScore = achievementTexts.includes(queryLower) ? 85 : 50;

        // Filter by skills if provided
        if (input.skills && input.skills.length > 0) {
          const hasSkills = input.skills.some(skill => 
            achievementTexts.includes(skill.toLowerCase())
          );
          if (!hasSkills) continue;
        }

        // Calculate trajectory score (simplified)
        const avgImpactScore = 75; // Simplified - calculate from achievement metrics

        matches.push({
          candidateId: `anon_${user.id}`,
          matchScore,
          achievements: achievements.slice(0, 3).map(a => ({
            title: a.xyzAccomplishment || `${a.action?.substring(0, 50)}...`,
            verified: false, // In production, check verification table
            skills: [], // Extract from achievement text
            impactScore: 75,
          })),
          trajectoryScore: Math.round(avgImpactScore),
          contactAvailable: true,
          yearsExperience: 5, // Calculate from achievements date range
        });
      }

      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return {
        matches: matches.slice(0, input.limit),
        total: matches.length,
        query: input.query,
      };
    }),

  /**
   * Get detailed candidate profile (after recruiter expresses interest)
   */
  getCandidateProfile: protectedProcedure
    .input(z.object({
      candidateId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Extract user ID from anonymized candidate ID
      const userId = parseInt(input.candidateId.replace('anon_', ''));

      const user = await db.getUserByOpenId(String(userId)); // Simplified lookup
      if (!user) {
        throw new Error("Candidate not found");
      }

      const achievements = await db.getUserAchievements(userId);
      // const profile = await db.getUserProfile(userId); // Simplified

      return {
        name: user.name || "Anonymous",
        email: user.email, // In production, only reveal after candidate approves
        currentRole: "Not specified",
        achievements: achievements.map(a => ({
          id: a.id,
          title: a.xyzAccomplishment || a.action,
          situation: a.situation,
          task: a.task,
          action: a.action,
          result: a.result,
          company: a.company,
          roleTitle: a.roleTitle,
          startDate: a.startDate,
          endDate: a.endDate,
          impactScore: 75,
          verified: false,
        })),
        skills: [], // Aggregate from achievements
        trajectoryScore: 75,
      };
    }),

  /**
   * Get talent market insights
   */
  getMarketInsights: protectedProcedure
    .input(z.object({
      role: z.string(),
      industry: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // In production, aggregate real data
      // For now, return mock insights

      return {
        role: input.role,
        insights: {
          averageYearsExperience: 5.2,
          topSkills: ["Python", "AWS", "System Design", "Leadership"],
          averageImpactScore: 72,
          salaryRange: {
            min: 120000,
            max: 180000,
            currency: "USD"
          },
          demandTrend: "increasing",
          candidateCount: 1247,
        },
        benchmarks: [
          {
            metric: "Team Leadership",
            average: "Led teams of 5-8 people",
            topPerformer: "Led teams of 20+ people"
          },
          {
            metric: "Cost Reduction",
            average: "Reduced costs by 15-25%",
            topPerformer: "Reduced costs by 40%+"
          }
        ]
      };
    }),
});
