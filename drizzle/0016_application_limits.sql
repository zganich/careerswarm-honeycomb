-- Add application usage tracking columns for free tier limits
ALTER TABLE `users` ADD `applicationsThisMonth` int DEFAULT 0 NOT NULL;
ALTER TABLE `users` ADD `applicationsResetAt` timestamp DEFAULT CURRENT_TIMESTAMP;
