import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import Stripe from "stripe";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}
const stripe = getStripe();

export const stripeRouter = router({
  /**
   * Create a checkout session for Pro subscription
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!stripe)
        throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const priceId =
        input.priceId?.trim() || process.env.STRIPE_PRO_PRICE_ID?.trim() || "";
      if (!priceId || priceId === "price_pro_monthly") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Pro checkout is not configured. Set STRIPE_PRO_PRICE_ID in Railway to your Stripe Price ID (e.g. price_xxx).",
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?subscription=success`,
        cancel_url: `${origin}/pricing?subscription=cancelled`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            user_id: ctx.user.id.toString(),
          },
        },
      });

      if (!session.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Stripe checkout URL not returned—verify price ID and Stripe config",
        });
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Get current subscription status
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) throw new Error("User not found");

    let stripeSubscription = null;
    if (stripe && user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );
      } catch (error) {
        console.error("[Stripe] Failed to retrieve subscription:", error);
      }
    }

    return {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionEndDate: user.subscriptionEndDate,
      stripeSubscription,
    };
  }),

  /**
   * Create a billing portal session for managing subscription
   */
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe)
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user || !user.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    const origin = ctx.req.headers.origin || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return {
      portalUrl: session.url,
    };
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    if (!stripe)
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user || !user.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    // Cancel at period end (don't immediately revoke access)
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    return {
      success: true,
      subscription,
    };
  }),
});
