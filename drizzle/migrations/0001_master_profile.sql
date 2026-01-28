-- Create all Master Profile tables

CREATE TABLE IF NOT EXISTS `userProfiles` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL UNIQUE,
  `phone` varchar(20),
  `linkedinUrl` text,
  `locationCity` varchar(100),
  `locationState` varchar(50),
  `locationCountry` varchar(50) DEFAULT 'USA',
  `workPreference` json,
  `profileCompleteness` int DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `workExperiences` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `jobTitle` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date,
  `location` varchar(255),
  `isCurrent` boolean DEFAULT false,
  `companyStage` varchar(50),
  `companyFunding` varchar(100),
  `companyIndustry` varchar(100),
  `companySizeEmployees` int,
  `roleOverview` text,
  `displayOrder` int,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `achievements` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `workExperienceId` int,
  `userId` int NOT NULL,
  `description` text NOT NULL,
  `context` text,
  `metricType` varchar(50),
  `metricValue` decimal(15,2),
  `metricUnit` varchar(50),
  `metricTimeframe` varchar(100),
  `keywords` json,
  `relevanceScorePartnerships` int DEFAULT 0,
  `relevanceScoreGTM` int DEFAULT 0,
  `relevanceScoreTechnical` int DEFAULT 0,
  `relevanceScoreLeadership` int DEFAULT 0,
  `relevanceScoreRevenue` int DEFAULT 0,
  `importanceScore` int DEFAULT 0,
  `timesUsed` int DEFAULT 0,
  `lastUsedAt` timestamp,
  `applicationsWithAchievement` int DEFAULT 0,
  `responsesWithAchievement` int DEFAULT 0,
  `interviewsWithAchievement` int DEFAULT 0,
  `responseRateWithAchievement` decimal(5,2),
  `sourceResumeFilename` varchar(255),
  `timesSeenInResumes` int DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `skills` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `skillName` varchar(255) NOT NULL,
  `skillCategory` varchar(100),
  `proficiencyLevel` enum('beginner','intermediate','advanced','expert'),
  `yearsExperience` decimal(4,1),
  `mentionedInResumes` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `certifications` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `certificationName` varchar(255) NOT NULL,
  `issuingOrganization` varchar(255),
  `issueYear` int,
  `credentialId` varchar(255),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `awards` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `awardName` varchar(255) NOT NULL,
  `organization` varchar(255),
  `year` int,
  `context` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `education` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `degreeType` varchar(100),
  `fieldOfStudy` varchar(255),
  `institution` varchar(255) NOT NULL,
  `graduationYear` int,
  `gpa` decimal(3,2),
  `honors` varchar(255),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `superpowers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `evidenceAchievementIds` json,
  `rank` int,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `uploadedResumes` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `fileKey` varchar(500) NOT NULL,
  `fileUrl` text NOT NULL,
  `fileSize` int,
  `mimeType` varchar(100),
  `extractedText` text,
  `processingStatus` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `processingError` text,
  `uploadedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `processedAt` timestamp
);

CREATE TABLE IF NOT EXISTS `targetPreferences` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL UNIQUE,
  `roleTitles` json NOT NULL,
  `industries` json NOT NULL,
  `companyStages` json NOT NULL,
  `minimumBaseSalary` int,
  `minimumOTE` int,
  `targetBaseSalary` int,
  `targetOTE` int,
  `currency` varchar(3) DEFAULT 'USD',
  `locationType` varchar(50),
  `allowedCities` json,
  `maxTravelPercent` int DEFAULT 25,
  `internationalOk` boolean DEFAULT false,
  `dealBreakers` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `opportunities` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `companyName` varchar(255) NOT NULL,
  `companyUrl` text,
  `companyStage` varchar(50),
  `companyFunding` varchar(255),
  `companyIndustry` varchar(255),
  `companySizeEmployees` int,
  `roleTitle` varchar(255) NOT NULL,
  `jobDescription` text,
  `jobUrl` text,
  `locationType` varchar(50),
  `locationCity` varchar(100),
  `locationVerified` boolean DEFAULT false,
  `travelPercent` int,
  `baseSalaryMin` int,
  `baseSalaryMax` int,
  `oteMin` int,
  `oteMax` int,
  `strategicNeeds` json,
  `strategicFitScore` int,
  `whyNow` text,
  `painPoints` json,
  `hiringManagerName` varchar(255),
  `hiringManagerTitle` varchar(255),
  `hiringManagerLinkedin` text,
  `hiringManagerEmail` varchar(255),
  `recruiterName` varchar(255),
  `recruiterTitle` varchar(255),
  `recruiterLinkedin` text,
  `recruiterEmail` varchar(255),
  `discoveredAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `discoveredBy` varchar(50),
  `sourceUrl` text,
  `postedDate` date,
  `isActive` boolean DEFAULT true,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `applications` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `opportunityId` int NOT NULL,
  `status` enum('draft','applied','response_received','phone_screen','interview','final_interview','offer','accepted','rejected','withdrawn','ghosted') DEFAULT 'draft',
  `matchScore` int,
  `priorityLevel` enum('high','medium','low'),
  `tailoredResumeText` text,
  `tailoredResumeUrl` text,
  `coverLetterText` text,
  `coverLetterUrl` text,
  `linkedinMessage` text,
  `emailTemplate` text,
  `achievementsUsed` json,
  `appliedAt` timestamp,
  `appliedVia` varchar(100),
  `responseReceivedAt` timestamp,
  `phoneScreenAt` timestamp,
  `interviewScheduledAt` timestamp,
  `offerReceivedAt` timestamp,
  `lastFollowUpAt` timestamp,
  `nextFollowUpDue` timestamp,
  `followUpCount` int DEFAULT 0,
  `rejectionReason` text,
  `outcomeNotes` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `agentExecutionLogs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `agentName` varchar(50) NOT NULL,
  `executionType` varchar(100),
  `inputData` json,
  `outputData` json,
  `executionTimeMs` int,
  `llmCost` decimal(10,4),
  `tokensUsed` int,
  `status` enum('success','failed','partial') NOT NULL,
  `errorMessage` text,
  `executedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `applicationId` int,
  `opportunityId` int,
  `isRead` boolean DEFAULT false,
  `readAt` timestamp,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Update users table
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `onboardingCompleted` boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS `onboardingStep` int DEFAULT 0;
