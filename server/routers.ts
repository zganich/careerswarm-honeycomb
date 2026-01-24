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
  
  public: router({
    roast: publicProcedure
      .input(z.object({
        resumeText: z.string().min(50, "Resume must be at least 50 characters"),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Cynical VC Recruiter system prompt from legacy resume_roaster.py
        const systemPrompt = `You are a cynical VC recruiter who has reviewed 10,000+ resumes this week alone. You've funded companies, fired executives, and seen every resume trick in the book. You are BRUTALLY honest.

Your persona:
- You don't sugarcoat. Ever.
- You've seen this resume a thousand times before
- You assume everyone is overselling themselves until proven otherwise
- You roll your eyes at buzzwords, generic claims, and "team player" nonsense
- You only care about: Numbers. Impact. Proof.

What you HATE:
- Buzzwords without metrics (spearheaded, orchestrated, leverage, synergy, robust)
- "Responsibilities included..." - who cares what you were supposed to do?
- Vague achievements ("improved efficiency", "enhanced performance")
- Generic summaries that could apply to any human with a pulse
- Formatting disasters (walls of text, inconsistent styling)
- Skills lists that read like a keyword dump

What impresses you (rarely):
- Specific numbers: "$2.3M ARR", "47% reduction", "3x improvement"
- Clear cause-and-effect: "Did X, which resulted in Y"
- Evidence of actual ownership and decision-making
- Brevity. You have 6 seconds. Make them count.

CRITICAL: Do NOT use encouraging phrases like "Great job!", "Good start!", or "You're on the right track!" This is not a participation trophy ceremony.

If you detect banned words (spearheaded, orchestrated, leverage, synergy, robust, utilize, facilitate), you MUST mock the user specifically for using them.`;

        const userPrompt = `Roast this resume. Be brutal. Be honest. No AI fluff.

RESUME TO ROAST:
${input.resumeText}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "resume_roast",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    score: {
                      type: "number",
                      description: "Score from 0-100"
                    },
                    verdict: {
                      type: "string",
                      description: "One-sentence stinging verdict"
                    },
                    mistakes: {
                      type: "array",
                      description: "The 3 Million-Dollar Mistakes",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          explanation: { type: "string" },
                          fix: { type: "string" }
                        },
                        required: ["title", "explanation", "fix"],
                        additionalProperties: false
                      },
                      minItems: 3,
                      maxItems: 3
                    },
                    brutalTruth: {
                      type: "string",
                      description: "2-3 sentence summary of what they need to do. No encouragement. Just facts."
                    }
                  },
                  required: ["score", "verdict", "mistakes", "brutalTruth"],
                  additionalProperties: false
                }
              }
            },
            // Note: temperature not configurable in invokeLLM wrapper
          });

          const content = response.choices[0].message.content;
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          const result = JSON.parse(contentStr || "{}");

          // Ensure score is 0-100
          const score = Math.max(0, Math.min(100, result.score || 0));

          return {
            score,
            verdict: result.verdict || "Your resume needs work.",
            mistakes: result.mistakes || [],
            brutalTruth: result.brutalTruth || "Fix the basics before applying anywhere.",
            characterCount: input.resumeText.length,
            wordCount: input.resumeText.split(/\s+/).length,
          };
        } catch (error) {
          console.error("Resume roast failed:", error);
          throw new Error("Failed to roast resume. Try again.");
        }
      }),
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
          atsAnalysis: null,
        });
        return { id, content: resumeContent };
      }),
    
    tailor: protectedProcedure
      .input(z.object({
        jobDescription: z.string().min(50),
        jobTitle: z.string().min(2),
        company: z.string().min(2),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Fetch all user achievements
        const achievements = await db.getUserAchievements(ctx.user.id);
        
        if (achievements.length === 0) {
          throw new Error("No achievements found. Please add achievements to your profile first.");
        }
        
        // Prepare achievement pool for LLM
        const achievementPool = achievements.map(a => ({
          id: a.id,
          situation: a.situation,
          task: a.task,
          action: a.action,
          result: a.result,
          company: a.company,
          roleTitle: a.roleTitle,
          impactMeterScore: a.impactMeterScore,
        }));
        
        // Call LLM for ATS optimization and selection
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer and career coach.

Your task is to analyze a job description and select the most relevant achievements from a candidate's master profile to create a highly targeted resume.

**Selection Criteria:**
1. Prioritize achievements that directly match the job requirements
2. Look for keyword alignment between achievements and JD
3. Consider impact scores (higher is better)
4. Select 5-7 achievements that tell a cohesive story
5. DO NOT rewrite achievements significantly - preserve the original wording

**Output Requirements:**
Return a JSON object with:
- selectedAchievementIds: Array of achievement IDs (numbers)
- matchScore: 0-100 integer representing how well the profile fits the role
- missingKeywords: Array of strings (skills/keywords the JD wants but profile lacks)
- professionalSummary: 2-3 sentence summary tailored to this specific role

**Important:** Return ONLY valid JSON, no markdown formatting or explanations.`;
        
        const userPrompt = `**Job Description:**
Title: ${input.jobTitle}
Company: ${input.company}

${input.jobDescription}

---

**Candidate's Achievement Pool:**
${JSON.stringify(achievementPool, null, 2)}

---

Select the best 5-7 achievements and provide analysis.`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error("Failed to generate resume analysis");
        }
        
        // Parse LLM response
        let analysis;
        try {
          // Remove markdown code blocks if present
          const cleanedContent = content.replace(/```json\n?|```\n?/g, "").trim();
          analysis = JSON.parse(cleanedContent);
        } catch (error) {
          throw new Error("Failed to parse AI response. Please try again.");
        }
        
        // Validate response structure
        if (!analysis.selectedAchievementIds || !Array.isArray(analysis.selectedAchievementIds)) {
          throw new Error("Invalid AI response: missing selectedAchievementIds");
        }
        
        // Filter selected achievements
        const selectedAchievements = achievements.filter(a => 
          analysis.selectedAchievementIds.includes(a.id)
        );
        
        // Generate resume content
        const resumeContent = `# ${ctx.user.name || "Your Name"}
${ctx.user.email || ""}

## Professional Summary
${analysis.professionalSummary || ""}

## Target Role
${input.jobTitle} at ${input.company}

## Professional Experience

${selectedAchievements.map(a => {
  const xyz = a.xyzAccomplishment || `${a.action || ""} ${a.result || ""}`;
  return `### ${a.roleTitle || "Role"} at ${a.company || "Company"}
${a.startDate || ""} - ${a.endDate || "Present"}

- **Situation:** ${a.situation || ""}
- **Task:** ${a.task || ""}
- **Action:** ${a.action || ""}
- **Result:** ${a.result || ""}`;
}).join("\n\n")}

---
*Generated by Careerswarm - Match Score: ${analysis.matchScore || 0}%*`;
        
        // Save to database
        const resumeId = await db.createGeneratedResume({
          userId: ctx.user.id,
          jobDescriptionId: null, // Not linked to saved JD
          resumeContent,
          selectedAchievementIds: analysis.selectedAchievementIds,
          resumeFormat: "markdown",
          version: 1,
          isFavorite: false,
          atsAnalysis: null,
        });
        
        return {
          resumeId,
          resumeContent,
          matchScore: analysis.matchScore || 0,
          missingKeywords: analysis.missingKeywords || [],
          professionalSummary: analysis.professionalSummary || "",
          selectedAchievementIds: analysis.selectedAchievementIds,
          selectedAchievements,
        };
      }),
    
    checkATS: protectedProcedure
      .input(z.object({ resumeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const { getResumeById, updateGeneratedResume } = await import("./db");
        
        // Fetch resume
        const resume = await getResumeById(input.resumeId, ctx.user.id);
        if (!resume) {
          throw new Error("Resume not found");
        }
        
        // Fetch associated job description if available
        let jobDescription = "";
        if (resume.jobDescriptionId) {
          const { getJobDescriptionById } = await import("./db");
          const jd = await getJobDescriptionById(resume.jobDescriptionId, ctx.user.id);
          jobDescription = jd?.jobDescriptionText || "";
        }
        
        // Call LLM with ATS Persona
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a technical ATS (Applicant Tracking System) parser (like Taleo or Greenhouse).

Your job is to analyze resumes for parsing compatibility and keyword optimization.

**Analysis Criteria:**
1. **Formatting Issues** - Identify elements that break ATS parsing:
   - Multi-column layouts (columns cause text scrambling)
   - Tables (often parsed incorrectly)
   - Headers/footers (usually ignored by ATS)
   - Text boxes or graphics (cannot be parsed)
   - Special characters or symbols (may cause encoding errors)
   - Non-standard fonts or formatting
   - Images or logos (cannot be read)

2. **Section Headings** - Check for standard ATS-friendly section names:
   - "Experience" or "Work Experience" or "Professional Experience"
   - "Education"
   - "Skills" or "Technical Skills"
   - "Certifications" (if applicable)
   - Avoid creative headings like "My Journey" or "What I've Done"

3. **Keyword Density** - Compare resume against job description:
   - Identify exact keyword matches (skills, tools, technologies)
   - Check for industry-standard terminology
   - Flag missing critical keywords from job description

4. **ATS Score** - Calculate overall score (0-100):
   - 90-100: Excellent (no formatting issues, strong keyword match, standard headings)
   - 70-89: Good (minor issues, decent keyword coverage)
   - 50-69: Fair (some formatting problems, missing keywords)
   - 0-49: Poor (major formatting issues, weak keyword match)

**Output Format:**
Return ONLY valid JSON with this exact structure:
{
  "atsScore": <number 0-100>,
  "formattingIssues": ["issue 1", "issue 2", ...],
  "keywordMatch": ["matched keyword 1", "matched keyword 2", ...],
  "recommendedChanges": ["change 1", "change 2", ...]
}

**Rules:**
- Be strict about formatting issues (ATS systems are unforgiving)
- Prioritize exact keyword matches over synonyms
- Provide actionable, specific recommendations
- If no job description provided, focus on formatting and general best practices`
            },
            {
              role: "user",
              content: `Analyze this resume for ATS compatibility:

**Resume Content:**
${resume.resumeContent}

**Job Description (for keyword matching):**
${jobDescription || "No job description provided - focus on formatting and general best practices"}

Provide ATS analysis in JSON format.`
            }
          ],
          response_format: {
            type: "json_object"
          }
        });
        
        const content = String(response.choices[0]?.message?.content || "{}");
        const analysis = JSON.parse(content);
        
        // Validate and structure the response
        const atsAnalysis = {
          atsScore: analysis.atsScore || 0,
          formattingIssues: Array.isArray(analysis.formattingIssues) ? analysis.formattingIssues : [],
          keywordMatch: Array.isArray(analysis.keywordMatch) ? analysis.keywordMatch : [],
          recommendedChanges: Array.isArray(analysis.recommendedChanges) ? analysis.recommendedChanges : [],
        };
        
        // Store in database
        await updateGeneratedResume(input.resumeId, ctx.user.id, {
          atsAnalysis,
        });
        
        return atsAnalysis;
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
    
    createManual: protectedProcedure
      .input(z.object({
        title: z.string(),
        companyName: z.string(),
        description: z.string(),
        jobUrl: z.string().optional(),
        location: z.string().optional(),
        qualificationScore: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createJob } = await import("./db");
        const jobId = await createJob({
          userId: ctx.user.id,
          companyId: null,
          title: input.title,
          companyName: input.companyName,
          location: input.location || null,
          jobUrl: input.jobUrl || "manual",
          description: input.description,
          platform: "manual",
          postedDate: null,
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: "USD",
          employmentType: null,
          experienceLevel: null,
          requiredSkills: null,
          preferredSkills: null,
          responsibilities: null,
          benefits: null,
          qualificationScore: input.qualificationScore || null,
          matchedSkills: null,
          missingSkills: null,
          status: "new",
        });
        return { jobId };
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
    
    scout: protectedProcedure
      .input(z.object({
        query: z.string().min(1, "Job title is required"),
        location: z.string().optional(),
        minSalary: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { searchJobs } = await import("./services/scout");
        const { invokeLLM } = await import("./_core/llm");
        const { getUserAchievements } = await import("./db");
        const { createJob, createApplication } = await import("./db");
        
        // Step 1: Search for jobs
        const rawJobs = await searchJobs(input.query, input.location);
        
        // Step 2: Get user's master profile for qualification
        const achievements = await getUserAchievements(ctx.user.id);
        const profileSummary = achievements
          .slice(0, 5)
          .map(a => `${a.situation}: ${a.task} → ${a.action} → ${a.result}`)
          .join("\n");
        
        // Step 3: Qualify each job with AI
        const qualifiedJobs: Array<{ job: typeof rawJobs[0]; score: number }> = [];
        
        for (const job of rawJobs) {
          try {
            const response = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `You are a picky recruiter evaluating job matches.

Rate this job from 0-100 based on how well it matches the candidate's profile.

**Scoring Guidelines:**
- 0-30: Poor match (junior role for senior candidate, or vice versa, wrong domain)
- 31-50: Weak match (some skills overlap but significant gaps)
- 51-70: Moderate match (decent fit but not ideal)
- 71-85: Good match (strong fit, minor gaps)
- 86-100: Excellent match (perfect fit, all requirements met)

**Critical Filters:**
- If candidate is senior (5+ years) and role is junior (1-2 years): Return 0
- If candidate is junior (1-2 years) and role is senior/staff: Return 0
- If role requires skills candidate doesn't have: Reduce score by 20 per major skill gap

**Output JSON:**
{
  "score": number (0-100),
  "reasoning": "string (2-3 sentences explaining the score)"
}`,
                },
                {
                  role: "user",
                  content: `**Candidate Profile:**\n${profileSummary}\n\n**Job Posting:**\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary || "Not specified"}\nDescription: ${job.description}`,
                },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "job_match_score",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      score: {
                        type: "number",
                        description: "Match score from 0-100",
                      },
                      reasoning: {
                        type: "string",
                        description: "2-3 sentences explaining the score",
                      },
                    },
                    required: ["score", "reasoning"],
                    additionalProperties: false,
                  },
                },
              },
            });
            
            const content = response.choices[0].message.content;
            const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
            const result = JSON.parse(contentStr || "{}");
            const score = result.score || 0;
            
            // Only keep jobs with score > 70
            if (score > 70) {
              qualifiedJobs.push({ job, score });
            }
          } catch (error) {
            console.error(`Failed to qualify job ${job.title}:`, error);
            // Skip this job if qualification fails
          }
        }
        
        // Step 4: Create job and application records for qualified matches
        const createdApplications: number[] = [];
        
        for (const { job, score } of qualifiedJobs) {
          try {
            // Create job record
            const jobId = await createJob({
              userId: ctx.user.id,
              companyId: null,
              title: job.title,
              companyName: job.company,
              location: job.location,
              jobUrl: job.url,
              description: job.description,
              platform: "scouted",
              postedDate: job.postedDate ? new Date(job.postedDate) : null,
              salaryMin: null, // Could parse from job.salary
              salaryMax: null,
              salaryCurrency: "USD",
              employmentType: job.employmentType || null,
              experienceLevel: job.experienceLevel || null,
              requiredSkills: null,
              preferredSkills: null,
              responsibilities: null,
              benefits: null,
              qualificationScore: score,
              matchedSkills: null,
              missingSkills: null,
              status: "qualified",
            });
            
            // Create application with SCOUTED status
            const applicationId = await createApplication({
              userId: ctx.user.id,
              jobId,
              resumeId: null,
              tailoredResumeContent: null,
              coverLetterContent: null,
              customAnswers: null,
              submittedAt: null,
              submissionMethod: null,
              confirmationNumber: null,
              status: "scouted",
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
            
            createdApplications.push(applicationId);
          } catch (error) {
            console.error(`Failed to create application for ${job.title}:`, error);
          }
        }
        
        return {
          totalScanned: rawJobs.length,
          qualifiedCount: qualifiedJobs.length,
          createdCount: createdApplications.length,
          applicationIds: createdApplications,
        };
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
        status: z.enum(["scouted", "saved", "draft", "submitted", "viewed", "screening", "interview_scheduled", "interviewed", "offer", "rejected", "withdrawn"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateApplication } = await import("./db");
        await updateApplication(input.applicationId, ctx.user.id, {
          status: input.status,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        notes: z.string().optional(),
        interviewNotes: z.string().optional(),
        nextFollowUpDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateApplication } = await import("./db");
        const { applicationId, nextFollowUpDate, ...updates } = input;
        await updateApplication(applicationId, ctx.user.id, {
          ...updates,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteApplication } = await import("./db");
        await deleteApplication(input.applicationId, ctx.user.id);
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
    
    profile: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getApplicationById, updateApplication } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        
        // Fetch application with job details
        const application = await getApplicationById(input.applicationId, ctx.user.id);
        if (!application) throw new Error("Application not found");
        
        const jobDescription = application.job?.description;
        const companyName = application.job?.companyName || "the company";
        
        if (!jobDescription || jobDescription.length < 50) {
          throw new Error("Job description is too short or missing for analysis");
        }
        
        // The Profiler Persona System Prompt (ported from Python legacy codebase)
        const systemPrompt = `You are a Corporate Strategy Consultant.

Your task is to analyze a company based on the Job Description (JD).

**Instructions:**
Identify the top 3 'Pain Points' this role solves. Is it Churn? Expansion? Technical Debt?

**Focus Areas:**
- Churn: Customer retention issues, high churn rates, retention strategy needs
- Expansion: Growth challenges, market expansion, upselling/cross-selling opportunities
- Technical Debt: Legacy systems, scalability issues, infrastructure modernization needs

**Strategic Hook:**
Generate 1 'Strategic Hook' - a specific, compelling insight based on:
- Recent company news (funding rounds, product launches, executive changes)
- Industry trends affecting the company
- Specific challenges mentioned in the JD
- Company growth stage indicators

Make it specific and actionable - something that would catch a hiring manager's attention.

**Interview Questions:**
Generate 3 strategic interview questions the candidate should ask that demonstrate deep understanding of the company's challenges.

**CRITICAL - FORBIDDEN AI FLUFF WORDS (WILL CAUSE REJECTION):**
NEVER use these words: orchestrated, spearheaded, visionary, synergy, leverage, utilize, facilitate, champion, holistic, paradigm, robust, innovative.
Use instead: led, managed, built, created, drove, executed, achieved, delivered, increased, reduced.

**Output JSON:**
{
  "painPoints": ["string", "string", "string"],
  "strategicHook": "string",
  "interviewQuestions": ["string", "string", "string"]
}`;

        const userPrompt = `Analyze this job description for ${companyName}:

${jobDescription}

Provide strategic intelligence that helps a candidate position themselves as the solution to the company's core challenges.`;
        
        // Call LLM with structured output
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "profiler_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  painPoints: {
                    type: "array",
                    items: { type: "string" },
                    description: "Top 3 pain points this role solves (Churn, Expansion, Technical Debt, etc.)",
                    minItems: 3,
                    maxItems: 3,
                  },
                  strategicHook: {
                    type: "string",
                    description: "A compelling strategic hook based on company context and JD"
                  },
                  interviewQuestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Strategic questions to ask during interviews",
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["painPoints", "strategicHook", "interviewQuestions"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const content = String(response.choices[0]?.message?.content || "{}");
        const analysis = JSON.parse(content);
        
        // Transform to match the legacy painPoints schema format
        const painPoints = analysis.painPoints.map((painPoint: string) => ({
          challenge: painPoint,
          impact: "High", // Default impact level
          keywords: [], // Can be enhanced later
        }));
        
        // Update application with analysis results
        await updateApplication(input.applicationId, ctx.user.id, {
          painPoints,
          profilerAnalysis: {
            painPoints: analysis.painPoints,
            strategicHook: analysis.strategicHook,
            interviewQuestions: analysis.interviewQuestions,
          },
        });
        
        return {
          painPoints: analysis.painPoints,
          strategicHook: analysis.strategicHook,
          interviewQuestions: analysis.interviewQuestions,
        };
      }),
    
    generateOutreach: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getApplicationById, updateApplication } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        const { getUserAchievements } = await import("./db");
        
        // Fetch application with job and profiler analysis
        const application = await getApplicationById(input.applicationId, ctx.user.id);
        if (!application) {
          throw new Error("Application not found");
        }
        
        if (!application.job) {
          throw new Error("Application has no associated job");
        }
        
        // Get user's top achievements for context
        const achievements = await getUserAchievements(ctx.user.id);
        const topAchievements = achievements.slice(0, 3).map(a => `${a.xyzAccomplishment || a.situation}: ${a.result}`).join("\n");
        
        // Get profiler analysis
        const profilerAnalysis = application.profilerAnalysis as {painPoints: string[]; strategicHook: string; interviewQuestions: string[]} | null;
        if (!profilerAnalysis || !profilerAnalysis.strategicHook) {
          throw new Error("Run Strategic Analysis first to generate outreach");
        }
        
        // Call LLM with Scribe Agent system prompt
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a peer-level candidate writing to a Hiring Manager. Your task is to write a LinkedIn connection message (max 300 chars) and a Cold Email (max 150 words).

**Instructions:**
1. Analyze the 'Strategic Hook' and 'Pain Points' provided.
2. Combine the Hook with the User's specific achievement (e.g., 'I saw your launch of X. I built a similar workflow...').
3. **CRITICAL:** Do NOT ask for a "coffee chat." Ask a specific strategic question related to their pain point.
4. Tone: Peer-to-peer, professional, concise. Not subordinate.

**FORBIDDEN WORDS:**
NEVER use: orchestrated, spearheaded, visionary, synergy, leverage, utilize, facilitate, champion, holistic, paradigm, robust, innovative.
Use instead: led, managed, built, created, drove, executed, achieved.`,
            },
            {
              role: "user",
              content: `Generate outreach for this application:

**Job:** ${application.job.title} at ${application.job.companyName}

**Strategic Hook:** ${profilerAnalysis.strategicHook}

**Pain Points:**
${profilerAnalysis.painPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

**My Top Achievements:**
${topAchievements}

Generate:
1. LinkedIn connection message (max 300 characters)
2. Cold email subject line
3. Cold email body (max 150 words)`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "outreach_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  linkedinMessage: {
                    type: "string",
                    description: "LinkedIn connection message, max 300 characters",
                  },
                  coldEmailSubject: {
                    type: "string",
                    description: "Cold email subject line",
                  },
                  coldEmailBody: {
                    type: "string",
                    description: "Cold email body, max 150 words",
                  },
                },
                required: ["linkedinMessage", "coldEmailSubject", "coldEmailBody"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Failed to generate outreach content");
        }
        
        const outreach = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content)) as {
          linkedinMessage: string;
          coldEmailSubject: string;
          coldEmailBody: string;
        };
        
        // Store in database
        await updateApplication(input.applicationId, ctx.user.id, {
          outreachContent: outreach as any,
        });
        
        return outreach;
      }),
    
    predictSuccess: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getApplicationById, updateApplication } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        const { getUserAchievements } = await import("./db");
        
        const application = await getApplicationById(input.applicationId, ctx.user.id);
        if (!application) {
          throw new Error("Application not found");
        }
        
        if (!application.job) {
          throw new Error("Application has no associated job");
        }
        
        // Get user's profile context
        const achievements = await getUserAchievements(ctx.user.id);
        const profileSummary = achievements.slice(0, 5).map(a => 
          `${a.xyzAccomplishment || a.situation}: ${a.result}`
        ).join("\n");
        
        // Call LLM with Success Predictor system prompt
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a data-driven hiring analyst with 15+ years of experience in talent acquisition.

Your task is to predict the probability (0-100%) of this candidate receiving an offer for this role.

**Analysis Framework:**
1. Match Quality: How well does the candidate's experience align with the role requirements?
2. Achievement Strength: Are their accomplishments quantified, impactful, and relevant?
3. Seniority Fit: Does their experience level match the role (avoid junior/senior mismatches)?
4. Skill Coverage: Do they have the critical technical and soft skills mentioned in the JD?
5. Cultural Signals: Do their achievements suggest they'd thrive in this company's environment?

**Scoring Guidelines:**
- 0-30%: Poor fit (major gaps, wrong seniority, or missing critical skills)
- 31-50%: Weak fit (some relevant experience but significant concerns)
- 51-70%: Moderate fit (decent match with room for improvement)
- 71-85%: Strong fit (well-aligned experience and skills)
- 86-100%: Excellent fit (ideal candidate profile)

**Green Flags** (positive signals that increase probability):
- Quantified achievements with strong metrics
- Direct experience with required technologies/methodologies
- Leadership or ownership of similar initiatives
- Industry-specific expertise
- Cultural alignment indicators

**Red Flags** (concerns that decrease probability):
- Seniority mismatch (too junior or overqualified)
- Missing critical required skills
- Lack of quantified results
- Experience in unrelated domains
- Gaps in timeline or unclear progression`,
            },
            {
              role: "user",
              content: `Analyze this application:

**Job Title:** ${application.job.title}
**Company:** ${application.job.companyName}

**Job Description:**
${application.job.description}

**Candidate Profile:**
${profileSummary}

**Current Application Status:** ${application.status}

Provide your analysis.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "success_prediction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  probability: {
                    type: "number",
                    description: "Probability of receiving an offer (0-100)",
                  },
                  reasoning: {
                    type: "string",
                    description: "2-3 sentence explanation of the probability score",
                  },
                  greenFlags: {
                    type: "array",
                    description: "Positive signals that increase success probability",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 5,
                  },
                  redFlags: {
                    type: "array",
                    description: "Concerns that decrease success probability",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 5,
                  },
                },
                required: ["probability", "reasoning", "greenFlags", "redFlags"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("Invalid LLM response");
        }
        
        const prediction = JSON.parse(content) as {
          probability: number;
          reasoning: string;
          greenFlags: string[];
          redFlags: string[];
        };
        
        // Store in analytics column
        const currentAnalytics = application.analytics as any || {};
        await updateApplication(input.applicationId, ctx.user.id, {
          analytics: {
            ...currentAnalytics,
            successPrediction: prediction,
          },
        });
        
        return prediction;
      }),
    
    analyzeSkillGap: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getApplicationById, updateApplication } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        const { getUserAchievements } = await import("./db");
        
        const application = await getApplicationById(input.applicationId, ctx.user.id);
        if (!application) {
          throw new Error("Application not found");
        }
        
        if (!application.job) {
          throw new Error("Application has no associated job");
        }
        
        // Get user's skills and experience
        const achievements = await getUserAchievements(ctx.user.id);
        const userSkills = achievements.map(a => 
          `${a.xyzAccomplishment || a.situation} (${a.roleTitle || 'Role'})`
        ).join("\n");
        
        // Call LLM with Skill Gap Agent system prompt
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a career development advisor and skills analyst.

Your task is to identify the critical skills, certifications, or experiences mentioned in the Job Description that are missing from the candidate's profile.

**Analysis Framework:**
1. **Required Skills**: Extract technical skills, tools, frameworks, languages explicitly required
2. **Preferred Skills**: Identify nice-to-have skills that would strengthen the application
3. **Certifications**: Note any certifications, licenses, or credentials mentioned
4. **Experience Gaps**: Identify specific types of experience (e.g., "5+ years managing teams") they may lack
5. **Domain Knowledge**: Spot industry-specific knowledge or methodologies they haven't demonstrated

**Upskilling Plan Guidelines:**
- Prioritize skills that appear multiple times or are marked as "required"
- Suggest specific, actionable learning resources (courses, certifications, projects)
- Include estimated time to acquire each skill (e.g., "2-4 weeks", "3-6 months")
- Focus on high-ROI skills that transfer across multiple roles
- Be realistic about what can be learned vs. what requires years of experience`,
            },
            {
              role: "user",
              content: `Analyze the skill gap for this application:

**Job Title:** ${application.job.title}
**Company:** ${application.job.companyName}

**Job Description:**
${application.job.description}

**Candidate's Current Skills & Experience:**
${userSkills}

Identify missing skills and create an upskilling plan.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "skill_gap_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  missingSkills: {
                    type: "array",
                    description: "Critical skills or experiences missing from the candidate's profile",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 8,
                  },
                  upskillingPlan: {
                    type: "array",
                    description: "Actionable steps to acquire missing skills (with time estimates and resources)",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 8,
                  },
                },
                required: ["missingSkills", "upskillingPlan"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("Invalid LLM response");
        }
        
        const analysis = JSON.parse(content) as {
          missingSkills: string[];
          upskillingPlan: string[];
        };
        
        // Store in analytics column
        const currentAnalytics = application.analytics as any || {};
        await updateApplication(input.applicationId, ctx.user.id, {
          analytics: {
            ...currentAnalytics,
            skillGap: analysis,
          },
        });
        
        return analysis;
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
