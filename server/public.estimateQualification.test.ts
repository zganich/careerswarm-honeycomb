import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("public.estimateQualification", () => {
  const createMockContext = (): Context => ({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  async function callEstimate(
    caller: ReturnType<typeof appRouter.createCaller>,
    currentRole: string,
    targetRole: string
  ) {
    try {
      return await caller.public.estimateQualification({
        currentRole,
        targetRole,
      });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === "SERVICE_UNAVAILABLE") {
        console.log(
          "Skipping estimateQualification test: LLM unavailable (no key or rate limit)"
        );
        return null;
      }
      throw e;
    }
  }

  it("should return a score between 0 and 100", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await callEstimate(
      caller,
      "Software Engineer",
      "Product Manager"
    );
    if (result == null) return;
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  }, 20000);

  it("should return gaps array with required fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await callEstimate(
      caller,
      "Junior Developer",
      "Senior Engineer"
    );
    if (result == null) return;
    expect(Array.isArray(result.gaps)).toBe(true);
    expect(result.gaps.length).toBeGreaterThanOrEqual(3);
    expect(result.gaps.length).toBeLessThanOrEqual(5);
    result.gaps.forEach(gap => {
      expect(gap).toHaveProperty("skill");
      expect(gap).toHaveProperty("importance");
      expect(gap).toHaveProperty("suggestion");
      expect(["critical", "important", "helpful"]).toContain(gap.importance);
    });
  }, 20000);

  it("should return reasoning string", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await callEstimate(
      caller,
      "Marketing Manager",
      "Data Scientist"
    );
    if (result == null) return;
    expect(typeof result.reasoning).toBe("string");
    expect(result.reasoning.length).toBeGreaterThan(0);
  }, 20000);

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

  it("should handle similar roles (valid score)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await callEstimate(
      caller,
      "Frontend Developer",
      "Full Stack Developer"
    );
    if (result == null) return;
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  }, 20000);

  it("should handle very different roles (valid score)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await callEstimate(
      caller,
      "Accountant",
      "Software Engineer"
    );
    if (result == null) return;
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  }, 20000);
});
