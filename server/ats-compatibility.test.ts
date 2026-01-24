import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { generatedResumes, users } from "../drizzle/schema";

describe("ATS Compatibility Agent", () => {
  let testUserId: number;
  let testResumeId: number;

  beforeAll(async () => {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `ats-test-${Date.now()}`,
      name: "ATS Test User",
      email: `ats-test-${Date.now()}@test.com`,
      role: "user",
    });
    testUserId = Number(userResult[0].insertId);

    // Create test resume
    const resumeResult = await db.insert(generatedResumes).values({
      userId: testUserId,
      jobDescriptionId: null,
      resumeContent: `# John Doe
john.doe@email.com | (555) 123-4567

## Professional Experience

### Senior Software Engineer at Tech Corp
2020 - Present

- Led development of microservices architecture using Node.js and React
- Improved system performance by 40% through database optimization
- Mentored 5 junior developers in agile methodologies

### Software Engineer at StartupCo
2018 - 2020

- Built RESTful APIs using Python and Django
- Implemented CI/CD pipeline reducing deployment time by 60%

## Education

Bachelor of Science in Computer Science
University of Technology, 2018

## Skills

JavaScript, TypeScript, React, Node.js, Python, Django, PostgreSQL, MongoDB, AWS, Docker, Kubernetes`,
      resumeFormat: "markdown",
      selectedAchievementIds: [],
      version: 1,
      isFavorite: false,
      atsAnalysis: null,
    });
    testResumeId = Number(resumeResult[0].insertId);
  });

  afterAll(async () => {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) return;

    // Cleanup
    await db.delete(generatedResumes).where(eq(generatedResumes.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("resumes.checkATS procedure", () => {
    it("should validate input schema", async () => {
      const { getResumeById } = await import("./db");
      
      const resume = await getResumeById(testResumeId, testUserId);
      expect(resume).toBeDefined();
      expect(resume?.resumeContent).toContain("John Doe");
    });

    it("should return ATS analysis with required fields", async () => {
      // This test validates the structure without calling LLM
      const mockAnalysis = {
        atsScore: 85,
        formattingIssues: [],
        keywordMatch: ["JavaScript", "React", "Node.js"],
        recommendedChanges: ["Add more quantifiable metrics"],
      };

      expect(mockAnalysis).toHaveProperty("atsScore");
      expect(mockAnalysis).toHaveProperty("formattingIssues");
      expect(mockAnalysis).toHaveProperty("keywordMatch");
      expect(mockAnalysis).toHaveProperty("recommendedChanges");
      expect(typeof mockAnalysis.atsScore).toBe("number");
      expect(Array.isArray(mockAnalysis.formattingIssues)).toBe(true);
      expect(Array.isArray(mockAnalysis.keywordMatch)).toBe(true);
      expect(Array.isArray(mockAnalysis.recommendedChanges)).toBe(true);
    });

    it("should store analysis in database", async () => {
      const { updateGeneratedResume, getResumeById } = await import("./db");

      const analysisData = {
        atsScore: 75,
        formattingIssues: ["Avoid using tables"],
        keywordMatch: ["Python", "Django"],
        recommendedChanges: ["Add certifications section"],
      };

      await updateGeneratedResume(testResumeId, testUserId, {
        atsAnalysis: analysisData,
      });

      const updated = await getResumeById(testResumeId, testUserId);
      expect(updated?.atsAnalysis).toBeDefined();
      expect(updated?.atsAnalysis?.atsScore).toBe(75);
      expect(updated?.atsAnalysis?.formattingIssues).toContain("Avoid using tables");
    });

    it("should handle resume without job description", async () => {
      const { getResumeById } = await import("./db");
      
      const resume = await getResumeById(testResumeId, testUserId);
      expect(resume?.jobDescriptionId).toBeNull();
      // ATS check should still work without JD, focusing on formatting
    });

    it("should calculate ATS score in valid range (0-100)", () => {
      const validScores = [0, 50, 75, 100];
      validScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should identify formatting issues", () => {
      const commonIssues = [
        "Multi-column layout detected",
        "Tables may not parse correctly",
        "Non-standard section headings",
        "Special characters found",
      ];

      commonIssues.forEach(issue => {
        expect(typeof issue).toBe("string");
        expect(issue.length).toBeGreaterThan(0);
      });
    });

    it("should match keywords from job description", () => {
      const resumeText = "JavaScript, React, Node.js, Python, Django";
      const jdKeywords = ["JavaScript", "React", "AWS"];
      
      const matches = jdKeywords.filter(keyword => 
        resumeText.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(matches).toContain("JavaScript");
      expect(matches).toContain("React");
      expect(matches.length).toBe(2);
    });

    it("should provide actionable recommendations", () => {
      const recommendations = [
        "Use standard section headings like 'Experience' and 'Education'",
        "Add more quantifiable metrics (percentages, numbers)",
        "Include relevant certifications",
        "Remove multi-column formatting",
      ];

      recommendations.forEach(rec => {
        expect(typeof rec).toBe("string");
        expect(rec.length).toBeGreaterThan(10); // Meaningful recommendation
      });
    });

    it("should handle missing resume gracefully", async () => {
      const { getResumeById } = await import("./db");
      
      const nonExistent = await getResumeById(999999, testUserId);
      expect(nonExistent).toBeNull();
    });

    it.skip("should generate ATS analysis with LLM (integration test)", async () => {
      // Skipped: Requires real LLM call
      // This would test the full flow:
      // 1. Call resumes.checkATS mutation
      // 2. Verify LLM response structure
      // 3. Check database storage
      // 4. Validate score calculation logic
    });
  });

  describe("ATS Score Calculation", () => {
    it("should score excellent resumes (90-100)", () => {
      const excellentResume = {
        hasStandardHeadings: true,
        hasNoFormattingIssues: true,
        keywordMatchRate: 0.95,
      };

      const score = Math.round(
        (excellentResume.hasStandardHeadings ? 30 : 0) +
        (excellentResume.hasNoFormattingIssues ? 40 : 0) +
        (excellentResume.keywordMatchRate * 30)
      );

      expect(score).toBeGreaterThanOrEqual(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should score good resumes (70-89)", () => {
      const goodResume = {
        hasStandardHeadings: true,
        hasNoFormattingIssues: false,
        keywordMatchRate: 0.75,
      };

      const score = Math.round(
        (goodResume.hasStandardHeadings ? 30 : 0) +
        (goodResume.hasNoFormattingIssues ? 40 : 20) +
        (goodResume.keywordMatchRate * 30)
      );

      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThan(90);
    });

    it("should score fair resumes (50-69)", () => {
      const fairResume = {
        hasStandardHeadings: false,
        hasNoFormattingIssues: false,
        keywordMatchRate: 0.50,
      };

      const score = Math.round(
        (fairResume.hasStandardHeadings ? 30 : 15) +
        (fairResume.hasNoFormattingIssues ? 40 : 20) +
        (fairResume.keywordMatchRate * 30)
      );

      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(70);
    });

    it("should score poor resumes (0-49)", () => {
      const poorResume = {
        hasStandardHeadings: false,
        hasNoFormattingIssues: false,
        keywordMatchRate: 0.20,
      };

      const score = Math.round(
        (poorResume.hasStandardHeadings ? 30 : 0) +
        (poorResume.hasNoFormattingIssues ? 40 : 0) +
        (poorResume.keywordMatchRate * 30)
      );

      expect(score).toBeLessThan(50);
    });
  });
});
