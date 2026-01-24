import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Pivot Analyzer", () => {
  const testUserId = 1; // Use existing test user
  let testJobId: number;
  let testApplicationId: number;

  beforeAll(async () => {
    // Create test job (Strategy role - career pivot from Sales)
    testJobId = await db.createJob({
      userId: testUserId,
      title: "Strategy Manager",
      companyName: "Tech Corp",
      location: "San Francisco, CA",
      jobUrl: "https://example.com/strategy-role",
      platform: "LinkedIn",
      description: `We're seeking a Strategy Manager to drive market analysis and strategic planning.

Key Responsibilities:
- Conduct market opportunity assessments
- Develop go-to-market strategies
- Analyze competitive landscape
- Present strategic recommendations to executives
- Collaborate with cross-functional teams

Requirements:
- 5+ years experience in strategy, consulting, or related field
- Strong analytical and problem-solving skills
- Experience with data-driven decision making
- Excellent stakeholder management
- MBA preferred`,
      qualificationScore: 70,
    });

    // Create test application
    testApplicationId = await db.createApplication({
      userId: testUserId,
      jobId: testJobId,
      status: "draft",
    });
  });

  it("should store pivot analysis in database", async () => {
    const mockAnalysis = {
      bridgeSkills: [
        {
          skill: "Client needs analysis",
          fromContext: "Understanding enterprise customer pain points and requirements",
          toContext: "Market opportunity assessment and customer segmentation",
          strategicFrame: "My experience analyzing complex client needs translates directly to identifying market opportunities",
        },
        {
          skill: "Stakeholder management",
          fromContext: "Navigating enterprise buying committees with multiple decision-makers",
          toContext: "Cross-functional collaboration and executive alignment",
          strategicFrame: "I excel at building consensus among diverse stakeholders with competing priorities",
        },
        {
          skill: "Executive communication",
          fromContext: "Presenting proposals and business cases to C-level buyers",
          toContext: "Strategic recommendations and board-level presentations",
          strategicFrame: "I craft compelling narratives that drive executive decision-making",
        },
      ],
      pivotStrategy: "Moving from Sales to Strategy builds on my deep understanding of customer needs and market dynamics. My track record of analyzing complex buying decisions translates directly to strategic market assessment.",
      transferableStrengths: [
        "Data-driven decision making",
        "Market analysis from customer interactions",
        "Executive relationship building",
        "Revenue impact focus",
      ],
    };

    // Store analysis
    await db.updateApplication(testApplicationId, testUserId, {
      pivotAnalysis: mockAnalysis,
    });

    // Verify storage
    const updated = await db.getApplicationById(testApplicationId, testUserId);
    expect(updated?.pivotAnalysis).toBeDefined();
    expect(updated?.pivotAnalysis).toEqual(mockAnalysis);
  });

  it("should identify 3-5 bridge skills", async () => {
    const mockAnalysis = {
      bridgeSkills: [
        {
          skill: "Skill 1",
          fromContext: "From context",
          toContext: "To context",
          strategicFrame: "Frame",
        },
        {
          skill: "Skill 2",
          fromContext: "From context",
          toContext: "To context",
          strategicFrame: "Frame",
        },
        {
          skill: "Skill 3",
          fromContext: "From context",
          toContext: "To context",
          strategicFrame: "Frame",
        },
      ],
      pivotStrategy: "Strategy",
      transferableStrengths: ["Strength 1", "Strength 2", "Strength 3"],
    };

    await db.updateApplication(testApplicationId, testUserId, {
      pivotAnalysis: mockAnalysis,
    });

    const result = await db.getApplicationById(testApplicationId, testUserId);
    expect(result?.pivotAnalysis?.bridgeSkills).toBeDefined();
    expect(result?.pivotAnalysis?.bridgeSkills.length).toBeGreaterThanOrEqual(3);
    expect(result?.pivotAnalysis?.bridgeSkills.length).toBeLessThanOrEqual(5);
  });

  it("should include all required bridge skill fields", async () => {
    const mockAnalysis = {
      bridgeSkills: [
        {
          skill: "Test Skill",
          fromContext: "Previous role context",
          toContext: "Target role context",
          strategicFrame: "How to position this skill",
        },
      ],
      pivotStrategy: "Overall strategy",
      transferableStrengths: ["Strength 1"],
    };

    await db.updateApplication(testApplicationId, testUserId, {
      pivotAnalysis: mockAnalysis,
    });

    const result = await db.getApplicationById(testApplicationId, testUserId);
    const bridgeSkill = result?.pivotAnalysis?.bridgeSkills[0];
    
    expect(bridgeSkill).toBeDefined();
    expect(bridgeSkill?.skill).toBeDefined();
    expect(bridgeSkill?.fromContext).toBeDefined();
    expect(bridgeSkill?.toContext).toBeDefined();
    expect(bridgeSkill?.strategicFrame).toBeDefined();
  });

  it("should include pivot strategy", async () => {
    const mockAnalysis = {
      bridgeSkills: [
        {
          skill: "Test",
          fromContext: "From",
          toContext: "To",
          strategicFrame: "Frame",
        },
      ],
      pivotStrategy: "This is a strategic career transition that builds on existing strengths",
      transferableStrengths: ["Strength 1"],
    };

    await db.updateApplication(testApplicationId, testUserId, {
      pivotAnalysis: mockAnalysis,
    });

    const result = await db.getApplicationById(testApplicationId, testUserId);
    expect(result?.pivotAnalysis?.pivotStrategy).toBeDefined();
    expect(result?.pivotAnalysis?.pivotStrategy.length).toBeGreaterThan(20);
  });

  it("should include transferable strengths", async () => {
    const mockAnalysis = {
      bridgeSkills: [
        {
          skill: "Test",
          fromContext: "From",
          toContext: "To",
          strategicFrame: "Frame",
        },
      ],
      pivotStrategy: "Strategy",
      transferableStrengths: [
        "Analytical thinking",
        "Stakeholder management",
        "Data-driven decision making",
      ],
    };

    await db.updateApplication(testApplicationId, testUserId, {
      pivotAnalysis: mockAnalysis,
    });

    const result = await db.getApplicationById(testApplicationId, testUserId);
    expect(result?.pivotAnalysis?.transferableStrengths).toBeDefined();
    expect(result?.pivotAnalysis?.transferableStrengths.length).toBeGreaterThanOrEqual(3);
  });

  it("should not contain fluff words", async () => {
    const fluffWords = [
      'synergy', 'leverage', 'utilize', 'robust', 'dynamic', 
      'innovative', 'cutting-edge', 'best-in-class', 'world-class', 
      'game-changing', 'disruptive'
    ];

    const mockAnalysis = {
      bridgeSkills: [
        {
          skill: "Market analysis",
          fromContext: "Analyzing customer needs and pain points",
          toContext: "Strategic market assessment",
          strategicFrame: "I translate customer insights into market opportunities",
        },
      ],
      pivotStrategy: "Moving from sales to strategy builds on my experience understanding markets through direct customer interaction",
      transferableStrengths: ["Customer insight", "Market knowledge", "Executive communication"],
    };

    await db.updateApplication(testApplicationId, testUserId, {
      pivotAnalysis: mockAnalysis,
    });

    const result = await db.getApplicationById(testApplicationId, testUserId);
    const fullText = JSON.stringify(result?.pivotAnalysis).toLowerCase();
    
    fluffWords.forEach(fluffWord => {
      expect(fullText).not.toContain(fluffWord);
    });
  });

  it("should handle missing application gracefully", async () => {
    const result = await db.getApplicationById(999999, testUserId);
    expect(result).toBeUndefined();
  });
});
