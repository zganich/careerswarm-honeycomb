import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, pastEmployerJobs, achievements, skills, achievementSkills,
  jobDescriptions, generatedResumes, powerVerbs,
  jobs, applications, companies, contacts,
  sourceMaterials, type InsertSourceMaterial,
  type Achievement, type Skill, type JobDescription, type GeneratedResume,
  type Job, type InsertJob, type Application, type InsertApplication,
  type Company, type InsertCompany, type Contact, type InsertContact
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const fields = ["name", "email", "loginMethod", "currentRole", "currentCompany"] as const;
  fields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });

  if (user.yearsOfExperience !== undefined) {
    values.yearsOfExperience = user.yearsOfExperience;
    updateSet.yearsOfExperience = user.yearsOfExperience;
  }

  if (user.targetRoles !== undefined) {
    values.targetRoles = user.targetRoles;
    updateSet.targetRoles = user.targetRoles;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// Achievements
export async function createAchievement(data: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(achievements).values(data);
  return Number(result[0].insertId);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.createdAt));
}

export async function getAchievementById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(achievements).where(and(eq(achievements.id, id), eq(achievements.userId, userId))).limit(1);
  return result[0] || null;
}

export async function updateAchievement(id: number, userId: number, data: Partial<Achievement>) {
  const db = await getDb();
  if (!db) return;
  await db.update(achievements).set(data).where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function deleteAchievement(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(achievements).where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function searchAchievements(userId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements).where(
    and(
      eq(achievements.userId, userId),
      sql`(${achievements.situation} LIKE ${`%${query}%`} OR ${achievements.task} LIKE ${`%${query}%`} OR ${achievements.action} LIKE ${`%${query}%`} OR ${achievements.result} LIKE ${`%${query}%`})`
    )
  ).orderBy(desc(achievements.impactMeterScore));
}

// Skills
export async function createSkill(data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(skills).values(data);
  return Number(result[0].insertId);
}

export async function getUserSkills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skills).where(eq(skills.userId, userId)).orderBy(desc(skills.isProven));
}

export async function linkSkillToAchievement(achievementId: number, skillId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(achievementSkills).values({ achievementId, skillId });
}

// Job Descriptions
export async function createJobDescription(data: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(jobDescriptions).values(data);
  return Number(result[0].insertId);
}

export async function getUserJobDescriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobDescriptions).where(eq(jobDescriptions.userId, userId)).orderBy(desc(jobDescriptions.createdAt));
}

export async function getJobDescriptionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobDescriptions).where(and(eq(jobDescriptions.id, id), eq(jobDescriptions.userId, userId))).limit(1);
  return result[0] || null;
}

export async function updateJobDescription(id: number, userId: number, data: Partial<JobDescription>) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobDescriptions).set(data).where(and(eq(jobDescriptions.id, id), eq(jobDescriptions.userId, userId)));
}

// Generated Resumes
export async function createGeneratedResume(data: Omit<GeneratedResume, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(generatedResumes).values(data);
  return Number(result[0].insertId);
}

export async function getUserResumes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generatedResumes).where(eq(generatedResumes.userId, userId)).orderBy(desc(generatedResumes.createdAt));
}

export async function getResumeById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(generatedResumes).where(and(eq(generatedResumes.id, id), eq(generatedResumes.userId, userId))).limit(1);
  return result[0] || null;
}

export async function updateGeneratedResume(id: number, userId: number, data: Partial<Omit<GeneratedResume, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(generatedResumes)
    .set(data)
    .where(and(eq(generatedResumes.id, id), eq(generatedResumes.userId, userId)));
}

// Power Verbs
export async function getPowerVerbs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(powerVerbs);
}

export async function seedPowerVerbs() {
  const db = await getDb();
  if (!db) return;
  
  const verbs = [
    { verb: "Generated", category: "Results", strengthScore: 9 },
    { verb: "Engineered", category: "Technical", strengthScore: 9 },
    { verb: "Reduced", category: "Efficiency", strengthScore: 8 },
    { verb: "Accelerated", category: "Speed", strengthScore: 8 },
    { verb: "Scaled", category: "Growth", strengthScore: 9 },
    { verb: "Optimized", category: "Efficiency", strengthScore: 8 },
    { verb: "Launched", category: "Initiative", strengthScore: 8 },
    { verb: "Architected", category: "Technical", strengthScore: 9 },
    { verb: "Transformed", category: "Change", strengthScore: 9 },
    { verb: "Drove", category: "Leadership", strengthScore: 7 },
    { verb: "Increased", category: "Growth", strengthScore: 7 },
    { verb: "Improved", category: "Enhancement", strengthScore: 6 },
    { verb: "Led", category: "Leadership", strengthScore: 7 },
    { verb: "Managed", category: "Leadership", strengthScore: 5 },
    { verb: "Developed", category: "Creation", strengthScore: 6 },
    { verb: "Created", category: "Creation", strengthScore: 6 },
    { verb: "Designed", category: "Creation", strengthScore: 7 },
    { verb: "Implemented", category: "Execution", strengthScore: 7 },
    { verb: "Established", category: "Foundation", strengthScore: 7 },
    { verb: "Spearheaded", category: "Leadership", strengthScore: 8 },
  ];

  for (const verb of verbs) {
    try {
      await db.insert(powerVerbs).values(verb);
    } catch (e) {
      // Ignore duplicates
    }
  }
}

// Past Employer Jobs
export async function createPastEmployerJob(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(pastEmployerJobs).values(data);
  const insertId = result[0]?.insertId || result.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  return { id: Number(insertId) };
}

export async function getUserPastJobs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pastEmployerJobs).where(eq(pastEmployerJobs.userId, userId)).orderBy(desc(pastEmployerJobs.startDate));
}

export async function getPastJobById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pastEmployerJobs)
    .where(and(eq(pastEmployerJobs.id, id), eq(pastEmployerJobs.userId, userId)))
    .limit(1);
  return result[0];
}

export async function deletePastJob(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pastEmployerJobs).where(
    and(eq(pastEmployerJobs.id, id), eq(pastEmployerJobs.userId, userId))
  );
}

// ===== Job Automation Functions =====

export async function createJob(data: Omit<InsertJob, "id">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(jobs).values(data);
  const insertId = result[0]?.insertId || result.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  return Number(insertId);
}

export async function getUserJobs(userId: number): Promise<Job[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
}

export async function getJobById(id: number, userId: number): Promise<Job | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId))).limit(1);
  return result[0];
}

export async function updateJob(id: number, userId: number, data: Partial<Job>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set(data).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

export async function deleteJob(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

export async function bulkCreateJobs(jobsData: Omit<InsertJob, "id">[]): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const result: any = await db.insert(jobs).values(jobsData);
  const insertId = result[0]?.insertId || result.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  const firstId = Number(insertId);
  return Array.from({ length: jobsData.length }, (_, i) => firstId + i);
}

export async function createApplication(data: Omit<InsertApplication, "id">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(applications).values(data);
  const insertId = result[0]?.insertId || result.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  return Number(insertId);
}

export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      application: applications,
      job: jobs,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt));
  
  return result.map(r => ({
    ...r.application,
    job: r.job || undefined,
  }));
}

export async function getApplicationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      application: applications,
      job: jobs,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);
  
  if (!result[0]) return undefined;
  
  return {
    ...result[0].application,
    job: result[0].job || undefined,
  };
}

export async function updateApplication(id: number, userId: number, data: Partial<Application>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(applications).set(data).where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

export async function deleteApplication(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(applications).where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

export async function createCompany(data: Omit<InsertCompany, "id">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(companies).values(data);
  const insertId = result[0]?.insertId || result.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  return Number(insertId);
}

export async function getCompanyByName(name: string): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.name, name)).limit(1);
  return result[0];
}

export async function getOrCreateCompany(name: string): Promise<number> {
  const existing = await getCompanyByName(name);
  if (existing) return existing.id;

  return createCompany({
    name,
    domain: null,
    logoUrl: null,
    industry: null,
    size: null,
    founded: null,
    headquarters: null,
    description: null,
    mission: null,
    values: null,
    culture: null,
    techStack: null,
    recentNews: null,
    fundingRounds: null,
    isHiring: false,
    openPositions: 0,
    lastResearchedAt: null,
  });
}

// ============================================================================
// Source Materials
// ============================================================================

export async function createSourceMaterial(data: InsertSourceMaterial): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(sourceMaterials).values(data);
  const insertId = result[0]?.insertId || result.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  return Number(insertId);
}

export async function getSourceMaterialsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sourceMaterials).where(eq(sourceMaterials.userId, userId)).orderBy(desc(sourceMaterials.createdAt));
}

export async function getSourceMaterialById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(sourceMaterials).where(and(eq(sourceMaterials.id, id), eq(sourceMaterials.userId, userId))).limit(1);
  return results[0] || null;
}

export async function deleteSourceMaterial(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sourceMaterials).where(and(eq(sourceMaterials.id, id), eq(sourceMaterials.userId, userId)));
}

export async function updateSourceMaterialStatus(id: number, status: "PENDING" | "PROCESSED" | "FAILED", errorMessage: string | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(sourceMaterials).set({ status, errorMessage }).where(eq(sourceMaterials.id, id));
}
