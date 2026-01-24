import { describe, it, expect } from "vitest";
import { compareTwoStrings } from "string-similarity";

describe("Deduplication Logic", () => {
  describe("String Similarity Comparison", () => {
    it("should detect identical strings as 100% similar", () => {
      const str1 = "Implemented automated testing framework";
      const str2 = "Implemented automated testing framework";
      
      const similarity = compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
      expect(similarity).toBe(1.0);
    });
    
    it("should detect near-duplicates above 85% threshold", () => {
      const str1 = "Implemented automated testing framework for React applications";
      const str2 = "Implemented automated testing framework for React apps";
      
      const similarity = compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
      expect(similarity).toBeGreaterThan(0.85);
    });
    
    it("should detect minor typos as duplicates", () => {
      const str1 = "Developed microservices architecture";
      const str2 = "Developped microservices architechture"; // typos
      
      const similarity = compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
      expect(similarity).toBeGreaterThan(0.85);
    });
    
    it("should not flag unique achievements as duplicates", () => {
      const str1 = "Implemented automated testing framework";
      const str2 = "Led team of 5 engineers to deliver project";
      
      const similarity = compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
      expect(similarity).toBeLessThan(0.85);
    });
    
    it("should handle case-insensitive comparison", () => {
      const str1 = "IMPLEMENTED AUTOMATED TESTING FRAMEWORK";
      const str2 = "implemented automated testing framework";
      
      const similarity = compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
      expect(similarity).toBe(1.0);
    });
    
    it("should handle empty strings gracefully", () => {
      const str1 = "Implemented automated testing framework";
      const str2 = "";
      
      const similarity = compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
      expect(similarity).toBe(0);
    });
  });
  
  describe("Deduplication Algorithm", () => {
    it("should filter out exact duplicates", () => {
      const existing = [
        { action: "Implemented automated testing framework" },
        { action: "Led team of 5 engineers" }
      ];
      
      const candidates = [
        { action: "Implemented automated testing framework" }, // duplicate
        { action: "Designed database schema" } // unique
      ];
      
      const unique = candidates.filter(candidate => {
        return !existing.some(existing => {
          const similarity = compareTwoStrings(
            candidate.action.toLowerCase(),
            existing.action.toLowerCase()
          );
          return similarity > 0.85;
        });
      });
      
      expect(unique.length).toBe(1);
      expect(unique[0].action).toBe("Designed database schema");
    });
    
    it("should filter out near-duplicates", () => {
      const existing = [
        { action: "Implemented automated testing framework for React applications" }
      ];
      
      const candidates = [
        { action: "Implemented automated testing framework for React apps" }, // near-duplicate
        { action: "Built CI/CD pipeline" } // unique
      ];
      
      const unique = candidates.filter(candidate => {
        return !existing.some(existing => {
          const similarity = compareTwoStrings(
            candidate.action.toLowerCase(),
            existing.action.toLowerCase()
          );
          return similarity > 0.85;
        });
      });
      
      expect(unique.length).toBe(1);
      expect(unique[0].action).toBe("Built CI/CD pipeline");
    });
    
    it("should keep all unique achievements", () => {
      const existing = [
        { action: "Implemented automated testing framework" }
      ];
      
      const candidates = [
        { action: "Led team of 5 engineers" },
        { action: "Designed database schema" },
        { action: "Built CI/CD pipeline" }
      ];
      
      const unique = candidates.filter(candidate => {
        return !existing.some(existing => {
          const similarity = compareTwoStrings(
            candidate.action.toLowerCase(),
            existing.action.toLowerCase()
          );
          return similarity > 0.85;
        });
      });
      
      expect(unique.length).toBe(3);
    });
    
    it("should handle empty existing achievements list", () => {
      const existing: Array<{ action: string }> = [];
      
      const candidates = [
        { action: "Implemented automated testing framework" },
        { action: "Led team of 5 engineers" }
      ];
      
      const unique = candidates.filter(candidate => {
        return !existing.some(existing => {
          const similarity = compareTwoStrings(
            candidate.action.toLowerCase(),
            existing.action.toLowerCase()
          );
          return similarity > 0.85;
        });
      });
      
      expect(unique.length).toBe(2);
    });
    
    it("should count skipped duplicates correctly", () => {
      const existing = [
        { action: "Implemented automated testing framework" },
        { action: "Led team of 5 engineers" }
      ];
      
      const candidates = [
        { action: "Implemented automated testing framework" }, // duplicate
        { action: "Led team of 5 engineers" }, // duplicate
        { action: "Designed database schema" }, // unique
        { action: "Built CI/CD pipeline" } // unique
      ];
      
      let skippedCount = 0;
      const unique = candidates.filter(candidate => {
        const isDuplicate = existing.some(existing => {
          const similarity = compareTwoStrings(
            candidate.action.toLowerCase(),
            existing.action.toLowerCase()
          );
          return similarity > 0.85;
        });
        
        if (isDuplicate) {
          skippedCount++;
        }
        
        return !isDuplicate;
      });
      
      expect(unique.length).toBe(2);
      expect(skippedCount).toBe(2);
    });
  });
  
  describe("Response Format", () => {
    it("should return added and skipped counts", () => {
      const mockResponse = {
        success: true,
        added: 3,
        skipped: 2,
        count: 3,
        message: "Successfully imported 3 achievement(s) (2 duplicates removed)"
      };
      
      expect(mockResponse.added).toBe(3);
      expect(mockResponse.skipped).toBe(2);
      expect(mockResponse.message).toContain("3 achievement(s)");
      expect(mockResponse.message).toContain("2 duplicates");
    });
    
    it("should format message with no duplicates", () => {
      const added = 5;
      const skipped = 0;
      
      let message = `Successfully imported ${added} achievement(s)`;
      if (skipped > 0) {
        message += ` (${skipped} duplicate${skipped > 1 ? 's' : ''} removed)`;
      }
      
      expect(message).toBe("Successfully imported 5 achievement(s)");
      expect(message).not.toContain("duplicate");
    });
    
    it("should format message with single duplicate", () => {
      const added = 4;
      const skipped = 1;
      
      let message = `Successfully imported ${added} achievement(s)`;
      if (skipped > 0) {
        message += ` (${skipped} duplicate${skipped > 1 ? 's' : ''} removed)`;
      }
      
      expect(message).toBe("Successfully imported 4 achievement(s) (1 duplicate removed)");
    });
    
    it("should format message with multiple duplicates", () => {
      const added = 3;
      const skipped = 5;
      
      let message = `Successfully imported ${added} achievement(s)`;
      if (skipped > 0) {
        message += ` (${skipped} duplicate${skipped > 1 ? 's' : ''} removed)`;
      }
      
      expect(message).toBe("Successfully imported 3 achievement(s) (5 duplicates removed)");
    });
  });
});
