/**
 * Stripe Products and Pricing Configuration
 * Centralized product definitions for Careerswarm subscription tiers
 */

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    tier: "free" as const,
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: [
      "5 achievements",
      "3 resumes per month",
      "Basic templates",
      "STAR methodology wizard",
      "Impact Meter scoring",
    ],
    limits: {
      maxAchievements: 5,
      maxResumesPerMonth: 3,
      maxJobDescriptions: 3,
    },
  },
  PRO: {
    name: "Pro",
    tier: "pro" as const,
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly", // Set in Stripe dashboard
    features: [
      "Unlimited achievements",
      "Unlimited resumes",
      "PDF export",
      "Email integration",
      "Browser extension",
      "AI suggestions",
      "Skills gap analysis",
      "Past job import",
      "Bulk achievement import",
      "Priority support",
    ],
    limits: {
      maxAchievements: Infinity,
      maxResumesPerMonth: Infinity,
      maxJobDescriptions: Infinity,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function getTierLimits(tier: "free" | "pro") {
  return SUBSCRIPTION_TIERS[tier.toUpperCase() as SubscriptionTier].limits;
}

export function getTierFeatures(tier: "free" | "pro") {
  return SUBSCRIPTION_TIERS[tier.toUpperCase() as SubscriptionTier].features;
}

export function getTierPrice(tier: "free" | "pro") {
  return SUBSCRIPTION_TIERS[tier.toUpperCase() as SubscriptionTier].price;
}
