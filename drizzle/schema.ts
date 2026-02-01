import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean, json } from "drizzle-orm/mysql-core";

// ================================================================
// USERS & AUTHENTICATION
// ================================================================

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
  
  // Onboarding state
  onboardingCompleted: boolean("onboardingCompleted").default(false),
  onboardingStep: int("onboardingStep").default(0), // 0-5
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ================================================================
// USER PROFILE & CAREER DATA (Master Profile)
// ================================================================

export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Contact Information
  phone: varchar("phone", { length: 20 }),
  linkedinUrl: text("linkedinUrl"),
  locationCity: varchar("locationCity", { length: 100 }),
  locationState: varchar("locationState", { length: 50 }),
  locationCountry: varchar("locationCountry", { length: 50 }).default("USA"),
  
  // Work Preferences
  workPreference: json("workPreference").$type<string[]>(), // ['remote', 'hybrid', 'in-office']
  
  // Profile Completeness
  profileCompleteness: int("profileCompleteness").default(0), // 0-100
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workExperiences = mysqlTable("workExperiences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  companyName: varchar("companyName", { length: 255 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"), // NULL if current
  location: varchar("location", { length: 255 }),
  isCurrent: boolean("isCurrent").default(false),
  
  // Company Context
  companyStage: varchar("companyStage", { length: 50 }), // 'Startup', 'Growth', 'Enterprise'
  companyFunding: varchar("companyFunding", { length: 100 }), // 'Series B', '$50M raised'
  companyIndustry: varchar("companyIndustry", { length: 100 }),
  companySizeEmployees: int("companySizeEmployees"),
  
  // Role Overview
  roleOverview: text("roleOverview"),
  
  // Ordering
  displayOrder: int("displayOrder"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  workExperienceId: int("workExperienceId"),
  userId: int("userId").notNull(),
  
  // Achievement Content
  description: text("description").notNull(),
  context: text("context"),
  
  // Metrics
  metricType: varchar("metricType", { length: 50 }), // 'revenue', 'pipeline', 'efficiency', 'scale', 'innovation'
  metricValue: decimal("metricValue", { precision: 15, scale: 2 }),
  metricUnit: varchar("metricUnit", { length: 50 }), // 'percent', 'dollars', 'count'
  metricTimeframe: varchar("metricTimeframe", { length: 100 }), // 'X months', 'Y years'
  
  // AI Analysis
  keywords: json("keywords").$type<string[]>(),
  relevanceScorePartnerships: int("relevanceScorePartnerships").default(0), // 0-100
  relevanceScoreGTM: int("relevanceScoreGTM").default(0),
  relevanceScoreTechnical: int("relevanceScoreTechnical").default(0),
  relevanceScoreLeadership: int("relevanceScoreLeadership").default(0),
  relevanceScoreRevenue: int("relevanceScoreRevenue").default(0),
  importanceScore: int("importanceScore").default(0), // 0-100
  
  // Usage Tracking
  timesUsed: int("timesUsed").default(0),
  lastUsedAt: timestamp("lastUsedAt"),
  
  // Performance Metrics
  applicationsWithAchievement: int("applicationsWithAchievement").default(0),
  responsesWithAchievement: int("responsesWithAchievement").default(0),
  interviewsWithAchievement: int("interviewsWithAchievement").default(0),
  responseRateWithAchievement: decimal("responseRateWithAchievement", { precision: 5, scale: 2 }), // Calculated
  
  // Source Tracking
  sourceResumeFilename: varchar("sourceResumeFilename", { length: 255 }),
  timesSeenInResumes: int("timesSeenInResumes").default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  skillName: varchar("skillName", { length: 255 }).notNull(),
  skillCategory: varchar("skillCategory", { length: 100 }), // 'technical', 'domain', 'soft', 'tools'
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]),
  yearsExperience: decimal("yearsExperience", { precision: 4, scale: 1 }),
  
  // Tracking
  mentionedInResumes: json("mentionedInResumes").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const certifications = mysqlTable("certifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  certificationName: varchar("certificationName", { length: 255 }).notNull(),
  issuingOrganization: varchar("issuingOrganization", { length: 255 }),
  issueYear: int("issueYear"),
  credentialId: varchar("credentialId", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const awards = mysqlTable("awards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  awardName: varchar("awardName", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  year: int("year"),
  context: text("context"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const education = mysqlTable("education", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  degreeType: varchar("degreeType", { length: 100 }),
  fieldOfStudy: varchar("fieldOfStudy", { length: 255 }),
  institution: varchar("institution", { length: 255 }).notNull(),
  graduationYear: int("graduationYear"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  honors: varchar("honors", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const superpowers = mysqlTable("superpowers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  evidence: text("evidence"),
  evidenceAchievementIds: json("evidenceAchievementIds").$type<number[]>(),
  rank: int("rank"), // 1, 2, 3 (top 3 superpowers)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ================================================================
// UPLOADED RESUMES
// ================================================================

export const uploadedResumes = mysqlTable("uploadedResumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"), // bytes
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Extracted text
  extractedText: text("extractedText"),
  
  // Processing status
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending"),
  processingError: text("processingError"),
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

// ================================================================
// TARGET PREFERENCES
// ================================================================

export const targetPreferences = mysqlTable("targetPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Role Preferences
  roleTitles: json("roleTitles").$type<string[]>().notNull(),
  industries: json("industries").$type<string[]>().notNull(),
  companyStages: json("companyStages").$type<string[]>().notNull(),
  
  // Compensation
  minimumBaseSalary: int("minimumBaseSalary"),
  minimumOTE: int("minimumOTE"),
  targetBaseSalary: int("targetBaseSalary"),
  targetOTE: int("targetOTE"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Location
  locationType: varchar("locationType", { length: 50 }), // 'remote', 'hybrid', 'remote_or_city', 'city_only'
  allowedCities: json("allowedCities").$type<string[]>(),
  maxTravelPercent: int("maxTravelPercent").default(25),
  internationalOk: boolean("internationalOk").default(false),
  
  // Deal Breakers
  dealBreakers: json("dealBreakers").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ================================================================
// JOB OPPORTUNITIES
// ================================================================

export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Company Information
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyUrl: text("companyUrl"),
  companyStage: varchar("companyStage", { length: 50 }), // 'Series A', 'Series B', etc
  companyFunding: varchar("companyFunding", { length: 255 }),
  companyIndustry: varchar("companyIndustry", { length: 255 }),
  companySizeEmployees: int("companySizeEmployees"),
  
  // Job Details
  roleTitle: varchar("roleTitle", { length: 255 }).notNull(),
  jobDescription: text("jobDescription"),
  jobUrl: text("jobUrl"),
  
  // Location
  locationType: varchar("locationType", { length: 50 }), // 'remote', 'hybrid', 'city'
  locationCity: varchar("locationCity", { length: 100 }),
  locationVerified: boolean("locationVerified").default(false),
  travelPercent: int("travelPercent"),
  
  // Compensation
  baseSalaryMin: int("baseSalaryMin"),
  baseSalaryMax: int("baseSalaryMax"),
  oteMin: int("oteMin"),
  oteMax: int("oteMax"),
  
  // Strategic Analysis (from Profiler agent)
  strategicNeeds: json("strategicNeeds"),
  strategicFitScore: int("strategicFitScore"), // 0-100
  whyNow: text("whyNow"),
  painPoints: json("painPoints").$type<string[]>(),
  
  // Contacts (from Hunter agent)
  hiringManagerName: varchar("hiringManagerName", { length: 255 }),
  hiringManagerTitle: varchar("hiringManagerTitle", { length: 255 }),
  hiringManagerLinkedin: text("hiringManagerLinkedin"),
  hiringManagerEmail: varchar("hiringManagerEmail", { length: 255 }),
  recruiterName: varchar("recruiterName", { length: 255 }),
  recruiterTitle: varchar("recruiterTitle", { length: 255 }),
  recruiterLinkedin: text("recruiterLinkedin"),
  recruiterEmail: varchar("recruiterEmail", { length: 255 }),
  
  // Discovery Metadata
  discoveredAt: timestamp("discoveredAt").defaultNow(),
  discoveredBy: varchar("discoveredBy", { length: 50 }), // 'Scout', 'Manual', 'User Upload'
  sourceUrl: text("sourceUrl"),
  postedDate: date("postedDate"),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ================================================================
// APPLICATIONS
// ================================================================

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  opportunityId: int("opportunityId").notNull(),
  
  // Application Status
  status: mysqlEnum("status", [
    "draft", "applied", "response_received", "phone_screen", 
    "interview", "final_interview", "offer", "accepted", "rejected", "withdrawn", "ghosted"
  ]).default("draft"),
  
  // Match Score
  matchScore: int("matchScore"), // 0-100
  priorityLevel: mysqlEnum("priorityLevel", ["high", "medium", "low"]),
  
  // Application Materials
  tailoredResumeText: text("tailoredResumeText"),
  tailoredResumeUrl: text("tailoredResumeUrl"), // S3/storage URL
  coverLetterText: text("coverLetterText"),
  coverLetterUrl: text("coverLetterUrl"),
  linkedinMessage: text("linkedinMessage"),
  emailTemplate: text("emailTemplate"),
  
  // Application Package URLs
  packageZipUrl: text("packageZipUrl"),
  resumePdfUrl: text("resumePdfUrl"),
  resumeDocxUrl: text("resumeDocxUrl"),
  resumeTxtUrl: text("resumeTxtUrl"),
  coverLetterTxtUrl: text("coverLetterTxtUrl"),
  linkedinMessageTxtUrl: text("linkedinMessageTxtUrl"),
  
  // Achievements Used
  achievementsUsed: json("achievementsUsed").$type<number[]>(), // Array of achievement IDs
  
  // Application Dates
  appliedAt: timestamp("appliedAt"),
  appliedVia: varchar("appliedVia", { length: 100 }), // 'Greenhouse', 'Lever', 'Email', 'LinkedIn'
  
  // Timeline
  responseReceivedAt: timestamp("responseReceivedAt"),
  phoneScreenAt: timestamp("phoneScreenAt"),
  interviewScheduledAt: timestamp("interviewScheduledAt"),
  offerReceivedAt: timestamp("offerReceivedAt"),
  
  // Follow-up
  lastFollowUpAt: timestamp("lastFollowUpAt"),
  nextFollowUpDue: timestamp("nextFollowUpDue"),
  followUpCount: int("followUpCount").default(0),
  
  // Outcome
  rejectionReason: text("rejectionReason"),
  outcomeNotes: text("outcomeNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ================================================================
// AGENT EXECUTION LOGS
// ================================================================

export const agentExecutionLogs = mysqlTable("agentExecutionLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  agentName: varchar("agentName", { length: 50 }).notNull(), // 'Scout', 'Profiler', 'Qualifier', etc
  executionType: varchar("executionType", { length: 100 }), // 'discover_opportunities', 'analyze_company', etc
  
  // Input/Output
  inputData: json("inputData"),
  outputData: json("outputData"),
  
  // Execution Metrics
  executionTimeMs: int("executionTimeMs"),
  llmCost: decimal("llmCost", { precision: 10, scale: 4 }), // USD
  tokensUsed: int("tokensUsed"),
  
  // Status
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  errorMessage: text("errorMessage"),
  
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

// ================================================================
// NOTIFICATIONS
// ================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: varchar("type", { length: 50 }).notNull(), // 'follow_up_due', 'response_received', 'new_match', etc
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  
  // Related entities
  applicationId: int("applicationId"),
  opportunityId: int("opportunityId"),
  
  // Status
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ================================================================
// SAVED OPPORTUNITIES
// ================================================================

export const savedOpportunities = mysqlTable("savedOpportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  opportunityId: int("opportunityId").notNull(),
  
  // Optional notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ================================================================
// APPLICATION NOTES
// ================================================================

export const applicationNotes = mysqlTable("applicationNotes", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  userId: int("userId").notNull(),
  
  // Note content
  noteText: text("noteText").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ================================================================
// TYPE EXPORTS
// ================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type WorkExperience = typeof workExperiences.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type Award = typeof awards.$inferSelect;
export type Education = typeof education.$inferSelect;
export type Superpower = typeof superpowers.$inferSelect;
export type UploadedResume = typeof uploadedResumes.$inferSelect;
export type TargetPreferences = typeof targetPreferences.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type AgentExecutionLog = typeof agentExecutionLogs.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SavedOpportunity = typeof savedOpportunities.$inferSelect;
export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type InsertApplicationNote = typeof applicationNotes.$inferInsert;

// ================================================================
// AGENT METRICS (Production Monitoring)
// ================================================================

export const agentMetrics = mysqlTable("agentMetrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Agent identification
  agentType: varchar("agentType", { length: 50 }).notNull(), // 'tailor', 'scribe', 'assembler'
  
  // Performance metrics
  duration: int("duration").notNull(), // milliseconds
  success: boolean("success").notNull(),
  errorMessage: text("errorMessage"),
  
  // Related entities
  applicationId: int("applicationId"),
  userId: int("userId"),
  
  // Additional metadata
  metadata: json("metadata").$type<Record<string, any>>(), // Agent-specific data (e.g., keyword count, confidence score)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentMetric = typeof agentMetrics.$inferSelect;
export type InsertAgentMetric = typeof agentMetrics.$inferInsert;
