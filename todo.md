# CareerSwarm Implementation TODO
## Post-Audit: Missing Features Implementation

---

## 🚨 PRIORITY 1: CRITICAL FEATURES (MUST IMPLEMENT)

### Resume Text Extraction
- [ ] Install pdf-parse npm package for PDF text extraction
- [ ] Install mammoth npm package for DOCX text extraction
- [ ] Implement extractTextFromPDF function in server/resumeParser.ts
- [ ] Implement extractTextFromDOCX function in server/resumeParser.ts
- [ ] Update processResumes API to extract real text from uploaded files
- [ ] Handle extraction errors gracefully

### LLM-Based Achievement Extraction
- [ ] Create structured JSON schema for achievement extraction
- [ ] Implement parseWorkHistory function using invokeLLM
- [ ] Implement extractAchievements function using invokeLLM
- [ ] Implement extractSkills function using invokeLLM
- [ ] Implement generateSuperpowers function using invokeLLM
- [ ] Update processResumes API to use real LLM extraction
- [ ] Save extracted data to database (workExperiences, achievements, skills)
- [ ] Handle multi-resume consolidation logic

### Profile Editing
- [ ] Add edit mode toggle to Profile page
- [ ] Implement inline editing for achievements
- [ ] Add "Add Achievement" button and modal
- [ ] Add "Edit Work Experience" functionality
- [ ] Create profile.updateAchievement tRPC procedure
- [ ] Create profile.addAchievement tRPC procedure
- [ ] Create profile.deleteAchievement tRPC procedure
- [ ] Create profile.updateWorkExperience tRPC procedure
- [ ] Add "Add Work Experience" button and form

---

## ⚠️ PRIORITY 2: IMPORTANT FEATURES (SHOULD IMPLEMENT)

### Application Detail Page
- [ ] Create /applications/:id route in App.tsx
- [ ] Create ApplicationDetail.tsx page component
- [ ] Display generated resume text
- [ ] Display cover letter text
- [ ] Display LinkedIn message
- [ ] Display email outreach template
- [ ] Add copy-to-clipboard buttons for all materials
- [ ] Show application timeline (created, applied, response, interview, etc.)
- [ ] Add "Edit Status" dropdown
- [ ] Add "Add Note" functionality
- [ ] Create applications.getById tRPC procedure
- [ ] Create applications.getMaterials tRPC procedure

### Opportunity Detail Modal
- [ ] Create OpportunityDetailModal.tsx component
- [ ] Show full job description
- [ ] Display strategic analysis from Profiler agent
- [ ] Show hiring manager name, title, LinkedIn
- [ ] Show recruiter name, email
- [ ] Display match score breakdown
- [ ] Add "Quick Apply" button in modal
- [ ] Add "Save for Later" button
- [ ] Create opportunities.getById tRPC procedure

### Achievement Usage Tracking Display
- [ ] Add usage stats to achievement cards on Profile page
- [ ] Display "Used in X applications" badge
- [ ] Display "Y% response rate" metric
- [ ] Update achievement usage count when application created
- [ ] Calculate response rate from applications table
- [ ] Add "Top Performing" badge for high-performing achievements
- [ ] Create profile.getAchievementStats tRPC procedure

---

## 📊 PRIORITY 3: ENHANCEMENTS (NICE TO HAVE)

### Analytics Dashboard
- [ ] Create /analytics route in App.tsx
- [ ] Create Analytics.tsx page component
- [ ] Add response rate line chart (over time)
- [ ] Add applications by status pie chart
- [ ] Add top-performing achievements bar chart
- [ ] Add key metrics cards (total applications, response rate, interviews, offers)
- [ ] Add date range filter
- [ ] Add export to CSV button
- [ ] Create analytics.overview tRPC procedure
- [ ] Create analytics.responseRates tRPC procedure
- [ ] Create analytics.topAchievements tRPC procedure
- [ ] Add AI-generated insights section

### Real-Time Progress Updates
- [ ] Install ws npm package for WebSocket support
- [ ] Create WebSocket server in server/_core/websocket.ts
- [ ] Add progress event emitters to processResumes
- [ ] Add progress event emitters to Quick Apply workflow
- [ ] Update Extraction.tsx to connect to WebSocket
- [ ] Show live preview of extracted achievements
- [ ] Show real-time agent execution status
- [ ] Add progress percentage for each agent

### Jobs Page Improvements
- [ ] Add sort dropdown (match score, date, salary)
- [ ] Add industry filter
- [ ] Add location filter
- [ ] Add salary range filter
- [ ] Add company stage filter
- [ ] Add search bar for company/role name
- [ ] Add "Save for Later" button on job cards
- [ ] Create opportunities.search tRPC procedure with filters

### Follow-Up Management
- [ ] Add "Next Follow-up Due" badge to application cards
- [ ] Add "Send Follow-up" button to ApplicationDetail page
- [ ] Create follow-up email template generator
- [ ] Add follow-up reminder notifications
- [ ] Create applications.sendFollowUp tRPC procedure
- [ ] Create applications.getFollowUpsDue tRPC procedure
- [ ] Add follow-up timeline to ApplicationDetail page

---

## 🔧 TECHNICAL IMPROVEMENTS

### Error Handling
- [ ] Add try-catch blocks to all agent functions
- [ ] Add error logging to agent execution logs
- [ ] Show user-friendly error messages on frontend
- [ ] Add retry logic for failed LLM calls
- [ ] Add Sentry error tracking for agent failures

### Performance Optimization
- [ ] Add caching for frequently-accessed profile data
- [ ] Optimize LLM prompts to reduce token usage
- [ ] Add pagination to applications list
- [ ] Add pagination to opportunities list
- [ ] Add lazy loading for achievement lists

### Testing
- [ ] Write vitest tests for resume parser
- [ ] Write vitest tests for each agent
- [ ] Write vitest tests for onboarding flow APIs
- [ ] Write E2E tests for Quick Apply workflow
- [ ] Test with real PDF/DOCX resume files

---

## 📈 FUTURE ENHANCEMENTS

### Real API Integrations
- [ ] Integrate LinkedIn Jobs API for Scout agent
- [ ] Integrate Greenhouse API for job discovery
- [ ] Integrate Lever API for job discovery
- [ ] Integrate Crunchbase API for company funding data
- [ ] Integrate Glassdoor API for company reviews
- [ ] Add web scraping fallback for unavailable APIs

### Automation Features
- [ ] Email automation for outreach
- [ ] LinkedIn message automation
- [ ] Auto-apply to jobs (with user approval)
- [ ] Scheduled follow-up emails
- [ ] Interview prep agent
- [ ] Salary negotiation agent

---

## ✅ ALREADY COMPLETED

- [x] Complete database schema (13 tables)
- [x] 5-step onboarding UI (Welcome, Upload, Extraction, Review, Preferences)
- [x] Master Profile dashboard (basic view)
- [x] All 7 agents (Scout, Profiler, Qualifier, Hunter, Tailor, Scribe, Assembler)
- [x] Jobs discovery page with Scout integration
- [x] Applications tracking page
- [x] Quick Apply workflow orchestration
- [x] Auth system (Manus OAuth)
- [x] File upload to S3
- [x] tRPC API infrastructure

---

## 📝 CURRENT SESSION TASKS

Starting with Priority 1 features:
1. Resume text extraction (PDF/DOCX)
2. LLM-based achievement extraction
3. Profile editing capabilities
