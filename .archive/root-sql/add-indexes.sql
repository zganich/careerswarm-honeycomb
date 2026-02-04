-- Performance Optimization: Add Database Indexes
-- Run this to optimize query performance for frequently accessed data

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscriptionStatus);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Achievements table indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(userId);
CREATE INDEX IF NOT EXISTS idx_achievements_created ON achievements(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_impact ON achievements(impact);

-- Job Descriptions table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(userId);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(companyName);

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(userId);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(jobId);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_applications_updated ON applications(lastStatusUpdate DESC);

-- Generated Resumes table indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user ON generatedResumes(userId);
CREATE INDEX IF NOT EXISTS idx_resumes_created ON generatedResumes(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_resumes_month_year ON generatedResumes(userId, YEAR(createdAt), MONTH(createdAt));

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(companyId);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(userId);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_achievements_user_created ON achievements(userId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(userId, status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON jobs(userId, createdAt DESC);

-- Analyze tables to update statistics
ANALYZE TABLE users;
ANALYZE TABLE achievements;
ANALYZE TABLE jobs;
ANALYZE TABLE applications;
ANALYZE TABLE generatedResumes;
ANALYZE TABLE companies;
ANALYZE TABLE contacts;
