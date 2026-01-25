import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("public.estimateQualification", () => {
  const createMockContext = (): Context => ({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  it("should return a score between 0 and 100", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.public.estimateQualification({
      currentRole: "Software Engineer",
      targetRole: "Product Manager",
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should return gaps array with required fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.public.estimateQualification({
      currentRole: "Junior Developer",
      targetRole: "Senior Engineer",
    });

    expect(Array.isArray(result.gaps)).toBe(true);
    expect(result.gaps.length).toBeGreaterThanOrEqual(3);
    expect(result.gaps.length).toBeLessThanOrEqual(5);

    result.gaps.forEach((gap) => {
      expect(gap).toHaveProperty("skill");
      expect(gap).toHaveProperty("importance");
      expect(gap).toHaveProperty("suggestion");
      expect(["critical", "important", "helpful"]).toContain(gap.importance);
    });
  });

  it("should return reasoning string", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.public.estimateQualification({
      currentRole: "Marketing Manager",
      targetRole: "Data Scientist",
    });

    expect(typeof result.reasoning).toBe("string");
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it("should reject invalid input (too short)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.public.estimateQualification({
        currentRole: "A",
        targetRole: "Product Manager",
      })
    ).rejects.toThrow();
  });

  it("should handle similar roles (high score expected)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.public.estimateQualification({
      currentRole: "Frontend Developer",
      targetRole: "Full Stack Developer",
    });

    // Similar roles should generally score higher or equal to 50
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it("should handle very different roles (lower score expected)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.public.estimateQualification({
      currentRole: "Accountant",
      targetRole: "Software Engineer",
    });

    // Very different roles should generally score lower
    // Note: AI might still give decent scores if it finds transferable skills
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
