import { describe, it, expect } from "vitest";
import { searchJobs } from "./services/scout";

describe("Scout Agent", () => {
  describe("Mock Scraper", () => {
    it("should return jobs matching the query", async () => {
      const jobs = await searchJobs("Software Engineer");

      expect(jobs.length).toBeGreaterThan(0);
      expect(
        jobs.every(
          job =>
            job.title.toLowerCase().includes("engineer") ||
            job.description.toLowerCase().includes("engineer")
        )
      ).toBe(true);
    });

    it("should filter by location", async () => {
      const jobs = await searchJobs("Engineer", "San Francisco");

      expect(jobs.length).toBeGreaterThan(0);
      expect(
        jobs.every(
          job =>
            job.location.toLowerCase().includes("san francisco") ||
            job.location.toLowerCase() === "remote"
        )
      ).toBe(true);
    });

    it("should return remote jobs for any location", async () => {
      const jobs = await searchJobs("Product Manager", "New York");

      const hasRemote = jobs.some(
        job => job.location.toLowerCase() === "remote"
      );
      expect(hasRemote).toBe(true);
    });

    it("should return up to 15 results", async () => {
      const jobs = await searchJobs("Engineer");

      expect(jobs.length).toBeLessThanOrEqual(15);
    });

    it("should include required job fields", async () => {
      const jobs = await searchJobs("Senior");

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach(job => {
        expect(job).toHaveProperty("title");
        expect(job).toHaveProperty("company");
        expect(job).toHaveProperty("location");
        expect(job).toHaveProperty("description");
        expect(job).toHaveProperty("url");
        expect(typeof job.title).toBe("string");
        expect(typeof job.company).toBe("string");
        expect(typeof job.location).toBe("string");
        expect(typeof job.description).toBe("string");
        expect(typeof job.url).toBe("string");
      });
    });

    it("should return variety of seniority levels", async () => {
      const jobs = await searchJobs("Engineer");

      const seniorityLevels = new Set(
        jobs.map(job => job.experienceLevel).filter(Boolean)
      );
      expect(seniorityLevels.size).toBeGreaterThan(1);
    });
  });

  describe("Scout Procedure Integration", () => {
    it.skip("should qualify jobs and create applications", async () => {
      // This test requires:
      // 1. User with achievements in database
      // 2. LLM API calls (expensive, skip in CI)
      // 3. Database write permissions
      // Manual testing steps:
      // 1. Login to app
      // 2. Add 3-5 achievements
      // 3. Go to Applications page
      // 4. Click "Launch Scout Mission"
      // 5. Enter "Software Engineer" and location
      // 6. Verify:
      //    - Loading state shows progress
      //    - Success message shows qualified count
      //    - New applications appear in SCOUTED column
      //    - Applications have match scores > 70
    });
  });
});
