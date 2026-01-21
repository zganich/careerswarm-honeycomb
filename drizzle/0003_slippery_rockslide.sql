CREATE TABLE `achievementVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`achievementId` int NOT NULL,
	`userId` int NOT NULL,
	`verifierEmail` varchar(320),
	`verifierName` varchar(255),
	`verificationStatus` enum('pending','verified','declined') DEFAULT 'pending',
	`verificationToken` varchar(64),
	`verifiedAt` timestamp,
	`verifierComments` text,
	`relationship` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievementVerifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievementVerifications_verificationToken_unique` UNIQUE(`verificationToken`)
);
