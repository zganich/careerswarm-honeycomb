CREATE TABLE `sourceMaterials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('FILE','URL') NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sourceMaterials_id` PRIMARY KEY(`id`)
);
