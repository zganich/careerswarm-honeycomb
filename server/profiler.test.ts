import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

describe("Profiler Agent", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testJobId: number;
  let testApplicationId: number;

  beforeAll(async () => {
    // Create test context with mock user
    const mockUser: AuthenticatedUser = {
      id: 1,
      openId: "test_user",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user: mockUser,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    caller = appRouter.createCaller(ctx);

    // Create a test job with a realistic job description
    const jobResult = await caller.jobs.createManual({
      title: "Senior Software Engineer",
      companyName: "TechCorp",
      description: `We are seeking a Senior Software Engineer to join our rapidly growing team. 

Key Responsibilities:
- Lead the migration of our monolithic application to microservices architecture
- Reduce system downtime and improve reliability
- Mentor junior engineers and establish best practices
- Scale our infrastructure to handle 10x traffic growth

Requirements:
- 5+ years of experience with distributed systems
- Strong knowledge of Kubernetes and Docker
- Experience with high-traffic applications
- Excellent communication skills

Our team values collaboration, innovation, and work-life balance. We're a fast-paced startup looking to disrupt the fintech industry.`,
      qualificationScore: 85,
    });

    testJobId = jobResult.jobId;

    // Create a test application
    const appResult = await caller.applications.create({
      jobId: testJobId,
    });

    testApplicationId = appResult.id;
  });

  it.skip("should analyze job description and extract strategic insights (requires LLM)", async () => {
    // Run profiler analysis
    const result = await caller.applications.profile({
      applicationId: testApplicationId,
    });

    // Verify structure
    expect(result).toHaveProperty("challenges");
    expect(result).toHaveProperty("cultureClues");
    expect(result).toHaveProperty("interviewQuestions");

    // Verify challenges array
    expect(Array.isArray(result.challenges)).toBe(true);
    expect(result.challenges.length).toBeGreaterThan(0);
    expect(result.challenges.length).toBeLessThanOrEqual(4);
    
    // Verify each challenge is a non-empty string
    result.challenges.forEach((challenge) => {
      expect(typeof challenge).toBe("string");
      expect(challenge.length).toBeGreaterThan(10);
    });

    // Verify culture clues array
    expect(Array.isArray(result.cultureClues)).toBe(true);
    expect(result.cultureClues.length).toBeGreaterThan(0);
    expect(result.cultureClues.length).toBeLessThanOrEqual(4);
    
    result.cultureClues.forEach((clue) => {
      expect(typeof clue).toBe("string");
      expect(clue.length).toBeGreaterThan(10);
    });

    // Verify interview questions array
    expect(Array.isArray(result.interviewQuestions)).toBe(true);
    expect(result.interviewQuestions.length).toBeGreaterThan(0);
    expect(result.interviewQuestions.length).toBeLessThanOrEqual(4);
    
    result.interviewQuestions.forEach((question) => {
      expect(typeof question).toBe("string");
      expect(question.length).toBeGreaterThan(10);
      // Questions should typically end with a question mark
      expect(question.trim().endsWith("?")).toBe(true);
    });

    console.log("\n=== Profiler Analysis Results ===");
    console.log("\nChallenges:");
    result.challenges.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    console.log("\nCulture Clues:");
    result.cultureClues.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    console.log("\nInterview Questions:");
    result.interviewQuestions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
  });

  it.skip("should persist profiler analysis in database (requires LLM)", async () => {
    // Get the application after profiling
    const application = await caller.applications.get({
      id: testApplicationId,
    });

    // Verify profilerAnalysis is stored
    expect(application).toBeDefined();
    expect(application?.profilerAnalysis).toBeDefined();
    expect(application?.profilerAnalysis?.challenges).toBeDefined();
    expect(application?.profilerAnalysis?.cultureClues).toBeDefined();
    expect(application?.profilerAnalysis?.interviewQuestions).toBeDefined();

    // Verify painPoints is also stored (legacy format)
    expect(application?.painPoints).toBeDefined();
    expect(Array.isArray(application?.painPoints)).toBe(true);
  });

  it("should fail gracefully with missing job description", async () => {
    // Create a job without description
    const emptyJobResult = await caller.jobs.createManual({
      title: "Test Job",
      companyName: "Test Company",
      description: "",
      qualificationScore: 50,
    });

    const emptyAppResult = await caller.applications.create({
      jobId: emptyJobResult.jobId,
    });

    // Try to profile - should throw error
    await expect(
      caller.applications.profile({
        applicationId: emptyAppResult.id,
      })
    ).rejects.toThrow("Job description is too short or missing");
  });
});
