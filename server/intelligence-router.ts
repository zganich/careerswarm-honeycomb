import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";

/**
 * Intelligence Router - Core moat features
 * - Career Trajectory Prediction
 * - Interview Prep Intelligence
 * - Achievement Verification
 */

export const intelligenceRouter = router({
  // Career Trajectory Prediction
  predictTrajectory: protectedProcedure
    .input(z.object({
      jobDescriptionId: z.number().optional(),
      targetRole: z.string().optional(),
      targetCompany: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const achievements = await db.getUserAchievements(ctx.user.id);
      const skills = await db.getUserSkills(ctx.user.id);
      
      let targetJD = "";
      if (input.jobDescriptionId) {
        const jd = await db.getJobDescriptionById(input.jobDescriptionId, ctx.user.id);
        if (jd) {
          targetJD = jd.jobDescriptionText || "";
        }
      }

      const achievementsSummary = achievements.map(a => 
        `${a.xyzAccomplishment || a.result || a.action}`
      ).join("; ");

      const skillsList = skills.map(s => s.skillName).join(", ");

      const prompt = `Analyze this candidate's career trajectory and predict their fit for a role.

Candidate Achievements: ${achievementsSummary}
Candidate Skills: ${skillsList}
Target Role: ${input.targetRole || "Not specified"}
Target Company: ${input.targetCompany || "Not specified"}
Target Job Description: ${targetJD}

Provide:
1. Match percentage (0-100)
2. Strengths (what makes them a good fit)
3. Gaps (what's missing)
4. Recommendations (specific achievements or skills to add)
5. Probability assessment (low/medium/high/very high)`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert career coach and recruiter." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "trajectory_prediction",
            strict: true,
            schema: {
              type: "object",
              properties: {
                matchPercentage: { type: "number" },
                strengths: {
                  type: "array",
                  items: { type: "string" },
                },
                gaps: {
                  type: "array",
                  items: { type: "string" },
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                },
                probability: {
                  type: "string",
                  enum: ["low", "medium", "high", "very_high"],
                },
              },
              required: ["matchPercentage", "strengths", "gaps", "recommendations", "probability"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = String(response.choices[0]?.message?.content || "{}");
      return JSON.parse(content);
    }),

  // Interview Prep Intelligence
  generateInterviewAnswers: protectedProcedure
    .input(z.object({
      jobDescriptionId: z.number().optional(),
      achievementIds: z.array(z.number()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      let achievements = await db.getUserAchievements(ctx.user.id);
      
      if (input.achievementIds && input.achievementIds.length > 0) {
        achievements = achievements.filter(a => input.achievementIds!.includes(a.id));
      }

      let jdContext = "";
      if (input.jobDescriptionId) {
        const jd = await db.getJobDescriptionById(input.jobDescriptionId, ctx.user.id);
        if (jd) {
          jdContext = `Target Role: ${jd.jobTitle}\nCompany: ${jd.companyName}\nKey Requirements: ${jd.requiredSkills?.join(", ")}`;
        }
      }

      const achievementsList = achievements.map(a => ({
        id: a.id,
        situation: a.situation,
        task: a.task,
        action: a.action,
        result: a.result,
        xyz: a.xyzAccomplishment,
      }));

      const prompt = `Generate behavioral interview answers from these achievements.

${jdContext}

Achievements:
${JSON.stringify(achievementsList, null, 2)}

For each achievement, provide:
1. Common interview questions it answers
2. A polished 2-minute answer using STAR format
3. Key talking points to emphasize
4. Follow-up questions the interviewer might ask`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert interview coach." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "interview_prep",
            strict: true,
            schema: {
              type: "object",
              properties: {
                answers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      achievementId: { type: "number" },
                      questions: {
                        type: "array",
                        items: { type: "string" },
                      },
                      answer: { type: "string" },
                      keyPoints: {
                        type: "array",
                        items: { type: "string" },
                      },
                      followUps: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["achievementId", "questions", "answer", "keyPoints", "followUps"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["answers"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = String(response.choices[0]?.message?.content || "{}");
      return JSON.parse(content);
    }),

  // Achievement Verification
  verification: router({
    request: protectedProcedure
      .input(z.object({
        achievementId: z.number(),
        verifierEmail: z.string().email(),
        verifierName: z.string(),
        relationship: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const achievement = await db.getAchievementById(input.achievementId, ctx.user.id);
        if (!achievement) {
          throw new Error("Achievement not found");
        }

        const token = nanoid(32);
        
        // Create verification request
        const result: any = await db.getDb().then(db => 
          db!.insert(achievementVerifications).values({
            achievementId: input.achievementId,
            userId: ctx.user.id,
            verifierEmail: input.verifierEmail,
            verifierName: input.verifierName,
            relationship: input.relationship,
            verificationToken: token,
            verificationStatus: "pending",
          })
        );

        // TODO: Send email to verifier with link
        // For now, return the verification link
        const verificationLink = `${process.env.VITE_APP_URL || "https://careerswarm.app"}/verify/${token}`;

        return {
          id: Number(result.insertId),
          verificationLink,
          message: "Verification request created. Send this link to your colleague.",
        };
      }),

    verify: publicProcedure
      .input(z.object({
        token: z.string(),
        status: z.enum(["verified", "declined"]),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(achievementVerifications)
          .set({
            verificationStatus: input.status,
            verifiedAt: new Date(),
            verifierComments: input.comments || null,
          })
          .where(eq(achievementVerifications.verificationToken, input.token));

        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ achievementId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        return db.select()
          .from(achievementVerifications)
          .where(
            and(
              eq(achievementVerifications.achievementId, input.achievementId),
              eq(achievementVerifications.userId, ctx.user.id)
            )
          );
      }),
  }),
});

// Import missing dependencies
import { achievementVerifications } from "../drizzle/schema";
import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
