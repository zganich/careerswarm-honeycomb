import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
// @ts-ignore
import { markdownToPDF } from "./pdf-export.mjs";
import { readFileSync, unlinkSync } from "fs";
import { getAllTemplates, getTemplatesByRole } from "./achievement-templates";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(({ ctx }) => ctx.user),
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        currentRole: z.string().optional(),
        currentCompany: z.string().optional(),
        yearsOfExperience: z.number().optional(),
        targetRoles: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  achievements: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserAchievements(ctx.user.id)),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getAchievementById(input.id, ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        situation: z.string().optional(),
        task: z.string().optional(),
        action: z.string().optional(),
        result: z.string().optional(),
        company: z.string().optional(),
        roleTitle: z.string().optional(),
        impactMeterScore: z.number().default(0),
        hasStrongVerb: z.boolean().default(false),
        hasMetric: z.boolean().default(false),
        hasMethodology: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createAchievement({ 
          userId: ctx.user.id,
          situation: input.situation || null,
          task: input.task || null,
          action: input.action || null,
          result: input.result || null,
          company: input.company || null,
          roleTitle: input.roleTitle || null,
          startDate: null,
          endDate: null,
          impactMeterScore: input.impactMeterScore,
          hasStrongVerb: input.hasStrongVerb,
          hasMetric: input.hasMetric,
          hasMethodology: input.hasMethodology,
          xyzAccomplishment: null,
          xyzMetricValue: null,
          xyzMetricUnit: null,
          xyzMetricPrecision: null,
          xyzMechanism: null,
          teamSize: null,
          budgetAmount: null,
          budgetCurrency: "USD",
          evidenceTier: 4,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        situation: z.string().optional(),
        task: z.string().optional(),
        action: z.string().optional(),
        result: z.string().optional(),
        company: z.string().optional(),
        roleTitle: z.string().optional(),
        xyzAccomplishment: z.string().optional(),
        xyzMetricValue: z.string().optional(),
        xyzMetricUnit: z.string().optional(),
        xyzMechanism: z.array(z.string()).optional(),
        impactMeterScore: z.number().optional(),
        hasStrongVerb: z.boolean().optional(),
        hasMetric: z.boolean().optional(),
        hasMethodology: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateAchievement(id, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAchievement(input.id, ctx.user.id);
        return { success: true };
      }),

    bulkCreate: protectedProcedure
      .input(z.object({
        text: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // AI parse multiple achievements from text
        const prompt = `Parse this text into individual achievements. Each achievement should be a bullet point or paragraph describing a work accomplishment.

Text:
${input.text}

Extract each achievement and structure it into STAR format (Situation, Task, Action, Result). If the text doesn't clearly separate into STAR, do your best to infer the components.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert at parsing resumes and extracting achievements." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "bulk_achievements",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  achievements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        situation: { type: "string" },
                        task: { type: "string" },
                        action: { type: "string" },
                        result: { type: "string" },
                        company: { type: "string" },
                        roleTitle: { type: "string" },
                      },
                      required: ["situation", "task", "action", "result"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["achievements"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = String(response.choices[0]?.message?.content || "{}");
        const parsed = JSON.parse(content);

        const created = [];
        for (const ach of parsed.achievements) {
          const result = await db.createAchievement({
            userId: ctx.user.id,
            ...ach,
            impactMeterScore: 0,
            hasStrongVerb: false,
            hasMetric: false,
            hasMethodology: false,
          });
          created.push(result);
        }

        return { count: created.length, achievements: created };
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ ctx, input }) => db.searchAchievements(ctx.user.id, input.query)),

    getSuggestions: protectedProcedure.query(async ({ ctx }) => {
      const profile = ctx.user; // Use authenticated user data
      const achievements = await db.getUserAchievements(ctx.user.id);
      const pastJobs = await db.getUserPastJobs(ctx.user.id);

      const profileSummary = profile ? `${profile.currentRole || ""} at ${profile.currentCompany || ""}` : "Professional";
      const jobHistory = pastJobs.map(j => `${j.jobTitle} at ${j.companyName || "unknown"}`).join(", ");
      const existingAchievements = achievements.map(a => a.result || a.action).join("; ");

      const prompt = `You are a career coach helping someone build their Master Profile.

Profile: ${profileSummary}
Past Roles: ${jobHistory}
Existing Achievements: ${existingAchievements}

Suggest 5 common achievements they might have forgotten to document. Be specific to their roles and industry. For each suggestion, provide:
1. A title
2. A brief prompt/question to jog their memory
3. Why it matters`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert career coach." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "achievement_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      prompt: { type: "string" },
                      why: { type: "string" },
                    },
                    required: ["title", "prompt", "why"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = String(response.choices[0]?.message?.content || "{}");
      const parsed = JSON.parse(content);
      return parsed.suggestions || [];
    }),
    
    transformToXYZ: protectedProcedure
      .input(z.object({
        situation: z.string(),
        task: z.string(),
        action: z.string(),
        result: z.string(),
      }))
      .mutation(async ({ input }) => {
        const prompt = `Transform this career achievement into Google XYZ format: "Accomplished [X] as measured by [Y], by doing [Z]"

STAR Input:
- Situation: ${input.situation}
- Task: ${input.task}
- Action: ${input.action}
- Result: ${input.result}

Requirements:
1. Start with a strong action verb
2. Include specific, quantifiable metrics in [Y]
3. Describe the methodology/approach in [Z]
4. Keep it concise (1-2 sentences max)
5. Focus on impact and results

Return ONLY the transformed XYZ bullet point, nothing else.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert resume writer specializing in the Google XYZ methodology." },
            { role: "user", content: prompt }
          ],
        });

        const xyzText = String(response.choices[0]?.message?.content || "").trim();
        return { xyzText };
      }),
  }),

  skills: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserSkills(ctx.user.id)),
  }),

  templates: router({
    getAll: publicProcedure.query(() => getAllTemplates()),
    getByRole: publicProcedure
      .input(z.object({ role: z.string() }))
      .query(({ input }) => getTemplatesByRole(input.role)),
  }),

  pastEmployerJobs: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserPastJobs(ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        jobTitle: z.string(),
        companyName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        jobDescriptionText: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // AI extract skills and responsibilities
        const prompt = `Analyze this job description and extract:
1. Key skills (technical and soft skills)
2. Main responsibilities

Job Description:
${input.jobDescriptionText}

Return structured JSON.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert at analyzing job descriptions." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "jd_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  skills: {
                    type: "array",
                    items: { type: "string" },
                  },
                  responsibilities: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["skills", "responsibilities"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = String(response.choices[0]?.message?.content || "{}");
        const parsed = JSON.parse(content);

        const result = await db.createPastEmployerJob({
          userId: ctx.user.id,
          jobTitle: input.jobTitle,
          companyName: input.companyName || null,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          jobDescriptionText: input.jobDescriptionText,
          extractedSkills: parsed.skills || [],
          extractedResponsibilities: parsed.responsibilities || [],
        });

        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePastJob(input.id, ctx.user.id);
        return { success: true };
      }),

    getGapAnalysis: protectedProcedure.query(async ({ ctx }) => {
      const pastJobs = await db.getUserPastJobs(ctx.user.id);
      const achievements = await db.getUserAchievements(ctx.user.id);

      const allExpectedSkills = new Set<string>();
      pastJobs.forEach(job => {
        (job.extractedSkills || []).forEach(skill => allExpectedSkills.add(skill));
      });

      const provenSkills = new Set<string>();
      achievements.forEach(achievement => {
        const text = `${achievement.situation} ${achievement.task} ${achievement.action} ${achievement.result}`.toLowerCase();
        allExpectedSkills.forEach(skill => {
          if (text.includes(skill.toLowerCase())) {
            provenSkills.add(skill);
          }
        });
      });

      const missingEvidence = Array.from(allExpectedSkills).filter(skill => !provenSkills.has(skill));

      return {
        totalExpectedSkills: allExpectedSkills.size,
        provenSkills: Array.from(provenSkills),
        missingEvidence,
        coveragePercent: allExpectedSkills.size > 0 
          ? Math.round((provenSkills.size / allExpectedSkills.size) * 100)
          : 100,
      };
    }),
  }),

  jobDescriptions: router({
    matchAchievements: protectedProcedure
      .input(z.object({ jobDescriptionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const jd = await db.getJobDescriptionById(input.jobDescriptionId, ctx.user.id);
        const achievements = await db.getUserAchievements(ctx.user.id);

        if (!jd || achievements.length === 0) {
          return { matches: [] };
        }

        const prompt = `You are a career advisor analyzing job-achievement matches.

Job Description:
Title: ${jd.jobTitle}
Company: ${jd.companyName || "N/A"}
Required Skills: ${jd.requiredSkills?.join(", ") || "N/A"}
Description: ${jd.jobDescriptionText}

Achievements:
${achievements.map((a, idx) => `${idx + 1}. ${a.result || a.action} (Company: ${a.company}, Impact Score: ${a.impactMeterScore})`).join("\n")}

For each achievement, analyze:
1. Skill relevance (0-100)
2. Impact alignment (0-100)
3. Overall match score (0-100)
4. Brief reason for the match

Return a JSON array with match data for ALL achievements, ordered by match score (highest first).`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert at matching career achievements to job requirements." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "achievement_matches",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        achievementIndex: { type: "integer" },
                        matchScore: { type: "integer" },
                        skillRelevance: { type: "integer" },
                        impactAlignment: { type: "integer" },
                        reason: { type: "string" },
                      },
                      required: ["achievementIndex", "matchScore", "skillRelevance", "impactAlignment", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["matches"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = String(response.choices[0]?.message?.content || "{}");
        const parsed = JSON.parse(content);
        
        const enrichedMatches = parsed.matches.map((match: any) => ({
          ...match,
          achievement: achievements[match.achievementIndex - 1],
        }));

        return { matches: enrichedMatches };
      }),
    
    list: protectedProcedure.query(({ ctx }) => db.getUserJobDescriptions(ctx.user.id)),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getJobDescriptionById(input.id, ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        jobTitle: z.string(),
        companyName: z.string().optional(),
        jobDescriptionText: z.string(),
        jobUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createJobDescription({ 
          userId: ctx.user.id,
          jobTitle: input.jobTitle,
          jobDescriptionText: input.jobDescriptionText,
          companyName: input.companyName || null,
          jobUrl: input.jobUrl || null,
          requiredSkills: null,
          preferredSkills: null,
          keyResponsibilities: null,
          successMetrics: null,
          applicationStatus: "draft",
          appliedDate: null,
          notes: null,
        });
        return { id };
      }),
    
    analyze: protectedProcedure
      .input(z.object({ jobDescriptionText: z.string() }))
      .mutation(async ({ input }) => {
        const prompt = `Analyze this job description and extract structured information.

Job Description:
${input.jobDescriptionText}

Extract and return a JSON object with:
{
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "keyResponsibilities": ["responsibility1", ...],
  "successMetrics": ["metric1", ...]
}

Focus on technical skills, soft skills, tools, and measurable outcomes.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert at analyzing job descriptions." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "job_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  requiredSkills: { type: "array", items: { type: "string" } },
                  preferredSkills: { type: "array", items: { type: "string" } },
                  keyResponsibilities: { type: "array", items: { type: "string" } },
                  successMetrics: { type: "array", items: { type: "string" } },
                },
                required: ["requiredSkills", "preferredSkills", "keyResponsibilities", "successMetrics"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = String(response.choices[0]?.message?.content || "{}");
        const parsed = JSON.parse(content);
        return parsed;
      }),
  }),

  resumes: router({
    exportPDF: protectedProcedure
      .input(z.object({ resumeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const resume = await db.getResumeById(input.resumeId, ctx.user.id);
        if (!resume) {
          throw new Error("Resume not found");
        }

        try {
          const pdfPath = await markdownToPDF(resume.resumeContent);
          const pdfBuffer = readFileSync(pdfPath);
          const base64Pdf = pdfBuffer.toString('base64');
          
          try {
            unlinkSync(pdfPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          return { pdfData: base64Pdf };
        } catch (error) {
          throw new Error("Failed to generate PDF");
        }
      }),
    
    list: protectedProcedure.query(({ ctx }) => db.getUserResumes(ctx.user.id)),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getResumeById(input.id, ctx.user.id)),
    
    generate: protectedProcedure
      .input(z.object({
        jobDescriptionId: z.number(),
        selectedAchievementIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        const jd = await db.getJobDescriptionById(input.jobDescriptionId, ctx.user.id);
        const achievements = await db.getUserAchievements(ctx.user.id);
        const selectedAchievements = achievements.filter(a => input.selectedAchievementIds.includes(a.id!));

        const resumeContent = `# ${user.name || "Your Name"}
${user.email || ""}

## Target Role
${jd?.jobTitle || "Position"}

## Professional Experience

${selectedAchievements.map(a => {
  const xyz = a.xyzAccomplishment || `${a.action || ""} ${a.result || ""}`;
  return `### ${a.roleTitle || "Role"} at ${a.company || "Company"}
${a.startDate || ""} - ${a.endDate || "Present"}

- ${xyz}`;
}).join("\n\n")}

---
*Generated by Careerswarm*`;

        const id = await db.createGeneratedResume({
          userId: ctx.user.id,
          jobDescriptionId: input.jobDescriptionId,
          resumeContent,
          selectedAchievementIds: input.selectedAchievementIds,
          resumeFormat: "markdown",
          version: 1,
          isFavorite: false,
        });

        return { id, content: resumeContent };
      }),
  }),
});

export type AppRouter = typeof appRouter;
