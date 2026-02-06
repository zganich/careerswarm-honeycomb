-- Add application usage tracking for free tier limits
ALTER TABLE users ADD COLUMN applicationsThisMonth INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN applicationsResetAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
