import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  achievements,
  skills,
  workExperiences,
  userProfiles,
  superpowers,
  uploadedResumes,
  targetPreferences,
  opportunities,
  applications,
  agentExecutionLogs,
  notifications,
  certifications,
  education,
  awards,
  savedOpportunities,
  applicationNotes,
  agentMetrics,
  languages,
  volunteerExperiences,
  projects,
  publications,
  securityClearances,
  type Achievement,
  type Skill,
  type WorkExperience,
  type UserProfile,
  type Superpower,
  type UploadedResume,
  type TargetPreferences,
  type Opportunity,
  type Application,
  type AgentExecutionLog,
  type Notification,
  type Certification,
  type Education,
  type Award,
  type SavedOpportunity,
  type ApplicationNote,
  type AgentMetric,
  type InsertAgentMetric,
  type Language,
  type InsertLanguage,
  type VolunteerExperience,
  type InsertVolunteerExperience,
  type Project,
  type InsertProject,
  type Publication,
  type InsertPublication,
  type SecurityClearance,
  type InsertSecurityClearance,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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

// ================================================================
// USER OPERATIONS
// ================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const fields = ["name", "email", "loginMethod"] as const;
  fields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });

  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0] || null;
}

export async function updateUserOnboardingStep(
  userId: number,
  step: number,
  completed: boolean = false
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ onboardingStep: step, onboardingCompleted: completed })
    .where(eq(users.id, userId));
}

// ================================================================
// USER PROFILE OPERATIONS
// ================================================================

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function upsertUserProfile(
  userId: number,
  data: Partial<UserProfile>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserProfile(userId);
  if (existing) {
    await db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...data } as any);
  }
}

// ================================================================
// WORK EXPERIENCE OPERATIONS
// ================================================================

export async function getWorkExperiences(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(workExperiences)
    .where(eq(workExperiences.userId, userId))
    .orderBy(desc(workExperiences.startDate));
}

export async function createWorkExperience(data: Partial<WorkExperience>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(workExperiences).values(data as any);
  return result.insertId;
}

export async function updateWorkExperience(
  id: number,
  userId: number,
  data: Partial<WorkExperience>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(workExperiences)
    .set(data)
    .where(and(eq(workExperiences.id, id), eq(workExperiences.userId, userId)));
}

export async function deleteWorkExperience(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(workExperiences)
    .where(and(eq(workExperiences.id, id), eq(workExperiences.userId, userId)));
}

// ================================================================
// ACHIEVEMENT OPERATIONS
// ================================================================

export async function getAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.importanceScore));
}

export async function getAchievementsByWorkExperience(
  workExperienceId: number
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(achievements)
    .where(eq(achievements.workExperienceId, workExperienceId))
    .orderBy(desc(achievements.importanceScore));
}

export async function createAchievement(data: Partial<Achievement>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(achievements).values(data as any);
  return result.insertId;
}

export async function updateAchievement(
  id: number,
  userId: number,
  data: Partial<Achievement>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(achievements)
    .set(data)
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function deleteAchievement(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(achievements)
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function incrementAchievementUsage(achievementId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(achievements)
    .set({
      timesUsed: sql`${achievements.timesUsed} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(achievements.id, achievementId));
}

// ================================================================
// SKILL OPERATIONS
// ================================================================

export async function getSkills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skills).where(eq(skills.userId, userId));
}

export async function createSkill(data: Partial<Skill>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(skills).values(data as any);
  return result.insertId;
}

export async function deleteSkill(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(skills)
    .where(and(eq(skills.id, id), eq(skills.userId, userId)));
}

// ================================================================
// UPLOADED RESUME OPERATIONS
// ================================================================

export async function getUploadedResumes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(uploadedResumes)
    .where(eq(uploadedResumes.userId, userId))
    .orderBy(desc(uploadedResumes.uploadedAt));
}

export async function createUploadedResume(data: Partial<UploadedResume>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(uploadedResumes).values(data as any);
  return result.insertId;
}

export async function updateResumeProcessingStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  extractedText?: string,
  error?: string
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(uploadedResumes)
    .set({
      processingStatus: status,
      extractedText,
      processingError: error,
      processedAt:
        status === "completed" || status === "failed" ? new Date() : undefined,
    })
    .where(eq(uploadedResumes.id, id));
}

// ================================================================
// SUPERPOWER OPERATIONS
// ================================================================

export async function getSuperpowers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(superpowers)
    .where(eq(superpowers.userId, userId))
    .orderBy(superpowers.rank);
}

export async function upsertSuperpowers(
  userId: number,
  superpowersData: Array<{
    title: string;
    evidenceAchievementIds: number[];
    rank: number;
  }>
) {
  const db = await getDb();
  if (!db) return;

  // Delete existing superpowers
  await db.delete(superpowers).where(eq(superpowers.userId, userId));

  // Insert new superpowers
  for (const sp of superpowersData) {
    await db.insert(superpowers).values({ userId, ...sp } as any);
  }
}

// ================================================================
// TARGET PREFERENCES OPERATIONS
// ================================================================

export async function getTargetPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(targetPreferences)
    .where(eq(targetPreferences.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function upsertTargetPreferences(
  userId: number,
  data: Partial<TargetPreferences>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getTargetPreferences(userId);
  if (existing) {
    await db
      .update(targetPreferences)
      .set(data)
      .where(eq(targetPreferences.userId, userId));
  } else {
    await db.insert(targetPreferences).values({ userId, ...data } as any);
  }
}

// ================================================================
// OPPORTUNITY OPERATIONS
// ================================================================

export async function getOpportunities(filters?: {
  isActive?: boolean;
  companyStage?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(opportunities);

  if (filters?.isActive !== undefined) {
    query = query.where(eq(opportunities.isActive, filters.isActive)) as any;
  }

  return query.orderBy(desc(opportunities.discoveredAt));
}

export async function getOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createOpportunity(data: Partial<Opportunity>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(opportunities).values(data as any);
  return result.insertId;
}

// ================================================================
// APPLICATION OPERATIONS
// ================================================================

export async function getApplications(
  userId: number,
  filters?: { status?: string }
) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(applications.userId, userId)];
  if (filters?.status) {
    conditions.push(eq(applications.status, filters.status as any));
  }

  return db
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.createdAt));
}

export async function getApplicationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);
  return result[0] || null;
}

export async function createApplication(data: Partial<Application>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(applications).values(data as any);
  return result.insertId;
}

export async function updateApplication(
  id: number,
  userId: number,
  data: Partial<Application>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(applications)
    .set(data)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

// ================================================================
// AGENT EXECUTION LOG OPERATIONS
// ================================================================

export async function logAgentExecution(data: Partial<AgentExecutionLog>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(agentExecutionLogs).values(data as any);
  return result.insertId;
}

export async function getAgentExecutionLogs(
  userId: number,
  agentName?: string
) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(agentExecutionLogs.userId, userId)];
  if (agentName) {
    conditions.push(eq(agentExecutionLogs.agentName, agentName));
  }

  return db
    .select()
    .from(agentExecutionLogs)
    .where(and(...conditions))
    .orderBy(desc(agentExecutionLogs.executedAt))
    .limit(100);
}

// ================================================================
// NOTIFICATION OPERATIONS
// ================================================================

export async function getNotifications(
  userId: number,
  unreadOnly: boolean = false
) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function createNotification(data: Partial<Notification>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(notifications).values(data as any);
  return result.insertId;
}

export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

// ================================================================
// CERTIFICATION OPERATIONS
// ================================================================

export async function createCertification(data: Partial<Certification>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(certifications).values(data as any);
  return result.insertId;
}

export async function getCertifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(certifications)
    .where(eq(certifications.userId, userId))
    .orderBy(desc(certifications.issueYear));
}

// ================================================================
// EDUCATION OPERATIONS
// ================================================================

export async function createEducation(data: Partial<Education>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(education).values(data as any);
  return result.insertId;
}

export async function getEducation(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(education)
    .where(eq(education.userId, userId))
    .orderBy(desc(education.graduationYear));
}

// ================================================================
// AWARD OPERATIONS
// ================================================================

export async function createAward(data: Partial<Award>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(awards).values(data as any);
  return result.insertId;
}

export async function getAwards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(awards)
    .where(eq(awards.userId, userId))
    .orderBy(desc(awards.year));
}

// Note: Superpower operations are already defined earlier in this file
// Note: Update/Delete operations for work experiences, achievements, and skills are already defined earlier in this file

// ================================================================
// SAVED OPPORTUNITIES OPERATIONS
// ================================================================

export async function saveOpportunity(
  userId: number,
  opportunityId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) return null;

  // Check if already saved
  const existing = await db
    .select()
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result: any = await db.insert(savedOpportunities).values({
    userId,
    opportunityId,
    notes: notes || null,
  });
  return result.insertId;
}

export async function unsaveOpportunity(userId: number, opportunityId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    );
}

export async function getSavedOpportunities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(savedOpportunities)
    .where(eq(savedOpportunities.userId, userId))
    .orderBy(desc(savedOpportunities.createdAt));
}

export async function isOpportunitySaved(
  userId: number,
  opportunityId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1);
  return result.length > 0;
}

// ================================================================
// APPLICATION NOTES OPERATIONS
// ================================================================

export async function getApplicationNotes(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(applicationNotes)
    .where(eq(applicationNotes.applicationId, applicationId))
    .orderBy(desc(applicationNotes.createdAt));
}

export async function createApplicationNote(
  applicationId: number,
  userId: number,
  noteText: string
) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db
    .insert(applicationNotes)
    .values({ applicationId, userId, noteText });
  return result.insertId;
}

export async function deleteApplicationNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(applicationNotes)
    .where(
      and(eq(applicationNotes.id, noteId), eq(applicationNotes.userId, userId))
    );
}

// ================================================================
// SUPERPOWER OPERATIONS
// ================================================================

export async function updateSuperpower(
  id: number,
  data: {
    title: string;
    description: string;
    evidence: string;
    evidenceAchievementIds: number[];
  }
) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(superpowers)
    .set({
      title: data.title,
      description: data.description,
      evidence: data.evidence,
      evidenceAchievementIds: data.evidenceAchievementIds,
      updatedAt: new Date(),
    })
    .where(eq(superpowers.id, id));
  return id;
}

export async function createSuperpower(data: {
  userId: number;
  title: string;
  description: string;
  evidence: string;
  evidenceAchievementIds: number[];
}) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(superpowers).values({
    userId: data.userId,
    title: data.title,
    description: data.description,
    evidence: data.evidence,
    evidenceAchievementIds: data.evidenceAchievementIds,
  });
  return result.insertId;
}

// ================================================================
// TARGET PREFERENCES OPERATIONS
// ================================================================

export async function updateTargetPreferences(
  userId: number,
  data: {
    roleTitles?: string[];
    industries?: string[];
    companyStages?: string[];
    locationType?: "remote" | "hybrid" | "onsite" | "flexible";
    allowedCities?: string[];
    minimumBaseSalary?: number | null;
    dealBreakers?: string[];
  }
) {
  const db = await getDb();
  if (!db) return null;

  // Get existing preferences
  const existing = await db
    .select()
    .from(targetPreferences)
    .where(eq(targetPreferences.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    // Create new preferences if they don't exist
    const insertData: any = {
      userId,
      roleTitles: data.roleTitles || [],
      industries: data.industries || [],
      companyStages: data.companyStages || [],
      locationType: data.locationType || "remote",
      allowedCities: data.allowedCities || [],
      minimumBaseSalary: data.minimumBaseSalary,
      dealBreakers: data.dealBreakers || [],
    };
    await db.insert(targetPreferences).values(insertData);
  } else {
    // Update existing preferences
    await db
      .update(targetPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(targetPreferences.userId, userId));
  }

  return userId;
}

// ================================================================
// AGENT METRICS OPERATIONS (Production Monitoring)
// ================================================================

export async function insertAgentMetric(
  metric: InsertAgentMetric
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(agentMetrics).values(metric);
}

export async function getAgentMetrics(options?: {
  agentType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AgentMetric[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(agentMetrics);

  // Apply filters if provided
  const conditions = [];
  if (options?.agentType) {
    conditions.push(eq(agentMetrics.agentType, options.agentType));
  }
  if (options?.startDate) {
    conditions.push(sql`${agentMetrics.createdAt} >= ${options.startDate}`);
  }
  if (options?.endDate) {
    conditions.push(sql`${agentMetrics.createdAt} <= ${options.endDate}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(agentMetrics.createdAt)) as any;

  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }

  return await query;
}

export async function getAgentPerformanceStats(agentType?: string) {
  const db = await getDb();
  if (!db) return null;

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let query = sql`
    SELECT 
      agentType,
      COUNT(*) as totalExecutions,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successfulExecutions,
      AVG(duration) as avgDuration,
      MIN(duration) as minDuration,
      MAX(duration) as maxDuration,
      (SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as successRate
    FROM agentMetrics
    WHERE createdAt >= ${last24h}
  `;

  if (agentType) {
    query = sql`${query} AND agentType = ${agentType}`;
  }

  query = sql`${query} GROUP BY agentType`;

  const result = await db.execute(query);
  return result;
}

// ================================================================
// MASTER PROFILE - ADDITIONAL SECTIONS
// ================================================================

// Languages
export async function getUserLanguages(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(languages)
    .where(eq(languages.userId, userId))
    .orderBy(desc(languages.createdAt));
}

export async function insertLanguage(data: InsertLanguage) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(languages).values(data);
  return result;
}

export async function updateLanguage(
  id: number,
  userId: number,
  data: Partial<InsertLanguage>
) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(languages)
    .set(data)
    .where(and(eq(languages.id, id), eq(languages.userId, userId)));
}

export async function deleteLanguage(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .delete(languages)
    .where(and(eq(languages.id, id), eq(languages.userId, userId)));
}

// Volunteer Experiences
export async function getUserVolunteerExperiences(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(volunteerExperiences)
    .where(eq(volunteerExperiences.userId, userId))
    .orderBy(desc(volunteerExperiences.createdAt));
}

export async function insertVolunteerExperience(
  data: InsertVolunteerExperience
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(volunteerExperiences).values(data);
  return result;
}

export async function updateVolunteerExperience(
  id: number,
  userId: number,
  data: Partial<InsertVolunteerExperience>
) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(volunteerExperiences)
    .set(data)
    .where(
      and(
        eq(volunteerExperiences.id, id),
        eq(volunteerExperiences.userId, userId)
      )
    );
}

export async function deleteVolunteerExperience(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .delete(volunteerExperiences)
    .where(
      and(
        eq(volunteerExperiences.id, id),
        eq(volunteerExperiences.userId, userId)
      )
    );
}

// Projects
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function insertProject(data: InsertProject) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(projects).values(data);
  return result;
}

export async function updateProject(
  id: number,
  userId: number,
  data: Partial<InsertProject>
) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(projects)
    .set(data)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function deleteProject(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

// Publications
export async function getUserPublications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(publications)
    .where(eq(publications.userId, userId))
    .orderBy(desc(publications.createdAt));
}

export async function insertPublication(data: InsertPublication) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(publications).values(data);
  return result;
}

export async function updatePublication(
  id: number,
  userId: number,
  data: Partial<InsertPublication>
) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(publications)
    .set(data)
    .where(and(eq(publications.id, id), eq(publications.userId, userId)));
}

export async function deletePublication(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .delete(publications)
    .where(and(eq(publications.id, id), eq(publications.userId, userId)));
}

// Security Clearances
export async function getUserSecurityClearances(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(securityClearances)
    .where(eq(securityClearances.userId, userId))
    .orderBy(desc(securityClearances.createdAt));
}

export async function insertSecurityClearance(data: InsertSecurityClearance) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(securityClearances).values(data);
  return result;
}

export async function updateSecurityClearance(
  id: number,
  userId: number,
  data: Partial<InsertSecurityClearance>
) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(securityClearances)
    .set(data)
    .where(
      and(eq(securityClearances.id, id), eq(securityClearances.userId, userId))
    );
}

export async function deleteSecurityClearance(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .delete(securityClearances)
    .where(
      and(eq(securityClearances.id, id), eq(securityClearances.userId, userId))
    );
}

// ================================================================
// ALIAS FUNCTIONS (for backward compatibility with routers.ts)
// ================================================================

export const createLanguage = insertLanguage;
export const createVolunteerExperience = insertVolunteerExperience;
export const createProject = insertProject;
export const createPublication = insertPublication;
export const createSecurityClearance = insertSecurityClearance;

// ================================================================
// REFERRAL / FLYWHEEL OPERATIONS
// ================================================================

export async function setUserReferredBy(
  userId: number,
  referrerUserId: number
) {
  const db = await getDb();
  if (!db) return;

  // Add referredBy column if user doesn't already have a referrer
  // Note: This requires a 'referredBy' column in users table, or we store in user profile
  await db
    .update(users)
    .set({
      // Store referrer info - using a JSON field or adding a column
      // For now, store in profile metadata
    } as any)
    .where(eq(users.id, userId));
}

export async function grantReferrer30DaysProIfReferred(userId: number) {
  const db = await getDb();
  if (!db) return;

  // This function would:
  // 1. Check if user has a referrer
  // 2. If so, extend referrer's Pro subscription by 30 days
  // For now, this is a stub - actual implementation depends on how referrals are tracked
  console.log(`[Flywheel] Checking referral bonus for user ${userId}`);
}

// ================================================================
// GTM / B2B OPERATIONS (Stubs for pipeline-processor)
// ================================================================

export async function getB2BLeads(
  limit: number = 100,
  outreachStatus?: string
) {
  // Stub - B2B leads table not yet created
  console.log(
    `[GTM] getB2BLeads called with limit=${limit}, status=${outreachStatus}`
  );
  return [] as any[];
}

export async function upsertB2BLeadByKey(data: any) {
  // Stub - B2B leads table not yet created
  console.log(`[GTM] upsertB2BLeadByKey called`);
  return null;
}

export async function updateB2BLead(leadId: number, data: any) {
  // Stub - B2B leads table not yet created
  console.log(`[GTM] updateB2BLead called for lead ${leadId}`);
  return null;
}

export async function createOutreachDraft(
  leadId: number,
  channel: string,
  subject: string | null,
  body: string,
  campaignId?: string
) {
  // Stub - Outreach drafts table not yet created
  console.log(`[GTM] createOutreachDraft called for lead ${leadId}`);
  return null;
}

export async function getOutreachDraftsUnsent(limit: number = 10) {
  // Stub - Outreach drafts table not yet created
  console.log(`[GTM] getOutreachDraftsUnsent called with limit=${limit}`);
  return [] as any[];
}

export async function markOutreachDraftSent(draftId: number) {
  // Stub - Outreach drafts table not yet created
  console.log(`[GTM] markOutreachDraftSent called for draft ${draftId}`);
  return null;
}

export async function createGtmRun(
  runType: string,
  input: any,
  output: any,
  status: string
) {
  // Stub - GTM runs table not yet created
  console.log(`[GTM] createGtmRun called for type ${runType}`);
  return null;
}

export async function createGtmContent(data: {
  channel: string;
  contentType: string;
  title: string;
  body: string;
  metadata?: any;
}) {
  // Stub - GTM content table not yet created
  console.log(`[GTM] createGtmContent called for channel ${data.channel}`);
  return null;
}

export async function createGtmJobRun(
  step: string,
  channel: string | null,
  jobId: string
) {
  // Stub - GTM job runs table not yet created
  console.log(`[GTM] createGtmJobRun called for step ${step}`);
  return null;
}

export async function finishGtmJobRun(
  runId: any,
  status: string,
  message?: string,
  metadata?: string
) {
  // Stub - GTM job runs table not yet created
  console.log(`[GTM] finishGtmJobRun called for run ${runId}`);
  return null;
}

// ================================================================
// JD BUILDER OPERATIONS (Stubs)
// ================================================================

export async function getJdUsageForPeriod(
  userId: number,
  periodStart: string,
  periodEnd: string
) {
  // Stub - JD usage tracking not yet implemented
  console.log(`[JD] getJdUsageForPeriod called for user ${userId}`);
  return 0;
}

export async function createJdDraft(data: {
  userId: number;
  companyId: number | null;
  roleTitle: string;
  companyName: string;
  department: string | null;
  inputJson: any;
  outputSummary: string;
  outputResponsibilities: string | string[];
  outputRequirements: string | string[];
  outputBenefits: string | string[];
  fullText: string;
}) {
  // Stub - JD drafts table not yet created
  console.log(
    `[JD] createJdDraft called for ${data.roleTitle} at ${data.companyName}`
  );
  return 1; // Return fake ID
}

export async function incrementJdUsage(
  userId: number,
  companyId: number | null,
  periodStart: string,
  periodEnd: string
) {
  // Stub - JD usage tracking not yet implemented
  console.log(`[JD] incrementJdUsage called for user ${userId}`);
  return null;
}

export async function getJdDraftsByUserId(userId: number, limit: number = 50) {
  // Stub - JD drafts table not yet created
  console.log(`[JD] getJdDraftsByUserId called for user ${userId}`);
  return [] as any[];
}

export async function getJdDraftById(
  id: number,
  userId: number
): Promise<{ fullText?: string } | null> {
  // Stub - JD drafts table not yet created
  console.log(`[JD] getJdDraftById called for id ${id}`);
  return null;
}

// ================================================================
// APPLICATION USAGE TRACKING (Free tier limits)
// ================================================================

const FREE_TIER_APP_LIMIT = 5;

/**
 * Check if user can generate an application (based on tier and usage)
 * Returns { allowed: true } or { allowed: false, reason, applicationsUsed, limit }
 */
export async function checkApplicationLimit(userId: number): Promise<{
  allowed: boolean;
  reason?: string;
  applicationsUsed?: number;
  limit?: number;
  tier?: string;
}> {
  const db = await getDb();
  if (!db) return { allowed: false, reason: "Database not available" };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return { allowed: false, reason: "User not found" };

  // Pro users have unlimited applications
  if (user.subscriptionTier === "pro") {
    return { allowed: true, tier: "pro" };
  }

  // Check if we need to reset the monthly counter
  const now = new Date();
  const resetAt = user.applicationsResetAt ? new Date(user.applicationsResetAt) : new Date(0);
  const monthsSinceReset =
    (now.getFullYear() - resetAt.getFullYear()) * 12 +
    (now.getMonth() - resetAt.getMonth());

  let applicationsUsed = user.applicationsThisMonth ?? 0;

  // Reset counter if it's a new month
  if (monthsSinceReset >= 1) {
    await db
      .update(users)
      .set({
        applicationsThisMonth: 0,
        applicationsResetAt: now,
      })
      .where(eq(users.id, userId));
    applicationsUsed = 0;
  }

  // Check limit
  if (applicationsUsed >= FREE_TIER_APP_LIMIT) {
    return {
      allowed: false,
      reason: `You've used all ${FREE_TIER_APP_LIMIT} free applications this month. Upgrade to Pro for unlimited applications.`,
      applicationsUsed,
      limit: FREE_TIER_APP_LIMIT,
      tier: "free",
    };
  }

  return {
    allowed: true,
    applicationsUsed,
    limit: FREE_TIER_APP_LIMIT,
    tier: "free",
  };
}

/**
 * Increment the user's application count (call after successful generation)
 */
export async function incrementApplicationCount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.subscriptionTier === "pro") return;

  await db
    .update(users)
    .set({
      applicationsThisMonth: (user.applicationsThisMonth ?? 0) + 1,
    })
    .where(eq(users.id, userId));
}

/**
 * Get user's current application usage
 */
export async function getApplicationUsage(userId: number): Promise<{
  used: number;
  limit: number;
  tier: string;
  unlimited: boolean;
}> {
  const db = await getDb();
  if (!db) return { used: 0, limit: FREE_TIER_APP_LIMIT, tier: "free", unlimited: false };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return { used: 0, limit: FREE_TIER_APP_LIMIT, tier: "free", unlimited: false };

  if (user.subscriptionTier === "pro") {
    return { used: 0, limit: 0, tier: "pro", unlimited: true };
  }

  return {
    used: user.applicationsThisMonth ?? 0,
    limit: FREE_TIER_APP_LIMIT,
    tier: "free",
    unlimited: false,
  };
}
