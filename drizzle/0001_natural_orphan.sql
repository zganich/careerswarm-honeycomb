CREATE TABLE `achievementSkills` (
	`achievementId` int NOT NULL,
	`skillId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`situation` text,
	`task` text,
	`action` text,
	`result` text,
	`xyzAccomplishment` text,
	`xyzMetricValue` decimal(15,2),
	`xyzMetricUnit` varchar(50),
	`xyzMetricPrecision` enum('exact','range','relative'),
	`xyzMechanism` json,
	`company` text,
	`roleTitle` text,
	`startDate` date,
	`endDate` date,
	`teamSize` int,
	`budgetAmount` decimal(15,2),
	`budgetCurrency` varchar(3) DEFAULT 'USD',
	`impactMeterScore` int DEFAULT 0,
	`hasStrongVerb` boolean DEFAULT false,
	`hasMetric` boolean DEFAULT false,
	`hasMethodology` boolean DEFAULT false,
	`evidenceTier` int DEFAULT 4,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generatedResumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobDescriptionId` int,
	`resumeFormat` varchar(20) DEFAULT 'markdown',
	`resumeContent` text NOT NULL,
	`selectedAchievementIds` json,
	`version` int DEFAULT 1,
	`isFavorite` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generatedResumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobDescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobTitle` text NOT NULL,
	`companyName` text,
	`jobDescriptionText` text NOT NULL,
	`jobUrl` text,
	`requiredSkills` json,
	`preferredSkills` json,
	`keyResponsibilities` json,
	`successMetrics` json,
	`applicationStatus` enum('draft','applied','interviewing','rejected','accepted') DEFAULT 'draft',
	`appliedDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobDescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `powerVerbs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`verb` varchar(100) NOT NULL,
	`category` varchar(50),
	`strengthScore` int DEFAULT 5,
	CONSTRAINT `powerVerbs_id` PRIMARY KEY(`id`),
	CONSTRAINT `powerVerbs_verb_unique` UNIQUE(`verb`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`skillCategory` varchar(100),
	`isProven` boolean DEFAULT false,
	`firstMentionedDate` date,
	`lastUsedDate` date,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `currentRole` text;--> statement-breakpoint
ALTER TABLE `users` ADD `currentCompany` text;--> statement-breakpoint
ALTER TABLE `users` ADD `yearsOfExperience` int;--> statement-breakpoint
ALTER TABLE `users` ADD `targetRoles` json;