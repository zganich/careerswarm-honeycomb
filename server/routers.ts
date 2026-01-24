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
import { scrapeJobDescription } from "./jd-scraper";

export const appRouter = router({
  system: systemRouter,
  
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
        const prompt = `Analyze this past job description and extract skills and responsibilities.

Job Description:
${input.jobDescriptionText}

Extract:
1. Technical and soft skills mentioned
2. Key responsibilities`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert at analyzing job descriptions." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "past_jd_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  skills: { type: "array", items: { type: "string" } },
                  responsibilities: { type: "array", items: { type: "string" } },
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
      .query(async ({ ctx, input }) => {
        const achievements = await db.getUserAchievements(ctx.user.id);
        return achievements.find(a => a.id === input.id) || null;
      }),

    create: protectedProcedure
      .use(async ({ ctx, next }) => {
        const { checkAchievementLimit } = await import("./usageLimits");
        await checkAchievementLimit(ctx.user.id);
        return next({ ctx });
      })
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
    
    bulkImport: protectedProcedure
      .use(async ({ ctx, next }) => {
        // Check usage limits before bulk import
        const { checkAchievementLimit } = await import("./usageLimits");
        await checkAchievementLimit(ctx.user.id);
        return next({ ctx });
      })
      .input(z.object({
        achievements: z.array(z.object({
          situation: z.string(),
          task: z.string(),
          action: z.string(),
          result: z.string(),
          company: z.string().optional(),
          role: z.string(),
        }))
      }))
      .mutation(async ({ ctx, input }) => {
        // Import string similarity library
        const { compareTwoStrings } = await import("string-similarity");
        
        // Fetch existing achievements for deduplication (only task and action fields)
        const existingAchievements = await db.getUserAchievements(ctx.user.id);
        
        // Filter out duplicates
        const uniqueAchievements = [];
        let skippedCount = 0;
        
        for (const candidate of input.achievements) {
          let isDuplicate = false;
          
          // Compare against existing achievements
          for (const existing of existingAchievements) {
            const actionSimilarity = compareTwoStrings(
              candidate.action.toLowerCase(),
              (existing.action || '').toLowerCase()
            );
            
            // If similarity > 85%, consider it a duplicate
            if (actionSimilarity > 0.85) {
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate) {
            uniqueAchievements.push(candidate);
          } else {
            skippedCount++;
          }
        }
        
        // Insert only unique achievements
        let insertedCount = 0;
        for (const achievement of uniqueAchievements) {
          await db.createAchievement({
            userId: ctx.user.id,
            situation: achievement.situation,
            task: achievement.task,
            action: achievement.action,
            result: achievement.result,
            company: achievement.company || null,
            roleTitle: achievement.role,
            // Set default values for other required fields
            xyzAccomplishment: null,
            xyzMetricValue: null,
            xyzMetricUnit: null,
            xyzMetricPrecision: null,
            xyzMechanism: null,
            startDate: null,
            endDate: null,
            teamSize: null,
            budgetAmount: null,
            budgetCurrency: "USD",
            impactMeterScore: 0,
            hasStrongVerb: false,
            hasMetric: false,
            hasMethodology: false,
            evidenceTier: 4,
          });
          insertedCount++;
        }
        
        // Build message based on results
        let message = `Successfully imported ${insertedCount} achievement(s)`;
        if (skippedCount > 0) {
          message += ` (${skippedCount} duplicate${skippedCount > 1 ? 's' : ''} removed)`;
        }
        
        return {
          success: true,
          added: insertedCount,
          skipped: skippedCount,
          count: insertedCount, // Keep for backward compatibility
          message
        };
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

  jobDescriptions: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserJobDescriptions(ctx.user.id)),

    importFromUrl: protectedProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        const scraped = await scrapeJobDescription(input.url);
        
        // Use AI to analyze the scraped content
        const prompt = `Analyze this job description and extract key information.

Job Title: ${scraped.title || "Unknown"}
Company: ${scraped.company || "Unknown"}
Description:
${scraped.description}

Extract:
1. Required skills
2. Preferred skills
3. Experience level
4. Key responsibilities`;

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
                  requiredSkills: { type: "array", items: { type: "string" } },
                  preferredSkills: { type: "array", items: { type: "string" } },
                  experienceLevel: { type: "string" },
                  responsibilities: { type: "array", items: { type: "string" } },
                },
                required: ["requiredSkills", "preferredSkills", "experienceLevel", "responsibilities"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = String(response.choices[0]?.message?.content || "{}");
        const parsed = JSON.parse(content);

        const result = await db.createJobDescription({
          userId: ctx.user.id,
          jobTitle: scraped.title || "Imported Job",
          companyName: scraped.company || null,
          jobDescriptionText: scraped.description,
          jobUrl: input.url,
          requiredSkills: parsed.requiredSkills || [],
          preferredSkills: parsed.preferredSkills || [],
          keyResponsibilities: parsed.responsibilities || [],
          successMetrics: null,
          applicationStatus: null,
          appliedDate: null,
          notes: null,
        });

        return result;
      }),
    
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
  
  // Job automation routers
  jobs: router({
    search: protectedProcedure
      .input(z.object({
        keywords: z.string(),
        location: z.string().optional(),
        platforms: z.array(z.enum(["linkedin", "indeed", "glassdoor"])).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { scrapeAllPlatforms, scrapedJobToInsert } = await import("./agents/scout");
        const { bulkCreateJobs } = await import("./db");
        
        const scrapedJobs = await scrapeAllPlatforms(
          input.keywords,
          input.location,
          input.platforms
        );
        
        const jobsData = scrapedJobs.map(job => scrapedJobToInsert(job, ctx.user.id));
        const ids = await bulkCreateJobs(jobsData);
        
        return { count: ids.length, jobIds: ids };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserJobs } = await import("./db");
      return getUserJobs(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getJobById } = await import("./db");
        return getJobById(input.id, ctx.user.id);
      }),
    
    qualify: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getJobById } = await import("./db");
        const { qualifyForJob } = await import("./agents/qualifier");
        
        const job = await getJobById(input.jobId, ctx.user.id);
        if (!job) throw new Error("Job not found");
        
        const achievements = await db.getUserAchievements(ctx.user.id);
        const result = await qualifyForJob(job, achievements);
        
        // Update job with qualification data
        const { updateJob } = await import("./db");
        await updateJob(input.jobId, ctx.user.id, {
          qualificationScore: result.score,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          status: result.recommendation === "strong_match" || result.recommendation === "good_match" ? "qualified" : "rejected",
        });
        
        return result;
      }),
  }),
  
  applications: router({
    create: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        resumeId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createApplication } = await import("./db");
        const id = await createApplication({
          userId: ctx.user.id,
          jobId: input.jobId,
          resumeId: input.resumeId || null,
          tailoredResumeContent: null,
          coverLetterContent: null,
          customAnswers: null,
          submittedAt: null,
          submissionMethod: null,
          confirmationNumber: null,
          status: "draft",
          lastStatusUpdate: null,
          nextFollowUpDate: null,
          followUpCount: 0,
          interviewDates: null,
          interviewNotes: null,
          offerAmount: null,
          offerCurrency: null,
          rejectionReason: null,
          notes: null,
        });
        return { id };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserApplications } = await import("./db");
      return getUserApplications(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getApplicationById } = await import("./db");
        return getApplicationById(input.id, ctx.user.id);
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        status: z.enum(["draft", "submitted", "viewed", "screening", "interview_scheduled", "interviewed", "offer", "rejected", "withdrawn"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateApplication } = await import("./db");
        await updateApplication(input.applicationId, ctx.user.id, {
          status: input.status,
        });
        return { success: true };
      }),
    
    generateMaterials: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getApplicationById, updateApplication } = await import("./db");
        const { getJobById } = await import("./db");
        const { generateTailoredResume } = await import("./agents/tailor");
        const { generateCoverLetter } = await import("./agents/scribe");
        
        const application = await getApplicationById(input.applicationId, ctx.user.id);
        if (!application) throw new Error("Application not found");
        
        const job = await getJobById(application.jobId, ctx.user.id);
        if (!job) throw new Error("Job not found");
        
        const achievements = await db.getUserAchievements(ctx.user.id);
        
        // Generate tailored resume
        const tailoredResume = await generateTailoredResume(ctx.user, job, achievements);
        
        // Generate cover letter
        const coverLetter = await generateCoverLetter(ctx.user, job, achievements);
        
        // Update application
        await updateApplication(input.applicationId, ctx.user.id, {
          tailoredResumeContent: tailoredResume.resumeContent,
          coverLetterContent: coverLetter,
        });
        
        return {
          resume: tailoredResume.resumeContent,
          coverLetter,
          atsScore: tailoredResume.atsScore,
        };
      }),
  }),
  
  companies: router({
    research: protectedProcedure
      .input(z.object({ companyName: z.string() }))
      .mutation(async ({ input }) => {
        const { researchCompany } = await import("./agents/profiler");
        return researchCompany(input.companyName);
      }),
    
    talkingPoints: protectedProcedure
      .input(z.object({ companyName: z.string(), jobTitle: z.string() }))
      .mutation(async ({ input }) => {
        const { generateTalkingPoints } = await import("./agents/profiler");
        return { points: await generateTalkingPoints(input.companyName, input.jobTitle) };
       }),
  }),
  
  stripe: router({
    createCheckout: protectedProcedure
      .input(z.object({ tier: z.enum(["pro"]) }))
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-12-15.clover",
        });

        const { PRODUCTS } = await import("./products");
        const product = PRODUCTS.PRO;

        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: product.priceId,
              quantity: 1,
            },
          ],
          success_url: `${ctx.req.headers.origin}/dashboard?subscription=success`,
          cancel_url: `${ctx.req.headers.origin}/pricing?subscription=canceled`,
          client_reference_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || undefined,
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
        });

        return { url: session.url };
      }),
    }),

  // Source Materials
  sourceMaterials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getSourceMaterialsByUserId(ctx.user.id);
    }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSourceMaterial(input.id, ctx.user.id);
        return { success: true };
      }),
    
    synthesize: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get source material
        const material = await db.getSourceMaterialById(input.id, ctx.user.id);
        if (!material) {
          throw new Error("Source material not found");
        }
        
        if (material.status === "PROCESSED") {
          throw new Error("This source material has already been processed");
        }
        
        try {
          // Call LLM to extract achievements
          const systemPrompt = `You are an expert resume writer and career coach. Your task is to analyze resume text and extract distinct professional achievements.

For each achievement you find, extract:
- situation: The context or circumstances (company, role, team size, challenges)
- task: The specific challenge or goal that needed to be addressed
- action: The specific actions taken to address the task (be detailed)
- result: The quantifiable outcome or impact (use numbers, percentages, or measurable results)
- role: The job title or position held
- company: The company name (if mentioned)

Rules:
- Extract ONLY achievements that have measurable results or clear impact
- Each achievement should be a distinct accomplishment, not a job duty
- Focus on achievements with quantifiable metrics (revenue, time saved, users, etc.)
- If no clear achievements are found, return an empty array
- Do not invent or embellish information`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Extract professional achievements from this resume/profile text:\n\n${material.content}` }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "achievement_extraction",
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
                          role: { type: "string" },
                          company: { type: "string" }
                        },
                        required: ["situation", "task", "action", "result", "role"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["achievements"],
                  additionalProperties: false
                }
              }
            }
          });
          
          // Parse response
          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error("No response from LLM");
          }
          
          // Handle both string and array content types
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          const parsed = JSON.parse(contentStr);
          const achievements = parsed.achievements || [];
          
          // Add confidence score (mock for now - can be enhanced later)
          const achievementsWithScore = achievements.map((achievement: any) => ({
            ...achievement,
            confidenceScore: achievement.result && achievement.result.match(/\d+/) ? 0.9 : 0.7
          }));
          
          // Update source material status to PROCESSED
          const { updateSourceMaterialStatus } = await import("./db");
          await updateSourceMaterialStatus(input.id, "PROCESSED", null);
          
          // Return extracted achievements for review (don't auto-insert)
          return {
            success: true,
            count: achievementsWithScore.length,
            achievements: achievementsWithScore,
            message: `Found ${achievementsWithScore.length} potential achievement(s) for review`
          };
        } catch (error: any) {
          console.error("[Synthesize] Error:", error);
          
          // Update source material status to FAILED
          const { updateSourceMaterialStatus } = await import("./db");
          await updateSourceMaterialStatus(input.id, "FAILED", error.message);
          
          throw new Error(`Failed to extract achievements: ${error.message}`);
        }
      }),
  }),
  
  // Interview Prep
  interviewPrep: router({
    generateQuestions: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        questionCount: z.number().optional(),
        includeCompanyResearch: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const { generateInterviewQuestions } = await import("./agents/interviewPrep");
        
        // Get job details
        const job = await db.getJobById(input.jobId, ctx.user.id);
        if (!job || !job.description || !job.companyName) {
          throw new Error("Job not found or missing required fields");
        }
        
        // Get user achievements
        const achievements = await db.getUserAchievements(ctx.user.id);
        
        return generateInterviewQuestions(
          job.description,
          job.companyName,
          achievements.map(a => ({
            title: a.xyzAccomplishment || "Achievement",
            description: `${a.situation || ""} ${a.task || ""} ${a.action || ""} ${a.result || ""}`.trim(),
            impact: a.xyzMetricValue || undefined
          })),
          {
            questionCount: input.questionCount,
            includeCompanyResearch: input.includeCompanyResearch
          }
        );
      }),

    evaluateAnswer: protectedProcedure
      .input(z.object({
        question: z.string(),
        answer: z.string(),
        relevantAchievements: z.array(z.string())
      }))
      .mutation(async ({ input }) => {
        const { evaluatePracticeAnswer } = await import("./agents/interviewPrep");
        return evaluatePracticeAnswer(
          input.question,
          input.answer,
          input.relevantAchievements
        );
      }),

    generateFollowUps: protectedProcedure
      .input(z.object({
        question: z.string(),
        answer: z.string()
      }))
      .mutation(async ({ input }) => {
        const { generateFollowUpQuestions } = await import("./agents/interviewPrep");
        return generateFollowUpQuestions(input.question, input.answer);
      }),
  }),
});
export type AppRouter = typeof appRouter;
