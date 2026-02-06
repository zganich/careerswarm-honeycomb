#!/usr/bin/env node
/**
 * Test script for Phase 2: Application Package Generation Testing
 * This script creates test data and triggers package generation without requiring UI authentication
 */

import * as db from "./server/db.ts";

async function createTestData() {
  console.log("🔧 Creating test data...\n");

  // 1. Create test user
  const testUserData = {
    openId: "test-user-" + Date.now(),
    name: "Test User",
    email: "test@careerswarm.test",
    role: "user",
  };

  await db.upsertUser(testUserData);
  const user = await db.getUserByOpenId(testUserData.openId);
  const userId = user.id;
  console.log(`✅ Created test user: ${userId}`);

  // 2. Create user profile
  await db.upsertUserProfile(userId, {
    phone: "555-1234",
    locationCity: "San Francisco",
    locationState: "CA",
    locationCountry: "USA",
    linkedinUrl: "https://linkedin.com/in/testuser",
  });
  console.log(`✅ Created user profile`);

  // 3. Create work experience
  const workExpId = await db.createWorkExperience({
    userId: userId,
    companyName: "Acme Corp",
    jobTitle: "Software Engineer",
    startDate: new Date("2020-01-01"),
    endDate: new Date("2023-01-01"),
    description: "Built scalable APIs and microservices",
  });
  if (!workExpId) throw new Error("Failed to create work experience");
  console.log(`✅ Created work experience: ${workExpId}`);

  // 4. Create achievements
  const achievementDescriptions = [
    "Built scalable API serving 1M requests/day, reducing response time by 40%",
    "Led migration to microservices architecture, improving system reliability to 99.9%",
    "Mentored 5 junior engineers, 3 of whom were promoted within 1 year",
  ];

  for (const description of achievementDescriptions) {
    await db.createAchievement({
      userId: userId,
      workExperienceId: workExpId,
      description: description,
      category: "technical",
    });
  }
  console.log(`✅ Created 3 achievements`);

  // 5. Create skills
  const skillNames = ["React", "Node.js", "TypeScript", "System Design"];
  for (const name of skillNames) {
    await db.createSkill({
      userId: userId,
      skillName: name,
      skillCategory: "technical",
    });
  }
  console.log(`✅ Created 4 skills`);

  // 6. Create opportunity (job)
  const jobDescription = `We're looking for a Senior Software Engineer to join our team. 
    
Requirements:
- 5+ years of experience with React and Node.js
- Strong system design skills
- Experience with microservices architecture
- Excellent communication and mentorship abilities
- Track record of building scalable APIs

Responsibilities:
- Design and build scalable backend services
- Lead technical initiatives and mentor junior engineers
- Collaborate with product and design teams
- Optimize system performance and reliability`;

  const oppId = await db.createOpportunity({
    companyName: "Example Inc",
    roleTitle: "Senior Software Engineer",
    jobDescription: jobDescription,
    locationType: "remote",
    baseSalaryMin: 150000,
    baseSalaryMax: 200000,
  });
  if (!oppId) throw new Error("Failed to create opportunity");
  console.log(
    `✅ Created opportunity: ${oppId} (Senior Software Engineer at Example Inc)`
  );

  // 7. Create application
  console.log(
    `   - Creating application with userId=${userId}, opportunityId=${oppId}`
  );
  const appId = await db.createApplication({
    userId: userId,
    opportunityId: oppId,
    status: "draft",
  });
  if (!appId) throw new Error("Failed to create application");
  console.log(`✅ Created application: ${appId}\n`);

  return { userId, appId, oppId };
}

async function testPackageGeneration(userId, appId) {
  console.log("📦 Testing package generation...\n");

  try {
    // Import the agents
    const { generateTailoredResume } =
      await import("./server/agents/tailor.ts");
    const { generateOutreach } = await import("./server/agents/scribe.ts");
    const { assembleApplicationPackage } =
      await import("./server/agents/assembler.ts");

    // Fetch all required data using db helper functions
    const user = await db.getUserById(userId);
    const profile = await db.getUserProfile(userId);
    const workExperiences = await db.getWorkExperiences(userId);
    const achievements = await db.getAchievements(userId);
    const skillsList = await db.getSkills(userId);
    const application = await db.getApplicationById(appId);
    const opportunity = await db.getOpportunityById(application.opportunityId);

    console.log("✅ Fetched all required data");
    console.log(`   - User: ${user.name}`);
    console.log(`   - Work Experiences: ${workExperiences.length}`);
    console.log(`   - Achievements: ${achievements.length}`);
    console.log(`   - Skills: ${skillsList.length}`);
    console.log(
      `   - Opportunity: ${opportunity.roleTitle} at ${opportunity.companyName}\n`
    );

    // Build user profile for Tailor agent
    const tailorUserProfile = {
      fullName: user.name || "User",
      email: user.email || "",
      phone: profile?.phone || "",
      location:
        [
          profile?.locationCity,
          profile?.locationState,
          profile?.locationCountry,
        ]
          .filter(Boolean)
          .join(", ") || "",
      linkedIn: profile?.linkedinUrl || "",
      workExperience: workExperiences.map(exp => ({
        company: exp.companyName,
        title: exp.jobTitle,
        startDate: exp.startDate.toISOString().split("T")[0],
        endDate: exp.endDate
          ? exp.endDate.toISOString().split("T")[0]
          : "Present",
        achievements: achievements
          .filter(ach => ach.workExperienceId === exp.id)
          .map(ach => ach.description),
      })),
      skills: skillsList.map(s => s.name),
      education: [],
    };

    console.log("🤖 Step 1: Calling Tailor agent (resume generation)...");
    const resumeResult = await generateTailoredResume({
      userProfile: tailorUserProfile,
      jobDescription: opportunity.jobDescription || "",
      companyName: opportunity.companyName,
      roleTitle: opportunity.roleTitle,
    });
    console.log(`✅ Tailor agent completed`);
    console.log(`   - Confidence: ${resumeResult.confidence}%`);
    console.log(`   - Keywords matched: ${resumeResult.keywordMatches.length}`);
    console.log(
      `   - Resume length: ${resumeResult.resumeMarkdown.length} chars\n`
    );

    // Build user profile for Scribe agent
    const scribeUserProfile = {
      fullName: user.name || "User",
      currentTitle: workExperiences[0]?.jobTitle || "Professional",
      topAchievements: achievements.slice(0, 3).map(ach => ach.description),
    };

    console.log("🤖 Step 2: Calling Scribe agent (outreach generation)...");
    const outreachResult = await generateOutreach({
      userProfile: scribeUserProfile,
      companyName: opportunity.companyName,
      roleTitle: opportunity.roleTitle,
      strategicMemo: "Strategic analysis pending",
      jobDescription: opportunity.jobDescription || "",
    });
    console.log(`✅ Scribe agent completed`);
    console.log(
      `   - Cover letter length: ${outreachResult.coverLetter.length} chars`
    );
    console.log(
      `   - LinkedIn message length: ${outreachResult.linkedInMessage.length} chars\n`
    );

    console.log(
      "🤖 Step 3: Calling Assembler agent (file generation + S3 upload)..."
    );
    const packageResult = await assembleApplicationPackage({
      applicationId: appId.toString(),
      resumeMarkdown: resumeResult.resumeMarkdown,
      coverLetter: outreachResult.coverLetter,
      linkedInMessage: outreachResult.linkedInMessage,
      userFullName: user.name || "User",
      companyName: opportunity.companyName,
      roleTitle: opportunity.roleTitle,
    });
    console.log(`✅ Assembler agent completed\n`);

    // Update application with package URLs
    await db.updateApplication(appId, userId, {
      packageZipUrl: packageResult.packageUrl,
      resumePdfUrl: packageResult.files.resumePDF,
      resumeDocxUrl: packageResult.files.resumeDOCX,
      resumeTxtUrl: packageResult.files.resumeTXT,
      coverLetterTxtUrl: packageResult.files.coverLetterTXT,
      linkedinMessageTxtUrl: packageResult.files.linkedInMessageTXT,
      tailoredResumeText: resumeResult.resumeMarkdown,
      coverLetterText: outreachResult.coverLetter,
      linkedinMessage: outreachResult.linkedInMessage,
    });

    console.log("✅ Updated application with package URLs\n");

    return { resumeResult, outreachResult, packageResult };
  } catch (error) {
    console.error("❌ Error during package generation:", error);
    throw error;
  }
}

async function verifyResults(appId) {
  console.log("🔍 Verifying results in database...\n");

  // Check application record
  const app = await db.getApplicationById(appId);

  console.log("📊 Application Record:");
  console.log(
    `   - packageZipUrl: ${app.packageZipUrl ? "✅ " + app.packageZipUrl : "❌ NULL"}`
  );
  console.log(
    `   - resumePdfUrl: ${app.resumePdfUrl ? "✅ " + app.resumePdfUrl : "❌ NULL"}`
  );
  console.log(
    `   - resumeDocxUrl: ${app.resumeDocxUrl ? "✅ " + app.resumeDocxUrl : "❌ NULL"}`
  );
  console.log(
    `   - resumeTxtUrl: ${app.resumeTxtUrl ? "✅ " + app.resumeTxtUrl : "❌ NULL"}`
  );
  console.log(
    `   - coverLetterTxtUrl: ${app.coverLetterTxtUrl ? "✅ " + app.coverLetterTxtUrl : "❌ NULL"}`
  );
  console.log(
    `   - linkedinMessageTxtUrl: ${app.linkedinMessageTxtUrl ? "✅ " + app.linkedinMessageTxtUrl : "❌ NULL"}`
  );
  console.log(
    `   - tailoredResumeText: ${app.tailoredResumeText ? "✅ " + app.tailoredResumeText.length + " chars" : "❌ NULL"}`
  );
  console.log(
    `   - coverLetterText: ${app.coverLetterText ? "✅ " + app.coverLetterText.length + " chars" : "❌ NULL"}`
  );
  console.log(
    `   - linkedinMessage: ${app.linkedinMessage ? "✅ " + app.linkedinMessage.length + " chars" : "❌ NULL"}`
  );

  const allFieldsPopulated =
    app.packageZipUrl &&
    app.resumePdfUrl &&
    app.resumeDocxUrl &&
    app.resumeTxtUrl &&
    app.coverLetterTxtUrl &&
    app.linkedinMessageTxtUrl &&
    app.tailoredResumeText &&
    app.coverLetterText &&
    app.linkedinMessage;

  console.log(
    `\n${allFieldsPopulated ? "✅ All fields populated successfully!" : "❌ Some fields are missing"}\n`
  );

  return allFieldsPopulated;
}

async function main() {
  console.log("🚀 Phase 2: Application Package Generation Testing\n");
  console.log("=".repeat(60) + "\n");

  try {
    // Step 1: Create test data
    const { userId, appId, oppId } = await createTestData();

    // Step 2: Test package generation
    const results = await testPackageGeneration(userId, appId);

    // Step 3: Verify results
    const success = await verifyResults(appId);

    console.log("=".repeat(60));
    console.log(
      `\n${success ? "✅ PHASE 2 TEST: PASSED" : "❌ PHASE 2 TEST: FAILED"}\n`
    );

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
