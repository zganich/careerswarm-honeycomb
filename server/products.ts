/**
 * Stripe Products & Pricing
 *
 * Free Tier:
 * - 10 achievements
 * - 3 resume generations/month
 * - Manual job search
 * - Basic impact scoring
 *
 * Pro Tier ($29/month):
 * - Unlimited achievements
 * - Unlimited resume generations
 * - Automated job scraping (50 jobs/day)
 * - AI qualification scoring
 * - Company research
 * - Cover letter generation
 * - Application tracking
 * - Priority support
 */

export const PRODUCTS = {
  FREE: {
    name: "Free",
    price: 0,
    limits: {
      achievements: 10,
      resumeGenerations: 3,
      jobSearches: 0, // Manual only
      applications: 5,
    },
    features: [
      "10 achievements",
      "3 resume generations/month",
      "Manual job search",
      "Basic impact scoring",
      "STAR to XYZ transformation",
    ],
  },
  PRO: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO || "price_pro_monthly",
    limits: {
      achievements: Infinity,
      resumeGenerations: Infinity,
      jobSearches: 50, // per day
      applications: Infinity,
    },
    features: [
      "Unlimited achievements",
      "Unlimited resume generations",
      "Automated job scraping (50/day)",
      "AI qualification scoring",
      "Company research & intelligence",
      "Cover letter generation",
      "Application tracking",
      "Follow-up automation",
      "Priority support",
    ],
  },
} as const;

export type SubscriptionTier = "free" | "pro";

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof typeof PRODUCTS.PRO.limits
): boolean {
  if (tier === "pro") return true;
  return false; // Free tier has limited access
}

export function getRemainingLimit(
  tier: SubscriptionTier,
  feature: keyof typeof PRODUCTS.PRO.limits,
  currentUsage: number
): number {
  const limits = tier === "pro" ? PRODUCTS.PRO.limits : PRODUCTS.FREE.limits;
  const limit = limits[feature];
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - currentUsage);
}
