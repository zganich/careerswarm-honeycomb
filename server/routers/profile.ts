import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";

// ================================================================
// MASTER PROFILE - ADDITIONAL SECTIONS CRUD
// ================================================================

export const profileRouter = router({
  // ================================================================
  // LANGUAGES
  // ================================================================
  languages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await db.getUserLanguages(user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          language: z.string().min(1),
          proficiency: z.string().optional(),
          isNative: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.insertLanguage({
          userId: user.id,
          ...input,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          language: z.string().min(1).optional(),
          proficiency: z.string().optional(),
          isNative: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        await db.updateLanguage(id, user.id, data);

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteLanguage(input.id, user.id);

        return { success: true };
      }),
  }),

  // ================================================================
  // VOLUNTEER EXPERIENCES
  // ================================================================
  volunteerExperiences: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await db.getUserVolunteerExperiences(user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          organization: z.string().min(1),
          role: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.insertVolunteerExperience({
          userId: user.id,
          ...input,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          organization: z.string().min(1).optional(),
          role: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        await db.updateVolunteerExperience(id, user.id, data);

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteVolunteerExperience(input.id, user.id);

        return { success: true };
      }),
  }),

  // ================================================================
  // PROJECTS
  // ================================================================
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await db.getUserProjects(user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          url: z.string().optional(),
          role: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.insertProject({
          userId: user.id,
          ...input,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          url: z.string().optional(),
          role: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        await db.updateProject(id, user.id, data);

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteProject(input.id, user.id);

        return { success: true };
      }),
  }),

  // ================================================================
  // PUBLICATIONS
  // ================================================================
  publications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await db.getUserPublications(user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          publisherOrVenue: z.string().optional(),
          year: z.number().optional(),
          url: z.string().optional(),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.insertPublication({
          userId: user.id,
          ...input,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          publisherOrVenue: z.string().optional(),
          year: z.number().optional(),
          url: z.string().optional(),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        await db.updatePublication(id, user.id, data);

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deletePublication(input.id, user.id);

        return { success: true };
      }),
  }),

  // ================================================================
  // SECURITY CLEARANCES
  // ================================================================
  securityClearances: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await db.getUserSecurityClearances(user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          clearanceType: z.string().min(1),
          level: z.string().optional(),
          expiryDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.insertSecurityClearance({
          userId: user.id,
          ...input,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          clearanceType: z.string().min(1).optional(),
          level: z.string().optional(),
          expiryDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { id, ...data } = input;
        await db.updateSecurityClearance(id, user.id, data);

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        await db.deleteSecurityClearance(input.id, user.id);

        return { success: true };
      }),
  }),
});
