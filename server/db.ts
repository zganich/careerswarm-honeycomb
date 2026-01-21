import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, pastEmployerJobs, achievements, skills, achievementSkills,
  jobDescriptions, generatedResumes, powerVerbs,
  type Achievement, type Skill, type JobDescription, type GeneratedResume
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
  return { id: Number(result.insertId) };
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
