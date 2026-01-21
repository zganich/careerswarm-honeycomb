CREATE TABLE `pastEmployerJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`companyName` varchar(255),
	`startDate` timestamp,
	`endDate` timestamp,
	`jobDescriptionText` text,
	`extractedSkills` json,
	`extractedResponsibilities` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pastEmployerJobs_id` PRIMARY KEY(`id`)
);
