import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, achievements, skills,
  workExperiences, userProfiles, superpowers,
  uploadedResumes, targetPreferences,
  opportunities, applications, agentExecutionLogs, notifications,
  certifications, education, awards, savedOpportunities, applicationNotes,
  b2bLeads, gtmRuns, gtmContent, outreachDrafts, jdDrafts, jdUsage, gtmJobRuns,
  type Achievement, type Skill, type WorkExperience, type UserProfile,
  type Superpower, type UploadedResume, type TargetPreferences,
  type Opportunity, type Application, type AgentExecutionLog, type Notification,
  type Certification, type Education, type Award, type SavedOpportunity, type ApplicationNote,
  type InsertB2BLead, type InsertJdDraft
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

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] || null;
}

export async function updateUserOnboardingStep(userId: number, step: number, completed: boolean = false) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ onboardingStep: step, onboardingCompleted: completed })
    .where(eq(users.id, userId));
}

/** Set referredByUserId for a user (call when user lands with ref=referrerUserId). Only set if not already set. */
export async function setUserReferredBy(userId: number, referrerUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u || u.referredByUserId != null) return;
  if (referrerUserId === userId) return; // no self-referral
  await db.update(users).set({ referredByUserId: referrerUserId }).where(eq(users.id, userId));
}

/** Flywheel: grant referrer 30 days Pro when referred user completes first resume ingestion (onboarding complete). */
export async function grantReferrer30DaysProIfReferred(newUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const [newUser] = await db.select().from(users).where(eq(users.id, newUserId)).limit(1);
  if (!newUser?.referredByUserId) return;
  const referrerId = newUser.referredByUserId;
  const [referrer] = await db.select().from(users).where(eq(users.id, referrerId)).limit(1);
  if (!referrer) return;
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const existingEnd = referrer.subscriptionEndDate ? new Date(referrer.subscriptionEndDate).getTime() : 0;
  const newEnd = existingEnd > now.getTime() ? new Date(existingEnd + 30 * 24 * 60 * 60 * 1000) : thirtyDaysLater;
  await db.update(users)
    .set({ subscriptionTier: "pro", subscriptionEndDate: newEnd })
    .where(eq(users.id, referrerId));
}

// ================================================================
// USER PROFILE OPERATIONS
// ================================================================

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0] || null;
}

export async function upsertUserProfile(userId: number, data: Partial<UserProfile>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserProfile(userId);
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
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
  return db.select().from(workExperiences)
    .where(eq(workExperiences.userId, userId))
    .orderBy(desc(workExperiences.startDate));
}

export async function createWorkExperience(data: Partial<WorkExperience>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(workExperiences).values(data as any);
  return result.insertId;
}

export async function updateWorkExperience(id: number, userId: number, data: Partial<WorkExperience>) {
  const db = await getDb();
  if (!db) return;
  await db.update(workExperiences)
    .set(data)
    .where(and(eq(workExperiences.id, id), eq(workExperiences.userId, userId)));
}

export async function deleteWorkExperience(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(workExperiences)
    .where(and(eq(workExperiences.id, id), eq(workExperiences.userId, userId)));
}

// ================================================================
// ACHIEVEMENT OPERATIONS
// ================================================================

export async function getAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.importanceScore));
}

export async function getAchievementsByWorkExperience(workExperienceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements)
    .where(eq(achievements.workExperienceId, workExperienceId))
    .orderBy(desc(achievements.importanceScore));
}

export async function createAchievement(data: Partial<Achievement>) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(achievements).values(data as any);
  return result.insertId;
}

export async function updateAchievement(id: number, userId: number, data: Partial<Achievement>) {
  const db = await getDb();
  if (!db) return;
  await db.update(achievements)
    .set(data)
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function deleteAchievement(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(achievements)
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function incrementAchievementUsage(achievementId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(achievements)
    .set({ 
      timesUsed: sql`${achievements.timesUsed} + 1`,
      lastUsedAt: new Date()
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
  await db.delete(skills)
    .where(and(eq(skills.id, id), eq(skills.userId, userId)));
}

// ================================================================
// UPLOADED RESUME OPERATIONS
// ================================================================

export async function getUploadedResumes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(uploadedResumes)
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
  status: 'pending' | 'processing' | 'completed' | 'failed',
  extractedText?: string,
  error?: string
) {
  const db = await getDb();
  if (!db) return;
  await db.update(uploadedResumes).set({ 
    processingStatus: status,
    extractedText,
    processingError: error,
    processedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
  }).where(eq(uploadedResumes.id, id));
}

// ================================================================
// SUPERPOWER OPERATIONS
// ================================================================

export async function getSuperpowers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(superpowers)
    .where(eq(superpowers.userId, userId))
    .orderBy(superpowers.rank);
}

export async function upsertSuperpowers(userId: number, superpowersData: Array<{ title: string; evidenceAchievementIds: number[]; rank: number }>) {
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
  const result = await db.select().from(targetPreferences)
    .where(eq(targetPreferences.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function upsertTargetPreferences(userId: number, data: Partial<TargetPreferences>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getTargetPreferences(userId);
  if (existing) {
    await db.update(targetPreferences).set(data).where(eq(targetPreferences.userId, userId));
  } else {
    await db.insert(targetPreferences).values({ userId, ...data } as any);
  }
}

// ================================================================
// OPPORTUNITY OPERATIONS
// ================================================================

export async function getOpportunities(filters?: { isActive?: boolean; companyStage?: string }) {
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
  const result = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
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

export async function getApplications(userId: number, filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(applications.userId, userId)];
  if (filters?.status) {
    conditions.push(eq(applications.status, filters.status as any));
  }
  
  return db.select().from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.createdAt));
}

export async function getApplicationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(applications)
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

export async function updateApplication(id: number, userId: number, data: Partial<Application>) {
  const db = await getDb();
  if (!db) return;
  await db.update(applications)
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

export async function getAgentExecutionLogs(userId: number, agentName?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(agentExecutionLogs.userId, userId)];
  if (agentName) {
    conditions.push(eq(agentExecutionLogs.agentName, agentName));
  }
  
  return db.select().from(agentExecutionLogs)
    .where(and(...conditions))
    .orderBy(desc(agentExecutionLogs.executedAt))
    .limit(100);
}

// ================================================================
// NOTIFICATION OPERATIONS
// ================================================================

export async function getNotifications(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }
  
  return db.select().from(notifications)
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
  await db.update(notifications)
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
  return db.select().from(certifications)
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
  return db.select().from(education)
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
  return db.select().from(awards)
    .where(eq(awards.userId, userId))
    .orderBy(desc(awards.year));
}

// Note: Superpower operations are already defined earlier in this file
// Note: Update/Delete operations for work experiences, achievements, and skills are already defined earlier in this file


// ================================================================
// SAVED OPPORTUNITIES OPERATIONS
// ================================================================

export async function saveOpportunity(userId: number, opportunityId: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if already saved
  const existing = await db.select().from(savedOpportunities)
    .where(and(eq(savedOpportunities.userId, userId), eq(savedOpportunities.opportunityId, opportunityId)))
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
  await db.delete(savedOpportunities)
    .where(and(eq(savedOpportunities.userId, userId), eq(savedOpportunities.opportunityId, opportunityId)));
}

export async function getSavedOpportunities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedOpportunities)
    .where(eq(savedOpportunities.userId, userId))
    .orderBy(desc(savedOpportunities.createdAt));
}

export async function isOpportunitySaved(userId: number, opportunityId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(savedOpportunities)
    .where(and(eq(savedOpportunities.userId, userId), eq(savedOpportunities.opportunityId, opportunityId)))
    .limit(1);
  return result.length > 0;
}

// ================================================================
// APPLICATION NOTES OPERATIONS
// ================================================================

export async function getApplicationNotes(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applicationNotes)
    .where(eq(applicationNotes.applicationId, applicationId))
    .orderBy(desc(applicationNotes.createdAt));
}

export async function createApplicationNote(applicationId: number, userId: number, noteText: string) {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.insert(applicationNotes).values({ applicationId, userId, noteText });
  return result.insertId;
}

export async function deleteApplicationNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(applicationNotes)
    .where(and(eq(applicationNotes.id, noteId), eq(applicationNotes.userId, userId)));
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
  await db.update(superpowers)
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
  const existing = await db.select().from(targetPreferences).where(eq(targetPreferences.userId, userId)).limit(1);
  
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
    await db.update(targetPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(targetPreferences.userId, userId));
  }
  
  return userId;
}

// ================================================================
// GTM & B2B LEADS
// ================================================================

export async function createB2BLead(data: InsertB2BLead) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(b2bLeads).values(data);
  return result[0].insertId;
}

export async function upsertB2BLeadByKey(data: InsertB2BLead & { idempotencyKey: string }) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(b2bLeads).where(eq(b2bLeads.idempotencyKey!, data.idempotencyKey)).limit(1);
  if (existing[0]) {
    await db.update(b2bLeads).set(data).where(eq(b2bLeads.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(b2bLeads).values(data);
  return result[0].insertId;
}

export async function getB2BLeads(limit = 100, outreachStatus?: string) {
  const db = await getDb();
  if (!db) return [];
  if (outreachStatus) {
    return db.select().from(b2bLeads).where(eq(b2bLeads.outreachStatus, outreachStatus as any)).orderBy(desc(b2bLeads.firstSeenAt)).limit(limit);
  }
  return db.select().from(b2bLeads).orderBy(desc(b2bLeads.firstSeenAt)).limit(limit);
}

export async function updateB2BLead(id: number, data: Partial<typeof b2bLeads.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(b2bLeads).set(data).where(eq(b2bLeads.id, id));
}

// ================================================================
// GTM RUNS & CONTENT
// ================================================================

export async function createGtmRun(runType: string, inputJson: unknown, outputJson: unknown, status: "success" | "failed" | "partial", errorMessage?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(gtmRuns).values({ runType, inputJson: inputJson as any, outputJson: outputJson as any, status, errorMessage });
  return result[0].insertId;
}

export async function createGtmContent(data: { runId?: number; channel: string; contentType?: string; title?: string; body?: string; metadata?: unknown }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(gtmContent).values(data as any);
  return result[0].insertId;
}

export async function createOutreachDraft(leadId: number, channel: string, subject: string | null, body: string, campaignId?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(outreachDrafts).values({ leadId, channel, subject, body, campaignId });
  return result[0].insertId;
}

export async function getOutreachDraftsUnsent(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outreachDrafts).where(isNull(outreachDrafts.sentAt)).limit(limit);
}

export async function markOutreachDraftSent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(outreachDrafts).set({ sentAt: new Date() }).where(eq(outreachDrafts.id, id));
}

// ================================================================
// JD BUILDER (B2B)
// ================================================================

export async function createJdDraft(data: InsertJdDraft) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(jdDrafts).values(data);
  return result[0].insertId;
}

export async function getJdDraftsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jdDrafts).where(eq(jdDrafts.userId, userId)).orderBy(desc(jdDrafts.createdAt)).limit(limit);
}

export async function getJdDraftById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jdDrafts).where(and(eq(jdDrafts.id, id), eq(jdDrafts.userId, userId))).limit(1);
  return result[0] || null;
}

export async function getJdUsageForPeriod(userId: number, periodStart: string, periodEnd: string) {
  const db = await getDb();
  if (!db) return 0;
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const result = await db.select().from(jdUsage).where(
    and(eq(jdUsage.userId, userId), eq(jdUsage.periodStart, start), eq(jdUsage.periodEnd, end))
  ).limit(1);
  return result[0]?.jdsGenerated ?? 0;
}

export async function incrementJdUsage(userId: number, companyId: number | null, periodStart: string, periodEnd: string) {
  const db = await getDb();
  if (!db) return;
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const existing = await db.select().from(jdUsage).where(
    and(eq(jdUsage.userId, userId), eq(jdUsage.periodStart, start), eq(jdUsage.periodEnd, end))
  ).limit(1);
  if (existing[0]) {
    await db.update(jdUsage).set({ jdsGenerated: existing[0].jdsGenerated + 1 }).where(eq(jdUsage.id, existing[0].id));
  } else {
    await db.insert(jdUsage).values({ userId, companyId, periodStart: start, periodEnd: end, jdsGenerated: 1 });
  }
}

// ================================================================
// GTM JOB RUNS (Observability)
// ================================================================

export async function createGtmJobRun(jobType: string, channel: string | null, jobId?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(gtmJobRuns).values({ jobType, channel, jobId, status: "running" });
  return result[0].insertId;
}

export async function finishGtmJobRun(id: number, status: "success" | "failed" | "skipped", errorMessage?: string, payloadSummary?: string) {
  const db = await getDb();
  if (!db) return;
  const run = await db.select().from(gtmJobRuns).where(eq(gtmJobRuns.id, id)).limit(1);
  if (!run[0]) return;
  const startedAt = run[0].startedAt ? new Date(run[0].startedAt).getTime() : Date.now();
  const durationMs = Date.now() - startedAt;
  await db.update(gtmJobRuns).set({ finishedAt: new Date(), status, errorMessage, payloadSummary, durationMs }).where(eq(gtmJobRuns.id, id));
}
