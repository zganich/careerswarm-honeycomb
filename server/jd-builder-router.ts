/**
 * JD Builder router: generate, list, get, export job descriptions (B2B).
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { executeJDBuilder } from "./agents/gtm/jd-builder";

const JD_FREE_PER_MONTH = 1; // Free tier: 1 JD per month

function getCurrentMonthPeriod(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return {
    periodStart: `${y}-${m}-01`,
    periodEnd: `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}`,
  };
}

export const jdBuilderRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        roleTitle: z.string().min(1),
        companyName: z.string().min(1),
        department: z.string().optional(),
        mustHaves: z.array(z.string()).optional(),
        niceToHaves: z.array(z.string()).optional(),
        level: z.string().optional(),
        location: z.string().optional(),
        compensationRange: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const { periodStart, periodEnd } = getCurrentMonthPeriod();
      const used = await db.getJdUsageForPeriod(user.id, periodStart, periodEnd);
      const limit = user.subscriptionTier === "pro" ? 999 : JD_FREE_PER_MONTH;
      if (used >= limit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `JD limit reached (${limit} per month). Upgrade to Pro for unlimited JDs.`,
        });
      }

      const output = await executeJDBuilder({
        roleTitle: input.roleTitle,
        companyName: input.companyName,
        department: input.department,
        mustHaves: input.mustHaves,
        niceToHaves: input.niceToHaves,
        level: input.level,
        location: input.location,
        compensationRange: input.compensationRange,
      });

      const draftId = await db.createJdDraft({
        userId: user.id,
        companyId: null,
        roleTitle: input.roleTitle,
        companyName: input.companyName,
        department: input.department ?? null,
        inputJson: input as any,
        outputSummary: output.summary,
        outputResponsibilities: output.responsibilities,
        outputRequirements: output.requirements,
        outputBenefits: output.benefits,
        fullText: output.fullText,
      });

      await db.incrementJdUsage(user.id, null, periodStart, periodEnd);

      return { draftId, ...output };
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return db.getJdDraftsByUserId(user.id, input?.limit ?? 50);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      const draft = await db.getJdDraftById(input.id, user.id);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "JD draft not found" });
      return draft;
    }),

  export: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      const draft = await db.getJdDraftById(input.id, user.id);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "JD draft not found" });
      return { fullText: draft.fullText ?? "" };
    }),
});
