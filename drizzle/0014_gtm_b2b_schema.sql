-- GTM & B2B schema: extend users, add b2b_leads, gtm_runs, gtm_content, outreach_drafts, jd_drafts, jd_usage, gtm_job_runs

-- Extend users for B2B roles and flywheel referral
ALTER TABLE `users` ADD COLUMN `companyId` int;
ALTER TABLE `users` ADD COLUMN `referredByUserId` int;
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','recruiter','company_admin') DEFAULT 'user' NOT NULL;

-- B2B leads
CREATE TABLE `b2b_leads` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `leadType` enum('recruiter_inhouse','recruiter_agency','hr_leader','hiring_manager','startup','company') NOT NULL,
  `name` varchar(255),
  `title` varchar(255),
  `companyName` varchar(255),
  `companyDomain` varchar(255),
  `linkedinUrl` text,
  `email` varchar(320),
  `sourceUrl` text,
  `sourceChannel` enum('linkedin','reddit','twitter','company_site','job_board','newsletter','event'),
  `industry` varchar(100),
  `companySize` varchar(50),
  `geography` varchar(100),
  `signals` text,
  `vertical` varchar(100),
  `priority` enum('high','medium','low') DEFAULT 'medium',
  `score` int,
  `firstSeenAt` timestamp DEFAULT (now()) NOT NULL,
  `lastEnrichedAt` timestamp,
  `outreachStatus` enum('none','drafted','sent','replied','converted') DEFAULT 'none',
  `idempotencyKey` varchar(255) UNIQUE,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- GTM runs (strategy, report outputs)
CREATE TABLE `gtm_runs` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `runType` varchar(50) NOT NULL,
  `inputJson` json,
  `outputJson` json,
  `status` enum('success','failed','partial') NOT NULL,
  `errorMessage` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- GTM content (posts, drafts)
CREATE TABLE `gtm_content` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `runId` int,
  `channel` varchar(50) NOT NULL,
  `contentType` varchar(50),
  `title` varchar(255),
  `body` text,
  `metadata` json,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- Outreach drafts per lead
CREATE TABLE `outreach_drafts` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `leadId` int NOT NULL,
  `channel` varchar(50) NOT NULL,
  `subject` varchar(500),
  `body` text NOT NULL,
  `campaignId` varchar(100),
  `sentAt` timestamp,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- JD Builder drafts (B2B)
CREATE TABLE `jd_drafts` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `companyId` int,
  `roleTitle` varchar(255) NOT NULL,
  `companyName` varchar(255),
  `department` varchar(100),
  `inputJson` json,
  `outputSummary` text,
  `outputResponsibilities` text,
  `outputRequirements` text,
  `outputBenefits` text,
  `fullText` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- JD usage (billing/limits)
CREATE TABLE `jd_usage` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `companyId` int,
  `periodStart` date NOT NULL,
  `periodEnd` date NOT NULL,
  `jdsGenerated` int DEFAULT 0 NOT NULL,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- GTM job runs (observability)
CREATE TABLE `gtm_job_runs` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `jobId` varchar(255),
  `jobType` varchar(50) NOT NULL,
  `channel` varchar(50),
  `startedAt` timestamp DEFAULT (now()) NOT NULL,
  `finishedAt` timestamp,
  `status` enum('running','success','failed','skipped') NOT NULL,
  `payloadSummary` text,
  `errorMessage` text,
  `durationMs` int
);
