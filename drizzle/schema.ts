import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Subscription and billing
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  
  // Extended profile fields
  currentRole: text("currentRole"),
  currentCompany: text("currentCompany"),
  yearsOfExperience: int("yearsOfExperience"),
  targetRoles: json("targetRoles").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // STAR input
  situation: text("situation"),
  task: text("task"),
  action: text("action"),
  result: text("result"),
  
  // XYZ output
  xyzAccomplishment: text("xyzAccomplishment"),
  xyzMetricValue: decimal("xyzMetricValue", { precision: 15, scale: 2 }),
  xyzMetricUnit: varchar("xyzMetricUnit", { length: 50 }),
  xyzMetricPrecision: mysqlEnum("xyzMetricPrecision", ["exact", "range", "relative"]),
  xyzMechanism: json("xyzMechanism").$type<string[]>(),
  
  // Context metadata
  company: text("company"),
  roleTitle: text("roleTitle"),
  startDate: date("startDate"),
  endDate: date("endDate"),
  teamSize: int("teamSize"),
  budgetAmount: decimal("budgetAmount", { precision: 15, scale: 2 }),
  budgetCurrency: varchar("budgetCurrency", { length: 3 }).default("USD"),
  
  // Quality scoring
  impactMeterScore: int("impactMeterScore").default(0),
  hasStrongVerb: boolean("hasStrongVerb").default(false),
  hasMetric: boolean("hasMetric").default(false),
  hasMethodology: boolean("hasMethodology").default(false),
  evidenceTier: int("evidenceTier").default(4),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  skillCategory: varchar("skillCategory", { length: 100 }),
  isProven: boolean("isProven").default(false),
  firstMentionedDate: date("firstMentionedDate"),
  lastUsedDate: date("lastUsedDate"),
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const achievementSkills = mysqlTable("achievementSkills", {
  achievementId: int("achievementId").notNull(),
  skillId: int("skillId").notNull(),
});

export const jobDescriptions = mysqlTable("jobDescriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  jobTitle: text("jobTitle").notNull(),
  companyName: text("companyName"),
  jobDescriptionText: text("jobDescriptionText").notNull(),
  jobUrl: text("jobUrl"),
  
  // AI-parsed data
  requiredSkills: json("requiredSkills").$type<string[]>(),
  preferredSkills: json("preferredSkills").$type<string[]>(),
  keyResponsibilities: json("keyResponsibilities").$type<string[]>(),
  successMetrics: json("successMetrics").$type<string[]>(),
  
  applicationStatus: mysqlEnum("applicationStatus", ["draft", "applied", "interviewing", "rejected", "accepted"]).default("draft"),
  appliedDate: date("appliedDate"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const generatedResumes = mysqlTable("generatedResumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobDescriptionId: int("jobDescriptionId"),
  
  resumeFormat: varchar("resumeFormat", { length: 20 }).default("markdown"),
  resumeContent: text("resumeContent").notNull(),
  selectedAchievementIds: json("selectedAchievementIds").$type<number[]>(),
  
  version: int("version").default(1),
  isFavorite: boolean("isFavorite").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const powerVerbs = mysqlTable("powerVerbs", {
  id: int("id").autoincrement().primaryKey(),
  verb: varchar("verb", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }),
  strengthScore: int("strengthScore").default(5),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type GeneratedResume = typeof generatedResumes.$inferSelect;
export type InsertGeneratedResume = typeof generatedResumes.$inferInsert;

export const pastEmployerJobs = mysqlTable("pastEmployerJobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  jobDescriptionText: text("jobDescriptionText"),
  extractedSkills: json("extractedSkills").$type<string[]>(),
  extractedResponsibilities: json("extractedResponsibilities").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Job automation tables
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyId: int("companyId"),
  
  // Job details
  title: varchar("title", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  location: text("location"),
  jobUrl: text("jobUrl").notNull(),
  description: text("description"),
  
  // Scraped metadata
  platform: varchar("platform", { length: 50 }), // linkedin, indeed, glassdoor
  postedDate: timestamp("postedDate"),
  salaryMin: int("salaryMin"),
  salaryMax: int("salaryMax"),
  salaryCurrency: varchar("salaryCurrency", { length: 3 }).default("USD"),
  employmentType: varchar("employmentType", { length: 50 }), // full-time, contract, etc
  experienceLevel: varchar("experienceLevel", { length: 50 }),
  
  // AI analysis
  requiredSkills: json("requiredSkills").$type<string[]>(),
  preferredSkills: json("preferredSkills").$type<string[]>(),
  responsibilities: json("responsibilities").$type<string[]>(),
  benefits: json("benefits").$type<string[]>(),
  
  // Qualification score
  qualificationScore: int("qualificationScore"), // 0-100
  matchedSkills: json("matchedSkills").$type<string[]>(),
  missingSkills: json("missingSkills").$type<string[]>(),
  
  // Status
  status: mysqlEnum("status", ["new", "qualified", "rejected", "applied", "interviewing", "offer", "closed"]).default("new"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId").notNull(),
  resumeId: int("resumeId"),
  
  // Application materials
  tailoredResumeContent: text("tailoredResumeContent"),
  coverLetterContent: text("coverLetterContent"),
  customAnswers: json("customAnswers").$type<Record<string, string>>(),
  
  // Submission
  submittedAt: timestamp("submittedAt"),
  submissionMethod: varchar("submissionMethod", { length: 50 }), // auto, manual, email
  confirmationNumber: varchar("confirmationNumber", { length: 255 }),
  
  // Tracking
  status: mysqlEnum("status", ["scouted", "saved", "draft", "submitted", "viewed", "screening", "interview_scheduled", "interviewed", "offer", "rejected", "withdrawn"]).default("draft"),
  lastStatusUpdate: timestamp("lastStatusUpdate"),
  
  // AI Agent Analysis (for Profiler agent)
  painPoints: json("painPoints").$type<{challenge: string; impact: string; keywords: string[]}[]>(),
  
  // Follow-up
  nextFollowUpDate: date("nextFollowUpDate"),
  followUpCount: int("followUpCount").default(0),
  
  // Interview details
  interviewDates: json("interviewDates").$type<string[]>(),
  interviewNotes: text("interviewNotes"),
  
  // Outcome
  offerAmount: int("offerAmount"),
  offerCurrency: varchar("offerCurrency", { length: 3 }),
  rejectionReason: text("rejectionReason"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic info
  name: varchar("name", { length: 255 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }),
  logoUrl: text("logoUrl"),
  
  // Company details
  industry: varchar("industry", { length: 255 }),
  size: varchar("size", { length: 50 }), // 1-10, 11-50, 51-200, etc
  founded: int("founded"),
  headquarters: text("headquarters"),
  
  // Culture & values
  description: text("description"),
  mission: text("mission"),
  values: json("values").$type<string[]>(),
  culture: text("culture"),
  
  // Tech & tools
  techStack: json("techStack").$type<string[]>(),
  
  // Recent activity
  recentNews: json("recentNews").$type<Array<{ title: string; url: string; date: string }>>(),
  fundingRounds: json("fundingRounds").$type<Array<{ amount: number; date: string; stage: string }>>(),
  
  // Hiring
  isHiring: boolean("isHiring").default(false),
  openPositions: int("openPositions").default(0),
  
  // Cache metadata
  lastResearchedAt: timestamp("lastResearchedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyId: int("companyId"),
  
  // Contact info
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  linkedinUrl: text("linkedinUrl"),
  
  // Role
  title: varchar("title", { length: 255 }),
  department: varchar("department", { length: 100 }),
  
  // Relationship
  relationshipType: varchar("relationshipType", { length: 50 }), // recruiter, hiring_manager, referral, etc
  connectionStrength: int("connectionStrength"), // 1-5
  
  // Interaction history
  lastContactedAt: timestamp("lastContactedAt"),
  contactCount: int("contactCount").default(0),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

export type PastEmployerJob = typeof pastEmployerJobs.$inferSelect;
export type InsertPastEmployerJob = typeof pastEmployerJobs.$inferInsert;

export const achievementVerifications = mysqlTable("achievementVerifications", {
  id: int("id").autoincrement().primaryKey(),
  achievementId: int("achievementId").notNull(),
  userId: int("userId").notNull(),
  verifierEmail: varchar("verifierEmail", { length: 320 }),
  verifierName: varchar("verifierName", { length: 255 }),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "declined"]).default("pending"),
  verificationToken: varchar("verificationToken", { length: 64 }).unique(),
  verifiedAt: timestamp("verifiedAt"),
  verifierComments: text("verifierComments"),
  relationship: varchar("relationship", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AchievementVerification = typeof achievementVerifications.$inferSelect;
export type InsertAchievementVerification = typeof achievementVerifications.$inferInsert;

// Source Materials - Raw material for Master Profile
export const sourceMaterials = mysqlTable("sourceMaterials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Source type and title
  type: mysqlEnum("type", ["FILE", "URL"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  
  // Extracted content
  content: text("content").notNull(), // Raw text extracted from file or URL
  
  // Processing status
  status: mysqlEnum("status", ["PENDING", "PROCESSED", "FAILED"]).default("PENDING").notNull(),
  errorMessage: text("errorMessage"), // Error details if status is FAILED
  
  // Metadata (JSON)
  metadata: json("metadata").$type<{
    // For FILE type
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    
    // For URL type
    url?: string;
    domain?: string;
    scrapedAt?: string;
    
    // Common
    wordCount?: number;
    parseErrors?: string[];
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SourceMaterial = typeof sourceMaterials.$inferSelect;
export type InsertSourceMaterial = typeof sourceMaterials.$inferInsert;