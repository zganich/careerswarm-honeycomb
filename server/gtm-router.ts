/**
 * GTM router: enqueue GTM pipeline jobs and list B2B leads.
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { addJob, QueueName, type GtmPipelineData } from "./queue";

const channelSchema = z
  .enum([
    "linkedin",
    "reddit",
    "twitter",
    "company_site",
    "job_board",
    "newsletter",
    "event",
  ])
  .optional();

export const gtmRouter = router({
  runStrategy: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.getUserByOpenId(ctx.user.openId);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
      step: "strategy",
      payload: {},
    });
    return { jobId: job?.id ?? null, message: "Strategy job enqueued" };
  }),

  runLeadDiscovery: protectedProcedure
    .input(
      z.object({
        channel: channelSchema.default("reddit"),
        vertical: z.string().optional(),
        rawText: z.string().optional(),
        query: z.string().optional(),
        sourceUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
        step: "lead_discovery",
        channel: input.channel,
        vertical: input.vertical,
        payload: {
          rawText: input.rawText,
          query: input.query,
          sourceUrl: input.sourceUrl,
        },
      });
      return { jobId: job?.id ?? null, message: "Lead discovery job enqueued" };
    }),

  runScoring: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.getUserByOpenId(ctx.user.openId);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
      step: "scoring",
      payload: {},
    });
    return { jobId: job?.id ?? null, message: "Scoring job enqueued" };
  }),

  runContent: protectedProcedure
    .input(z.object({ channel: channelSchema }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
        step: "content",
        channel: input.channel ?? "linkedin",
        payload: {},
      });
      return { jobId: job?.id ?? null, message: "Content job enqueued" };
    }),

  runReport: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.getUserByOpenId(ctx.user.openId);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
      step: "report",
      payload: {},
    });
    return { jobId: job?.id ?? null, message: "Report job enqueued" };
  }),

  runOutreachDraft: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.getUserByOpenId(ctx.user.openId);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
      step: "outreach_draft",
      payload: {},
    });
    return { jobId: job?.id ?? null, message: "Outreach draft job enqueued" };
  }),

  runOutreachSend: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.getUserByOpenId(ctx.user.openId);
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    const job = await addJob<GtmPipelineData>(QueueName.GTM_PIPELINE, {
      step: "outreach_send",
      payload: {},
    });
    return { jobId: job?.id ?? null, message: "Outreach send job enqueued" };
  }),

  listLeads: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(500).default(100),
        outreachStatus: z
          .enum(["none", "drafted", "sent", "replied", "converted"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return db.getB2BLeads(input.limit, input.outreachStatus);
    }),
});
