import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
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