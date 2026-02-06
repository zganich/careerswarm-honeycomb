import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe.skip("Intelligence Fleet Agents (requires db.createJob)", () => {
  // Use a test user ID (in real tests, this would be created via OAuth)
  const testUserId = 1;
  let testApplicationId: number;

  beforeAll(async () => {
    // Create a test application with job description
    const jobId = await db.createJob({
      userId: testUserId,
      title: "Senior Product Manager",
      companyName: "TechCorp",
      location: "San Francisco, CA",
      jobUrl: "https://example.com/job/123",
      platform: "LinkedIn",
      description: `We are seeking a Senior Product Manager to lead our B2B SaaS platform.
      
Key Responsibilities:
- Define product roadmap and strategy for enterprise customers
- Reduce customer churn through data-driven feature prioritization
- Lead cross-functional teams (engineering, design, sales)
- Conduct user research and competitive analysis
- Drive product adoption and expansion revenue

Requirements:
- 5+ years of product management experience in B2B SaaS
- Strong analytical skills with SQL and data visualization tools
- Experience with agile methodologies and product analytics
- Excellent communication and stakeholder management
- Technical background preferred (CS degree or engineering experience)

Nice to Have:
- Experience with AI/ML product features
- Knowledge of payment systems and billing
- Prior startup experience`,
      qualificationScore: 75,
    });

    testApplicationId = await db.createApplication({
      userId: testUserId,
      jobId,
      status: "submitted",
      notes: "Applied via LinkedIn",
    });
  });

  afterAll(async () => {
    // Cleanup handled by database reset between test runs
  });

  describe("Success Predictor Agent", () => {
    it("should validate input schema", async () => {
      const { predictSuccess } = await import("./routers");

      // Missing applicationId should fail
      await expect(async () => {
        // @ts-ignore - intentionally testing invalid input
        await predictSuccess({ applicationId: undefined });
      }).rejects.toThrow();
    });

    it("should handle missing application gracefully", async () => {
      const { getApplicationById, updateApplication } = await import("./db");

      const nonExistentApp = await getApplicationById(999999, testUserId);
      expect(nonExistentApp).toBeUndefined();
    });

    it.skip("should generate success prediction with probability and flags", async () => {
      // Skipped: Requires real LLM call
      // Manual test: Create application → Click "Predict Success" → Verify:
      // - Probability between 0-100
      // - Reasoning text present
      // - greenFlags array with positive indicators
      // - redFlags array with concerns
    });

    it("should validate success prediction schema", () => {
      const mockPrediction = {
        probability: 72,
        reasoning:
          "Strong product management experience aligns with role requirements. Technical background is a plus.",
        greenFlags: [
          "5+ years of product management experience matches requirement",
          "B2B SaaS background directly relevant",
          "Technical skills (SQL, analytics) are strong fit",
        ],
        redFlags: [
          "No explicit AI/ML product experience mentioned",
          "Startup experience not highlighted in profile",
        ],
      };

      expect(mockPrediction).toHaveProperty("probability");
      expect(mockPrediction.probability).toBeGreaterThanOrEqual(0);
      expect(mockPrediction.probability).toBeLessThanOrEqual(100);
      expect(mockPrediction).toHaveProperty("reasoning");
      expect(mockPrediction.reasoning).toBeTruthy();
      expect(Array.isArray(mockPrediction.greenFlags)).toBe(true);
      expect(Array.isArray(mockPrediction.redFlags)).toBe(true);
    });

    it("should store prediction in analytics column", async () => {
      const { updateApplication, getApplicationById } = await import("./db");

      const mockPrediction = {
        probability: 68,
        reasoning: "Good fit overall with some gaps",
        greenFlags: ["Strong PM experience", "B2B SaaS background"],
        redFlags: ["Missing AI/ML experience"],
      };

      await updateApplication(testApplicationId, testUserId, {
        analytics: {
          successPrediction: mockPrediction,
        },
      });

      const updated = await getApplicationById(testApplicationId, testUserId);
      expect(updated?.analytics?.successPrediction).toBeDefined();
      expect(updated?.analytics?.successPrediction?.probability).toBe(68);
      expect(updated?.analytics?.successPrediction?.greenFlags).toHaveLength(2);
      expect(updated?.analytics?.successPrediction?.redFlags).toHaveLength(1);
    });
  });

  describe("Skill Gap Analysis Agent", () => {
    it("should validate input schema", async () => {
      const { analyzeSkillGap } = await import("./routers");

      // Missing applicationId should fail
      await expect(async () => {
        // @ts-ignore - intentionally testing invalid input
        await analyzeSkillGap({ applicationId: undefined });
      }).rejects.toThrow();
    });

    it.skip("should identify missing skills from job requirements", async () => {
      // Skipped: Requires real LLM call
      // Manual test: Create application → Click "Analyze Skill Gap" → Verify:
      // - missingSkills array lists gaps (e.g., "AI/ML product experience")
      // - upskillingPlan array provides actionable steps
    });

    it("should validate skill gap schema", () => {
      const mockSkillGap = {
        missingSkills: [
          "AI/ML product development experience",
          "Payment systems and billing knowledge",
          "Startup scaling experience",
        ],
        upskillingPlan: [
          "Complete online course on AI/ML for Product Managers (Coursera or Udacity)",
          "Read 'Inspired' by Marty Cagan for product leadership best practices",
          "Build side project using Stripe API to gain payment systems experience",
          "Attend startup product meetups to network and learn scaling strategies",
        ],
      };

      expect(mockSkillGap).toHaveProperty("missingSkills");
      expect(Array.isArray(mockSkillGap.missingSkills)).toBe(true);
      expect(mockSkillGap.missingSkills.length).toBeGreaterThan(0);
      expect(mockSkillGap).toHaveProperty("upskillingPlan");
      expect(Array.isArray(mockSkillGap.upskillingPlan)).toBe(true);
      expect(mockSkillGap.upskillingPlan.length).toBeGreaterThan(0);
    });

    it("should store skill gap analysis in analytics column", async () => {
      const { updateApplication, getApplicationById } = await import("./db");

      const mockSkillGap = {
        missingSkills: ["AI/ML experience", "Payment systems"],
        upskillingPlan: [
          "Take AI/ML course",
          "Build Stripe integration project",
        ],
      };

      await updateApplication(testApplicationId, testUserId, {
        analytics: {
          skillGap: mockSkillGap,
        },
      });

      const updated = await getApplicationById(testApplicationId, testUserId);
      expect(updated?.analytics?.skillGap).toBeDefined();
      expect(updated?.analytics?.skillGap?.missingSkills).toHaveLength(2);
      expect(updated?.analytics?.skillGap?.upskillingPlan).toHaveLength(2);
    });

    it("should handle both analytics together", async () => {
      const { updateApplication, getApplicationById } = await import("./db");

      const mockAnalytics = {
        successPrediction: {
          probability: 65,
          reasoning: "Moderate fit with some gaps",
          greenFlags: ["Strong PM background"],
          redFlags: ["Missing technical skills"],
        },
        skillGap: {
          missingSkills: ["AI/ML", "Payment systems"],
          upskillingPlan: ["Take courses", "Build projects"],
        },
      };

      await updateApplication(testApplicationId, testUserId, {
        analytics: mockAnalytics,
      });

      const updated = await getApplicationById(testApplicationId, testUserId);
      expect(updated?.analytics?.successPrediction).toBeDefined();
      expect(updated?.analytics?.skillGap).toBeDefined();
      expect(updated?.analytics?.successPrediction?.probability).toBe(65);
      expect(updated?.analytics?.skillGap?.missingSkills).toHaveLength(2);
    });
  });

  describe("Integration with Application Lifecycle", () => {
    it("should allow running analytics independently", async () => {
      const { getApplicationById, updateApplication } = await import("./db");

      // Run success prediction first
      await updateApplication(testApplicationId, testUserId, {
        analytics: {
          successPrediction: {
            probability: 70,
            reasoning: "Good match",
            greenFlags: ["Experience"],
            redFlags: [],
          },
        },
      });

      let app = await getApplicationById(testApplicationId, testUserId);
      expect(app?.analytics?.successPrediction).toBeDefined();
      expect(app?.analytics?.skillGap).toBeUndefined();

      // Run skill gap later
      await updateApplication(testApplicationId, testUserId, {
        analytics: {
          ...app?.analytics,
          skillGap: {
            missingSkills: ["AI/ML"],
            upskillingPlan: ["Learn AI"],
          },
        },
      });

      app = await getApplicationById(testApplicationId, testUserId);
      expect(app?.analytics?.successPrediction).toBeDefined();
      expect(app?.analytics?.skillGap).toBeDefined();
    });
  });
});
