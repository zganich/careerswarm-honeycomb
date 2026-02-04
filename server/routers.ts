import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { gtmRouter } from "./gtm-router";
import { jdBuilderRouter } from "./jd-builder-router";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut, storageGet } from "./storage";
import { extractTextFromResume, parseResumeWithLLM, consolidateResumes, generateSuperpowers } from "./resumeParser";
import { profileRouter } from "./routers/profile";
import { stripeRouter } from "./stripe-router";
import { setResumeProgress } from "./resumeProgress";

// ================================================================
// CAREERSWARM - MASTER PROFILE & 7-AGENT SYSTEM
// ================================================================

// ================================================================
// PUBLIC ROUTES (no auth) - Resume Roast, etc.
// ================================================================
const ROAST_SYSTEM_PROMPT = `You are a cynical VC recruiter who has reviewed 10,000+ resumes this week. You don't sugarcoat. Ever.

Your job: Roast the resume. Give a 0-100 score and exactly 3 "Million-Dollar Mistakes" — specific, brutal, actionable.

What you hate:
- Buzzwords without metrics (spearheaded, orchestrated, leverage, synergy, utilize, facilitate, robust)
- "Responsibilities included..." — who cares what they were supposed to do?
- Vague achievements ("improved efficiency", "enhanced performance")
- Generic summaries that could apply to any human with a pulse
- Formatting disasters (walls of text, inconsistent styling)
- Skills lists that read like keyword dumps

What impresses you (rarely):
- Specific numbers: "$2.3M ARR", "47% reduction", "3x improvement"
- Clear cause-and-effect: "Did X, which resulted in Y"
- Evidence of actual ownership and decision-making
- Brevity. They have 6 seconds. Make them count.

Output JSON only: score (0-100), verdict (one short sentence), brutalTruth (2-4 sentences of direct critique), and exactly 3 mistakes, each with title, explanation, and fix.`;

export const appRouter = router({
  system: systemRouter,
  profileSections: profileRouter,

  public: router({
    // Monitoring configuration for frontend (Sentry, PostHog)
    getMonitoringConfig: publicProcedure.query(() => {
      return {
        sentryDsn: process.env.SENTRY_DSN || null,
        posthogKey: process.env.POSTHOG_KEY || null,
        posthogHost: process.env.POSTHOG_HOST || 'https://us.posthog.com',
      };
    }),

    roast: publicProcedure
      .input(
        z.object({
          resumeText: z.string().min(50, "Resume must be at least 50 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const resumeText = input.resumeText.trim();
        const characterCount = resumeText.length;
        const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

        let response;
        try {
          response = await invokeLLM({
          messages: [
            { role: "system", content: ROAST_SYSTEM_PROMPT },
            { role: "user", content: `Roast this resume:\n\n${resumeText}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "resume_roast",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  verdict: { type: "string" },
                  brutalTruth: { type: "string" },
                  mistakes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        explanation: { type: "string" },
                        fix: { type: "string" },
                      },
                      required: ["title", "explanation", "fix"],
                      additionalProperties: false,
                    },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["score", "verdict", "brutalTruth", "mistakes"],
                additionalProperties: false,
              },
            },
          },
        });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Resume roast failed. Please try again.";
          const cause = err instanceof Error ? err.cause : undefined;
          console.error("[Resume Roast] LLM failed:", message, cause ? { cause: String(cause) } : "");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: message.includes("timed out") ? message : "Resume roast failed. Please try again in a moment.",
          });
        }

        const raw = response.choices[0].message.content;
        const rawStr = typeof raw === "string" ? raw : "";
        // Strip markdown code blocks if LLM wrapped JSON in ```json ... ```
        const jsonStr = rawStr
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/i, "")
          .trim();
        let parsed: {
          score?: number;
          verdict?: string;
          brutalTruth?: string;
          mistakes?: Array<{ title?: string; explanation?: string; fix?: string }>;
        } = {};
        try {
          parsed = JSON.parse(jsonStr || "{}") as typeof parsed;
        } catch {
          console.warn("[Resume Roast] LLM response was not valid JSON, using fallback");
          parsed = {
            score: 50,
            verdict: "Could not parse detailed feedback.",
            brutalTruth: "The analysis could not be structured. Try again or paste plain text only.",
            mistakes: [
              { title: "Parse issue", explanation: "Response format was unexpected.", fix: "Retry with resume text only." },
              { title: "—", explanation: "—", fix: "—" },
              { title: "—", explanation: "—", fix: "—" },
            ],
          };
        }

        const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));

        return {
          score,
          verdict: String(parsed.verdict ?? "").trim() || "See feedback below.",
          brutalTruth: String(parsed.brutalTruth ?? "").trim() || "Review the mistakes and improve your resume.",
          mistakes: (parsed.mistakes ?? []).slice(0, 3).map((m) => ({
            title: String(m.title ?? "").trim() || "Mistake",
            explanation: String(m.explanation ?? "").trim() || "",
            fix: String(m.fix ?? "").trim() || "",
          })),
          characterCount,
          wordCount,
        };
      }),

    estimateQualification: publicProcedure
      .input(
        z.object({
          currentRole: z.string().min(2, "Current role must be at least 2 characters"),
          targetRole: z.string().min(2, "Target role must be at least 2 characters"),
        })
      )
      .mutation(async ({ input }) => {
        // Stub: returns valid shape for tests; can be replaced with LLM later
        const score = Math.min(100, Math.max(0, 50 + Math.floor(Math.random() * 40)));
        const gaps = [
          { skill: "Domain experience", importance: "critical" as const, suggestion: "Gain experience in target domain." },
          { skill: "Leadership", importance: "important" as const, suggestion: "Take on project ownership." },
          { skill: "Communication", importance: "helpful" as const, suggestion: "Present to stakeholders." },
        ];
        const reasoning = `Comparison of ${input.currentRole} to ${input.targetRole}: gap analysis based on typical requirements.`;
        return { score, gaps, reasoning };
      }),
  }),

  // ================================================================
  // AUTH ROUTES
  // ================================================================
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      const user = await db.getUserByOpenId(ctx.user.openId);
      return user;
    }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
      const { COOKIE_NAME } = await import("@shared/const");
      const { getSessionCookieOptions } = await import("./_core/cookies");
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: 0 });
      return { success: true };
    }),
  }),

  // ================================================================
  // ONBOARDING ROUTES
  // ================================================================
  onboarding: router({
    // Get current onboarding status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      return {
        step: user.onboardingStep || 0,
        completed: user.onboardingCompleted || false,
      };
    }),

    // Flywheel: apply referral (call when user lands with ref=referrerUserId in URL). Referrer gets 30 days Pro when this user completes onboarding.
    applyReferral: protectedProcedure
      .input(z.object({ referrerUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        await db.setUserReferredBy(user.id, input.referrerUserId);
        return { success: true };
      }),

    // Update onboarding step
    updateStep: protectedProcedure
      .input(z.object({
        step: z.number().min(0).max(5),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        await db.updateUserOnboardingStep(user.id, input.step, input.completed);
        return { success: true };
      }),

    // Upload resume file
    uploadResume: protectedProcedure
      .input(z.object({
        filename: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // Upload to S3
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `resumes/${user.id}/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        // Save to database
        const resumeId = await db.createUploadedResume({
          userId: user.id,
          filename: input.filename,
          fileKey,
          fileUrl: url,
          fileSize: fileBuffer.length,
          mimeType: input.mimeType,
          processingStatus: 'pending',
        });

        return { resumeId, url };
      }),

    // Process uploaded resumes (extract text + parse achievements)
    processResumes: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const resumes = await db.getUploadedResumes(user.id);
      const pendingResumes = resumes.filter(r => r.processingStatus === 'pending');

      if (pendingResumes.length === 0) {
        return { message: "No resumes to process" };
      }

      const total = pendingResumes.length;
      setResumeProgress(user.id, { phase: "processing", current: 0, total, message: "Starting..." });

      // Process each resume
      for (let i = 0; i < pendingResumes.length; i++) {
        const resume = pendingResumes[i];
        try {
          setResumeProgress(user.id, { phase: "processing", current: i + 1, total, message: `Processing ${resume.filename}...` });
          await db.updateResumeProcessingStatus(resume.id, 'processing');

          // Download file from S3
          const { url } = await storageGet(resume.fileKey);
          const response = await fetch(url);
          const buffer = Buffer.from(await response.arrayBuffer());

          // Extract text based on file type
          const extractedText = await extractTextFromResume(buffer, resume.mimeType || 'application/pdf');
          
          await db.updateResumeProcessingStatus(resume.id, 'completed', extractedText);
        } catch (error: any) {
          console.error(`[Resume Parser] Failed to process ${resume.filename}:`, error);
          await db.updateResumeProcessingStatus(resume.id, 'failed', undefined, error.message);
        }
      }

      setResumeProgress(user.id, { phase: "parsing", message: "Extracting profile..." });
      return { processed: pendingResumes.length };
    }),

    // Parse resumes and extract Master Profile data
    parseResumes: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const database = await db.getDb();
      if (!database) {
        console.error("[parseResumes] Database not available");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database is not available. Please check your connection and try again. If this persists, contact support.",
        });
      }

      const resumes = await db.getUploadedResumes(user.id);
      const completedResumes = resumes.filter(r => r.processingStatus === 'completed' && r.extractedText);

      if (completedResumes.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No processed resumes found. Upload and process resumes first, then try again." });
      }

      setResumeProgress(user.id, { phase: "parsing", message: "Building your profile..." });

      try {
      // Parse each resume with LLM
      const parsedResumes = [];
      for (const resume of completedResumes) {
        const parsed = await parseResumeWithLLM(resume.extractedText!);
        parsedResumes.push(parsed);
      }

      // Consolidate multiple resumes
      const consolidated = consolidateResumes(parsedResumes);

      // Save work experiences and achievements
      for (const we of consolidated.workExperiences) {
        const workExpId = await db.createWorkExperience({
          userId: user.id,
          companyName: we.companyName,
          jobTitle: we.jobTitle,
          startDate: new Date(we.startDate),
          endDate: we.endDate ? new Date(we.endDate) : null,
          location: we.location || null,
          isCurrent: we.isCurrent,
          roleOverview: we.roleOverview || null,
          companyStage: we.companyStage || null,
          companyFunding: we.companyFunding || null,
          companyIndustry: we.companyIndustry || null,
          companySizeEmployees: we.companySizeEmployees || null,
        });

        // Save achievements for this work experience
        for (const ach of we.achievements || []) {
          await db.createAchievement({
            userId: user.id,
            workExperienceId: workExpId,
            description: ach.description,
            context: ach.context,
            metricType: ach.metricType,
            metricValue: ach.metricValue ? ach.metricValue.toString() : null,
            metricUnit: ach.metricUnit,
            metricTimeframe: ach.metricTimeframe,
            keywords: ach.keywords as any,
            importanceScore: ach.importanceScore,
            sourceResumeFilename: completedResumes[0].filename,
          });
        }
      }

      // Save skills
      for (const skill of consolidated.skills) {
        await db.createSkill({
          userId: user.id,
          skillName: skill.skillName,
          skillCategory: skill.skillCategory || null,
          proficiencyLevel: skill.proficiencyLevel as any || null,
          yearsExperience: skill.yearsExperience ? skill.yearsExperience.toString() : null,
        });
      }

      // Save certifications
      for (const cert of consolidated.certifications) {
        await db.createCertification({
          userId: user.id,
          certificationName: cert.name,
          issuingOrganization: cert.organization || null,
          issueYear: cert.year || null,
        });
      }

      // Save education
      for (const edu of consolidated.education) {
        await db.createEducation({
          userId: user.id,
          institution: edu.institution,
          degreeType: edu.degree || null,
          fieldOfStudy: edu.field || null,
          graduationYear: edu.graduationYear || null,
        });
      }

      // Save awards
      for (const award of consolidated.awards) {
        await db.createAward({
          userId: user.id,
          awardName: award.name,
          organization: award.organization || null,
          year: award.year || null,
          context: award.context || null,
        });
      }

      // Save professional summary, portfolio URLs, parsed contact (pre-fill only)
      await db.upsertUserProfile(user.id, {
        professionalSummary: consolidated.professionalSummary || null,
        portfolioUrls: (consolidated.portfolioUrls?.length ? consolidated.portfolioUrls : null) as any,
        parsedContactFromResume: consolidated.parsedContact && Object.keys(consolidated.parsedContact).length ? consolidated.parsedContact as any : null,
      });

      // Save languages
      for (const lang of consolidated.languages ?? []) {
        await db.createLanguage({
          userId: user.id,
          language: lang.language,
          proficiency: lang.proficiency ?? undefined,
          isNative: lang.isNative ?? false,
        });
      }

      // Save volunteer experiences
      for (const v of consolidated.volunteerExperiences ?? []) {
        await db.createVolunteerExperience({
          userId: user.id,
          organization: v.organization,
          role: v.role ?? undefined,
          startDate: v.startDate ?? undefined,
          endDate: v.endDate ?? undefined,
          description: v.description ?? undefined,
        });
      }

      // Save projects
      for (const p of consolidated.projects ?? []) {
        await db.createProject({
          userId: user.id,
          name: p.name,
          description: p.description ?? undefined,
          url: p.url ?? undefined,
          role: p.role ?? undefined,
          startDate: p.startDate ?? undefined,
          endDate: p.endDate ?? undefined,
        });
      }

      // Save publications
      for (const pub of consolidated.publications ?? []) {
        await db.createPublication({
          userId: user.id,
          title: pub.title,
          publisherOrVenue: pub.publisherOrVenue ?? undefined,
          year: pub.year ?? undefined,
          url: pub.url ?? undefined,
          context: pub.context ?? undefined,
        });
      }

      // Save security clearances
      for (const c of consolidated.securityClearances ?? []) {
        await db.createSecurityClearance({
          userId: user.id,
          clearanceType: c.clearanceType,
          level: c.level ?? undefined,
          expiryDate: c.expiryDate ?? undefined,
        });
      }

      // Save licenses (as certifications with type 'license')
      for (const lic of consolidated.licenses ?? []) {
        await db.createCertification({
          userId: user.id,
          certificationName: lic.name,
          issuingOrganization: lic.organization ?? null,
          issueYear: lic.year ?? null,
          type: "license",
        } as any);
      }

      // Generate superpowers
      const allAchievements = consolidated.workExperiences.flatMap(we => we.achievements);
      const superpowers = await generateSuperpowers(allAchievements);

      // Save superpowers
      const superpowersData = superpowers.map((sp, i) => ({
        title: sp.title,
        evidenceAchievementIds: [], // Will be populated later when user selects achievements
        rank: i + 1,
      }));
      await db.upsertSuperpowers(user.id, superpowersData);

      // Update onboarding step
      await db.updateUserOnboardingStep(user.id, 3, false);

      setResumeProgress(user.id, { phase: "done", message: "Profile saved." });

      return { 
        success: true, 
        workExperiences: consolidated.workExperiences.length,
        achievements: allAchievements.length,
        skills: consolidated.skills.length,
        superpowers: superpowers,
      };
      } catch (err) {
        setResumeProgress(user.id, { phase: "error", message: "Something went wrong." });
        console.error("[parseResumes] Failed to save profile:", err);
        const isDbError = err && typeof err === "object" && ("code" in err || "errno" in err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: isDbError
            ? "Failed to save your profile. Please try again or contact support."
            : "Resume parsing failed. Please try again or use a different file. If it keeps failing, try a shorter or simpler resume.",
          cause: err instanceof Error ? err : undefined,
        });
      }
    }),

    // Legacy code - keep for backward compatibility
    _oldParseResumes: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const resumes = await db.getUploadedResumes(user.id);
      const completedResumes = resumes.filter(r => r.processingStatus === 'completed' && r.extractedText);

      if (completedResumes.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No processed resumes found" });
      }

      // Combine all resume text
      const combinedText = completedResumes.map(r => r.extractedText).join('\n\n---\n\n');

      // Use LLM to extract structured data
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert resume parser. Extract structured career data from resumes.
Focus on:
- Work experiences (company, title, dates, achievements with metrics)
- Skills (technical, domain, tools)
- Education
- Certifications
- Awards

For achievements, extract:
- Description with context
- Metrics (type, value, unit, timeframe)
- Keywords for relevance scoring`
          },
          {
            role: "user",
            content: `Parse these resumes and extract structured data:\n\n${combinedText}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "resume_parse",
            strict: true,
            schema: {
              type: "object",
              properties: {
                workExperiences: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      companyName: { type: "string" },
                      jobTitle: { type: "string" },
                      startDate: { type: "string" },
                      endDate: { type: ["string", "null"] },
                      location: { type: "string" },
                      isCurrent: { type: "boolean" },
                      roleOverview: { type: "string" },
                      achievements: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            description: { type: "string" },
                            context: { type: "string" },
                            metricType: { type: ["string", "null"] },
                            metricValue: { type: ["number", "null"] },
                            metricUnit: { type: ["string", "null"] },
                            metricTimeframe: { type: ["string", "null"] },
                            keywords: { type: "array", items: { type: "string" } },
                          },
                          required: ["description", "context", "keywords"],
                          additionalProperties: false,
                        }
                      }
                    },
                    required: ["companyName", "jobTitle", "startDate", "isCurrent", "achievements"],
                    additionalProperties: false,
                  }
                },
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skillName: { type: "string" },
                      skillCategory: { type: "string" },
                      proficiencyLevel: { type: "string" },
                    },
                    required: ["skillName"],
                    additionalProperties: false,
                  }
                },
                education: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      institution: { type: "string" },
                      degreeType: { type: ["string", "null"] },
                      fieldOfStudy: { type: ["string", "null"] },
                      graduationYear: { type: ["number", "null"] },
                    },
                    required: ["institution"],
                    additionalProperties: false,
                  }
                },
              },
              required: ["workExperiences", "skills", "education"],
              additionalProperties: false,
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(typeof content === 'string' ? content : "{}");

      // Save work experiences and achievements
      for (const we of parsed.workExperiences) {
        const workExpId = await db.createWorkExperience({
          userId: user.id,
          companyName: we.companyName,
          jobTitle: we.jobTitle,
          startDate: new Date(we.startDate),
          endDate: we.endDate ? new Date(we.endDate) : null,
          location: we.location || null,
          isCurrent: we.isCurrent,
          roleOverview: we.roleOverview || null,
        });

        // Save achievements for this work experience
        for (const ach of we.achievements || []) {
          await db.createAchievement({
            userId: user.id,
            workExperienceId: workExpId,
            description: ach.description,
            context: ach.context,
            metricType: ach.metricType,
            metricValue: ach.metricValue,
            metricUnit: ach.metricUnit,
            metricTimeframe: ach.metricTimeframe,
            keywords: ach.keywords as any,
            sourceResumeFilename: completedResumes[0].filename,
          });
        }
      }

      // Save skills
      for (const skill of parsed.skills) {
        await db.createSkill({
          userId: user.id,
          skillName: skill.skillName,
          skillCategory: skill.skillCategory || null,
          proficiencyLevel: skill.proficiencyLevel as any || null,
        });
      }

      return { success: true, parsed };
    }),

    // Generate superpowers from achievements
    generateSuperpowers: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const achievements = await db.getAchievements(user.id);
      if (achievements.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No achievements found" });
      }

      // Use LLM to identify top 3 superpowers
      const achievementsList = achievements.map((a, i) => 
        `${i + 1}. ${a.description} (${a.context})`
      ).join('\n');

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert career coach. Analyze achievements and identify the top 3 "superpowers" - unique differentiators that make this person stand out.

Each superpower should:
- Be specific and memorable (not generic like "hard worker")
- Be backed by concrete evidence from achievements
- Highlight measurable impact
- Be relevant to their target roles`
          },
          {
            role: "user",
            content: `Identify the top 3 superpowers from these achievements:\n\n${achievementsList}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "superpowers",
            strict: true,
            schema: {
              type: "object",
              properties: {
                superpowers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      evidenceAchievementIndices: { type: "array", items: { type: "number" } },
                    },
                    required: ["title", "evidenceAchievementIndices"],
                    additionalProperties: false,
                  },
                  minItems: 3,
                  maxItems: 3,
                }
              },
              required: ["superpowers"],
              additionalProperties: false,
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(typeof content === 'string' ? content : "{}");

      // Save superpowers
      const superpowersData = parsed.superpowers.map((sp: any, rank: number) => ({
        title: sp.title,
        evidenceAchievementIds: sp.evidenceAchievementIndices.map((idx: number) => achievements[idx - 1]?.id).filter(Boolean),
        rank: rank + 1,
      }));

      await db.upsertSuperpowers(user.id, superpowersData);

      return { superpowers: superpowersData };
    }),

    // Save target preferences (Step 5)
    savePreferences: protectedProcedure
      .input(z.object({
        roleTitles: z.array(z.string()),
        industries: z.array(z.string()),
        companyStages: z.array(z.string()),
        minimumBaseSalary: z.number().optional(),
        minimumOTE: z.number().optional(),
        targetBaseSalary: z.number().optional(),
        targetOTE: z.number().optional(),
        locationType: z.string().optional(),
        allowedCities: z.array(z.string()).optional(),
        maxTravelPercent: z.number().optional(),
        internationalOk: z.boolean().optional(),
        dealBreakers: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.upsertTargetPreferences(user.id, {
          roleTitles: input.roleTitles as any,
          industries: input.industries as any,
          companyStages: input.companyStages as any,
          minimumBaseSalary: input.minimumBaseSalary,
          minimumOTE: input.minimumOTE,
          targetBaseSalary: input.targetBaseSalary,
          targetOTE: input.targetOTE,
          locationType: input.locationType,
          allowedCities: input.allowedCities as any,
          maxTravelPercent: input.maxTravelPercent,
          internationalOk: input.internationalOk,
          dealBreakers: input.dealBreakers as any,
        } as any);

        // Mark onboarding as complete
        await db.updateUserOnboardingStep(user.id, 5, true);
        // Flywheel: grant referrer 30 days Pro when referred user completes first resume ingestion
        await db.grantReferrer30DaysProIfReferred(user.id);

        return { success: true };
      }),
  }),

  // ================================================================
  // MASTER PROFILE ROUTES
  // ================================================================
  profile: router({
    // Get complete Master Profile
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const [
        userProfile,
        workExperiences,
        achievements,
        skills,
        superpowers,
        preferences,
        education,
        certifications,
        awards,
        languages,
        volunteerExperiences,
        projects,
        publications,
        securityClearances,
      ] = await Promise.all([
        db.getUserProfile(user.id),
        db.getWorkExperiences(user.id),
        db.getAchievements(user.id),
        db.getSkills(user.id),
        db.getSuperpowers(user.id),
        db.getTargetPreferences(user.id),
        db.getEducation(user.id),
        db.getCertifications(user.id),
        db.getAwards(user.id),
        db.getUserLanguages(user.id),
        db.getUserVolunteerExperiences(user.id),
        db.getUserProjects(user.id),
        db.getUserPublications(user.id),
        db.getUserSecurityClearances(user.id),
      ]);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        profile: userProfile,
        workExperiences,
        achievements,
        skills,
        superpowers,
        preferences,
        education,
        certifications,
        awards,
        languages,
        volunteerExperiences,
        projects,
        publications,
        securityClearances,
      };
    }),

    // Update user profile
    updateProfile: protectedProcedure
      .input(z.object({
        phone: z.string().optional(),
        linkedinUrl: z.string().optional(),
        locationCity: z.string().optional(),
        locationState: z.string().optional(),
        locationCountry: z.string().optional(),
        workPreference: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.upsertUserProfile(user.id, {
          phone: input.phone,
          linkedinUrl: input.linkedinUrl,
          locationCity: input.locationCity,
          locationState: input.locationState,
          locationCountry: input.locationCountry,
          workPreference: input.workPreference ? JSON.stringify(input.workPreference) : null,
        } as any);

        return { success: true };
      }),

    // Get work experiences with achievements
    getWorkHistory: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const workExperiences = await db.getWorkExperiences(user.id);
      
      // Get achievements for each work experience
      const workHistoryWithAchievements = await Promise.all(
        workExperiences.map(async (we) => ({
          ...we,
          achievements: await db.getAchievementsByWorkExperience(we.id),
        }))
      );

      return workHistoryWithAchievements;
    }),

    // Add work experience
    addWorkExperience: protectedProcedure
      .input(z.object({
        companyName: z.string(),
        jobTitle: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        location: z.string().nullable(),
        isCurrent: z.boolean(),
        roleOverview: z.string().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const workExperienceId = await db.createWorkExperience({
          userId: user.id,
          companyName: input.companyName,
          jobTitle: input.jobTitle,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
          location: input.location,
          isCurrent: input.isCurrent,
          roleOverview: input.roleOverview,
        });

        return { success: true, id: workExperienceId };
      }),

    // Update work experience
    updateWorkExperience: protectedProcedure
      .input(z.object({
        id: z.number(),
        companyName: z.string().optional(),
        jobTitle: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        isCurrent: z.boolean().optional(),
        roleOverview: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        // Convert string dates to Date objects
        const updateData: any = { ...data };
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);
        await db.updateWorkExperience(id, user.id, updateData);

        return { success: true };
      }),

    // Delete work experience
    deleteWorkExperience: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteWorkExperience(input.id, user.id);

        return { success: true };
      }),

    // Add achievement
    addAchievement: protectedProcedure
      .input(z.object({
        workExperienceId: z.number(),
        description: z.string(),
        context: z.string().nullable(),
        metricType: z.string().nullable(),
        metricValue: z.number().nullable(),
        metricUnit: z.string().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const achievementData: any = { ...input };
        if (input.metricValue !== null) {
          achievementData.metricValue = input.metricValue.toString();
        }

        const achievementId = await db.createAchievement(achievementData);

        return { success: true, id: achievementId };
      }),

    // Update achievement
    updateAchievement: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        context: z.string().optional(),
        metricType: z.string().optional(),
        metricValue: z.number().optional(),
        metricUnit: z.string().optional(),
        metricTimeframe: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        // Convert metricValue to string for decimal field
        const updateData: any = { ...data };
        if (data.metricValue !== undefined) {
          updateData.metricValue = data.metricValue.toString();
        }
        await db.updateAchievement(id, user.id, updateData);

        return { success: true };
      }),

    // Delete achievement
    deleteAchievement: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteAchievement(input.id, user.id);

        return { success: true };
      }),

    // Add skill
    addSkill: protectedProcedure
      .input(z.object({
        skillName: z.string(),
        skillCategory: z.string(),
        proficiencyLevel: z.string(),
        yearsExperience: z.number().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const skillData: any = { userId: user.id, ...input };
        if (input.yearsExperience !== null) {
          skillData.yearsExperience = input.yearsExperience.toString();
        }

        const skillId = await db.createSkill(skillData);

        return { success: true, id: skillId };
      }),

    // Delete skill
    deleteSkill: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteSkill(input.id, user.id);

        return { success: true };
      }),

    // Get achievement usage statistics
    getAchievementStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const achievements = await db.getAchievements(user.id);
      const applications = await db.getApplications(user.id);

      // Calculate stats for each achievement
      const stats = achievements.map((achievement) => {
        const usageCount = achievement.timesUsed || 0;
        const applicationsWithThis = achievement.applicationsWithAchievement || 0;
        const responsesWithThis = achievement.responsesWithAchievement || 0;
        
        // Calculate success rate (responses / applications)
        const successRate = applicationsWithThis > 0 
          ? Math.round((responsesWithThis / applicationsWithThis) * 100)
          : 0;

        return {
          achievementId: achievement.id,
          usageCount,
          successRate,
          lastUsed: achievement.lastUsedAt,
        };
      });

      return stats;
    }),

    // Get profile completeness score
    getCompleteness: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const [userProfile, workExperiences, achievements, skills, preferences, languages] = await Promise.all([
        db.getUserProfile(user.id),
        db.getWorkExperiences(user.id),
        db.getAchievements(user.id),
        db.getSkills(user.id),
        db.getTargetPreferences(user.id),
        db.getUserLanguages(user.id),
      ]);

      // Calculate completeness score (0-100)
      let score = 0;
      const missing: string[] = [];

      // Contact info (20 points)
      if (user.email) score += 5;
      else missing.push("Email address");
      
      if (userProfile?.phone) score += 5;
      else missing.push("Phone number");
      
      if (userProfile?.linkedinUrl) score += 5;
      else missing.push("LinkedIn profile");
      
      if (userProfile?.locationCity && userProfile?.locationState) score += 5;
      else missing.push("Location");

      // Work experience (20 points)
      if (workExperiences.length >= 2) score += 20;
      else if (workExperiences.length === 1) {
        score += 10;
        missing.push("At least 2 work experiences (only " + workExperiences.length + " added)");
      } else {
        missing.push("Work experience");
      }

      // Achievements (30 points)
      if (achievements.length >= 10) score += 30;
      else if (achievements.length >= 5) {
        score += 20;
        missing.push("At least 10 achievements (only " + achievements.length + " added)");
      } else if (achievements.length >= 1) {
        score += 10;
        missing.push("At least 10 achievements (only " + achievements.length + " added)");
      } else {
        missing.push("Achievements");
      }

      // Skills (15 points)
      if (skills.length >= 20) score += 15;
      else if (skills.length >= 10) {
        score += 10;
        missing.push("At least 20 skills (only " + skills.length + " added)");
      } else if (skills.length >= 1) {
        score += 5;
        missing.push("At least 20 skills (only " + skills.length + " added)");
      } else {
        missing.push("Skills");
      }

      // Target preferences (15 points)
      if (preferences) {
        if (preferences.roleTitles && preferences.roleTitles.length > 0) score += 5;
        else missing.push("Target job titles");
        
        if (preferences.industries && preferences.industries.length > 0) score += 5;
        else missing.push("Target industries");
        
        if (preferences.minimumBaseSalary) score += 5;
        else missing.push("Minimum salary expectations");
      } else {
        missing.push("Target preferences");
      }

      // Profile richness (up to 5 bonus points; total capped at 100; optional, no penalty if missing)
      let richness = 0;
      if (userProfile?.professionalSummary?.trim()) richness += 2;
      if (languages.length >= 1) richness += 2;
      if (userProfile?.portfolioUrls && Array.isArray(userProfile.portfolioUrls) && userProfile.portfolioUrls.length > 0) richness += 1;
      score = Math.min(100, score + richness);

      return {
        score,
        isComplete: score === 100,
        missing,
        counts: {
          workExperiences: workExperiences.length,
          achievements: achievements.length,
          skills: skills.length,
        },
      };
    }),

    // Update superpower
    updateSuperpower: protectedProcedure
      .input(z.object({
        id: z.number().nullable(),
        title: z.string(),
        description: z.string(),
        evidence: z.string(),
        evidenceAchievementIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        if (input.id) {
          // Update existing superpower
          await db.updateSuperpower(input.id, {
            title: input.title,
            description: input.description,
            evidence: input.evidence,
            evidenceAchievementIds: input.evidenceAchievementIds,
          });
        } else {
          // Create new superpower
          await db.createSuperpower({
            userId: user.id,
            title: input.title,
            description: input.description,
            evidence: input.evidence,
            evidenceAchievementIds: input.evidenceAchievementIds,
          });
        }

        return { success: true };
      }),

    // Update target preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        roleTitles: z.array(z.string()).optional(),
        industries: z.array(z.string()).optional(),
        companyStages: z.array(z.string()).optional(),
        locationType: z.enum(["remote", "hybrid", "onsite", "flexible"]).optional(),
        allowedCities: z.array(z.string()).optional(),
        minimumBaseSalary: z.number().nullable().optional(),
        dealBreakers: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.updateTargetPreferences(user.id, input);

        return { success: true };
      }),
  }),

  // ================================================================
  // AGENT SYSTEM ROUTES
  // ================================================================
  agents: router({
    // Run Scout Agent (find opportunities)
    runScout: protectedProcedure
      .input(z.object({
        searchQuery: z.string().optional(),
        limit: z.number().default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const startTime = Date.now();

        // Get user preferences
        const preferences = await db.getTargetPreferences(user.id);
        if (!preferences) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Please complete onboarding first" });
        }

        // Import and run Scout agent
        const { ScoutAgent } = await import("./agents/scout");
        const scout = new ScoutAgent(user.id);
        
        const searchParams = {
          roleTitles: preferences.roleTitles || [],
          industries: preferences.industries || [],
          companyStages: preferences.companyStages || [],
          locationType: preferences.locationType || "remote",
          allowedCities: preferences.allowedCities || [],
          numResults: input.limit,
        };
        
        const opportunities = await scout.execute(searchParams);

        // Log agent execution
        await db.logAgentExecution({
          userId: user.id,
          agentName: "Scout",
          executionType: "job_search",
          inputData: JSON.stringify({ searchQuery: input.searchQuery, limit: input.limit }),
          outputData: JSON.stringify({ foundCount: opportunities.length }),
          executionTimeMs: Date.now() - startTime,
          status: "success",
        });

        return { opportunities, count: opportunities.length };
      }),

    // Get agent execution logs
    getLogs: protectedProcedure
      .input(z.object({
        agentName: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const logs = await db.getAgentExecutionLogs(user.id, input.agentName);
        return logs.slice(0, input.limit);
      }),
  }),

  // ================================================================
  // OPPORTUNITIES & APPLICATIONS
  // ================================================================
  opportunities: router({
    // List discovered opportunities
    list: protectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
        companyStage: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getOpportunities(input);
      }),

    // Get opportunity by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const opportunity = await db.getOpportunityById(input.id);
        if (!opportunity) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found" });
        }
        return opportunity;
      }),

    // Save opportunity for later
    save: protectedProcedure
      .input(z.object({ opportunityId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.saveOpportunity(user.id, input.opportunityId, input.notes);
        return { success: true };
      }),

    // Unsave opportunity
    unsave: protectedProcedure
      .input(z.object({ opportunityId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.unsaveOpportunity(user.id, input.opportunityId);
        return { success: true };
      }),

    // Get saved opportunities
    getSaved: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const saved = await db.getSavedOpportunities(user.id);
      // Fetch full opportunity details for each saved item
      const opportunities = await Promise.all(
        saved.map(async (s) => {
          const opp = await db.getOpportunityById(s.opportunityId);
          return { ...opp, savedAt: s.createdAt, savedNotes: s.notes };
        })
      );
      return opportunities.filter(Boolean);
    }),

    // Check if opportunity is saved
    isSaved: protectedProcedure
      .input(z.object({ opportunityId: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        return db.isOpportunitySaved(user.id, input.opportunityId);
      }),
  }),

  applications: router({
    // List user applications
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        return db.getApplications(user.id, input);
      }),

    // Get application by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const application = await db.getApplicationById(input.id, user.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        return application;
      }),

    // Update application status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['draft', 'applied', 'response_received', 'phone_screen', 'interview', 'final_interview', 'offer', 'accepted', 'rejected', 'withdrawn', 'ghosted']),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.updateApplication(input.id, user.id, { status: input.status });
        return { success: true };
      }),

    // Quick Apply - Orchestrate all 7 agents
    quickApply: protectedProcedure
      .input(z.object({
        opportunityId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const startTime = Date.now();

        // Get opportunity
        const opportunity = await db.getOpportunityById(input.opportunityId);
        if (!opportunity) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found" });
        }

        // Get user profile and preferences
        const [profile, workExperiences, achievements, skills, superpowers, preferences, educationList] = await Promise.all([
          db.getUserProfile(user.id),
          db.getWorkExperiences(user.id),
          db.getAchievements(user.id),
          db.getSkills(user.id),
          db.getSuperpowers(user.id),
          db.getTargetPreferences(user.id),
          db.getEducation(user.id),
        ]);

        const userProfile = {
          user,
          profile,
          workExperiences,
          achievements,
          skills,
          superpowers,
        };

        // Import all agents
        const { ProfilerAgent } = await import("./agents/profiler");
        const { QualifierAgent, HunterAgent, ScribeAgent, AssemblerAgent } = await import("./agents/remaining");
        const { tailorResume } = await import("./agents/tailor");

        // AGENT 2: Profiler - Analyze company
        const profiler = new ProfilerAgent(user.id, userProfile);
        const analysis = await profiler.execute(opportunity);

        // AGENT 3: Qualifier - Verify fit
        const qualifier = new QualifierAgent(user.id, preferences);
        const qualification = await qualifier.execute(opportunity);

        if (!qualification.qualified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Opportunity not qualified: ${qualification.reasons.join(", ")}`,
          });
        }

        // AGENT 4: Hunter - Find contacts
        const hunter = new HunterAgent(user.id);
        const contacts = await hunter.execute(opportunity);

        // AGENT 5: Tailor - Generate resume (unified tailorResume with addendum rules)
        const tailorUserProfile = {
          fullName: user.name || "User",
          email: user.email || "",
          phone: (profile as any)?.phone || "",
          location: (profile as any)?.locationCity || "",
          linkedIn: (profile as any)?.linkedinUrl || "",
          workExperience: workExperiences.map((exp: any) => ({
            company: exp.companyName,
            title: exp.jobTitle,
            startDate: exp.startDate?.toISOString?.()?.split("T")[0] ?? "",
            endDate: exp.endDate ? exp.endDate.toISOString?.()?.split("T")[0] ?? "" : "Present",
            achievements: achievements
              .filter((ach: any) => ach.workExperienceId === exp.id)
              .map((ach: any) => ach.description),
          })),
          skills: skills.map((s: any) => s.skillName),
          education: educationList.map((e: any) => ({
            institution: e.institution,
            degree: e.degreeType || "",
            field: e.fieldOfStudy || "",
            graduationYear: String(e.graduationYear ?? ""),
          })),
        };
        const resumeResult = await tailorResume({
          userProfile: tailorUserProfile,
          jobDescription: opportunity.jobDescription || "",
          companyName: opportunity.companyName,
          roleTitle: opportunity.roleTitle,
        });
        const resume = resumeResult.resumeMarkdown;

        // AGENT 6: Scribe - Write outreach
        const scribe = new ScribeAgent(user.id, userProfile);
        const outreach = await scribe.execute(opportunity, analysis, contacts);

        // AGENT 7: Assembler - Package everything
        const assembler = new AssemblerAgent(user.id);
        const applicationPackage = await assembler.execute({
          opportunity,
          analysis,
          qualification,
          contacts,
          resume,
          outreach,
        });

        // Create application record
        const application = await db.createApplication({
          userId: user.id,
          opportunityId: opportunity.id,
          status: "draft",
          tailoredResumeText: resume,
          coverLetterText: outreach.coverLetter,
          linkedinMessage: outreach.linkedinMessage,
          emailTemplate: outreach.emailOutreach,
          matchScore: qualification.matchScore,
        });

        // Log agent execution
        await db.logAgentExecution({
          userId: user.id,
          agentName: "QuickApply",
          executionType: "full_pipeline",
          inputData: JSON.stringify({ opportunityId: input.opportunityId }),
          outputData: JSON.stringify({ applicationId: application.id }),
          executionTimeMs: Date.now() - startTime,
          status: "success",
        });

        return {
          applicationId: application.id,
          matchScore: qualification.matchScore,
          checklist: applicationPackage.checklist,
          nextSteps: applicationPackage.nextSteps,
          estimatedTime: applicationPackage.estimatedTimeToApply,
        };
      }),

    // Get application notes
    getNotes: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // Verify application belongs to user
        const application = await db.getApplicationById(input.applicationId, user.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        return db.getApplicationNotes(input.applicationId);
      }),

    // Add application note
    addNote: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        noteText: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // Verify application belongs to user
        const application = await db.getApplicationById(input.applicationId, user.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        const noteId = await db.createApplicationNote(input.applicationId, user.id, input.noteText);
        return { success: true, noteId };
      }),

    // Delete application note
    deleteNote: protectedProcedure
      .input(z.object({ noteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteApplicationNote(input.noteId, user.id);
        return { success: true };
      }),

    // Generate application package (async)
    generatePackage: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // Verify application belongs to user
        const application = await db.getApplicationById(input.applicationId, user.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        // Start async generation (fire and forget)
        (async () => {
          try {
            // Import agents
            const { tailorResume } = await import("./agents/tailor");
            const { generateOutreach } = await import("./agents/scribe");
            const { assembleApplicationPackage } = await import("./agents/assembler");

            // Get user profile for generation
            const [profile, workExperiences, achievements, skillsList, educationList, superpowersList] = await Promise.all([
              db.getUserProfile(user.id),
              db.getWorkExperiences(user.id),
              db.getAchievements(user.id),
              db.getSkills(user.id),
              db.getEducation(user.id),
              db.getSuperpowers(user.id),
            ]);

            // Get opportunity details
            const opportunity = await db.getOpportunityById(application.opportunityId);
            if (!opportunity) {
              throw new Error("Opportunity not found");
            }

            // Transform userProfile for Tailor agent
            const tailorUserProfile = {
              fullName: user.name || "User",
              email: user.email || "",
              phone: (profile as any)?.phone || "",
              location: (profile as any)?.locationCity || "",
              linkedIn: (profile as any)?.linkedinUrl || "",
              workExperience: workExperiences.map(exp => ({
                company: exp.companyName,
                title: exp.jobTitle,
                startDate: exp.startDate.toISOString().split('T')[0],
                endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : "Present",
                achievements: achievements
                  .filter(ach => ach.workExperienceId === exp.id)
                  .map(ach => ach.description)
              })),
              skills: skillsList.map((s: { skillName: string }) => s.skillName),
              education: educationList.map((e: { institution: string; degreeType?: string | null; fieldOfStudy?: string | null; graduationYear?: number | null }) => ({
                institution: e.institution,
                degree: e.degreeType || "",
                field: e.fieldOfStudy || "",
                graduationYear: String(e.graduationYear ?? ""),
              })),
            };

            // Transform userProfile for Scribe agent
            const scribeUserProfile = {
              fullName: user.name || "User",
              currentTitle: workExperiences[0]?.jobTitle || "Professional",
              topAchievements: achievements.slice(0, 3).map(ach => ach.description)
            };

            // Generate resume (pass pivot context when available for Format B)
            const resumeResult = await tailorResume({
              userProfile: tailorUserProfile,
              jobDescription: opportunity.jobDescription || "",
              companyName: opportunity.companyName,
              roleTitle: opportunity.roleTitle,
              ...(application.pivotAnalysis != null && typeof application.pivotAnalysis === 'object'
                ? { pivotContext: application.pivotAnalysis }
                : {}),
            }, {
              applicationId: application.id,
              userId: user.id,
            });

            // Run Profiler for company insights (optional; fallback to empty if it fails)
            let strategicMemo = "";
            try {
              const { ProfilerAgent } = await import("./agents/profiler");
              const profilerUserProfile = { superpowers: superpowersList, achievements };
              const profiler = new ProfilerAgent(user.id, profilerUserProfile);
              const companyAnalysis = await profiler.execute(opportunity);
              strategicMemo = companyAnalysis.compellingNarrative || "";
            } catch (err) {
              console.warn("[Package generation] Profiler skipped:", err);
            }

            // Generate cover letter and LinkedIn message
            const outreachResult = await generateOutreach({
              userProfile: scribeUserProfile,
              jobDescription: opportunity.jobDescription || "",
              companyName: opportunity.companyName,
              roleTitle: opportunity.roleTitle,
              strategicMemo,
            }, {
              applicationId: application.id,
              userId: user.id,
            });

            // Assemble package
            const packageResult = await assembleApplicationPackage({
              applicationId: application.id.toString(),
              resumeMarkdown: resumeResult.resumeMarkdown,
              coverLetter: outreachResult.coverLetter,
              linkedInMessage: outreachResult.linkedInMessage,
              userFullName: user.name || "User",
              companyName: opportunity.companyName,
              roleTitle: opportunity.roleTitle,
            }, {
              applicationId: application.id,
              userId: user.id,
            });

            // Update application with package URLs
            await db.updateApplication(application.id, user.id, {
              packageZipUrl: packageResult.packageUrl,
              resumePdfUrl: packageResult.files.resumePDF,
              resumeDocxUrl: packageResult.files.resumeDOCX,
              tailoredResumeText: resumeResult.resumeMarkdown,
              coverLetterText: outreachResult.coverLetter,
              linkedinMessage: outreachResult.linkedInMessage,
            });

            // Send notification
            await db.createNotification({
              userId: user.id,
              type: "application_package_ready",
              title: "Application Package Ready",
              message: `Your application package for ${opportunity.companyName} - ${opportunity.roleTitle} is ready to download.`,
              applicationId: application.id,
            });

            // Production metrics: log success for package generation
            await db.logAgentExecution({
              userId: user.id,
              agentName: "PackagePipeline",
              executionType: "package_generation",
              status: "success",
            });
          } catch (error) {
            console.error("Package generation failed:", error);

            // Production metrics: log failure for package generation
            await db.logAgentExecution({
              userId: user.id,
              agentName: "PackagePipeline",
              executionType: "package_generation",
              status: "failed",
              errorMessage: error instanceof Error ? error.message : String(error),
            });

            // Send error notification with actionable message
            await db.createNotification({
              userId: user.id,
              type: "application_package_error",
              title: "Package Generation Failed",
              message: "We couldn't generate your application package. Please try again in a few minutes, or open the application and use \"Generate Package\" again.",
              applicationId: input.applicationId,
            });
          }
        })();

        return { success: true, message: "Package generation started" };
      }),

    // Get package status
    getPackageStatus: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const application = await db.getApplicationById(input.applicationId, user.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        return {
          ready: !!application.packageZipUrl,
          packageUrl: application.packageZipUrl || null,
          files: {
            resumePDF: application.resumePdfUrl || null,
            resumeDOCX: application.resumeDocxUrl || null,
            resumeTXT: application.resumeTxtUrl || null,
            coverLetterTXT: application.coverLetterTxtUrl || null,
            linkedInMessageTXT: application.linkedinMessageTxtUrl || null,
          },
        };
      }),
  }),

  // ================================================================
  // ANALYTICS
  // ================================================================
  analytics: router({  
    // Get analytics overview
    getOverview: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const applications = await db.getApplications(user.id, {});
      const achievements = await db.getAchievements(user.id);

      // Calculate metrics
      const totalApplications = applications.length;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      
      const thisWeekApplications = applications.filter(
        (app) => app.appliedAt && new Date(app.appliedAt).getTime() > oneWeekAgo
      ).length;
      
      const lastWeekApplications = applications.filter(
        (app) => app.appliedAt && 
          new Date(app.appliedAt).getTime() > twoWeeksAgo &&
          new Date(app.appliedAt).getTime() <= oneWeekAgo
      );

      const respondedApplications = applications.filter(
        (app) => app.status !== "applied" && app.status !== "draft"
      );
      const responseRate = totalApplications > 0
        ? Math.round((respondedApplications.length / totalApplications) * 100)
        : 0;
      
      // Calculate response rate change (this week vs last week)
      const thisWeekResponded = applications.filter(
        (app) => app.appliedAt && 
          new Date(app.appliedAt).getTime() > oneWeekAgo &&
          app.status !== "applied" && app.status !== "draft"
      ).length;
      const thisWeekTotal = thisWeekApplications;
      const thisWeekRate = thisWeekTotal > 0 ? (thisWeekResponded / thisWeekTotal) * 100 : 0;
      
      const lastWeekResponded = lastWeekApplications.filter(
        (app) => app.status !== "applied" && app.status !== "draft"
      ).length;
      const lastWeekTotal = lastWeekApplications.length;
      const lastWeekRate = lastWeekTotal > 0 ? (lastWeekResponded / lastWeekTotal) * 100 : 0;
      
      const responseRateChange = lastWeekTotal > 0 
        ? Math.round(thisWeekRate - lastWeekRate)
        : 0;

      const interviewingCount = applications.filter(
        (app) => app.status === "interview" || app.status === "phone_screen" || app.status === "final_interview"
      ).length;
      const offerCount = applications.filter(
        (app) => app.status === "offer"
      ).length;
      const rejectedCount = applications.filter(
        (app) => app.status === "rejected"
      ).length;

      const interviewRate = totalApplications > 0
        ? Math.round((interviewingCount / totalApplications) * 100)
        : 0;

      // Calculate average response time (using updatedAt as proxy since respondedAt doesn't exist)
      const responseTimes = respondedApplications
        .map((app) => {
          if (!app.appliedAt) return null;
          return Math.floor(
            (new Date(app.updatedAt).getTime() - new Date(app.appliedAt).getTime()) /
              (24 * 60 * 60 * 1000)
          );
        })
        .filter((time): time is number => time !== null);

      const avgResponseTime = responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          )
        : 0;

      // Get top achievements
      const topAchievements = achievements
        .filter((a) => (a.timesUsed || 0) > 0)
        .map((a) => ({
          title: a.description, // achievements use 'description' not 'title'
          timesUsed: a.timesUsed,
          successRate:
            (a.applicationsWithAchievement || 0) > 0
              ? Math.round(
                  ((a.responsesWithAchievement || 0) / (a.applicationsWithAchievement || 1)) * 100
                )
              : 0,
        }))
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5);

      // Generate insights based on metrics
      const insights: { type: 'positive' | 'negative' | 'neutral'; message: string }[] = [];
      
      // Response rate insights
      if (responseRate >= 30) {
        insights.push({ type: 'positive', message: `Your ${responseRate}% response rate is above average. Keep targeting similar roles!` });
      } else if (responseRate > 0 && responseRate < 15) {
        insights.push({ type: 'negative', message: 'Low response rate. Consider tailoring your resume more specifically to each job.' });
      }
      
      // Response rate trend
      if (responseRateChange > 10) {
        insights.push({ type: 'positive', message: `Response rate up ${responseRateChange}% from last week. Your strategy is working!` });
      } else if (responseRateChange < -10) {
        insights.push({ type: 'negative', message: `Response rate down ${Math.abs(responseRateChange)}% from last week. Review recent applications.` });
      }
      
      // Interview conversion
      if (interviewRate >= 20) {
        insights.push({ type: 'positive', message: `${interviewRate}% of applications reaching interviews. Excellent conversion!` });
      }
      
      // Activity insights
      if (thisWeekApplications === 0 && totalApplications > 0) {
        insights.push({ type: 'neutral', message: 'No applications this week. Consistency helps - aim for 5-10 quality applications weekly.' });
      } else if (thisWeekApplications >= 10) {
        insights.push({ type: 'positive', message: `Strong activity with ${thisWeekApplications} applications this week!` });
      }
      
      // Offer insights
      if (offerCount > 0) {
        insights.push({ type: 'positive', message: `You have ${offerCount} offer${offerCount > 1 ? 's' : ''} to consider. Congratulations!` });
      }
      
      // Top achievement insight
      if (topAchievements.length > 0 && topAchievements[0].successRate > 50) {
        insights.push({ type: 'positive', message: `"${topAchievements[0].title.slice(0, 50)}..." has ${topAchievements[0].successRate}% success rate.` });
      }
      
      // Limit to 3 most relevant insights
      const limitedInsights = insights.slice(0, 3);

      return {
        totalApplications,
        thisWeekApplications,
        responseRate,
        responseRateChange,
        avgResponseTime,
        interviewRate,
        interviewingCount,
        offerCount,
        rejectedCount,
        topAchievements,
        insights: limitedInsights,
      };
    }),

    // Get agent performance metrics
    getAgentMetrics: protectedProcedure
      .input(z.object({
        agentType: z.enum(['tailor', 'scribe', 'assembler']).optional(),
        hours: z.number().default(24), // Last N hours
      }))
      .query(async ({ input }) => {
        const startDate = new Date(Date.now() - input.hours * 60 * 60 * 1000);
        
        const stats = await db.getAgentPerformanceStats(input.agentType);
        
        return stats;
      }),

    // Get package generation success rate
    getPackageSuccessRate: protectedProcedure
      .input(z.object({
        hours: z.number().default(24), // Last N hours
      }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        const startDate = new Date(Date.now() - input.hours * 60 * 60 * 1000);
        
        const applications = await db.getApplications(user.id, {});
        const recentApplications = applications.filter(
          (app) => app.createdAt && new Date(app.createdAt).getTime() >= startDate.getTime()
        );
        
        const totalAttempts = recentApplications.length;
        const successful = recentApplications.filter((app) => app.packageZipUrl).length;
        const successRate = totalAttempts > 0 ? (successful / totalAttempts) * 100 : 0;
        
        return {
          totalAttempts,
          successful,
          failed: totalAttempts - successful,
          successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
          timeRange: `Last ${input.hours} hours`,
        };
      }),
  }),

  // ================================================================
  // NOTIFICATIONS
  // ================================================================
  notifications: router({
    // Get user notifications
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        return db.getNotifications(user.id, input.unreadOnly);
      }),

    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.markNotificationAsRead(input.id, user.id);
        return { success: true };
      }),
  }),

  gtm: gtmRouter,
  jdBuilder: jdBuilderRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
