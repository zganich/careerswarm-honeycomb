import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

describe.skip("Profiler Agent (requires jobs.createManual)", () => {
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

    // Verify structure (legacy format)
    expect(result).toHaveProperty("painPoints");
    expect(result).toHaveProperty("strategicHook");
    expect(result).toHaveProperty("interviewQuestions");

    // Verify painPoints array (exactly 3)
    expect(Array.isArray(result.painPoints)).toBe(true);
    expect(result.painPoints.length).toBe(3);

    // Verify each pain point is a non-empty string
    result.painPoints.forEach(painPoint => {
      expect(typeof painPoint).toBe("string");
      expect(painPoint.length).toBeGreaterThan(10);
    });

    // Verify strategic hook
    expect(typeof result.strategicHook).toBe("string");
    expect(result.strategicHook.length).toBeGreaterThan(20);

    // Verify interview questions array (exactly 3)
    expect(Array.isArray(result.interviewQuestions)).toBe(true);
    expect(result.interviewQuestions.length).toBe(3);

    result.interviewQuestions.forEach(question => {
      expect(typeof question).toBe("string");
      expect(question.length).toBeGreaterThan(10);
      // Questions should typically end with a question mark
      expect(question.trim().endsWith("?")).toBe(true);
    });

    console.log("\n=== Profiler Analysis Results ===");
    console.log("\nPain Points:");
    result.painPoints.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    console.log("\nStrategic Hook:");
    console.log(`  ${result.strategicHook}`);
    console.log("\nInterview Questions:");
    result.interviewQuestions.forEach((q, i) =>
      console.log(`  ${i + 1}. ${q}`)
    );
  });

  it.skip("should persist profiler analysis in database (requires LLM)", async () => {
    // Get the application after profiling
    const application = await caller.applications.get({
      id: testApplicationId,
    });

    // Verify profilerAnalysis is stored (legacy format)
    expect(application).toBeDefined();
    expect(application?.profilerAnalysis).toBeDefined();
    expect(application?.profilerAnalysis?.painPoints).toBeDefined();
    expect(application?.profilerAnalysis?.strategicHook).toBeDefined();
    expect(application?.profilerAnalysis?.interviewQuestions).toBeDefined();

    // Verify painPoints is also stored (for backward compatibility)
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
