import { describe, it, expect } from "vitest";
import {
  TaskComplexity,
  Model,
  selectModel,
  getModelForTask,
  TaskType,
  estimateCost,
  estimateTokens,
} from "./modelRouter";

describe("Model Router", () => {
  describe("selectModel", () => {
    it("should select GPT-4o-mini for simple tasks", () => {
      const model = selectModel(TaskComplexity.SIMPLE);
      expect(model).toBe(Model.GPT_4O_MINI);
    });

    it("should select GPT-4o for medium tasks", () => {
      const model = selectModel(TaskComplexity.MEDIUM);
      expect(model).toBe(Model.GPT_4O);
    });

    it("should select Claude 3.5 Sonnet for complex tasks", () => {
      const model = selectModel(TaskComplexity.COMPLEX);
      expect(model).toBe(Model.CLAUDE_35_SONNET);
    });
  });

  describe("getModelForTask", () => {
    it("should route simple tasks to GPT-4o-mini", () => {
      expect(getModelForTask("IMPACT_METER_SCORING")).toBe(Model.GPT_4O_MINI);
      expect(getModelForTask("POWER_VERB_DETECTION")).toBe(Model.GPT_4O_MINI);
      expect(getModelForTask("METRIC_DETECTION")).toBe(Model.GPT_4O_MINI);
      expect(getModelForTask("KEYWORD_MATCHING")).toBe(Model.GPT_4O_MINI);
    });

    it("should route medium tasks to GPT-4o", () => {
      expect(getModelForTask("SKILL_EXTRACTION")).toBe(Model.GPT_4O);
      expect(getModelForTask("JD_ANALYSIS")).toBe(Model.GPT_4O);
      expect(getModelForTask("ACHIEVEMENT_PARSING")).toBe(Model.GPT_4O);
      expect(getModelForTask("COMPANY_RESEARCH")).toBe(Model.GPT_4O);
    });

    it("should route complex tasks to Claude 3.5 Sonnet", () => {
      expect(getModelForTask("STAR_TO_XYZ_TRANSFORMATION")).toBe(
        Model.CLAUDE_35_SONNET
      );
      expect(getModelForTask("COVER_LETTER_GENERATION")).toBe(
        Model.CLAUDE_35_SONNET
      );
      expect(getModelForTask("RESUME_TAILORING")).toBe(Model.CLAUDE_35_SONNET);
      expect(getModelForTask("INTERVIEW_PREP")).toBe(Model.CLAUDE_35_SONNET);
    });
  });

  describe("estimateCost", () => {
    it("should calculate cost for GPT-4o-mini correctly", () => {
      const cost = estimateCost(Model.GPT_4O_MINI, 1000, 500);
      // (1000 * 0.15 + 500 * 0.60) / 1_000_000 = 0.00045
      expect(cost).toBeCloseTo(0.00045, 6);
    });

    it("should calculate cost for GPT-4o correctly", () => {
      const cost = estimateCost(Model.GPT_4O, 1000, 500);
      // (1000 * 2.50 + 500 * 10.00) / 1_000_000 = 0.0075
      expect(cost).toBeCloseTo(0.0075, 6);
    });

    it("should calculate cost for Claude 3.5 Sonnet correctly", () => {
      const cost = estimateCost(Model.CLAUDE_35_SONNET, 1000, 500);
      // (1000 * 3.00 + 500 * 15.00) / 1_000_000 = 0.0105
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it("should show significant cost savings with GPT-4o-mini", () => {
      const miniCost = estimateCost(Model.GPT_4O_MINI, 10000, 5000);
      const gpt4oCost = estimateCost(Model.GPT_4O, 10000, 5000);
      const claudeCost = estimateCost(Model.CLAUDE_35_SONNET, 10000, 5000);

      // GPT-4o-mini should be ~90% cheaper than GPT-4o
      expect(miniCost).toBeLessThan(gpt4oCost * 0.1);

      // GPT-4o-mini should be ~95% cheaper than Claude
      expect(miniCost).toBeLessThan(claudeCost * 0.05);
    });
  });

  describe("estimateTokens", () => {
    it("should estimate tokens from text length", () => {
      const text =
        "This is a test sentence with about twenty characters per word.";
      const tokens = estimateTokens(text);

      // Rough estimate: 1 token ≈ 4 characters
      // 63 characters / 4 ≈ 16 tokens
      expect(tokens).toBeGreaterThan(10);
      expect(tokens).toBeLessThan(20);
    });

    it("should handle empty strings", () => {
      const tokens = estimateTokens("");
      expect(tokens).toBe(0);
    });

    it("should scale linearly with text length", () => {
      const shortText = "Hello world";
      const longText = shortText.repeat(10);

      const shortTokens = estimateTokens(shortText);
      const longTokens = estimateTokens(longText);

      expect(longTokens).toBeGreaterThan(shortTokens * 9);
      expect(longTokens).toBeLessThan(shortTokens * 11);
    });
  });

  describe("Cost optimization strategy", () => {
    it("should demonstrate 90% cost savings for simple tasks", () => {
      const inputTokens = 500;
      const outputTokens = 200;

      const optimizedCost = estimateCost(
        Model.GPT_4O_MINI,
        inputTokens,
        outputTokens
      );
      const unoptimizedCost = estimateCost(
        Model.GPT_4O,
        inputTokens,
        outputTokens
      );

      const savings =
        ((unoptimizedCost - optimizedCost) / unoptimizedCost) * 100;
      expect(savings).toBeGreaterThan(90);
    });

    it("should show cumulative savings over many requests", () => {
      const requests = 1000; // 1000 requests per day
      const avgInput = 800;
      const avgOutput = 400;

      const miniCostPerRequest = estimateCost(
        Model.GPT_4O_MINI,
        avgInput,
        avgOutput
      );
      const gpt4oCostPerRequest = estimateCost(
        Model.GPT_4O,
        avgInput,
        avgOutput
      );

      const miniTotalCost = miniCostPerRequest * requests;
      const gpt4oTotalCost = gpt4oCostPerRequest * requests;

      const monthlySavings = (gpt4oTotalCost - miniTotalCost) * 30;

      // Should save significant money per month
      expect(monthlySavings).toBeGreaterThan(10); // At least $10/month savings
    });
  });
});
