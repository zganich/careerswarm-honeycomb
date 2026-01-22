# Careerswarm MVP TODO

## Phase 1: Database & Setup
- [x] Define database schema with all tables
- [x] Create database helper functions

## Phase 2: Authentication & Landing
- [x] User authentication with email/password
- [x] Google OAuth integration
- [x] Landing page with value proposition
- [x] Profile setup and management

## Phase 3: Achievement Wizard
- [x] Multi-step wizard UI component
- [x] STAR input forms (Situation, Task, Action, Result)
- [x] Context metadata form (company, role, dates)
- [x] Achievement CRUD API endpoints
- [x] Achievement list/dashboard view
- [x] Edit and delete functionality
- [x] Search and filter capabilities

## Phase 4: Impact Meter & AI
- [x] Impact Meter visual component
- [x] Power verb detection algorithm
- [x] Metric detection algorithm
- [x] Methodology detection algorithm
- [x] Real-time score calculation
- [x] AI STAR-to-XYZ transformation endpoint
- [x] XYZ preview and approval UI

## Phase 5: Job Description Analysis
- [x] JD input interface
- [x] JD storage and management
- [x] AI-powered skill extraction
- [x] Required vs preferred skills parsing
- [x] Skills database and API
- [x] Link skills to achievements
- [x] Skill match visualization

## Phase 6: Resume Generation
- [x] Resume generation engine
- [x] Achievement selection algorithm
- [x] Keyword matching logic
- [x] Resume template (Markdown)
- [x] Real-time preview component
- [x] Download functionality
- [x] Copy to clipboard
- [x] Resume version history

## Phase 7: Polish & Testing
- [x] Mobile responsiveness
- [x] Loading states and error handling
- [ ] User onboarding flow
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Final bug fixes

## Enhancements (Phase 8)
- [x] Achievement editing functionality
- [x] Smart AI-powered achievement matching for jobs
- [x] PDF export for resumes

## Advanced Features (Phase 9)
- [x] Past Employer JD Import and storage
- [x] Skills gap analysis from past JDs
- [x] Bulk Achievement Import (paste multiple)
- [x] Resume parsing for bulk import
- [x] Achievement Templates by role
- [x] Skills Gap Dashboard with visual comparison
- [x] AI-powered Achievement Suggestions

## Ecosystem Features (Phase 10-11)

### Core Intelligence APIs
- [x] Career Trajectory Prediction Engine
- [x] Interview Prep Intelligence system
- [x] Achievement Verification system (invite colleagues)
- [ ] Company Talent Intelligence Dashboard (B2B)

### Web Platform Enhancements
- [x] Past Jobs UI page
- [ ] Templates integrated into Achievement Wizard
- [x] AI Suggestions on Dashboard
- [x] URL-based JD import (scrape any job posting URL)

### Browser Extension
- [ ] Chrome extension manifest and core
- [ ] Firefox extension port
- [ ] Inject match % on LinkedIn/Indeed/job sites
- [ ] One-click "Analyze with Careerswarm"
- [ ] Generate resume without leaving page

### Email Integration
- [ ] Dedicated email ingestion endpoint
- [ ] Email parsing and JD extraction
- [ ] Auto-reply with match report
- [ ] Email-to-resume generation

### Partner API
- [ ] Public REST API for job boards
- [ ] API authentication and rate limiting
- [ ] Webhook integrations
- [ ] "Powered by Careerswarm" embeds
- [ ] API documentation

### Mobile & Distribution
- [ ] Mobile-responsive improvements
- [ ] Chrome Web Store submission
- [ ] Firefox Add-ons submission

## Stripe Integration (Phase 10)
- [x] Add Stripe feature to project
- [x] Create pricing page with Free/Pro tiers
- [x] Implement checkout flow
- [x] Add subscription management
- [x] Build billing portal integration
- [ ] Enforce usage limits (achievements, resumes)
- [ ] Add subscription status to user profile

## UNIFIED RECODE - SESSIONS 1-7 COMPLETE

### Session 1: Infrastructure & Token Optimization
- [x] Install ioredis for Redis caching
- [x] Install BullMQ for job queue
- [x] Create cache layer (server/cache.ts)
- [x] Create model router (server/modelRouter.ts)
- [x] Create prompt compression (server/promptCompression.ts)
- [x] Update LLM wrapper for model routing
- [x] Create queue infrastructure (server/queue.ts)
- [x] Add jobs table to schema
- [x] Add applications table to schema
- [x] Add companies table to schema
- [x] Add contacts table to schema
- [x] Write cache tests
- [x] Write model router tests
- [x] Session 1 checkpoint

### Sessions 2-5: Automation Agents
- [x] Scout agent (job scraping)
- [x] Qualifier agent (resume-job matching)
- [x] Profiler agent (company research)
- [x] Tailor agent (resume customization)
- [x] Scribe agent (cover letters & emails)
- [x] Database helpers for jobs/applications/companies/contacts
- [x] tRPC routers for all automation features

### Sessions 6-7: Stripe & Polish
- [x] Stripe products configuration
- [x] Stripe webhook handler
- [x] Stripe checkout router
- [ ] Update Pricing page with real Stripe integration
- [ ] Add usage limits enforcement
- [ ] Final testing
- [ ] Sessions 2-7 checkpoint

## UNIFIED RECODE (Weeks 1-6)

### Week 1: Token-Efficient Infrastructure
- [ ] Install Redis for caching
- [ ] Install BullMQ for job queue
- [ ] Create model routing system (gpt-4o-mini/gpt-4o/claude-3.5)
- [ ] Build caching layer with TTL strategies
- [ ] Add cost tracking middleware
- [ ] Create compressed prompt library
- [ ] Setup agent registry pattern

### Week 2: Job Scraping Automation
- [ ] Port Scout agent (LinkedIn/Indeed/Glassdoor scraping)
- [ ] Add job result caching (24hr TTL)
- [ ] Build job qualification with mini model
- [ ] Create Profiler agent (company research)
- [ ] Add batch processing for multiple jobs

### Week 3: Achievement System Optimization
- [ ] Optimize STAR-to-XYZ with compressed prompts
- [ ] Use mini model for Impact Meter scoring
- [ ] Add incremental processing (only transform changed achievements)
- [ ] Batch bulk imports in single LLM call
- [ ] Cache achievement templates

### Week 4: Automation Pipeline
- [ ] Port Tailor agent (resume customization)
- [ ] Port Scribe agent (cover letter generation)
- [ ] Build 7-stage pipeline orchestration
- [ ] Add auto-apply workflow UI
- [ ] Implement progress tracking dashboard
- [ ] Add email notifications for pipeline events

### Week 5: Pricing & Limits
- [ ] Update schema with subscription tiers
- [ ] Implement feature gate middleware
- [ ] Add usage tracking (achievements, resumes, jobs, applications)
- [ ] Build Stripe checkout with proper webhooks
- [ ] Create upgrade prompts at limit boundaries
- [ ] Add billing portal integration

### Week 6: Testing & Optimization
- [ ] Write test suite for all agents
- [ ] Load test with cost monitoring
- [ ] A/B test prompt compression savings
- [ ] Security audit (data privacy, encryption)
- [ ] Performance optimization
- [ ] Deploy and launch
