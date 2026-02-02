-- Master Profile new sections: userProfiles columns, certifications type, new tables
-- Idempotent: safe to run multiple times (ADD COLUMN only if missing, CREATE TABLE IF NOT EXISTS).

-- userProfiles: professional summary, portfolio URLs, parsed contact (pre-fill)
SET @db = DATABASE();

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'userProfiles' AND COLUMN_NAME = 'professionalSummary') = 0,
  'ALTER TABLE `userProfiles` ADD COLUMN `professionalSummary` text',
  'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'userProfiles' AND COLUMN_NAME = 'portfolioUrls') = 0,
  'ALTER TABLE `userProfiles` ADD COLUMN `portfolioUrls` json',
  'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'userProfiles' AND COLUMN_NAME = 'parsedContactFromResume') = 0,
  'ALTER TABLE `userProfiles` ADD COLUMN `parsedContactFromResume` json',
  'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- certifications: type for license vs certification
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'certifications' AND COLUMN_NAME = 'type') = 0,
  'ALTER TABLE `certifications` ADD COLUMN `type` enum(''certification'',''license'') DEFAULT ''certification''',
  'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- languages
CREATE TABLE IF NOT EXISTS `languages` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `language` varchar(100) NOT NULL,
  `proficiency` varchar(50),
  `isNative` boolean DEFAULT false,
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);

-- volunteerExperiences
CREATE TABLE IF NOT EXISTS `volunteerExperiences` (
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
CREATE TABLE IF NOT EXISTS `projects` (
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
CREATE TABLE IF NOT EXISTS `publications` (
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
CREATE TABLE IF NOT EXISTS `securityClearances` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,
  `clearanceType` varchar(100) NOT NULL,
  `level` varchar(100),
  `expiryDate` varchar(20),
  `createdAt` timestamp DEFAULT (now()) NOT NULL
);
