import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Applications Router", () => {
  // Use a test user ID (in real tests, this would be created via OAuth)
  const testUserId = 1;
  let testJobId: number;
  let testResumeId: number;
  let testApplicationId: number;

  beforeAll(async () => {
    // Create a test job
    testJobId = await db.createJob({
      userId: testUserId,
      companyId: null,
      title: "Senior Software Engineer",
      companyName: "Test Company",
      location: "Remote",
      jobUrl: "https://example.com/job",
      description: "Test job description",
      platform: "manual",
      postedDate: null,
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: "USD",
      employmentType: "full-time",
      experienceLevel: "senior",
      requiredSkills: ["JavaScript", "React"],
      preferredSkills: ["TypeScript"],
      responsibilities: ["Build features"],
      benefits: ["Health insurance"],
      qualificationScore: 85,
      matchedSkills: ["JavaScript", "React"],
      missingSkills: [],
      status: "new",
    });

    // Create a test resume
    testResumeId = await db.createGeneratedResume({
      userId: testUserId,
      jobDescriptionId: null,
      resumeContent: "Test resume content",
      selectedAchievementIds: [],
      resumeFormat: "markdown",
      version: 1,
      isFavorite: false,
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testApplicationId) {
      try {
        await db.deleteApplication(testApplicationId, testUserId);
      } catch (e) {
        // Already deleted in test
      }
    }
  });

  it("should complete full application lifecycle", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test", name: "Test User", email: "test@example.com", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // 1. Create an application
    const createResult = await caller.applications.create({
      jobId: testJobId,
      resumeId: testResumeId,
    });

    expect(createResult).toHaveProperty("id");
    expect(createResult.id).toBeGreaterThan(0);
    testApplicationId = createResult.id;

    // 2. List applications
    const applications = await caller.applications.list();
    expect(Array.isArray(applications)).toBe(true);
    expect(applications.length).toBeGreaterThan(0);
    
    const app = applications.find(a => a.id === testApplicationId);
    expect(app).toBeDefined();
    expect(app?.status).toBe("draft");

    // 3. Get application by ID
    const application = await caller.applications.get({ id: testApplicationId });
    expect(application).toBeDefined();
    expect(application?.id).toBe(testApplicationId);
    expect(application?.jobId).toBe(testJobId);
    expect(application?.resumeId).toBe(testResumeId);

    // 4. Update application status
    const updateStatusResult = await caller.applications.updateStatus({
      applicationId: testApplicationId,
      status: "submitted",
    });

    expect(updateStatusResult.success).toBe(true);

    // Verify the status was updated
    const updatedApp = await caller.applications.get({ id: testApplicationId });
    expect(updatedApp?.status).toBe("submitted");

    // 5. Update application notes
    const testNotes = "Spoke with recruiter on 1/24/2026";
    const updateNotesResult = await caller.applications.update({
      applicationId: testApplicationId,
      notes: testNotes,
    });

    expect(updateNotesResult.success).toBe(true);

    // Verify notes were updated
    const appWithNotes = await caller.applications.get({ id: testApplicationId });
    expect(appWithNotes?.notes).toBe(testNotes);

    // 6. Delete the application
    const deleteResult = await caller.applications.delete({
      applicationId: testApplicationId,
    });

    expect(deleteResult.success).toBe(true);

    // Verify application was deleted
    const deletedApp = await caller.applications.get({ id: testApplicationId });
    expect(deletedApp).toBeUndefined();
    
    testApplicationId = 0; // Mark as deleted so cleanup doesn't try to delete again
  });
});
