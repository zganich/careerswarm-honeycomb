import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import Stripe from "stripe";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

export const stripeRouter = router({
  /**
   * Create a checkout session for Pro subscription
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      priceId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const origin = ctx.req.headers.origin || "http://localhost:3000";
      
      // Use default Pro price if not provided
      const priceId = input.priceId || process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly";

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
    if (user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
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
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      success: true,
      subscription,
    };
  }),
});
