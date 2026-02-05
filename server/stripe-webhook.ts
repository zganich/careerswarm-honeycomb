import type { Request, Response } from "express";
import Stripe from "stripe";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2025-12-15.clover" }) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) return res.status(503).send("Stripe not configured");
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] No signature found");
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Webhook] Signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  const database = await db.getDb();
  if (!database) {
    console.error("[Webhook] Database not available");
    return res.status(500).send("Database unavailable");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.client_reference_id || "0");

        if (!userId) {
          console.error("[Webhook] No user ID in session");
          break;
        }

        // Get subscription ID from session
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        // Update user with Stripe IDs and upgrade to Pro
        await database
          .update(users)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionTier: "pro",
            subscriptionStatus: "active",
          })
          .where(eq(users.id, userId));

        console.log(`[Webhook] User ${userId} upgraded to Pro`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (!user) {
          console.error("[Webhook] User not found for customer:", customerId);
          break;
        }

        // Update subscription status
        const status = subscription.status;
        const endDate = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : null;

        await database
          .update(users)
          .set({
            subscriptionStatus: status,
            subscriptionEndDate: endDate,
            subscriptionTier: status === "active" || status === "trialing" ? "pro" : "free",
          })
          .where(eq(users.id, user.id));

        console.log(`[Webhook] Subscription updated for user ${user.id}: ${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user and downgrade to free
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (!user) {
          console.error("[Webhook] User not found for customer:", customerId);
          break;
        }

        await database
          .update(users)
          .set({
            subscriptionTier: "free",
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          })
          .where(eq(users.id, user.id));

        console.log(`[Webhook] User ${user.id} downgraded to Free`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Payment succeeded for invoice: ${invoice.id}`);
        // Payment successful - subscription will be updated via subscription.updated event
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user and mark subscription as past_due
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (user) {
          await database
            .update(users)
            .set({
              subscriptionStatus: "past_due",
            })
            .where(eq(users.id, user.id));

          console.log(`[Webhook] Payment failed for user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).send("Webhook processing failed");
  }
}
