import type { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2025-12-15.clover" })
  : null;

/**
 * Helper function to handle checkout.session.completed events
 */
async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Validate required data exists
  if (!session.metadata?.user_id) {
    console.error("[Webhook] No user_id in session metadata", {
      sessionId: session.id,
      metadata: session.metadata,
    });
    return;
  }

  if (!session.customer || !session.subscription) {
    console.error("[Webhook] Missing customer or subscription in session", {
      sessionId: session.id,
      customer: session.customer,
      subscription: session.subscription,
    });
    return;
  }

  const userId = parseInt(session.metadata.user_id);

  // Update user subscription
  await db
    .update(users)
    .set({
      subscriptionTier: "pro",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: "active",
    })
    .where(eq(users.id, userId));

  console.log(`[Webhook] Subscription activated for user ${userId}`, {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
  });
}

/**
 * Helper function to handle customer.subscription.updated events
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Validate required data exists
  if (!subscription.customer) {
    console.error("[Webhook] No customer in subscription", {
      subscriptionId: subscription.id,
    });
    return;
  }

  // Find user by customer ID
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, subscription.customer as string));

  if (!user) {
    console.error("[Webhook] User not found for customer", {
      customerId: subscription.customer,
      subscriptionId: subscription.id,
    });
    return;
  }

  // Update subscription status
  await db
    .update(users)
    .set({
      subscriptionStatus: subscription.status,
      subscriptionEndDate: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : null,
    })
    .where(eq(users.id, user.id));

  console.log(`[Webhook] Subscription updated for user ${user.id}`, {
    status: subscription.status,
    subscriptionId: subscription.id,
    currentPeriodEnd: (subscription as any).current_period_end,
  });
}

/**
 * Helper function to handle customer.subscription.deleted events
 */
async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Validate required data exists
  if (!subscription.customer) {
    console.error("[Webhook] No customer in subscription", {
      subscriptionId: subscription.id,
    });
    return;
  }

  // Find user by customer ID
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, subscription.customer as string));

  if (!user) {
    console.error("[Webhook] User not found for customer", {
      customerId: subscription.customer,
      subscriptionId: subscription.id,
    });
    return;
  }

  // Downgrade to free tier
  await db
    .update(users)
    .set({
      subscriptionTier: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
    })
    .where(eq(users.id, user.id));

  console.log(`[Webhook] Subscription canceled for user ${user.id}`, {
    subscriptionId: subscription.id,
  });
}

/**
 * Main Stripe webhook handler with comprehensive error handling
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    return res
      .status(503)
      .json({ success: false, error: "Stripe not configured" });
  }
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header", {
      headers: Object.keys(req.headers),
    });
    return res.status(400).json({
      success: false,
      error: "Missing stripe-signature header",
    });
  }

  let event: Stripe.Event;

  // Wrap signature verification in try-catch
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed", {
      error: err.message,
      stack: err.stack,
      signature:
        typeof sig === "string" ? sig.substring(0, 20) + "..." : "[array]", // Log partial signature for debugging
    });
    return res.status(400).json({
      success: false,
      error: `Webhook signature verification failed: ${err.message}`,
    });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log(
      "[Webhook] Test event detected, returning verification response"
    );
    return res.json({
      verified: true,
      eventType: event.type,
    });
  }

  console.log(`[Webhook] Received event: ${event.type}`, {
    eventId: event.id,
    created: event.created,
  });

  // Wrap event processing in try-catch
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Webhook] Database not available");
      return res.status(500).json({
        success: false,
        error: "Database unavailable",
      });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSession(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(subscription);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({
      success: true,
      received: true,
      eventType: event.type,
    });
  } catch (error: any) {
    console.error("[Webhook] Error processing event", {
      eventType: event.type,
      eventId: event.id,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: `Webhook processing error: ${error.message}`,
    });
  }
}
