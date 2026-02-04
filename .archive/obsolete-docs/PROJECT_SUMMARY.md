# CareerSwarm - Project Documentation

**AI-Powered Career Evidence Platform**

Version: c2bc14ad  
GitHub: https://github.com/zganich/careerswarm-honeycomb  
Stack: React 19, Tailwind 4, Express 4, tRPC 11, Drizzle ORM, MySQL/TiDB

---

## Table of Contents

1. [Overview](#overview)
2. [Core Architecture](#core-architecture)
3. [The 7-Stage Agent Pipeline](#the-7-stage-agent-pipeline)
4. [Additional Intelligence Agents](#additional-intelligence-agents)
5. [User Interface](#user-interface)
6. [Database Schema](#database-schema)
7. [Testing Infrastructure](#testing-infrastructure)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Development Guide](#development-guide)

---

## Overview

CareerSwarm transforms the job application process from "career chaos to order" through a **7-stage AI agent pipeline** that analyzes, tailors, and optimizes every application with strategic intelligence.

### Key Value Propositions

- **Evidence-Based Career Management**: Store achievements in STAR format with quantifiable impact
- **AI-Powered Application Intelligence**: 7 specialized agents analyze every aspect of job applications
- **Strategic Career Transitions**: Bridge Skills logic helps users pivot careers with confidence
- **ATS Optimization**: Ensure resumes pass automated screening systems
- **Comprehensive Tracking**: Kanban-style board tracks applications from scouting to offer

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 (with @theme inline blocks using OKLCH)
- Wouter for routing
- shadcn/ui component library
- tRPC client with React Query

**Backend:**
- Express 4 with TypeScript
- tRPC 11 for type-safe APIs
- Drizzle ORM for database operations
- MySQL/TiDB database
- Manus OAuth for authentication

**AI Integration:**
- Manus built-in Forge API for LLM access
- Structured JSON responses with schema validation
- Context-aware prompts for each agent

**Testing:**
- Vitest for backend unit tests (127 passing)
- Playwright for E2E testing (20 passing, 2 skipped)
- Auth bypass utility for reliable E2E tests
- Video recording enabled for all test runs

---

## Core Architecture

### Project Structure

```
careerswarm/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and tRPC client
│   │   ├── App.tsx          # Routes and layout
│   │   └── main.tsx         # Entry point
│   └── index.html
├── server/                   # Backend Express + tRPC
│   ├── _core/               # Framework-level code
│   ├── db.ts                # Database query helpers
│   ├── routers.ts           # tRPC procedures
│   ├── pdf-export.mjs       # PDF generation
│   └── *.test.ts            # Vitest tests
├── drizzle/                 # Database schema and migrations
│   ├── schema.ts            # Table definitions
│   └── meta/                # Migration metadata
├── tests/                   # Playwright E2E tests
│   ├── auth.spec.ts
│   └── achievements.spec.ts
├── storage/                 # S3 integration helpers
├── shared/                  # Shared types and constants
└── todo.md                  # Project task tracking
```

### Database Schema (14 Tables)

**Core Tables:**
- `users` - User accounts with OAuth integration
- `achievements` - STAR-format career accomplishments
- `jobs` - Job listings with qualification scoring
- `applications` - Application tracking with AI analysis
- `generatedResumes` - AI-generated resumes with ATS analysis

**Supporting Tables:**
- `companies` - Company research data
- `contacts` - Recruiter and hiring manager contacts
- `skills` - Skill taxonomy
- `jobDescriptions` - Parsed job requirements
- `pastEmployerJobs` - Historical employment data
- `sourceMaterials` - Reference documents
- `powerVerbs` - Action verb library
- `achievementSkills` - Achievement-skill mapping
- `achievementVerifications` - Achievement validation

### Authentication Flow

1. User clicks "Sign In" → redirects to Manus OAuth portal
2. User authenticates → callback to `/api/oauth/callback`
3. Session cookie created with JWT
4. Protected routes check `ctx.user` via tRPC context
5. Frontend reads auth state via `trpc.auth.me.useQuery()`

---

## The 7-Stage Agent Pipeline

### 1. Scout Agent (`jobs.search`)

**Purpose:** Discover and capture job opportunities

**Input:**
- Job URL (LinkedIn, Indeed, company career pages)
- Manual job description paste

**Process:**
1. Scrapes job description from URL using Cheerio
2. Extracts structured data: title, company, location, requirements
3. Stores in `jobs` table with metadata

**Output:**
```typescript
{
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  jobUrl?: string;
  platform?: string;
  source: 'url' | 'manual' | 'direct';
}
```

**tRPC Procedure:** `jobs.search`

---

### 2. Qualifier Agent (`jobs.qualify`)

**Purpose:** Assess job fit against user's profile

**Input:**
- Job ID
- User's achievements and skills

**Process:**
1. Analyzes job requirements vs. user qualifications
2. Generates qualification score (0-100)
3. Provides match reasoning and gap analysis
4. Uses LLM with structured JSON output

**Output:**
```typescript
{
  qualificationScore: number; // 0-100
  qualificationReasoning: string;
  matchedSkills: string[];
  missingSkills: string[];
}
```

**tRPC Procedure:** `jobs.qualify`

---

### 3. Profiler Agent (`applications.profile`)

**Purpose:** Strategic analysis of job requirements

**Input:**
- Application ID (links to job and user)

**Process:**
1. Identifies pain points in job description
2. Creates strategic hook for application
3. Generates interview preparation questions
4. Stores in `profilerAnalysis` JSON column

**Output:**
```typescript
{
  painPoints: string[];
  strategicHook: string;
  interviewQuestions: string[];
}
```

**System Prompt:** "You are a strategic career advisor analyzing job descriptions to identify employer pain points and craft compelling application narratives."

**tRPC Procedure:** `applications.profile`

---

### 4. Tailor Agent (`resumes.generate`)

**Purpose:** Generate role-specific resumes from achievements

**Input:**
- Job ID
- User's achievements
- Target format (markdown, pdf, docx)

**Process:**
1. Selects relevant achievements for job
2. Transforms to XYZ format: "Accomplished [X] by doing [Y] as measured by [Z]"
3. Generates resume with professional formatting
4. Stores in `generatedResumes` table

**Output:**
```typescript
{
  id: number;
  resumeContent: string; // Markdown format
  format: 'markdown' | 'pdf' | 'docx';
  generatedAt: Date;
}
```

**XYZ Transformation Example:**
- **STAR Input:** "Situation: Company needed to reduce churn. Task: Implement retention program. Action: Built email automation. Result: Reduced churn by 35%"
- **XYZ Output:** "Reduced customer churn by 35% by implementing automated email retention program with personalized engagement triggers"

**tRPC Procedure:** `resumes.generate`

#### Appendix A: Dynamic Format Selection Logic (2026 Standards)

**Purpose:** Instructions for the Tailor Agent to select the optimal resume architecture based on Job Role, Industry, and Region.

**1. The Three Core Architectures**

Select the base template based on the user's career trajectory:

- **Format A: Enhanced Reverse-Chronological (The Default)**
  - **Trigger:** Standard corporate roles, steady employment history, Finance, Legal, Operations.
  - **Logic:** Focuses on linear progression. Use for 90% of applications to maximize recruiter familiarity.
  - **Risk:** Highlights employment gaps; avoid if user has >6 month gaps.

- **Format B: Strategic Hybrid (The Pivot)**
  - **Trigger:** Career changers, "Squiggly" career paths, Executives, or Mid-career transitions.
  - **Logic:** Places a robust "Skills/Summary" section at the top to frame capabilities before showing work history.
  - **Why:** Mitigates "garbage data" risks associated with pure functional resumes in modern ATS.

- **Format C: Functional (Restricted Use)**
  - **Trigger:** ONLY for users with massive employment gaps returning to the workforce.
  - **Warning:** Highly susceptible to ATS rejection due to lack of timeline anchors. Mark as "High Risk" in UI.

**2. Sectoral Optimization Rules**

| Sector | Rules |
|--------|-------|
| **Technology & Engineering** | Must include Artifact Links (GitHub, Portfolio). Tech Stack section must precede Work Experience. Group by Languages, Frameworks, Tools. Enforce Google XYZ Formula. Metric focus: Latency, Scalability, Uptime. |
| **Creative & Design** | External Portfolio Link mandatory. Use "Visual-Strategic" layout—clean typography and white space, but avoid columns/tables that break parsing. Metric focus: Conversion rates, User Engagement. |
| **Federal Government (USA)** | Strict 2-Page Maximum. Must include hours worked per week, salary, supervisor details. Dates: MM/DD/YYYY format. |
| **Healthcare & Medical Sales** | Keywords: Clinical fluency (GMP, Clinical Trials) + Commercial Drive (Quota Attainment). Hybrid format preferred; certifications/licenses prominent. |
| **Skilled Trades** | Focus: Equipment proficiency, safety records, apprenticeship history. Quantify reliability (e.g., "0 safety incidents," "100% inspection pass rate"). |

**3. Regional Compliance Filters**

| Region | Rules |
|--------|-------|
| **North America / UK / Australia** | Prohibited: Photos, Age, Marital Status, Religion. Tone: Achievement-driven, "I" statements. |
| **Germany / DACH** | Required: Professional Headshot, strict chronological order, explanation of all timeline gaps. |
| **France / Asia** | Photos common/expected. Education often placed higher (France). |

**4. ATS "Safe Parse" Guardrails**

The ATS Compatibility Agent flags the following as Critical Errors:

- **Dates:** Must use MM/YYYY or Month YYYY. Never use "Seasons" (e.g., "Summer 2026").
- **Layout:** Single-column body text only. No text boxes, sidebars, or tables.
- **Fonts:** Standard only (Arial, Calibri, Helvetica). No custom/script fonts.
- **Headers:** Use standard labels ("Experience") not creative ones ("My Journey").

---

### 5. Scribe Agent (`applications.generateOutreach`)

**Purpose:** Create personalized outreach messages

**Input:**
- Application ID
- Company research data

**Process:**
1. Generates LinkedIn connection message
2. Creates cold email subject and body
3. Personalizes based on job and company context
4. Stores in `outreachContent` JSON column

**Output:**
```typescript
{
  linkedinMessage: string; // 300 char limit
  coldEmailSubject: string;
  coldEmailBody: string;
}
```

**System Prompt:** "You are a professional networking expert crafting personalized outreach messages that build genuine connections without being salesy."

**tRPC Procedure:** `applications.generateOutreach`

---

### 6. Success Predictor Agent (`applications.predictSuccess`)

**Purpose:** Predict probability of receiving job offer

**Input:**
- Application ID
- Job description
- User profile and achievements
- Application status

**Process:**
1. Analyzes match quality, experience level, skill alignment
2. Identifies green flags (strong matches) and red flags (gaps)
3. Generates probability score (0-100)
4. Provides reasoning for prediction
5. Stores in `analytics.successPrediction`

**Output:**
```typescript
{
  probability: number; // 0-100
  reasoning: string;
  greenFlags: string[]; // 3-5 positive indicators
  redFlags: string[]; // 3-5 concerns
}
```

**System Prompt:** "You are a data-driven hiring analyst. Predict the probability of this candidate receiving an offer (0-100%) based on job requirements, candidate qualifications, and hiring market dynamics."

**tRPC Procedure:** `applications.predictSuccess`

**UI Integration:** Overview tab displays circular progress ring with color-coded scoring:
- Green (>70%): Strong match
- Blue (40-70%): Moderate match
- Amber (<40%): Weak match

---

### 7. Skill Gap Agent (`applications.analyzeSkillGap`)

**Purpose:** Identify missing skills and create upskilling plan

**Input:**
- Application ID
- Job requirements
- User's current skills

**Process:**
1. Extracts required skills from job description
2. Compares against user's demonstrated skills
3. Identifies critical gaps
4. Creates actionable upskilling plan with resources
5. Stores in `analytics.skillGap`

**Output:**
```typescript
{
  missingSkills: string[]; // 1-8 critical gaps
  upskillingPlan: string[]; // Actionable steps with time estimates
}
```

**System Prompt:** "You are a career development advisor. Identify critical skills missing from the candidate's profile and create a prioritized upskilling plan with specific resources and time estimates."

**tRPC Procedure:** `applications.analyzeSkillGap`

**UI Integration:** Overview tab displays:
- "Missing Pieces" section with gap icons
- Upskilling plan with course/resource links
- "Start Learning" CTA buttons

---

## Additional Intelligence Agents

### ATS Compatibility Agent (`resumes.checkATS`)

**Purpose:** Score resume for ATS parsing compatibility

**Input:**
- Resume ID
- Resume content
- Job description

**Process:**
1. Analyzes formatting issues (columns, tables, graphics)
2. Checks keyword density against job requirements
3. Verifies standard section headings
4. Generates ATS score (0-100)
5. Provides recommended changes

**Output:**
```typescript
{
  atsScore: number; // 0-100
  formattingIssues: string[];
  keywordMatch: string[];
  recommendedChanges: string[];
}
```

**System Prompt:** "You are a technical ATS (Applicant Tracking System) parser like Taleo or Greenhouse. Analyze this resume for parsing compatibility."

**Scoring Criteria:**
- **90-100:** Excellent - Will parse perfectly
- **70-89:** Good - Minor issues, likely to parse
- **50-69:** Fair - Significant issues, may lose data
- **Below 50:** Poor - Major formatting problems

**tRPC Procedure:** `resumes.checkATS`

**UI Integration:** Integrated into ResumePreview with visual sidebar:
- Circular progress gauge (0-100)
- Color-coded scoring (green/blue/amber/red)
- Formatting checklist with icons
- Keyword match badges
- Recommendation cards

---

### Pivot Analyzer (Career Path Intelligence) (`applications.analyzePivot`)

**Purpose:** Identify transferable skills for career transitions

**Input:**
- Application ID
- User's background (achievements)
- Target role (job description)

**Process:**
1. Identifies 3-5 "Bridge Skills" - transferable strengths
2. Shows context translation (from current → to target role)
3. Provides strategic framing for each skill
4. Creates overall pivot strategy
5. Enforces "no fluff words" constraint
6. Stores in `pivotAnalysis` JSON column

**Output:**
```typescript
{
  bridgeSkills: Array<{
    skill: string;
    fromContext: string; // How skill appears in current role
    toContext: string; // How skill applies to target role
    strategicFrame: string; // Language for interviews/resumes
  }>;
  pivotStrategy: string; // 2-3 sentence overall strategy
  transferableStrengths: string[]; // 3-5 unique value adds
}
```

**Bridge Skill Examples:**
- **Sales → Strategy:** "Client needs analysis" becomes "Market opportunity assessment"
- **Teaching → Training:** "Curriculum design" becomes "Learning program development"
- **Engineering → Product:** "Technical architecture" becomes "Product systems thinking"
- **Operations → Consulting:** "Process optimization" becomes "Operational excellence advisory"

**Forbidden Fluff Words:** synergy, leverage, utilize, robust, dynamic, innovative, cutting-edge, best-in-class, world-class, game-changing, disruptive

**System Prompt:** "You are a career transition strategist. Identify 3-5 Bridge Skills that connect the candidate's background to the target role. Be specific and concrete. NO FLUFF WORDS."

**tRPC Procedure:** `applications.analyzePivot`

**UI Integration:** Career Path tab with purple-themed design:
- Pivot strategy card (gradient background)
- Bridge skills timeline with visual connections
- "From" and "To" context badges
- Strategic framing callouts
- Transferable strengths badges
- "Analyze Career Path" CTA button

---

### Resume Roaster (`public.roast`)

**Purpose:** Brutally honest resume critique

**Input:**
- Resume text (minimum 50 characters)

**Process:**
1. Analyzes resume with cynical VC recruiter persona
2. Identifies buzzwords, vague claims, formatting issues
3. Provides specific, actionable improvements
4. Public endpoint (no authentication required)

**Output:**
```typescript
{
  roast: string; // Brutally honest critique
  score: number; // 0-100
  improvements: string[];
}
```

**Persona:** "You are a cynical VC recruiter who has reviewed 10,000+ resumes this week. You don't sugarcoat. Ever."

**What the Roaster Hates:**
- Buzzwords without metrics (spearheaded, orchestrated, leverage, synergy)
- "Responsibilities included..." - who cares what you were supposed to do?
- Vague achievements ("improved efficiency", "enhanced performance")
- Generic summaries that could apply to any human with a pulse
- Formatting disasters (walls of text, inconsistent styling)
- Skills lists that read like keyword dumps

**What Impresses the Roaster (Rarely):**
- Specific numbers: "$2.3M ARR", "47% reduction", "3x improvement"
- Clear cause-and-effect: "Did X, which resulted in Y"
- Evidence of actual ownership and decision-making
- Brevity. You have 6 seconds. Make them count.

**tRPC Procedure:** `public.roast` (no auth required)

---

## User Interface

### Dashboard Layout

**Navigation Structure:**
- Sidebar navigation (persistent for internal tools)
- Top navigation (for public-facing sections)

**Key Sections:**
- **Home:** Welcome screen with quick actions
- **Dashboard:** Main workspace with achievement management
- **Job Matcher:** Search and save jobs
- **Swarm Board:** Application tracker (Kanban-style)
- **Profile:** User settings and account management
- **Resume Roast:** Public resume critique tool

---

### Achievement Management

**STAR Wizard:**
- **Situation:** Context and challenge
- **Task:** Your responsibility
- **Action:** What you did
- **Result:** Quantifiable outcome

**Impact Meter:**
- Visual gauge showing impact score (0-100)
- Color-coded: Red (<40), Yellow (40-70), Green (>70)

**XYZ Transformation:**
- Automatically converts STAR to XYZ format
- "Accomplished [X] by doing [Y] as measured by [Z]"

**Usage Limits:**
- Free tier: 10 achievements
- Pro tier: Unlimited

---

### Job Matcher

**Features:**
- Search by URL or manual paste
- Qualification scoring (0-100)
- Save jobs for later
- Quick apply workflow

**Job Card Display:**
- Title and company
- Location and salary (if available)
- Qualification score badge
- Quick actions: Apply, Save, Dismiss

---

### Swarm Board (Application Tracker)

**Status Columns:**
1. **Scouted:** Jobs discovered but not applied
2. **Saved:** Jobs saved for later
3. **Draft:** Applications in progress
4. **Submitted:** Applications sent
5. **Screening:** Under review
6. **Interview:** Interview scheduled/completed
7. **Offer:** Offer received
8. **Rejected:** Application rejected
9. **Withdrawn:** User withdrew application

**Application Cards:**
- Job title and company
- Status badge
- Days since last update
- Quick actions: View details, Update status, Delete

**Drag-and-Drop:**
- Move cards between columns to update status
- Optimistic UI updates with rollback on error

---

### Application Detail Modal

**5 Tabs:**

**1. Overview Tab:**
- Timeline (created, submitted, last update)
- Success Gauge (probability ring with color coding)
- Gap Analysis (missing skills and upskilling plan)
- Quick actions: Run Intelligence Analysis

**2. Documents Tab:**
- Generated resumes list
- Download options (PDF, DOCX, Markdown)
- ATS compatibility scores
- Generate new resume button

**3. Strategy Tab:**
- Profiler analysis (pain points, strategic hook)
- Interview questions
- Outreach content (LinkedIn, email)
- Copy-to-clipboard buttons

**4. Career Path Tab:**
- Career transition strategy
- Bridge skills timeline
- Strategic framing callouts
- Transferable strengths badges
- Analyze Career Path button

**5. Notes Tab:**
- Free-form notes textarea
- Auto-save on blur
- Unsaved changes indicator

---

### Resume Preview

**Layout:**
- Left: Resume content preview
- Right: ATS Analysis sidebar

**ATS Analysis Sidebar:**
- Circular progress gauge (0-100)
- Color-coded scoring
- Formatting checklist
- Keyword match badges
- Recommended changes cards
- "Re-scan" button

---

## Database Schema

### users

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  avatar TEXT,
  bio TEXT,
  currentRole VARCHAR(255),
  targetRole VARCHAR(255),
  linkedinUrl TEXT,
  githubUrl TEXT,
  portfolioUrl TEXT,
  phone VARCHAR(50),
  location VARCHAR(255),
  role ENUM('admin', 'user') DEFAULT 'user',
  subscriptionTier ENUM('free', 'pro') DEFAULT 'free',
  subscriptionStatus VARCHAR(50),
  stripeCustomerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### achievements

```sql
CREATE TABLE achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  
  -- STAR Format
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  
  -- XYZ Transformation
  xyzAccomplishment TEXT,
  
  -- Metadata
  roleTitle VARCHAR(255),
  companyName VARCHAR(255),
  startDate DATE,
  endDate DATE,
  category VARCHAR(100),
  tags JSON,
  
  -- Impact Scoring
  impactScore INT, -- 0-100
  impactMetrics JSON,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verificationSource VARCHAR(255),
  verificationDate TIMESTAMP,
  
  -- Visibility
  visibility ENUM('public', 'private', 'unlisted') DEFAULT 'public',
  
  -- AI Analysis
  skillsExtracted JSON,
  powerVerbsUsed JSON,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### jobs

```sql
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  
  -- Core Info
  title VARCHAR(255) NOT NULL,
  companyName VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  
  -- Sourcing
  jobUrl TEXT,
  platform VARCHAR(100), -- LinkedIn, Indeed, etc.
  source ENUM('url', 'manual', 'direct') NOT NULL,
  
  -- Details
  salary VARCHAR(100),
  employmentType VARCHAR(50),
  experienceLevel VARCHAR(50),
  remote BOOLEAN,
  
  -- Qualification
  qualificationScore INT, -- 0-100
  qualificationReasoning TEXT,
  
  -- Requirements (parsed)
  requiredSkills JSON,
  preferredSkills JSON,
  requirements TEXT,
  
  -- Status
  status ENUM('active', 'closed', 'archived') DEFAULT 'active',
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### applications

```sql
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  jobId INT NOT NULL,
  resumeId INT,
  
  -- Application Materials
  tailoredResumeContent TEXT,
  coverLetterContent TEXT,
  customAnswers JSON,
  
  -- Submission
  submittedAt TIMESTAMP,
  submissionMethod VARCHAR(50), -- auto, manual, email
  confirmationNumber VARCHAR(255),
  
  -- Tracking
  status ENUM('scouted', 'saved', 'draft', 'submitted', 'viewed', 
              'screening', 'interview_scheduled', 'interviewed', 
              'offer', 'rejected', 'withdrawn') DEFAULT 'draft',
  lastStatusUpdate TIMESTAMP,
  
  -- AI Agent Analysis
  painPoints JSON, -- Array of {challenge, impact, keywords}
  profilerAnalysis JSON, -- {painPoints, strategicHook, interviewQuestions}
  outreachContent JSON, -- {linkedinMessage, coldEmailSubject, coldEmailBody}
  
  -- Intelligence Fleet Analytics
  analytics JSON, -- {successPrediction, skillGap}
  
  -- Pivot Analysis
  pivotAnalysis JSON, -- {bridgeSkills, pivotStrategy, transferableStrengths}
  
  -- Follow-up
  nextFollowUpDate DATE,
  followUpCount INT DEFAULT 0,
  
  -- Interview
  interviewDates JSON,
  interviewNotes TEXT,
  
  -- Outcome
  offerAmount INT,
  offerCurrency VARCHAR(10),
  rejectionReason TEXT,
  
  -- Notes
  notes TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### generatedResumes

```sql
CREATE TABLE generatedResumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  jobId INT,
  
  -- Content
  resumeContent TEXT NOT NULL, -- Markdown format
  format ENUM('markdown', 'pdf', 'docx') DEFAULT 'markdown',
  
  -- Metadata
  generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1,
  
  -- ATS Analysis
  atsAnalysis JSON, -- {atsScore, formattingIssues, keywordMatch, recommendedChanges}
  
  -- File Storage
  fileUrl TEXT, -- S3 URL for PDF/DOCX
  fileKey TEXT, -- S3 key
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Testing Infrastructure

### Vitest (Backend Unit Tests)

**Test Coverage:** 123 passing tests across 17 files

**Key Test Files:**
- `server/auth.logout.test.ts` - Authentication flows
- `server/applications.test.ts` - Application CRUD operations
- `server/intelligence-fleet.test.ts` - Success Predictor & Skill Gap agents
- `server/ats-compatibility.test.ts` - ATS scoring logic
- `server/pivot-analyzer.test.ts` - Bridge Skills identification
- `server/achievements.test.ts` - Achievement management
- `server/jobs.test.ts` - Job search and qualification
- `server/resumes.test.ts` - Resume generation

**Running Tests:**
```bash
pnpm test                    # Run all tests
pnpm test server/pivot-analyzer.test.ts  # Run specific test
pnpm test --watch           # Watch mode
```

**Test Patterns:**
```typescript
describe("Pivot Analyzer", () => {
  let testApplicationId: number;

  beforeAll(async () => {
    // Setup test data
    testApplicationId = await db.createApplication({...});
  });

  it("should identify 3-5 bridge skills", async () => {
    const result = await db.getApplicationById(testApplicationId, userId);
    expect(result?.pivotAnalysis?.bridgeSkills.length).toBeGreaterThanOrEqual(3);
    expect(result?.pivotAnalysis?.bridgeSkills.length).toBeLessThanOrEqual(5);
  });
});
```

---

### Playwright (E2E Tests)

**Configuration:** `playwright.config.ts`
- Base URL: http://localhost:3000
- Browsers: Chromium only (webkit/mobile browsers commented out)
- Reporters: HTML report
- Screenshots: On failure only
- Video: Record all tests (`video: 'on'`)
- Auth bypass: Mock session cookies to skip OAuth flow

**Test Files:**
- `tests/auth.spec.ts` - Authentication flows (login, logout, session persistence)
- `tests/achievements.spec.ts` - STAR wizard, achievement CRUD, Impact Meter
- `tests/utils/auth-bypass.ts` - Auth bypass utility for reliable E2E tests

**Running Tests:**
```bash
npx playwright install chromium  # Install browser
npx playwright test              # Run all tests (20 passing, 2 skipped)
npx playwright test --ui         # Interactive mode
npx playwright show-report       # View HTML report
```

**Auth Bypass Utility:**
```typescript
import { bypassLogin } from './utils/auth-bypass';

test('protected route test', async ({ page }) => {
  await bypassLogin(page);  // Inject mock session cookie
  await page.goto('/dashboard');
  // Test authenticated functionality
});
```

**Test Example:**
```typescript
test('should create achievement with valid STAR data', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /add achievement/i }).click();
  
  await page.getByLabel(/situation/i).fill('Company needed to improve...');
  await page.getByLabel(/task/i).fill('Redesign the customer...');
  await page.getByLabel(/action/i).fill('Led a cross-functional team...');
  await page.getByLabel(/result/i).fill('Increased satisfaction by 35%');
  
  await page.getByRole('button', { name: /save/i }).click();
  
  await expect(page.getByText(/success|created/i)).toBeVisible();
});
```

---

## API Reference

### tRPC Routers

**Authentication:**
- `auth.me` - Get current user
- `auth.logout` - Clear session

**Achievements:**
- `achievements.create` - Create achievement
- `achievements.list` - List user's achievements
- `achievements.get` - Get achievement by ID
- `achievements.update` - Update achievement
- `achievements.delete` - Delete achievement
- `achievements.transform` - Convert STAR to XYZ

**Jobs:**
- `jobs.search` - Search/scrape job
- `jobs.qualify` - Assess job fit
- `jobs.list` - List saved jobs
- `jobs.get` - Get job details
- `jobs.update` - Update job
- `jobs.delete` - Delete job

**Applications:**
- `applications.create` - Create application
- `applications.list` - List applications
- `applications.get` - Get application details
- `applications.update` - Update application
- `applications.delete` - Delete application
- `applications.profile` - Run Profiler agent
- `applications.generateOutreach` - Run Scribe agent
- `applications.predictSuccess` - Run Success Predictor
- `applications.analyzeSkillGap` - Run Skill Gap agent
- `applications.analyzePivot` - Run Pivot Analyzer

**Resumes:**
- `resumes.generate` - Generate resume from achievements
- `resumes.list` - List generated resumes
- `resumes.get` - Get resume by ID
- `resumes.checkATS` - Run ATS compatibility check
- `resumes.export` - Export to PDF/DOCX

**Public:**
- `public.roast` - Resume roast (no auth)

---

### tRPC Client Usage

```typescript
import { trpc } from "@/lib/trpc";

// Query (GET)
const { data, isLoading, error } = trpc.achievements.list.useQuery();

// Mutation (POST/PUT/DELETE)
const createMutation = trpc.achievements.create.useMutation({
  onSuccess: () => {
    toast.success("Achievement created!");
    utils.achievements.list.invalidate();
  },
  onError: (error) => {
    toast.error(`Failed: ${error.message}`);
  },
});

// Optimistic Update
const updateMutation = trpc.achievements.update.useMutation({
  onMutate: async (newData) => {
    await utils.achievements.list.cancel();
    const previousData = utils.achievements.list.getData();
    
    utils.achievements.list.setData(undefined, (old) => 
      old?.map(item => item.id === newData.id ? { ...item, ...newData } : item)
    );
    
    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.achievements.list.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.achievements.list.invalidate();
  },
});
```

---

## Deployment

### Environment Variables

**Required (Auto-configured by Manus):**
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `OAUTH_SERVER_URL` - Manus OAuth backend
- `VITE_OAUTH_PORTAL_URL` - Manus login portal (frontend)
- `BUILT_IN_FORGE_API_KEY` - Server-side LLM access
- `VITE_FRONTEND_FORGE_API_KEY` - Client-side LLM access
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint

**Stripe (Test Mode Configured):**
- `STRIPE_SECRET_KEY` - Stripe API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `STRIPE_PRICE_ID_PRO` - Pro tier price ID

**Custom (Optional):**
- None required for core functionality

### Database Migrations

```bash
# Generate migration from schema changes
pnpm db:push

# This runs:
# 1. drizzle-kit generate (creates SQL migration file)
# 2. drizzle-kit migrate (applies migration to database)
```

**Migration Files:**
- Location: `drizzle/*.sql`
- Metadata: `drizzle/meta/*.json`
- Current version: 0013_easy_warbird.sql

### Build Process

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Build frontend
pnpm build

# Start production server
pnpm start
```

### Deployment Checklist

- [ ] Database migrations applied (`pnpm db:push`)
- [ ] Environment variables configured
- [ ] Stripe live keys added (after KYC)
- [ ] Domain configured (custom or manus.space)
- [ ] SSL certificate active
- [ ] Analytics tracking enabled
- [ ] Error monitoring configured
- [ ] Backup strategy in place

---

## Development Guide

### Getting Started

```bash
# Clone repository
git clone https://github.com/zganich/careerswarm-honeycomb.git
cd careerswarm-honeycomb

# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start dev server
pnpm dev

# Open browser
# http://localhost:3000
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Update Schema (if needed)**
   - Edit `drizzle/schema.ts`
   - Run `pnpm db:push`

3. **Add Backend Logic**
   - Add query helpers to `server/db.ts`
   - Add tRPC procedures to `server/routers.ts`

4. **Build Frontend**
   - Create/update components in `client/src/components/`
   - Add pages in `client/src/pages/`
   - Use tRPC hooks: `trpc.*.useQuery/useMutation`

5. **Write Tests**
   - Backend: `server/*.test.ts`
   - E2E: `tests/*.spec.ts`

6. **Test Locally**
   ```bash
   pnpm test                # Run vitest
   npx playwright test      # Run E2E tests
   ```

7. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add feature"
   git push origin feature/my-feature
   ```

### Code Style

**TypeScript:**
- Strict mode enabled
- No implicit any
- Prefer interfaces over types for objects

**React:**
- Functional components with hooks
- Use `useEffect` for side effects
- Never call setState in render phase

**Tailwind:**
- Use utility classes
- Avoid custom CSS when possible
- Use design tokens (colors, spacing)

**tRPC:**
- Input validation with Zod
- Proper error handling
- Use `protectedProcedure` for auth-required routes

### Common Tasks

**Add New Agent:**
1. Create tRPC procedure in `server/routers.ts`
2. Add system prompt and LLM integration
3. Define output schema with Zod
4. Store results in appropriate JSON column
5. Create UI component for results
6. Write vitest tests

**Add Database Table:**
1. Define schema in `drizzle/schema.ts`
2. Run `pnpm db:push`
3. Add query helpers to `server/db.ts`
4. Create tRPC procedures
5. Build frontend UI

**Add UI Component:**
1. Create component in `client/src/components/`
2. Use shadcn/ui primitives
3. Add tRPC hooks for data
4. Handle loading/error states
5. Add to appropriate page

---

## Performance Optimization

### Frontend

**Code Splitting:**
- Lazy load routes with `React.lazy()`
- Use `Suspense` for loading states

**Caching:**
- tRPC React Query caching (5 minutes default)
- Optimistic updates for instant feedback

**Bundle Size:**
- Tree-shaking enabled
- Dynamic imports for large libraries

### Backend

**Database:**
- Indexes on frequently queried columns
- JSON columns for flexible agent outputs
- Connection pooling

**API:**
- tRPC batching enabled
- Response compression
- Rate limiting (TODO)

---

## Security

**Authentication:**
- OAuth 2.0 via Manus
- JWT session cookies (httpOnly, secure, sameSite)
- CSRF protection

**Authorization:**
- User ID validation on all protected routes
- Role-based access control (admin/user)
- Row-level security (users can only access their own data)

**Data Protection:**
- Passwords never stored (OAuth only)
- Sensitive data encrypted at rest
- HTTPS enforced in production

**Input Validation:**
- Zod schemas on all tRPC inputs
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)

---

## Monitoring and Analytics

**Built-in Analytics:**
- Page views tracked via `VITE_ANALYTICS_ENDPOINT`
- User actions logged
- Error tracking

**Metrics to Monitor:**
- Application success rate (offers / submitted)
- Agent usage (which agents are most popular)
- Resume generation volume
- ATS score distribution
- User retention and churn

---

## Troubleshooting

### Common Issues

**Database Connection Failed:**
- Check `DATABASE_URL` environment variable
- Verify database is running
- Check firewall rules

**Authentication Not Working:**
- Verify `OAUTH_SERVER_URL` is correct
- Check session cookie settings
- Clear browser cookies and retry

**LLM API Errors:**
- Check `BUILT_IN_FORGE_API_KEY` is set
- Verify API endpoint is reachable
- Check rate limits

**Build Failures:**
- Run `pnpm install` to update dependencies
- Check TypeScript errors: `pnpm exec tsc --noEmit`
- Clear build cache: `rm -rf .next dist`

---

## Roadmap

### Completed ✅
- 7-stage agent pipeline
- ATS Compatibility Agent
- Pivot Analyzer (Career Path Intelligence)
- Resume Roaster
- Application Tracker (Swarm Board)
- Comprehensive test coverage (123 tests)
- Playwright E2E framework

### In Progress 🚧
- Playwright E2E test execution
- Analytics dashboard
- Auto-trigger logic for agents

### Planned 📋
- Export Career Transition Report (PDF)
- Company research agent
- Salary negotiation coach
- Interview preparation simulator
- Network mapping (LinkedIn integration)
- Job application automation
- Chrome extension for one-click apply

---

## Contributing

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit PR with clear description

### Code Review Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] TypeScript compiles (`pnpm exec tsc --noEmit`)
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Loading states added

---

## Support

**Documentation:** This file  
**GitHub:** https://github.com/zganich/careerswarm-honeycomb  
**Issues:** https://github.com/zganich/careerswarm-honeycomb/issues  
**Manus Support:** https://help.manus.im

---

## License

Proprietary - All rights reserved

---

## Acknowledgments

Built with:
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Manus Platform](https://manus.im/)

---

**Last Updated:** January 24, 2026  
**Version:** 8ee11914  
**Status:** Production Ready
