import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Resume Roaster", () => {
  it("should reject resumes shorter than 50 characters", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });

    await expect(
      caller.public.roast({ resumeText: "Short resume" })
    ).rejects.toThrow("Resume must be at least 50 characters");
  });

  it("should return valid roast shape (integration: requires OPENAI_API_KEY)", async () => {
    if (!process.env.OPENAI_API_KEY) {
      console.log("Skipping roast integration test: OPENAI_API_KEY not set");
      return;
    }
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
    const resumeText = `
    Jane Doe | jane.doe@email.com
    Senior Product Manager at TechCorp (2020-Present)
    - Launched payment feature that generated $2.3M ARR in first 6 months
    - Reduced customer churn by 47% through data-driven retention strategy
    - Led team of 8 engineers to ship 12 features on time, 0 critical bugs
    EDUCATION: MBA, Stanford | BS Computer Science, MIT
    `.trim();
    const result = await caller.public.roast({ resumeText });
    expect(result).toBeDefined();
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(typeof result.verdict).toBe("string");
    expect(Array.isArray(result.mistakes)).toBe(true);
    expect(result.mistakes.length).toBe(3);
    result.mistakes.forEach((m: any) => {
      expect(m).toHaveProperty("title");
      expect(m).toHaveProperty("explanation");
      expect(m).toHaveProperty("fix");
    });
    expect(typeof result.brutalTruth).toBe("string");
    expect(typeof result.characterCount).toBe("number");
    expect(typeof result.wordCount).toBe("number");
  }, 20000);

  it.skip("should roast a buzzword-heavy resume with low score (LLM test)", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });

    const buzzwordResume = `
    John Smith
    john.smith@email.com

    OBJECTIVE: Seeking a challenging position where I can leverage my skills

    EXPERIENCE:
    Software Engineer at Tech Company (2020-Present)
    - Worked on various projects
    - Collaborated with team members
    - Utilized cutting-edge technologies
    - Synergized cross-functional initiatives
    - Spearheaded robust solutions
    - Orchestrated seamless deployments

    SKILLS: Python, JavaScript, teamwork, communication, problem-solving

    EDUCATION: Computer Science Degree
    `;

    const result = await caller.public.roast({ resumeText: buzzwordResume });

    expect(result.score).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.verdict).toBeDefined();
    expect(result.mistakes).toHaveLength(3);
    expect(result.brutalTruth).toBeDefined();
    expect(result.characterCount).toBeGreaterThan(0);
    expect(result.wordCount).toBeGreaterThan(0);

    // Buzzword-heavy resume should get low score
    expect(result.score).toBeLessThan(50);

    // Should have specific mistake structure
    result.mistakes.forEach((mistake: any) => {
      expect(mistake.title).toBeDefined();
      expect(mistake.explanation).toBeDefined();
      expect(mistake.fix).toBeDefined();
    });
  });

  it.skip("should roast a metrics-rich resume with higher score (LLM test)", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });

    const goodResume = `
    Jane Doe
    jane.doe@email.com

    Senior Product Manager at TechCorp (2020-Present)
    - Launched payment feature that generated $2.3M ARR in first 6 months
    - Reduced customer churn by 47% through data-driven retention strategy
    - Led team of 8 engineers to ship 12 features on time, 0 critical bugs
    - Increased user engagement by 3x (from 2M to 6M MAU) in 18 months

    Product Manager at StartupCo (2018-2020)
    - Built MVP in 90 days with $50K budget, acquired 10K users in first month
    - Negotiated partnership with Fortune 500 company worth $500K annually
    - Reduced feature development time by 35% through process improvements

    EDUCATION: MBA, Stanford | BS Computer Science, MIT
    `;

    const result = await caller.public.roast({ resumeText: goodResume });

    expect(result.score).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);

    // Metrics-rich resume should get higher score
    expect(result.score).toBeGreaterThan(60);
  });
});
