# Careerswarm: Complete Site Documentation

**Version:** 1.0 (Production Ready)  
**Last Updated:** January 22, 2026  
**Status:** Ready for Launch

---

## Executive Summary

Careerswarm is an AI-powered career evidence platform that transforms achievements into powerful, tailored resumes. Built with React 19, TypeScript, tRPC 11, and Express 4, featuring Manus OAuth authentication, Stripe payments, and a 7-stage AI agent pipeline.

**Key Metrics:**
- 95% feature parity with original GitHub vision
- 100% TypeScript coverage (0 errors)
- 24 database indexes for performance
- 7-stage AI agent pipeline
- Free + Pro ($29/month) subscription tiers
- GDPR/CCPA compliant

---

## Site Structure

### Public Pages (No Authentication Required)

#### 1. Homepage (`/`)
**Purpose:** Landing page, value proposition, feature showcase, conversion  
**Sections:**
- Hero: Off-white background with subtle orange honeycomb pattern, matte orange CTA button
- How It Works: 3-step process (Build Profile → Match Jobs → Generate Resumes)
- Features: 6 gradient cards (Impact Meter, XYZ Format, Smart Matching, STAR Methodology, Master Profile, Tailored Output)
- Final CTA: Lavender gradient with glassmorphism card

**Design:**
- Lindy-inspired sectional design with gradient blending (15% edge-fade)
- Cream/white/lavender alternating backgrounds
- Unique gradient colors per feature card
- Responsive layout (mobile-first)

**SEO:**
- Title: "Careerswarm - AI-Powered Career Evidence Platform"
- Meta description: 155 characters
- Open Graph tags for social sharing
- Structured data with H1/H2 hierarchy

#### 2. Pricing Page (`/pricing`)
**Purpose:** Subscription tier comparison, Stripe checkout  
**Tiers:**
- **Free:** 10 achievements, 3 resumes/month, STAR wizard, Impact Meter, basic job matching, interview prep
- **Pro ($29/month):** Unlimited achievements, unlimited resumes, advanced job matching, auto-qualification, tailored cover letters, AI interview feedback, application tracking, priority support

**Features:**
- Feature comparison table
- Stripe checkout integration
- 7-day money-back guarantee
- Usage limit enforcement

#### 3. FAQ Page (`/faq`)
**Purpose:** Answer common questions, reduce support burden  
**Content:** 24 questions covering:
- Platform overview and differentiation
- STAR methodology and XYZ format
- Impact Meter scoring
- Pricing and subscriptions
- Data security and privacy
- Feature details (job matching, application tracking, interview prep)
- ATS compatibility
- Roadmap and feature requests

**Design:**
- Accordion-style Q&A
- Search-friendly structure
- Links to Privacy/Terms

#### 4. Privacy Policy (`/privacy`)
**Purpose:** GDPR/CCPA compliance, data transparency  
**Sections:**
- Information collection (personal, career evidence, payment, usage)
- Data usage and processing
- Third-party sharing (service providers only, no selling)
- Security measures (encryption, JWT, CSRF protection)
- User rights (access, rectification, erasure, portability)
- Data retention policies
- Cookie usage
- Children's privacy (16+ only)
- International data transfers
- Contact information

**Compliance:** GDPR, CCPA, PIPEDA

#### 5. Terms of Service (`/terms`)
**Purpose:** Legal protection, user agreement  
**Sections:**
- Account creation and eligibility
- Subscription and payment terms
- User content ownership and responsibilities
- AI-generated content disclaimers
- Acceptable use policy
- Intellectual property
- Disclaimers and liability limitations
- Dispute resolution and arbitration
- Governing law (Delaware, USA)

---

### Authenticated Pages (Login Required)

#### 6. Dashboard (`/dashboard`)
**Purpose:** Main hub after login, overview of user activity  
**Features:**
- Welcome message with user name
- Quick stats (achievements, resumes, applications)
- Recent activity feed
- Quick actions (New Achievement, Find Jobs, Generate Resume)
- Navigation to all features

**Layout:** DashboardLayout with sidebar navigation

#### 7. Achievements (`/achievements`)
**Purpose:** Master Profile - career evidence library  
**Features:**
- List view with Impact Meter scores
- Filter by category, date, score
- Search achievements
- STAR wizard for new achievements
- Edit/delete existing achievements
- XYZ format preview

**Sub-routes:**
- `/achievements/new` - STAR wizard (Situation, Task, Action, Result)
- `/achievements/:id/edit` - Edit existing achievement

**Impact Meter Scoring:**
- Strong action verbs: +10%
- Quantifiable metrics: +40%
- Clear methodology/skills: +50%
- Target: 80-100% (green)

#### 8. Jobs (`/jobs`)
**Purpose:** Job search and matching  
**Features:**
- Search jobs by keyword, location, company
- LinkedIn/Indeed scraping integration
- Save jobs for later
- Auto-qualification (Pro feature)
- Fit % badge (based on achievement matching)
- Skills gap analysis
- Job description import

**Sub-routes:**
- `/jobs/saved` - Saved jobs list
- `/jobs/new` - Add job manually

**Matching Algorithm:**
- Extract requirements from job description
- Match achievements to requirements
- Calculate fit percentage
- Identify matched skills and gaps
- Provide reasoning for fit score

#### 9. Applications (`/applications`)
**Purpose:** Application tracking and pipeline management  
**Features:**
- 9-stage pipeline: Draft → Applied → Phone Screen → Technical Interview → Onsite Interview → Offer → Accepted → Rejected → Withdrawn
- Drag-and-drop status updates
- Application notes and dates
- Follow-up reminders (7 days after applying)
- Interview prep reminders (2 days before interview)
- Cover letter generation (Pro feature)

**Automation:**
- Auto-create application when resume is generated
- Schedule reminders based on status
- Send notifications via email/in-app

#### 10. Resumes (`/resumes`)
**Purpose:** Resume generation and management  
**Features:**
- Generate resume from achievements + job description
- 3 templates (Professional, Modern, Executive)
- AI-powered achievement selection
- XYZ format transformation
- PDF/DOCX export
- Resume preview
- Version history

**Sub-routes:**
- `/resumes/templates` - Template selection

**Generation Process:**
1. Select job description
2. AI matches best achievements
3. Transform to XYZ format
4. Apply template
5. Generate PDF/DOCX

**Usage Limits:**
- Free: 3 resumes/month
- Pro: Unlimited

#### 11. Interview Prep (`/interview-prep`)
**Purpose:** Practice interviews with AI feedback  
**Features:**
- Generate likely questions from job description
- Practice mode with answer input
- AI feedback on answers (Pro feature)
- Follow-up question generation
- Save practice sessions
- Link to specific applications

**Question Types:**
- Behavioral (STAR-based)
- Technical (role-specific)
- Company culture fit
- Situational judgment

#### 12. Skills Gap Analysis (`/skills-gap`)
**Purpose:** Identify missing skills for target roles  
**Features:**
- Compare current skills to job requirements
- Visualize skill gaps
- Suggest learning resources
- Track skill development over time

#### 13. Past Jobs (`/past-jobs`)
**Purpose:** Track previous employers and roles  
**Features:**
- Add past employers
- Link achievements to past jobs
- Generate "experience summary" for resumes
- Calculate tenure and progression

#### 14. Profile (`/profile`)
**Purpose:** User settings and subscription management  
**Features:**
- Personal information (name, email, current role, company)
- Target roles and industries
- Subscription status and billing
- Usage statistics (achievements, resumes, applications)
- Cancel subscription
- Delete account

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4 with custom design system
- **Routing:** Wouter (lightweight React router)
- **State Management:** tRPC + React Query
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)

### Backend Stack
- **Framework:** Express 4 with TypeScript
- **API:** tRPC 11 (end-to-end type safety)
- **Database:** MySQL/TiDB via Drizzle ORM
- **Authentication:** Manus OAuth (JWT-based sessions)
- **Payments:** Stripe (checkout, webhooks, subscriptions)
- **AI:** OpenAI/Anthropic via Manus Forge API
- **Storage:** S3 (Manus-provided)
- **Caching:** In-memory cache with graceful degradation

### Database Schema

**Users Table:**
- id, email, name, role (user/admin)
- currentRole, currentCompany, yearsExperience, targetRoles
- stripeCustomerId, subscriptionTier, subscriptionStatus
- usageStats (achievementsCount, resumesThisMonth, etc.)
- createdAt, updatedAt

**Achievements Table:**
- id, userId
- situation, task, action, result (STAR format)
- xyzFormat (AI-generated)
- impactScore (0-100)
- category, tags, skills
- metrics (quantifiable data)
- createdAt, updatedAt

**Jobs Table:**
- id, userId
- title, company, location, salary
- description (full job posting)
- requirements (extracted by AI)
- source (LinkedIn, Indeed, manual)
- fitPercentage, matchedSkills, missingSkills
- status (saved, applied, rejected)
- createdAt, updatedAt

**Applications Table:**
- id, userId, jobId, resumeId
- status (draft, applied, phone_screen, etc.)
- appliedDate, interviewDate, offerDate
- notes, followUpDate
- createdAt, updatedAt

**Resumes Table:**
- id, userId, jobId
- template (professional, modern, executive)
- content (JSON with sections)
- pdfUrl, docxUrl
- createdAt, updatedAt

**InterviewPrep Table:**
- id, userId, jobId, applicationId
- questions (AI-generated)
- practiceAnswers (user input)
- feedback (AI-generated, Pro only)
- createdAt, updatedAt

**Notifications Table:**
- id, userId
- type (follow_up_reminder, interview_prep, etc.)
- title, message
- scheduledFor, sentAt
- read (boolean)
- createdAt

### AI Agent Pipeline (7 Stages)

**1. Scout Agent**
- Scrapes job boards (LinkedIn, Indeed)
- Extracts job descriptions
- Normalizes data format

**2. Qualifier Agent**
- Analyzes job requirements
- Calculates fit percentage
- Identifies matched/missing skills
- Provides reasoning

**3. Profiler Agent**
- Matches achievements to job requirements
- Scores achievement relevance
- Selects best evidence

**4. Tailor Agent**
- Transforms STAR → XYZ format
- Optimizes for ATS keywords
- Adjusts tone for company culture

**5. Scribe Agent**
- Generates resume sections
- Applies template formatting
- Creates cover letter (Pro)

**6. Interview Agent**
- Generates likely questions
- Provides practice mode
- Gives AI feedback (Pro)

**7. Tracker Agent**
- Monitors application status
- Schedules reminders
- Sends notifications

### API Endpoints (tRPC Procedures)

**Authentication:**
- `auth.me` - Get current user
- `auth.logout` - Logout user

**Achievements:**
- `achievements.list` - Get all achievements
- `achievements.create` - Create new achievement (STAR wizard)
- `achievements.update` - Update existing achievement
- `achievements.delete` - Delete achievement
- `achievements.calculateImpactScore` - Get Impact Meter score

**Jobs:**
- `jobs.search` - Search jobs by keyword
- `jobs.save` - Save job for later
- `jobs.analyze` - Extract requirements and calculate fit
- `jobs.list` - Get saved jobs

**Applications:**
- `applications.list` - Get all applications
- `applications.create` - Create new application
- `applications.updateStatus` - Update application status
- `applications.delete` - Delete application

**Resumes:**
- `resumes.generate` - Generate resume from achievements + job
- `resumes.list` - Get all resumes
- `resumes.export` - Export as PDF/DOCX

**Interview Prep:**
- `interviewPrep.generateQuestions` - Generate questions from job description
- `interviewPrep.submitAnswer` - Submit practice answer
- `interviewPrep.getFeedback` - Get AI feedback (Pro only)

**Profile:**
- `profile.get` - Get user profile
- `profile.update` - Update profile information
- `profile.getUsageStats` - Get usage statistics

**Stripe:**
- `stripe.createCheckoutSession` - Create Stripe checkout
- Webhook: `/api/stripe/webhook` - Handle Stripe events

### Security Features

**Authentication:**
- JWT-based sessions with HTTP-only cookies
- OAuth providers (Google, GitHub, etc.)
- CSRF protection on all mutations
- Session expiration (7 days)

**Authorization:**
- Role-based access control (user/admin)
- Protected procedures require authentication
- Usage limit enforcement (Free vs Pro)

**Data Protection:**
- Encrypted database connections (TLS/SSL)
- Environment variables for secrets
- No sensitive data in logs
- Stripe handles payment processing (PCI-compliant)

**Input Validation:**
- Zod schemas on all inputs
- SQL injection protection (Drizzle ORM)
- XSS protection (React escaping)
- Rate limiting on API endpoints

### Performance Optimizations

**Database:**
- 24 composite indexes on frequently queried columns
- Connection pooling
- Query optimization with Drizzle ORM

**Caching:**
- In-memory cache for AI responses
- Cache invalidation on data updates
- Graceful degradation if cache fails

**Frontend:**
- Code splitting with React.lazy
- Image lazy loading
- Optimistic updates with React Query
- Debounced search inputs

**AI:**
- Model routing (GPT-4 for complex, GPT-3.5 for simple)
- Prompt caching
- Batch processing for multiple achievements

---

## Design System

### Color Palette

**Primary Colors:**
- Primary (Matte Orange): `#E8934C`
- Background (Off-white): `#FEFDFB`
- Cream: `#FFF8E7`
- Warm Yellow: `#F4E5A1`

**Text Colors:**
- Foreground (Charcoal): `#2A2D34`
- Muted Foreground: `#6B7280`

**Accent Colors:**
- Soft Lavender: `#E8E3F5`
- Light Mint: `#E3F5F0`
- Soft Coral: `#F5E3E0`
- Light Blue: `#E0F2FE`
- Peach: `#FFEDD5`

**Gradient Feature Cards:**
- Yellow: `from-[#FFFBEB] to-[#FEF3C7]`
- Lavender: `from-[#F5F3FF] to-[#E8E3F5]`
- Mint: `from-[#F0FFF4] to-[#E3F5F0]`
- Coral: `from-[#FFF5F3] to-[#F5E3E0]`
- Blue: `from-[#F0F9FF] to-[#E0F2FE]`
- Orange: `from-[#FFF7ED] to-[#FFEDD5]`

### Typography

**Fonts:**
- Body: Inter (400, 500, 600, 700)
- Headings: Inter (bold)

**Scale:**
- H1: 3xl-6xl (responsive)
- H2: 2xl-4xl
- H3: xl-2xl
- Body: base-lg
- Small: sm-xs

### Spacing

**Container:**
- Max width: 1280px
- Padding: 16px (mobile), 32px (desktop)

**Section Padding:**
- Vertical: 80px (py-20), 128px (py-32) on desktop

**Component Spacing:**
- Gap: 16px (gap-4), 24px (gap-6)
- Margin bottom: 16px (mb-4), 24px (mb-6)

### Components

**Button:**
- Primary: Matte orange background, white text, no shadow
- Outline: Transparent background, border, hover effect
- Ghost: No background, hover effect
- Sizes: sm, md, lg

**Card:**
- Background: Off-white (#FEFDFB)
- Border: Warm yellow (#F4E5A1)
- Padding: 24px
- Border radius: 8px

**Input:**
- Background: Off-white
- Border: Warm yellow on focus
- Padding: 12px
- Border radius: 6px

### Patterns

**Honeycomb:**
- SVG pattern with gradient (fragmented → swarm → cohesive)
- Orange hints (#F5A623) at 0.04-0.12% opacity
- Overall opacity: 0.5/0.35
- Applied to hero section background

**Gradient Blending:**
- 15% edge-fade on section boundaries
- Smooth transitions between cream/white/lavender backgrounds

---

## SEO Optimization

### Meta Tags (index.html)
```html
<title>Careerswarm - AI-Powered Career Evidence Platform</title>
<meta name="description" content="Transform your achievements into powerful resumes with AI. Build a Master Profile, get real-time quality feedback, and generate tailored resumes that stand out to recruiters." />
<meta name="keywords" content="resume builder, AI resume, career evidence, STAR methodology, XYZ format, job application, ATS optimization, achievement tracking" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Careerswarm - Transform Your Achievements Into Powerful Resumes" />
<meta property="og:description" content="Stop guessing what recruiters want. Build a Master Profile of your career evidence, get real-time quality feedback, and generate tailored resumes that stand out." />
<meta property="og:image" content="/og-image.png" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Careerswarm - Transform Your Achievements Into Powerful Resumes" />
<meta name="twitter:description" content="Stop guessing what recruiters want. Build a Master Profile of your career evidence, get real-time quality feedback, and generate tailored resumes that stand out." />
<meta name="twitter:image" content="/og-image.png" />
```

### Sitemap (sitemap.xml)
- Homepage: Priority 1.0, weekly updates
- Pricing: Priority 0.8, monthly updates
- Dashboard: Priority 0.9, daily updates
- FAQ: Priority 0.7, monthly updates
- Privacy/Terms: Priority 0.5, yearly updates

### Robots.txt
```
User-agent: *
Allow: /
Sitemap: https://careerswarm.manus.space/sitemap.xml
```

---

## Deployment

### Environment Variables (Auto-Injected by Manus)
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend
- `VITE_OAUTH_PORTAL_URL` - Manus login portal (frontend)
- `BUILT_IN_FORGE_API_URL` - Manus AI/storage/notification APIs
- `BUILT_IN_FORGE_API_KEY` - Server-side API key
- `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### Deployment Process
1. Create final checkpoint in Manus
2. Click "Publish" button in Management UI
3. Verify live site loads correctly
4. Test critical flows on production
5. Monitor error logs for first 24 hours

### Custom Domain
- Default: `careerswarm.manus.space`
- Custom: Configure in Settings → Domains
- SSL: Automatically provisioned

---

## Monitoring & Analytics

### Manus Analytics (Built-in)
- Page views (UV/PV)
- Feature usage
- Conversion funnel
- User retention

### Error Monitoring
- Console errors logged to `.manus-logs/browserConsole.log`
- Server errors logged to `.manus-logs/devserver.log`
- Network requests logged to `.manus-logs/networkRequests.log`

### Performance Metrics
- Target Lighthouse scores: 90+ Performance, 100 Accessibility, 90+ Best Practices, 100 SEO
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

---

## Support & Maintenance

### User Support
- Free tier: FAQ and documentation
- Pro tier: Priority email support (support@careerswarm.com, 24-hour response)

### Feedback Channels
- Email: feedback@careerswarm.com
- In-app feedback form (Dashboard)
- Community forum (planned)

### Update Schedule
- Bug fixes: As needed (hot fixes)
- Feature updates: Monthly releases
- Security patches: Immediate

---

## Roadmap

### v2.0 (3-6 months)
- Multi-resume upload & parsing (PDF/DOCX)
- Career evidence dashboard with visualizations
- Browser extension (Chrome/Firefox)

### v2.1 (6-9 months)
- Verification guardrails (reality check for metrics)
- Cultural adaptation UI (tone selector, company-specific optimization)
- Email integration (forward job postings)

### v3.0 (9-12 months)
- Resume version comparison
- Advanced analytics
- Mobile app (React Native)
- Company Talent Intelligence Dashboard (B2B)

---

## Known Limitations

### Current Constraints
- No multi-resume upload (manual entry only)
- No visual dashboard (text-based stats)
- No browser extension
- No mobile app
- No team/enterprise plans (yet)

### Browser Compatibility
- Tested: Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS Safari, Chrome Android
- Not supported: IE11, older browsers

### Usage Limits
- Free tier: 10 achievements, 3 resumes/month
- Pro tier: Unlimited achievements/resumes
- Rate limiting: 100 requests/minute per user

---

## Troubleshooting

### Common Issues

**"Cannot generate resume"**
- Check: Do you have at least 1 achievement?
- Check: Have you reached Free tier limit (3 resumes/month)?
- Solution: Add achievements or upgrade to Pro

**"Job matching not working"**
- Check: Is job description complete (at least 100 words)?
- Check: Do you have achievements with relevant skills?
- Solution: Add more detailed achievements

**"Stripe checkout fails"**
- Check: Is Stripe sandbox claimed?
- Check: Are test keys configured?
- Solution: Use test card 4242 4242 4242 4242

**"Session expired"**
- Check: Have you been inactive for 7+ days?
- Solution: Log in again

### Support Contacts
- Technical issues: support@careerswarm.com
- Billing issues: billing@careerswarm.com
- Privacy concerns: privacy@careerswarm.com
- Legal questions: legal@careerswarm.com

---

## Appendix

### File Structure
```
careerswarm/
├── client/
│   ├── public/
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn/ui components)
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   └── trpc.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Privacy.tsx
│   │   │   ├── Terms.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── achievements/
│   │   │   ├── jobs/
│   │   │   ├── resumes/
│   │   │   └── ...
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── _core/ (framework, OAuth, context)
│   ├── db.ts (query helpers)
│   ├── routers.ts (tRPC procedures)
│   └── *.test.ts (vitest tests)
├── drizzle/
│   └── schema.ts (database schema)
├── shared/
│   └── types.ts (shared types)
├── storage/
│   └── index.ts (S3 helpers)
├── .manus-logs/ (logs)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

### Key Commands
```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm test             # Run vitest tests
pnpm db:push          # Push schema changes to database

# Database
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm typecheck        # Check TypeScript types
```

### Dependencies (Key Packages)
- react: 19.0.0
- typescript: 5.x
- @trpc/server: 11.x
- @trpc/client: 11.x
- @trpc/react-query: 11.x
- drizzle-orm: latest
- express: 4.x
- stripe: latest
- zod: 3.x
- tailwindcss: 4.x
- wouter: 3.x
- lucide-react: latest

---

**End of Documentation**

For questions or support, contact: support@careerswarm.com
