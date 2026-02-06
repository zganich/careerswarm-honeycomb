/**
 * PostHog utility for product analytics
 * Provides type-safe event tracking
 */

import posthog from "posthog-js";

export { posthog };

/**
 * Identify user after authentication
 */
export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    tier?: string;
    name?: string;
  }
) {
  if (import.meta.env.MODE !== "development") {
    posthog.identify(userId, properties);
  }
}

/**
 * Track custom events with type safety
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (import.meta.env.MODE !== "development") {
    posthog.capture(eventName, properties);
  }
}

/**
 * Core events for tracking
 */
export const EVENTS = {
  // User lifecycle
  USER_SIGNED_UP: "user_signed_up",

  // Core features
  ACHIEVEMENT_CREATED: "achievement_created",
  RESUME_ROASTED: "resume_roasted",
  RESUME_ROAST_FEEDBACK: "resume_roast_feedback",
  RESUME_GENERATED: "resume_generated",
  CAREER_SCORE_CALCULATED: "career_score_calculated",

  // Revenue
  CHECKOUT_STARTED: "checkout_started",
  PRO_SUBSCRIPTION_UPGRADED: "pro_subscription_upgraded",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",

  // Engagement
  JOB_ADDED: "job_added",
  APPLICATION_CREATED: "application_created",
  AI_AGENT_USED: "ai_agent_used",
} as const;
