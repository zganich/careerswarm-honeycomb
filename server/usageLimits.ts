import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { achievements, generatedResumes, users } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface UsageLimits {
  maxAchievements: number;
  maxResumesPerMonth: number;
  maxJobSearches: number;
  maxApplications: number;
}

const FREE_TIER_LIMITS: UsageLimits = {
  maxAchievements: 10,
  maxResumesPerMonth: 3,
  maxJobSearches: 50,
  maxApplications: 100,
};

const PRO_TIER_LIMITS: UsageLimits = {
  maxAchievements: Infinity,
  maxResumesPerMonth: Infinity,
  maxJobSearches: Infinity,
  maxApplications: Infinity,
};

export function getLimitsForUser(subscriptionTier: string | null): UsageLimits {
  return subscriptionTier === "pro" ? PRO_TIER_LIMITS : FREE_TIER_LIMITS;
}

export async function checkAchievementLimit(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get user's subscription tier
  const [userRecord] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, userId));
  
  const limits = getLimitsForUser(userRecord?.subscriptionTier || null);
  
  if (limits.maxAchievements === Infinity) {
    return; // Pro tier, no limit
  }
  
  // Count user's achievements
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(achievements)
    .where(eq(achievements.userId, userId));
  
  const currentCount = Number(result?.count || 0);
  
  if (currentCount >= limits.maxAchievements) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Free tier limit reached: ${limits.maxAchievements} achievements maximum. Upgrade to Pro for unlimited achievements.`,
    });
  }
}

export async function checkResumeLimit(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get user's subscription tier
  const [userRecord] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, userId));
  
  const limits = getLimitsForUser(userRecord?.subscriptionTier || null);
  
  if (limits.maxResumesPerMonth === Infinity) {
    return; // Pro tier, no limit
  }
  
  // Count resumes created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(generatedResumes)
    .where(
      and(
        eq(generatedResumes.userId, userId),
        gte(generatedResumes.createdAt, startOfMonth)
      )
    );
  
  const currentCount = Number(result?.count || 0);
  
  if (currentCount >= limits.maxResumesPerMonth) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Free tier limit reached: ${limits.maxResumesPerMonth} resumes per month. Upgrade to Pro for unlimited resume generation.`,
    });
  }
}

export async function getUserUsageStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get user's subscription tier
  const [userRecord] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, userId));
  
  const limits = getLimitsForUser(userRecord?.subscriptionTier || null);
  
  // Count achievements
  const [achievementResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(achievements)
    .where(eq(achievements.userId, userId));
  
  const achievementCount = Number(achievementResult?.count || 0);
  
  // Count resumes this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [resumeResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(generatedResumes)
    .where(
      and(
        eq(generatedResumes.userId, userId),
        gte(generatedResumes.createdAt, startOfMonth)
      )
    );
  
  const resumeCount = Number(resumeResult?.count || 0);
  
  return {
    subscriptionTier: userRecord?.subscriptionTier || "free",
    achievements: {
      used: achievementCount,
      limit: limits.maxAchievements,
      percentage: limits.maxAchievements === Infinity ? 0 : (achievementCount / limits.maxAchievements) * 100,
    },
    resumes: {
      used: resumeCount,
      limit: limits.maxResumesPerMonth,
      percentage: limits.maxResumesPerMonth === Infinity ? 0 : (resumeCount / limits.maxResumesPerMonth) * 100,
    },
  };
}
