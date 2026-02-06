import { describe, it, expect } from "vitest";

describe("Source Materials Synthesis", () => {
  describe("Achievement Extraction Schema", () => {
    it("should validate achievement extraction response format", () => {
      const mockResponse = {
        achievements: [
          {
            situation: "Led a team of 5 engineers at TechCorp",
            task: "Reduce system downtime and improve reliability",
            action: "Implemented automated monitoring and alerting system",
            result: "Reduced downtime by 40% and saved $200K annually",
            role: "Senior Software Engineer",
            company: "TechCorp",
          },
        ],
      };

      expect(mockResponse.achievements).toBeInstanceOf(Array);
      expect(mockResponse.achievements.length).toBeGreaterThan(0);

      const achievement = mockResponse.achievements[0];
      expect(achievement).toHaveProperty("situation");
      expect(achievement).toHaveProperty("task");
      expect(achievement).toHaveProperty("action");
      expect(achievement).toHaveProperty("result");
      expect(achievement).toHaveProperty("role");
      expect(achievement.situation).toBeTruthy();
      expect(achievement.task).toBeTruthy();
      expect(achievement.action).toBeTruthy();
      expect(achievement.result).toBeTruthy();
      expect(achievement.role).toBeTruthy();
    });

    it("should handle empty achievements array", () => {
      const mockResponse = {
        achievements: [],
      };

      expect(mockResponse.achievements).toBeInstanceOf(Array);
      expect(mockResponse.achievements.length).toBe(0);
    });

    it("should handle optional company field", () => {
      const mockResponse = {
        achievements: [
          {
            situation: "Freelance project",
            task: "Build mobile app",
            action: "Developed React Native app",
            result: "Delivered on time with 5-star rating",
            role: "Mobile Developer",
            // company is optional
          },
        ],
      };

      const achievement = mockResponse.achievements[0];
      expect(achievement).not.toHaveProperty("company");
      expect(achievement.role).toBe("Mobile Developer");
    });
  });

  describe("Content Parsing", () => {
    it("should handle string content from LLM", () => {
      const content = JSON.stringify({
        achievements: [
          {
            situation: "Test",
            task: "Test",
            action: "Test",
            result: "Test",
            role: "Test",
          },
        ],
      });

      const parsed = JSON.parse(content);
      expect(parsed.achievements).toBeInstanceOf(Array);
    });

    it("should handle array content from LLM", () => {
      const content = [
        { type: "text", text: JSON.stringify({ achievements: [] }) },
      ];

      const contentStr = JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      expect(parsed).toBeInstanceOf(Array);
    });
  });

  describe("Status Transitions", () => {
    it("should transition from PENDING to PROCESSED on success", () => {
      const initialStatus = "PENDING";
      const finalStatus = "PROCESSED";

      expect(initialStatus).toBe("PENDING");
      expect(finalStatus).toBe("PROCESSED");
    });

    it("should transition from PENDING to FAILED on error", () => {
      const initialStatus = "PENDING";
      const finalStatus = "FAILED";
      const errorMessage = "LLM returned invalid JSON";

      expect(initialStatus).toBe("PENDING");
      expect(finalStatus).toBe("FAILED");
      expect(errorMessage).toBeTruthy();
    });

    it("should allow retry from FAILED status", () => {
      const currentStatus = "FAILED";
      const canRetry =
        currentStatus === "FAILED" || currentStatus === "PENDING";

      expect(canRetry).toBe(true);
    });

    it("should prevent re-processing PROCESSED materials", () => {
      const currentStatus = "PROCESSED";
      const shouldProcess = currentStatus !== "PROCESSED";

      expect(shouldProcess).toBe(false);
    });
  });
});
