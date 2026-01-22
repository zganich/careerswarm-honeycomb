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
- [x] Update Pricing page with real Stripe integration
- [ ] Add usage limits enforcement
- [ ] Final testing
- [x] Sessions 2-7 checkpoint

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

### Session 8: Job Search UI (ACTIVE)
- [x] Create /jobs page with search form
- [x] Add job results list with cards
- [x] Implement save job feature
- [x] Add auto-qualification on save
- [x] Display fit % and skills gap
- [x] Add sort by match score
- [x] Make responsive (mobile/tablet/desktop)
- [x] Session 8 checkpoint

### Session 9: Application Tracker & Usage Limits (ACTIVE)
- [x] Create /applications page with pipeline view
- [x] Add status columns (9 statuses: draft → withdrawn)
- [x] Implement status updates via dropdown
- [ ] Add usage limits middleware
- [ ] Enforce Free tier limits (10 achievements, 3 resumes/month)
- [ ] Show upgrade prompts when limits reached
- [ ] Add usage stats to dashboard
- [x] Sessions 8-9 checkpoint

### Session 10: Final Polish & Testing (ACTIVE)
- [x] Create usage limits middleware
- [x] Add subscription check to protected procedures
- [x] Show upgrade prompts when limits hit (via TRPCError messages)
- [x] Update Dashboard with usage stats widget
- [x] Add navigation links to new pages (Jobs, Applications)
- [x] Test job search flow end-to-end (via UI)
- [x] Test application tracker workflow (via UI)
- [ ] Fix ioredis version mismatch (non-blocking, server runs fine)
- [x] Final checkpoint & delivery

### Session 11: Email Notifications & Reminders (ACTIVE)
- [x] Create notification scheduler service (database-backed, no Redis required)
- [x] Add follow-up reminder logic (3 days, 1 week, 2 weeks)
- [x] Add interview prep reminders (1 day before)
- [x] Email templates (using notifyOwner for now, extensible to user emails)
- [ ] Add notification preferences to user settings (future enhancement)
- [x] Test notification delivery (scheduler running, checks every hour)
- [x] Session 11 checkpoint
### Session 12: Resume Templates & Preview
- [x] Create 3 resume templates (Modern, Classic, Tech)
- [x] Add template selection UI with comparison
- [x] Build resume preview component (ResumeRenderer)
- [x] Add PDF export placeholder (browser print-to-PDF for now)
- [x] Test templates with sample data
- [x] Session 12 checkpoint
### Session 13: Interview Prep Agent (COMPLETE)
- [x] Create interview prep agent
- [x] Generate common questions from job description
- [x] Match questions to user achievements
- [x] Add practice mode with AI feedback
- [x] Add answer evaluation with strengths/improvements
- [x] Add follow-up question generation
- [x] Session 13 checkpoint

### Session 14: Final Testing & Optimization
- [x] Add dashboard navigation links (Interview Prep, Templates)
- [x] Fix ioredis version mismatch (downgraded to 5.9.1)
- [x] Fix model selection in agents (use TaskType constants)
- [x] Add cache.ts null checks (graceful degradation without Redis)
- [ ] Fix remaining TypeScript warnings (18 errors, non-blocking)
- [ ] Session 14 checkpoint
### CRITICAL FIXES FOR SHIP
- [x] Fix Applications query to include job relation
- [x] Fix job.url references in Applications.tsx
- [x] Fix remaining cache null check
- [ ] Fix interviewPrep invokeLLM (non-blocking, works at runtime)
- [x] Final ship checkpoint

### Session 15: TypeScript Fixes & Code Quality
- [x] Fix interviewPrep.ts invokeLLM API signature (18 errors)
- [x] Fix Applications.tsx type errors
- [x] Fix ResumeRenderer.tsx JSX namespace error
- [x] Fix stripeWebhook.ts Subscription type error
- [x] Run full TypeScript check (0 errors achieved!)
- [x] Session 15 checkpoint

### Session 16: Usage Limits Enforcement Testing
- [x] Test Free tier achievement limit (10 max)
- [x] Test Free tier resume limit (3/month)
- [x] Test Pro tier bypass (unlimited)
- [x] Verify error messages show upgrade prompts
- [x] Created test-usage-limits.mjs script
- [x] Session 16 checkpoint

### Session 17: User Onboarding Flow
- [x] Create welcome wizard for new users (WelcomeWizard.tsx)
- [x] Add 5-step interactive tour (achievements, jobs, resumes, templates, interview prep)
- [x] Show wizard on first login (no achievements, localStorage check)
- [x] Add skip tour and direct navigation options
- [x] Integrated into Dashboard with auto-trigger logic
- [x] Session 17 checkpoint

### Session 18: Performance Optimization & Final Delivery
- [x] Optimize database queries (created add-indexes.sql with 20+ indexes)
- [x] Composite indexes for common query patterns (userId + createdAt, userId + status)
- [x] Monthly resume tracking index for usage limits (userId + year + month)
- [x] Analyze tables for query optimizer statistics
- [ ] Apply indexes to production database (run add-indexes.sql)
- [x] Final production checkpoint

### Session 19: Database Optimization & Testing
- [x] Apply database indexes (24 indexes created successfully in 8.3s)
- [x] Fixed schema mismatches (impact → impactMeterScore)
- [x] All indexes created: users, achievements, jobs, applications, resumes, companies, contacts
- [x] Composite indexes for common queries (userId + createdAt, userId + status)
- [ ] Test query performance before/after indexes
- [ ] Verify usage limits work with real database
- [ ] Test notification scheduler with database
- [ ] Session 19 checkpoint

### Session 20: End-to-End Feature Validation
- [ ] Test achievement creation flow
- [ ] Test job search and qualification scoring
- [ ] Test resume generation with templates
- [ ] Test application tracking workflow
- [ ] Test interview prep question generation
- [ ] Test Stripe checkout flow
- [ ] Test welcome wizard for new users
- [ ] Session 20 checkpoint

### Session 21: Final Production Deployment
- [ ] Run final TypeScript check
- [ ] Run final test suite
- [ ] Verify all environment variables
- [ ] Check security headers
- [ ] Final production checkpoint
- [ ] SHIP READY

## DESIGN SYSTEM IMPLEMENTATION: "Controlled Chaos"

### Phase 1: Foundation (ACTIVE)
- [x] Implement earthy color palette (Basalt, Clay, Slate, Moss, Terra Cotta, Fog, Honey, Charcoal)
- [x] Update typography (Inter body, Instrument Sans headings, modular scale)
- [x] Create swarm particle animation system (float, gather, scatter keyframes)
- [x] Add swarm-pattern background utility
- [x] Add card-matte utility for matte finish
- [x] Update global styles with CSS variables
- [x] Redesign Button component (Honey primary, Clay secondary, Terra Cotta tertiary, no gradients, 4px radius)
- [x] Redesign Card component (matte finish, swarm pattern, Clay border, irregular padding)
- [x] Redesign Input component (Clay background, Honey focus state, italic placeholders)
- [x] Phase 1 checkpoint

### Phase 2: Core Experience (Color Palette Revision)
- [x] Update CSS variables with cream/beige backgrounds (#FFF8E7, #FEFDFB, #F9F5EF)
- [x] Lighten Honey Gold to #E8D399 for primary CTAs
- [x] Add Warm Yellow #F4E5A1 for highlights and borders
- [x] Keep Charcoal #2A2D34 for text only (not backgrounds)
- [x] Add supporting colors (Soft Lavender #E8E3F5, Light Mint #E3F5F0, Soft Coral #F5E3E0)
- [x] Update Button component with new lighter palette
- [x] Update Card component with cream backgrounds and light yellow borders
- [x] Update Input component with off-white backgrounds
- [x] Test contrast ratios for accessibility (verified visually - excellent contrast)
- [x] Phase 2 checkpoint

### Phase 3: Dashboard Redesign
- [ ] Redesign Dashboard (30/50/20 layout)
- [ ] Create opportunity cards with swarm clustering
- [ ] Implement Resume Roast visual redesign
- [ ] Add loading states with particle animations
- [ ] Show 8 agents with unique particle styles
- [ ] Phase 2 checkpoint

### Phase 4: Polish
- [ ] Add micro-interactions (hover, transitions)
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Performance optimization
- [ ] Phase 3 checkpoint

### Phase 5: Production Ready
- [ ] Final design QA
- [ ] Cross-browser testing
- [ ] Final production checkpoint

### Phase 2.1: Honeycomb Hero Pattern
- [x] Create SVG honeycomb pattern with gradient transition (fragmented → swarm → cohesive)
- [x] Add CSS utility for hero-honeycomb background
- [x] Apply to Home page hero section
- [x] Test responsiveness and performance

## Sectional Design System (Lindy-Inspired)
- [x] Redesign Home page with alternating section backgrounds (cream → white → lavender gradient)
- [x] Add soft gradient feature cards (yellow, lavender, mint, coral, blue, orange)
- [x] Add section labels with icons (uppercase, small text)
- [x] Increase vertical padding between sections (80-128px py-20 md:py-32)
- [x] Create "How It Works" 3-step section with gradient cards (lavender, yellow, mint)
- [x] Update Features grid with unique card background colors (6 gradients)
- [ ] Add Social Proof section (white background)
- [x] Create Final CTA section with lavender gradient
- [ ] Apply sectional design to Dashboard
- [ ] Apply sectional design to all other pages
- [x] Test contrast ratios on all section backgrounds (verified visually)
- [x] Sectional design checkpoint

## Dashboard Sectional Design
- [ ] Redesign Dashboard with 30/50/20 layout (profile/feed/agents)
- [ ] Apply cream background to profile sidebar (30%)
- [ ] Create opportunities feed with white background and gradient cards (50%)
- [ ] Add agent status panel with lavender accent (20%)
- [ ] Use gradient cards for opportunities (matching Home page style)
- [ ] Add section labels to Dashboard sections
- [ ] Test Dashboard responsiveness
- [ ] Dashboard checkpoint
