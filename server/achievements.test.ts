import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("achievements router", () => {
  it("creates an achievement with STAR data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.achievements.create({
      situation: "Our team faced declining user engagement",
      task: "Improve user retention by 20%",
      action: "Implemented gamification features",
      result: "Increased retention by 35% over 3 months",
      company: "Test Corp",
      roleTitle: "Product Manager",
      impactMeterScore: 90,
      hasStrongVerb: true,
      hasMetric: true,
      hasMethodology: true,
    });

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("number");
  });

  it("lists user achievements", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const achievements = await caller.achievements.list();

    expect(Array.isArray(achievements)).toBe(true);
  });

  it("transforms STAR to XYZ format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.achievements.transformToXYZ({
      situation: "Our API response times were slow",
      task: "Reduce latency by 50%",
      action: "Optimized database queries and added caching",
      result: "Reduced average response time from 800ms to 200ms",
    });

    expect(result.xyzText).toBeDefined();
    expect(typeof result.xyzText).toBe("string");
    expect(result.xyzText.length).toBeGreaterThan(0);
  });
});

describe("jobDescriptions router", () => {
  it("creates a job description", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobDescriptions.create({
      jobTitle: "Senior Product Manager",
      companyName: "Acme Corp",
      jobDescriptionText: "We are looking for a Senior PM with 5+ years experience...",
      jobUrl: "https://example.com/job",
    });

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("number");
  });

  it("analyzes job description with AI", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobDescriptions.analyze({
      jobDescriptionText: `Senior Product Manager
      
Requirements:
- 5+ years of product management experience
- Strong analytical skills
- Experience with Agile methodologies
- Excellent communication skills

Preferred:
- MBA or equivalent
- Technical background`,
    });

    expect(result.requiredSkills).toBeDefined();
    expect(Array.isArray(result.requiredSkills)).toBe(true);
    expect(result.preferredSkills).toBeDefined();
    expect(Array.isArray(result.preferredSkills)).toBe(true);
  });
});

describe("profile router", () => {
  it("returns current user profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const profile = await caller.profile.get();

    expect(profile).toBeDefined();
    expect(profile.id).toBe(1);
    expect(profile.email).toBe("test@example.com");
  });

  it("updates user profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.update({
      name: "Updated Name",
      currentRole: "Senior PM",
      yearsOfExperience: 8,
    });

    expect(result.success).toBe(true);
  });
});
