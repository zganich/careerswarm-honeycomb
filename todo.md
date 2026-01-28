# CareerSwarm Implementation TODO
## Post-Audit: Missing Features Implementation

---

## 🚨 PRIORITY 1: CRITICAL FEATURES (COMPLETED ✅)

### Resume Text Extraction ✅
- [x] Install pdf-parse npm package for PDF text extraction
- [x] Install mammoth npm package for DOCX text extraction
- [x] Implement extractTextFromPDF function in server/resumeParser.ts
- [x] Implement extractTextFromDOCX function in server/resumeParser.ts
- [x] Update processResumes API to extract real text from uploaded files
- [x] Handle extraction errors gracefully

### LLM-Based Achievement Extraction ✅
- [x] Create structured JSON schema for achievement extraction
- [x] Implement parseWorkHistory function using invokeLLM
- [x] Implement extractAchievements function using invokeLLM
- [x] Implement extractSkills function using invokeLLM
- [x] Implement generateSuperpowers function using invokeLLM
- [x] Update processResumes API to use real LLM extraction
- [x] Save extracted data to database (workExperiences, achievements, skills)
- [x] Handle multi-resume consolidation logic

### Profile Editing ✅ COMPLETE
- [x] Create /profile/edit page with tabbed interface
- [x] Add work experience CRUD (add, edit, delete)
- [x] Add achievement CRUD (add, edit, delete, reorder)
- [x] Add skill CRUD (add, edit, delete)
- [x] Wire up tRPC mutations for all edits
- [x] Add database helper functions
- [ ] Add superpower evidence selection (deferred - can be added later)
- [ ] Add target preferences editing (deferred - can be added later)

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

### Opportunity### Opportunity Detail Modal ✅ COMPLETE
- [x] Create OpportunityDetailModal component
- [x] Show full job description
- [x] Display strategic analysis (whyNow from Profiler agent)
- [x] Show hiring manager and recruiter contacts from Hunter agent
- [x] Display match score with visual progress bar
- [x] Add "Quick Apply" button in modal
- [x] Integrate modal into Jobs page with "View Details" button
- [x] opportunities.getById tRPC procedure already existed
- [ ] Add "Save for Later" button (deferred)ById tRPC procedure

### Achievement Usage Tracking Display ✅ COMPLETE
- [x] Add usage stats to achievement cards on Profile page
- [x] Display "Used in X applications" badge
- [x] Display "Y% success rate" metric with color coding
- [x] Add "Top Performer" badge for achievements with 70%+ success rate
- [x] Create profile.getAchievementStats tRPC procedure
- [x] Use existing schema fields (timesUsed, applicationsWithAchievement, responsesWithAchievement)
- [ ] Update achievement usage count when application created (deferred - needs Quick Apply integration)

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

Completing remaining Priority 2 & 3 features:
1. ✅ Resume text extraction (COMPLETE)
2. ✅ LLM-based achievement extraction (COMPLETE)
3. ✅ Application detail page (COMPLETE)
4. ✅ Profile editing UI (COMPLETE)
5. ✅ Achievement usage tracking display (COMPLETE)
6. ✅ Opportunity detail modal (COMPLETE)
7. ✅ Analytics dashboard (COMPLETE)
8. ⚠️ Real-time progress updates (DEFERRED - requires WebSocket infrastructure)
9. ✅ Sort/filter improvements (COMPLETE)


---

## 🔄 POST-AUDIT: ADDITIONAL MISSING FEATURES

### Dashboard Home Page ✅ COMPLETE
- [x] Create /dashboard route in App.tsx
- [x] Create Dashboard.tsx page component
- [x] Display key metrics cards (Active Applications, Response Rate, This Week Applied, Interviews Scheduled)
- [x] Add Quick Actions section with links to Jobs, Applications, Profile Edit, Analytics
- [x] Add Recent Activity feed showing responses and new matches
- [x] Add Performance Insights section with AI-generated tips
- [x] Wire up analytics.getOverview tRPC procedure
- [x] Add trend indicators (up/down arrows) for metrics


### Notification System ✅ COMPLETE
- [x] Database schema already exists (notifications table)
- [x] Backend API already exists (notifications.list, notifications.markAsRead)
- [x] Database helpers already exist (getNotifications, createNotification, markNotificationAsRead)
- [x] Created NotificationBell component with popover UI
- [x] Added notification bell to Home page header
- [x] Display unread count badge
- [x] Show notification types (follow_up_due, response_received, new_match)
- [x] Mark notifications as read on click
- [x] Link to related applications from notifications

### Follow-Up Tracking ✅ COMPLETE
- [x] Database schema already exists (lastFollowUpAt, nextFollowUpDue, followUpCount fields)
- [x] Added "Follow-up Due" badge to Applications page
- [x] Badge shows when nextFollowUpDue is past current date
- [x] Orange color for visibility


### Application Timeline View ✅ COMPLETE
- [x] Created Timeline tab in ApplicationDetail page
- [x] Display all timeline events (created, applied, response, phone screen, interview, offer, follow-ups)
- [x] Show timestamps for each event
- [x] Visual timeline with colored dots and connecting line
- [x] Display next follow-up due date if applicable
- [x] Set Timeline as default tab

### Status Pipeline View ✅ COMPLETE
- [x] Created StatusPipeline component
- [x] Visual pipeline showing 7 stages (Draft → Applied → Response → Phone Screen → Interview → Final → Offer)
- [x] Highlight current stage and completed stages
- [x] Show checkmarks for completed stages
- [x] Handle special statuses (accepted, rejected, withdrawn, ghosted)
- [x] Integrated into ApplicationDetail Timeline tab


### Saved Opportunities ✅ COMPLETE
- [x] Added savedOpportunities table to database schema
- [x] Added SavedOpportunity type export
- [x] Created database helper functions (saveOpportunity, unsaveOpportunity, getSavedOpportunities, isOpportunitySaved)
- [x] Added tRPC procedures (opportunities.save, opportunities.unsave, opportunities.getSaved, opportunities.isSaved)
- [x] Created SaveOpportunityButton component with bookmark icon
- [x] Integrated SaveOpportunityButton into Jobs page opportunity cards
- [x] Toggle between Bookmark and BookmarkCheck icons based on saved status
- [x] Show toast notifications on save/unsave


---

## 🎯 ORIGINAL DESIGN DOCUMENT FEATURES (Still Missing)

### Saved Opportunities Page
- [ ] Create /saved route in App.tsx
- [ ] Create SavedOpportunities.tsx page component
- [ ] Display all bookmarked jobs in grid/list view
- [ ] Add filter by company stage
- [ ] Add filter by location
- [ ] Add filter by date saved
- [ ] Add sort by match score, date saved, company name
- [ ] Add bulk actions (remove multiple, apply to multiple)
- [ ] Show "View All →" link from Dashboard Recent Activity section

### Application Notes & Activity
- [ ] Add "Add Note" button to ApplicationDetail page
- [ ] Create notes input form with timestamp
- [ ] Display notes chronologically in "Notes & Activity" section
- [ ] Save notes to database (add notes field to applications table or create notes table)
- [ ] Create applications.addNote tRPC procedure

### Profile Completeness Indicator
- [ ] Add "Profile Completeness" progress bar to Profile page
- [ ] Calculate completeness percentage (contact info, work experience, achievements, skills, preferences)
- [ ] Show "Complete Your Profile →" button when < 100%
- [ ] Create profile.getCompleteness tRPC procedure

### Achievement Detail Modal
- [ ] Create AchievementDetailModal component
- [ ] Show full achievement description with edit capability
- [ ] Display metrics (type, value, timeframe, context)
- [ ] Display keywords/tags
- [ ] Show usage statistics (times used, success rate, applications list)
- [ ] Show linked superpowers
- [ ] Add "Edit" and "Delete" buttons
- [ ] Trigger modal from achievement cards on Profile page

### Dashboard "View All Activity" Page
- [ ] Create /activity route in App.tsx
- [ ] Create Activity.tsx page component
- [ ] Display all notifications and activity in chronological order
- [ ] Filter by type (follow-ups, responses, new matches, notes)
- [ ] Pagination for long activity lists
- [ ] Link from Dashboard "View All Activity →" button


### Saved Opportunities Page ✅ COMPLETE
- [x] Create /saved route in App.tsx
- [x] Create SavedOpportunities.tsx page component
- [x] Display all bookmarked jobs in grid/list view
- [x] Add filter by company stage
- [x] Add filter by location
- [x] Add filter by date saved
- [x] Add sort by match score, date saved, company name
- [x] Show opportunity details (company, role, location, salary, match score)
- [x] Add Quick Apply button for each opportunity
- [x] Add View Details button to open modal
- [x] Add Remove button to unsave opportunities
- [x] Show "Saved X time ago" timestamp
- [x] Empty state with link to Jobs page


### Application Notes ✅ COMPLETE
- [x] Create applicationNotes table in schema
- [x] Add ApplicationNote type exports
- [x] Add application notes helper functions to db.ts (getApplicationNotes, createApplicationNote, deleteApplicationNote)
- [x] Add getNotes, addNote, deleteNote procedures to applications router
- [x] Create NotesSection component with textarea input
- [x] Display notes chronologically with timestamps
- [x] Add delete button for each note
- [x] Add Notes tab to ApplicationDetail page
- [x] Show empty state when no notes exist
- [x] Use date-fns for "X time ago" formatting
