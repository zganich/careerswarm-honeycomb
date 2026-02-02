-- Master Profile new sections: userProfiles columns, certifications type, new tables

-- userProfiles: professional summary, portfolio URLs, parsed contact (pre-fill)
ALTER TABLE `userProfiles` ADD COLUMN `professionalSummary` text;
ALTER TABLE `userProfiles` ADD COLUMN `portfolioUrls` json;
ALTER TABLE `userProfiles` ADD COLUMN `parsedContactFromResume` json;

-- certifications: type for license vs certification
ALTER TABLE `certifications` ADD COLUMN `type` enum('certification','license') DEFAULT 'certification';

-- languages
CREATE TABLE `languages` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `language` varchar(100) NOT NULL,
  `proficiency` varchar(50),
  `isNative` boolean DEFAULT false,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- volunteerExperiences
CREATE TABLE `volunteerExperiences` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `organization` varchar(255) NOT NULL,
  `role` varchar(255),
  `startDate` varchar(20),
  `endDate` varchar(20),
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- projects
CREATE TABLE `projects` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `url` text,
  `role` varchar(255),
  `startDate` varchar(20),
  `endDate` varchar(20),
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- publications
CREATE TABLE `publications` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `title` varchar(500) NOT NULL,
  `publisherOrVenue` varchar(255),
  `year` int,
  `url` text,
  `context` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- securityClearances
CREATE TABLE `securityClearances` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `clearanceType` varchar(100) NOT NULL,
  `level` varchar(100),
  `expiryDate` varchar(20),
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);
