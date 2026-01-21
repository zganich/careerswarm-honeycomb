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

describe("enhancement features", () => {
  it("updates an existing achievement", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create an achievement
    const created = await caller.achievements.create({
      situation: "Initial situation",
      task: "Initial task",
      action: "Initial action",
      result: "Initial result",
      impactMeterScore: 50,
      hasStrongVerb: false,
      hasMetric: false,
      hasMethodology: false,
    });

    // Then update it
    const result = await caller.achievements.update({
      id: created.id,
      situation: "Updated situation",
      result: "Increased efficiency by 200%",
      impactMeterScore: 90,
      hasMetric: true,
    });

    expect(result.success).toBe(true);
  });

  it("matches achievements to job descriptions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a job description
    const job = await caller.jobDescriptions.create({
      jobTitle: "Senior Software Engineer",
      companyName: "Tech Corp",
      jobDescriptionText: "Looking for a senior engineer with Python and React experience. Must have led teams and improved system performance.",
    });

    // Create some achievements
    await caller.achievements.create({
      situation: "System was slow",
      task: "Improve performance",
      action: "Optimized database queries",
      result: "Reduced response time by 80%",
      impactMeterScore: 90,
      hasStrongVerb: true,
      hasMetric: true,
      hasMethodology: true,
    });

    // Match achievements to the job
    const result = await caller.jobDescriptions.matchAchievements({
      jobDescriptionId: job.id,
    });

    expect(result.matches).toBeDefined();
    expect(Array.isArray(result.matches)).toBe(true);
    if (result.matches.length > 0) {
      expect(result.matches[0]).toHaveProperty("matchScore");
      expect(result.matches[0]).toHaveProperty("skillRelevance");
      expect(result.matches[0]).toHaveProperty("impactAlignment");
      expect(result.matches[0]).toHaveProperty("reason");
      expect(result.matches[0]).toHaveProperty("achievement");
    }
  });

  it("exports resume to PDF", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a job and achievement
    const job = await caller.jobDescriptions.create({
      jobTitle: "Product Manager",
      jobDescriptionText: "Looking for an experienced PM",
    });

    const achievement = await caller.achievements.create({
      result: "Launched successful product",
      impactMeterScore: 85,
      hasStrongVerb: true,
      hasMetric: false,
      hasMethodology: false,
    });

    // Generate a resume
    const resume = await caller.resumes.generate({
      jobDescriptionId: job.id,
      selectedAchievementIds: [achievement.id],
    });

    // Export to PDF
    const result = await caller.resumes.exportPDF({
      resumeId: resume.id,
    });

    expect(result.pdfData).toBeDefined();
    expect(typeof result.pdfData).toBe("string");
    expect(result.pdfData.length).toBeGreaterThan(0);
  });
});
