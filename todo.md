# CareerSwarm Implementation TODO
## Original November 2024 Vision - Complete Implementation

**CHECKPOINT 1 STATUS:** Backend Foundation Complete ✅

---

## Phase 1: Database Schema (Foundation) ✅ COMPLETE

- [x] Create `uploaded_resumes` table (file_key, user_id, filename, extracted_text, upload_date)
- [x] Create `work_history` table (user_id, company, role, start_date, end_date, description)
- [x] Create `achievements` table (user_id, work_history_id, description, metrics, keywords, usage_count, success_rate)
- [x] Create `skills` table (user_id, skill_name, proficiency, source)
- [x] Create `certifications` table (user_id, name, issuer, date)
- [x] Create `superpowers` table (user_id, title, evidence_achievement_ids, rank)
- [x] Create `user_preferences` table (user_id, target_roles, industries, location_type, salary_min)
- [x] Create `job_opportunities` table (company, role, url, match_score, strategic_fit, discovered_date)
- [x] Create `company_profiles` table (company_name, culture, tech_stack, funding, employee_count)
- [x] Create `applications` table (user_id, opportunity_id, status, submitted_date, follow_up_date)
- [x] Create `application_packages` table (application_id, resume_text, cover_letter, contacts)
- [x] Create `agent_execution_logs` table (agent_name, user_id, execution_time, cost, result)
- [x] Create `onboarding_progress` table (user_id, current_step, completed_steps, profile_data)
- [x] Run `pnpm db:push` to apply schema

**Notes:** All tables created successfully via SQL execution. Schema matches November 2024 design.

---

## Phase 2: Resume Parser Backend ✅ COMPLETE

- [x] Create `server/resumeParser.ts` with text extraction logic
- [x] Implement PDF parsing (use pdf-parse npm package)
- [x] Implement DOCX parsing (use mammoth npm package)
- [x] Create tRPC procedure `resume.upload` (handles file upload to S3)
- [x] Create tRPC procedure `resume.parse` (extracts text from uploaded file)
- [x] Create tRPC procedure `resume.extractProfile` (uses LLM to extract work history)
- [x] Implement achievement extraction with metrics detection
- [x] Implement skills extraction with categorization
- [x] Implement "Superpowers" generation (top 3 differentiators)
- [x] Create consolidation logic for multiple resumes
- [x] Add progress tracking for async parsing

**Notes:** Implemented in `server/routers.ts` under `onboarding` router. Uses `invokeLLM` for extraction with structured JSON schema output.

---

## Phase 3: Onboarding Flow - Step 1 (Welcome) 📋 TODO

- [ ] Create `client/src/pages/Onboarding.tsx` (main container)
- [ ] Create `client/src/components/onboarding/WelcomeStep.tsx`
- [ ] Add CareerSwarm logo and tagline
- [ ] Add value proposition bullets (Extract achievements, Build database, Find opportunities, Generate applications)
- [ ] Add "Let's Build Your Profile →" CTA button
- [ ] Add "Takes about 10 minutes" subtitle
- [ ] Route new users (onboarding_progress.current_step = 0) to /onboarding

---

## Phase 4: Onboarding Flow - Step 2 (Upload Resumes) 📋 TODO

- [ ] Create `client/src/components/onboarding/UploadStep.tsx`
- [ ] Add progress indicator "Step 1 of 5 [────○○○○○] 20%"
- [ ] Implement drag-and-drop file upload area
- [ ] Add file type validation (PDF, DOCX, TXT)
- [ ] Add file size validation (max 10MB per file)
- [ ] Show uploaded files list with remove option
- [ ] Add "Continue with X Files →" button
- [ ] Upload files to S3 on submit
- [ ] Store file references in `uploaded_resumes` table
- [ ] Update `onboarding_progress.current_step = 1`

---

## Phase 5: Onboarding Flow - Step 3 (AI Extraction) 📋 TODO

- [ ] Create `client/src/components/onboarding/ExtractionStep.tsx`
- [ ] Add progress indicator "Step 2 of 5 [██──○○○○○] 40%"
- [ ] Show "🤖 AI is Building Your Profile..." heading
- [ ] Add real-time progress checklist (Extracting work history, Finding achievements, Identifying skills, Analyzing metrics, Consolidating data)
- [ ] Implement Server-Sent Events (SSE) for live updates
- [ ] Create tRPC subscription `resume.parseProgress` for SSE
- [ ] Show live preview box (X jobs, Y achievements, Z skills)
- [ ] Highlight "Standout Achievement" as it's found
- [ ] Auto-advance to Step 4 when parsing complete
- [ ] Update `onboarding_progress.current_step = 2`

---

## Phase 6: Onboarding Flow - Step 4 (Profile Review) 📋 TODO

- [ ] Create `client/src/components/onboarding/ProfileReviewStep.tsx`
- [ ] Add progress indicator "Step 3 of 5 [████○○○○○] 60%"
- [ ] Show Profile Summary card (X roles, Y achievements, Z skills, Quality Score)
- [ ] Show "Your Superpowers" section (top 3 with evidence)
- [ ] Add "View Detailed Profile →" button (opens modal)
- [ ] Create detailed profile modal with expandable work history
- [ ] Allow inline editing of achievements
- [ ] Add "Looks Good, Continue →" button
- [ ] Update `onboarding_progress.current_step = 3`

---

## Phase 7: Onboarding Flow - Step 5 (Set Preferences) 📋 TODO

- [ ] Create `client/src/components/onboarding/PreferencesStep.tsx`
- [ ] Add progress indicator "Step 4 of 5 [██████○○○] 80%"
- [ ] Add target role input (multi-select with suggestions)
- [ ] Add industries input (multi-select: AI, SaaS, Fintech, etc.)
- [ ] Add location preference (Remote, Hybrid, Specific cities)
- [ ] Add salary range slider
- [ ] Add company stage checkboxes (Seed, Series A/B/C, Public)
- [ ] Add "Start Finding Jobs →" button
- [ ] Save preferences to `user_preferences` table
- [ ] Update `onboarding_progress.current_step = 4`
- [ ] Redirect to dashboard on completion

---

## Phase 8: Dashboard Home (Overview) 📋 TODO

- [ ] Create `client/src/pages/DashboardHome.tsx`
- [ ] Add sidebar navigation (Dashboard, Profile, Jobs, Applications, Analytics, Settings)
- [ ] Show "Welcome back, [Name]!" greeting
- [ ] Add 4 metric cards (Active Applies, Response Rate, This Week Applied, Interviews Scheduled)
- [ ] Add Quick Actions section (Find New Opportunities, Create Application, Edit Profile, View Analytics)
- [ ] Add Recent Activity feed (Follow-ups due, Responses received, New matches)
- [ ] Add Performance Insights section (AI-generated insights about what's working)
- [ ] Create tRPC procedures for dashboard metrics

---

## Phase 9: Master Profile View 📋 TODO

- [ ] Create `client/src/pages/MasterProfile.tsx`
- [ ] Show contact info header (name, email, phone, LinkedIn, location)
- [ ] Add Profile Completeness gauge (percentage bar)
- [ ] Show "Your Superpowers" section with evidence
- [ ] Show Work Experience section (expandable cards per role)
- [ ] For each role: show achievement count, usage stats, top achievement
- [ ] Add "View All" / "Edit" / "Add Achievement" buttons per role
- [ ] Show Skills section (categorized by type)
- [ ] Show Certifications section
- [ ] Add "Edit Profile" mode with inline editing
- [ ] Create tRPC procedures for profile CRUD operations

---

## Phase 10: Agent System - Scout Agent 📋 TODO

- [ ] Create `server/agents/scout.ts`
- [ ] Implement job search across multiple sources (LinkedIn, Greenhouse, Lever, Wellfound)
- [ ] Use search API or web scraping for job boards
- [ ] Implement Crunchbase integration for recently-funded companies
- [ ] Deduplicate results by company name
- [ ] Rank results by match score
- [ ] Create tRPC procedure `agents.scout.discover`
- [ ] Return list of JobOpportunity objects
- [ ] Log execution to `agent_execution_logs`

---

## Phase 11: Agent System - Profiler Agent 📋 TODO

- [ ] Create `server/agents/profiler.ts`
- [ ] Research company culture (Glassdoor, LinkedIn)
- [ ] Extract tech stack (job description, company website)
- [ ] Find funding info (Crunchbase, PitchBook)
- [ ] Analyze employee count and growth
- [ ] Generate company profile summary
- [ ] Create tRPC procedure `agents.profiler.analyze`
- [ ] Store results in `company_profiles` table

---

## Phase 12: Agent System - Qualifier Agent 📋 TODO

- [ ] Create `server/agents/qualifier.ts`
- [ ] Calculate match score (0-100) based on user profile vs job requirements
- [ ] Analyze strategic fit (why this role matches user's superpowers)
- [ ] Identify gaps (what's missing from user's profile)
- [ ] Generate qualification memo
- [ ] Create tRPC procedure `agents.qualifier.verify`
- [ ] Update `job_opportunities.match_score` and `strategic_fit`

---

## Phase 13: Agent System - Hunter Agent 📋 TODO

- [ ] Create `server/agents/hunter.ts`
- [ ] Find hiring manager on LinkedIn
- [ ] Find recruiter contacts
- [ ] Extract contact info (email patterns, LinkedIn URLs)
- [ ] Generate contact priority ranking
- [ ] Create tRPC procedure `agents.hunter.findContacts`
- [ ] Store contacts in `application_packages.contacts`

---

## Phase 14: Agent System - Tailor Agent 📋 TODO

- [ ] Create `server/agents/tailor.ts`
- [ ] Select best achievements from Master Profile for this role
- [ ] Rewrite achievement bullets to match job description keywords
- [ ] Emphasize relevant superpowers
- [ ] Format resume in clean, ATS-friendly structure
- [ ] Generate multiple resume versions (chronological, functional)
- [ ] Create tRPC procedure `agents.tailor.generateResume`
- [ ] Store resume in `application_packages.resume_text`

---

## Phase 15: Agent System - Scribe Agent 📋 TODO

- [ ] Create `server/agents/scribe.ts`
- [ ] Write personalized cover letter
- [ ] Reference specific company details from Profiler
- [ ] Highlight strategic fit from Qualifier
- [ ] Include call-to-action
- [ ] Generate LinkedIn outreach message
- [ ] Generate email outreach message
- [ ] Create tRPC procedure `agents.scribe.writeLetter`
- [ ] Store in `application_packages.cover_letter`

---

## Phase 16: Agent System - Assembler Agent 📋 TODO

- [ ] Create `server/agents/assembler.ts`
- [ ] Combine all agent outputs into ApplicationPackage
- [ ] Generate application checklist (steps to apply)
- [ ] Create submission timeline
- [ ] Package everything for download
- [ ] Create tRPC procedure `agents.assembler.package`
- [ ] Store in `application_packages` table

---

## Phase 17: Jobs View (Discovered Opportunities) 📋 TODO

- [ ] Create `client/src/pages/Jobs.tsx`
- [ ] Show list of discovered opportunities
- [ ] Display match score badge (color-coded)
- [ ] Show company logo, role, location, compensation
- [ ] Add filter controls (match score, industry, location)
- [ ] Add sort controls (match score, date discovered, salary)
- [ ] Show strategic fit summary on hover
- [ ] Add "Quick Apply" button (triggers full agent workflow)
- [ ] Add "View Details" button (opens opportunity modal)

---

## Phase 18: Applications View (Submitted Packages) 📋 TODO

- [ ] Create `client/src/pages/Applications.tsx`
- [ ] Show list of submitted applications
- [ ] Display status badges (Submitted, Responded, Interview, Rejected)
- [ ] Show submission date and follow-up date
- [ ] Add timeline view (visual progress)
- [ ] Add "Send Follow-up" button (generates follow-up email)
- [ ] Add "Schedule Interview" button (opens calendar)
- [ ] Show application package details (resume, cover letter, contacts)

---

## Phase 19: Analytics View 📋 TODO

- [ ] Create `client/src/pages/Analytics.tsx`
- [ ] Show response rate chart (line graph over time)
- [ ] Show applications by status (pie chart)
- [ ] Show top-performing achievements (bar chart)
- [ ] Show insights cards (AI-generated patterns)
- [ ] Add date range filter
- [ ] Add export to CSV button

---

## Phase 20: Quick Apply Workflow 📋 TODO

- [ ] Create `client/src/components/QuickApplyModal.tsx`
- [ ] Show progress stepper (Scout → Profiler → Qualifier → Hunter → Tailor → Scribe → Assembler)
- [ ] Execute agents sequentially with real-time updates
- [ ] Show estimated time remaining
- [ ] Display intermediate results as they complete
- [ ] Show final package preview
- [ ] Add "Download Package" button
- [ ] Add "Submit Application" button (marks as submitted)
- [ ] Add cost tracking (show LLM API costs)

---

## Phase 21: Testing & Polish 📋 TODO

- [ ] Test complete onboarding flow (all 5 steps)
- [ ] Test resume parsing with real PDF/DOCX files
- [ ] Test agent workflow end-to-end
- [ ] Test Quick Apply with real job posting
- [ ] Add loading states for all async operations
- [ ] Add error handling for LLM failures
- [ ] Add error handling for file upload failures
- [ ] Write vitest tests for resume parser
- [ ] Write vitest tests for each agent
- [ ] Write vitest tests for onboarding flow
- [ ] Add Sentry error tracking for agent failures
- [ ] Add PostHog events for onboarding completion
- [ ] Optimize LLM prompts for cost reduction

---

## Phase 22: Final Delivery 📋 TODO

- [ ] Remove old dashboard components (DashboardHero, EvidenceGrid, OnboardingSentence)
- [ ] Remove /cyber route (replaced by /onboarding)
- [ ] Update App.tsx routing (/ → marketing, /onboarding → onboarding, /dashboard → DashboardHome)
- [ ] Update README with new architecture
- [ ] Create user documentation
- [ ] Save checkpoint with complete implementation
- [ ] Deploy to production

---

## CHECKPOINT 1 SUMMARY

**Completed:**
- ✅ Complete database schema (13 tables)
- ✅ Backend API routes (onboarding, profile, agents, opportunities, applications, notifications)
- ✅ Database helpers (all CRUD operations)
- ✅ Resume parser backend with LLM integration
- ✅ Superpower generation logic
- ✅ Clean server architecture (old code removed)

**Next Session:**
- Build frontend onboarding flow (Phases 3-7)
- Build Master Profile dashboard (Phases 8-9)
- Implement 7-agent system (Phases 10-16)
- Build Jobs & Applications views (Phases 17-18)
- Complete testing & delivery (Phases 21-22)
