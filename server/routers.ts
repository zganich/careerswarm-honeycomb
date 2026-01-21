import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

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
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ ctx, input }) => db.searchAchievements(ctx.user.id, input.query)),
    
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

  jobDescriptions: router({
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
