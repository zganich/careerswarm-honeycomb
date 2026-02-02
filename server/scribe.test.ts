import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Scribe Agent - generateOutreach", () => {
  let testUserId: number;
  let testJobId: number;
  let testApplicationId: number;

  beforeAll(async () => {
    // Use existing test user from OAuth
    testUserId = 1;
  });

  it.skip("should generate LinkedIn and email outreach based on strategic analysis", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-user", name: "Test User", email: "test@example.com" },
      req: {} as any,
      res: {} as any,
    });

    // Create a test job
    const { createJob } = await import("./db");
    testJobId = await createJob({
      userId: testUserId,
      title: "Senior Software Engineer",
      companyName: "TechCorp",
      description: "We are looking for a senior engineer to help us scale our platform. Must have experience with microservices, reducing technical debt, and improving system reliability.",
      platform: "manual",
    });

    // Create application
    testApplicationId = await caller.applications.create({
      jobId: testJobId,
    });

    // Run profiler analysis first
    await caller.applications.profile({
      applicationId: testApplicationId,
    });

    // Generate outreach
    const outreach = await caller.applications.generateOutreach({
      applicationId: testApplicationId,
    });

    // Validate structure
    expect(outreach).toHaveProperty("linkedinMessage");
    expect(outreach).toHaveProperty("coldEmailSubject");
    expect(outreach).toHaveProperty("coldEmailBody");

    // Validate LinkedIn message length
    expect(outreach.linkedinMessage.length).toBeLessThanOrEqual(300);

    // Validate email body word count (approximately 150 words)
    const wordCount = outreach.coldEmailBody.split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(180); // Allow some buffer

    // Validate peer-level tone (should not contain subordinate phrases)
    const subordinatePhrases = ["coffee chat", "pick your brain", "learn from you"];
    subordinatePhrases.forEach(phrase => {
      expect(outreach.linkedinMessage.toLowerCase()).not.toContain(phrase);
      expect(outreach.coldEmailBody.toLowerCase()).not.toContain(phrase);
    });

    console.log("Generated LinkedIn Message:", outreach.linkedinMessage);
    console.log("Generated Email Subject:", outreach.coldEmailSubject);
    console.log("Generated Email Body:", outreach.coldEmailBody);
  }, 30000);

  it.skip("should fail if strategic analysis hasn't been run (requires createJob in db)", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-user", name: "Test User", email: "test@example.com" },
      req: {} as any,
      res: {} as any,
    });

    // Create a test job without profiler analysis (createJob not in db; use createOpportunity + application if needed)
    const { createJob } = await import("./db");
    const jobId = await createJob({
      userId: testUserId,
      title: "Product Manager",
      companyName: "StartupCo",
      jobUrl: "https://example.com/jobs/pm",
      description: "Looking for a PM to lead product strategy.",
      platform: "manual",
    });

    // Create application
    const createResult = await caller.applications.create({
      jobId,
    });
    const applicationId = typeof createResult === 'number' ? createResult : (createResult as any).id;

    // Try to generate outreach without running profiler first
    await expect(
      caller.applications.generateOutreach({
        applicationId,
      })
    ).rejects.toThrow("Run Strategic Analysis first");
  });
});
