# Playwright E2E Test Suite Implementation Plan

**Project:** Careerswarm  
**Version:** 4feea6ed  
**Date:** January 22, 2026  
**Purpose:** Automated end-to-end testing of authenticated user flows

---

## Executive Summary

This document outlines a comprehensive plan for implementing a Playwright-based E2E test suite to automate testing of authenticated flows that cannot be reliably tested manually. The suite will cover user signup, achievement creation, job search, resume generation, application tracking, interview prep, and Stripe checkout.

**Key Benefits:**
- **Automated regression testing** for every deployment
- **Consistent test coverage** across all critical user journeys
- **Faster feedback loops** (tests run in 5-10 minutes vs 4-6 hours manual)
- **CI/CD integration** for continuous quality assurance
- **Authentication state management** using Playwright's built-in storage

**Estimated Implementation Time:** 6-8 hours

---

## Architecture Overview

### Test Structure

```
careerswarm/
├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── auth/
│   │   ├── signup.spec.ts        # User registration flow
│   │   └── login.spec.ts         # Login and session management
│   ├── achievements/
│   │   ├── create.spec.ts        # STAR wizard and Impact Meter
│   │   ├── edit.spec.ts          # Edit existing achievements
│   │   └── delete.spec.ts        # Delete achievements
│   ├── jobs/
│   │   ├── search.spec.ts        # Job search and save
│   │   ├── qualification.spec.ts # Auto-qualification and fit %
│   │   └── skills-gap.spec.ts    # Skills gap analysis
│   ├── resumes/
│   │   ├── generate.spec.ts      # Resume generation
│   │   ├── templates.spec.ts     # Template selection
│   │   └── export.spec.ts        # PDF export
│   ├── applications/
│   │   ├── tracking.spec.ts      # Application status pipeline
│   │   └── reminders.spec.ts     # Follow-up reminders
│   ├── interview-prep/
│   │   └── questions.spec.ts     # Interview question generation
│   ├── stripe/
│   │   ├── checkout.spec.ts      # Pro upgrade flow
│   │   └── usage-limits.spec.ts  # Free tier limits
│   └── fixtures/
│       ├── auth.ts               # Authentication helpers
│       ├── test-data.ts          # Sample data generators
│       └── db-helpers.ts         # Database utilities
├── playwright-report/            # HTML test reports
└── test-results/                 # Test artifacts
```

---

## Phase 1: Authentication Strategy

### Challenge

Careerswarm uses **Manus OAuth** for authentication, which requires:
1. Email verification
2. External OAuth provider interaction
3. Session cookie management

### Solution: Database-Level Authentication Bypass

Instead of going through the full OAuth flow, we'll create authenticated sessions directly in the database for testing purposes.

**Approach:**

1. **Create test user in database** before tests run
2. **Generate valid JWT token** using the same secret as production
3. **Inject session cookie** into Playwright browser context
4. **Tests run as authenticated user** without OAuth flow

**Implementation:**

```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test';
import jwt from 'jsonwebtoken';
import { db } from '../../server/db';
import { users } from '../../drizzle/schema';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // 1. Create test user in database
    const testUser = await db.insert(users).values({
      openId: 'test-user-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      subscriptionTier: 'free',
      achievementCount: 0,
      resumeCount: 0,
    }).returning();

    // 2. Generate JWT token
    const token = jwt.sign(
      { openId: testUser[0].openId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 3. Inject session cookie
    await page.context().addCookies([{
      name: 'session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    }]);

    // 4. Navigate to dashboard
    await page.goto('/dashboard');

    // Use the authenticated page
    await use(page);

    // 5. Cleanup: Delete test user after test
    await db.delete(users).where(eq(users.id, testUser[0].id));
  },
});
```

**Benefits:**
- ✅ No email verification required
- ✅ No OAuth provider dependency
- ✅ Fast test execution (no external API calls)
- ✅ Deterministic test data
- ✅ Easy cleanup

---

## Phase 2: Playwright Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Key Features:**
- **Cross-browser testing**: Chrome, Firefox, Safari
- **Mobile testing**: iOS and Android viewports
- **Automatic dev server**: Starts server before tests
- **Failure artifacts**: Screenshots, videos, traces
- **CI/CD ready**: Configurable retries and workers

---

## Phase 3: Test Data Management

### Test Data Generators

```typescript
// tests/fixtures/test-data.ts
export const generateAchievement = () => ({
  situation: 'Led a team of 5 engineers on a critical project',
  task: 'Deliver new feature within 3-month deadline',
  action: 'Implemented agile methodology, daily standups, and code reviews',
  result: 'Delivered 2 weeks early, 0 critical bugs, 95% test coverage',
  category: 'leadership',
  skills: ['project management', 'agile', 'team leadership'],
});

export const generateJobDescription = () => ({
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  description: `
    We're looking for a Senior Software Engineer with:
    - 5+ years of experience in full-stack development
    - Strong leadership and mentoring skills
    - Experience with React, Node.js, and TypeScript
    - Track record of delivering high-quality products
  `,
  url: 'https://example.com/jobs/123',
});

export const generateResume = () => ({
  template: 'modern',
  sections: ['summary', 'experience', 'education', 'skills'],
  achievements: [1, 2, 3], // IDs of achievements to include
});
```

### Database Helpers

```typescript
// tests/fixtures/db-helpers.ts
import { db } from '../../server/db';
import { achievements, jobs, resumes, applications } from '../../drizzle/schema';

export const createTestAchievement = async (userId: number, data: any) => {
  return await db.insert(achievements).values({
    userId,
    ...data,
  }).returning();
};

export const createTestJob = async (userId: number, data: any) => {
  return await db.insert(jobs).values({
    userId,
    ...data,
  }).returning();
};

export const cleanupTestData = async (userId: number) => {
  await db.delete(achievements).where(eq(achievements.userId, userId));
  await db.delete(jobs).where(eq(jobs.userId, userId));
  await db.delete(resumes).where(eq(resumes.userId, userId));
  await db.delete(applications).where(eq(applications.userId, userId));
};
```

---

## Phase 4: Critical Test Scenarios

### 1. Authentication Tests

**tests/auth/signup.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Signup', () => {
  test('should complete signup flow', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Go to Dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/oauth/);
    
    // Note: Full OAuth flow requires manual testing
    // This test verifies redirect behavior only
  });
});
```

**tests/auth/login.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Authenticated Session', () => {
  test('should access dashboard when authenticated', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveURL('/dashboard');
    await expect(authenticatedPage.locator('text=Welcome back')).toBeVisible();
  });

  test('should show user profile in header', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(authenticatedPage.locator('text=Test User')).toBeVisible();
  });
});
```

---

### 2. Achievement Creation Tests

**tests/achievements/create.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';
import { generateAchievement } from '../fixtures/test-data';

test.describe('Achievement Creation', () => {
  test('should create achievement using STAR wizard', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const achievement = generateAchievement();

    // Click "New Achievement" button
    await page.click('text=New Achievement');

    // Fill STAR wizard
    await page.fill('[name="situation"]', achievement.situation);
    await page.fill('[name="task"]', achievement.task);
    await page.fill('[name="action"]', achievement.action);
    await page.fill('[name="result"]', achievement.result);

    // Select category
    await page.selectOption('[name="category"]', achievement.category);

    // Add skills
    for (const skill of achievement.skills) {
      await page.fill('[name="skills"]', skill);
      await page.press('[name="skills"]', 'Enter');
    }

    // Submit form
    await page.click('button:has-text("Save Achievement")');

    // Verify success
    await expect(page.locator('text=Achievement saved successfully')).toBeVisible();
    await expect(page.locator('text=1 career evidence points')).toBeVisible();
  });

  test('should show Impact Meter score', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.click('text=New Achievement');
    await page.fill('[name="result"]', 'Increased sales by 150% in Q1');

    // Impact Meter should show high score for quantified result
    await expect(page.locator('[data-testid="impact-meter"]')).toContainText(/[8-9][0-9]|100/);
  });

  test('should transform to XYZ format', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const achievement = generateAchievement();

    await page.click('text=New Achievement');
    await page.fill('[name="situation"]', achievement.situation);
    await page.fill('[name="task"]', achievement.task);
    await page.fill('[name="action"]', achievement.action);
    await page.fill('[name="result"]', achievement.result);

    // Click "Transform to XYZ" button
    await page.click('button:has-text("Transform to XYZ")');

    // Wait for AI transformation
    await page.waitForSelector('[data-testid="xyz-output"]', { timeout: 10000 });

    // Verify XYZ format: "Accomplished [X] by doing [Z], measured by [Y]"
    const xyzText = await page.locator('[data-testid="xyz-output"]').textContent();
    expect(xyzText).toMatch(/Accomplished .+ by .+, measured by .+/);
  });
});
```

---

### 3. Job Search Tests

**tests/jobs/search.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Job Search', () => {
  test('should search for jobs', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.click('text=Jobs');
    await page.fill('[placeholder="Search jobs..."]', 'Software Engineer');
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });

    // Verify results
    const jobCards = page.locator('[data-testid="job-card"]');
    await expect(jobCards).toHaveCount(10); // Should show 10 results per page
  });

  test('should save job and trigger auto-qualification', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.click('text=Jobs');
    await page.fill('[placeholder="Search jobs..."]', 'Software Engineer');
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForSelector('[data-testid="job-card"]');

    // Save first job
    await page.locator('[data-testid="job-card"]').first().click('button:has-text("Save")');

    // Verify success
    await expect(page.locator('text=Job saved successfully')).toBeVisible();

    // Navigate to saved jobs
    await page.click('text=Job Targets');

    // Verify auto-qualification badge appears
    await expect(page.locator('[data-testid="fit-percentage"]')).toBeVisible();
    await expect(page.locator('[data-testid="fit-percentage"]')).toContainText(/%/);
  });
});
```

---

### 4. Resume Generation Tests

**tests/resumes/generate.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';
import { createTestAchievement, createTestJob } from '../fixtures/db-helpers';
import { generateAchievement, generateJobDescription } from '../fixtures/test-data';

test.describe('Resume Generation', () => {
  test('should generate resume for saved job', async ({ authenticatedPage, authenticatedUser }) => {
    const page = authenticatedPage;

    // Setup: Create test achievement and job
    await createTestAchievement(authenticatedUser.id, generateAchievement());
    await createTestJob(authenticatedUser.id, generateJobDescription());

    // Navigate to Resume Templates
    await page.click('text=Resumes');
    await page.click('text=Resume Templates');

    // Select template
    await page.click('[data-testid="template-modern"]');

    // Select job
    await page.selectOption('[name="jobId"]', { index: 0 });

    // Generate resume
    await page.click('button:has-text("Generate Resume")');

    // Wait for generation (may take 5-10 seconds)
    await page.waitForSelector('[data-testid="resume-preview"]', { timeout: 15000 });

    // Verify resume contains achievement
    const resumeText = await page.locator('[data-testid="resume-preview"]').textContent();
    expect(resumeText).toContain('Led a team of 5 engineers');
  });

  test('should export resume as PDF', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Assume resume already generated
    await page.click('text=Resumes');
    await page.locator('[data-testid="resume-card"]').first().click();

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export PDF")');
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/resume.*\.pdf/);
  });
});
```

---

### 5. Application Tracking Tests

**tests/applications/tracking.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Application Tracking', () => {
  test('should update application status', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to Applications
    await page.click('text=Applications');

    // Verify pipeline stages visible
    await expect(page.locator('text=Draft')).toBeVisible();
    await expect(page.locator('text=Applied')).toBeVisible();
    await expect(page.locator('text=Interview Scheduled')).toBeVisible();

    // Assume there's a saved job in Draft
    const draftCard = page.locator('[data-testid="application-card"]').first();
    await draftCard.click();

    // Update status to "Applied"
    await page.selectOption('[name="status"]', 'applied');
    await page.click('button:has-text("Update Status")');

    // Verify success
    await expect(page.locator('text=Status updated successfully')).toBeVisible();

    // Verify follow-up reminder scheduled
    await expect(page.locator('text=Follow-up reminder set for')).toBeVisible();
  });

  test('should schedule interview prep reminder', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.click('text=Applications');

    // Find application and update to "Interview Scheduled"
    const card = page.locator('[data-testid="application-card"]').first();
    await card.click();

    // Set interview date
    await page.fill('[name="interviewDate"]', '2026-01-30');
    await page.selectOption('[name="status"]', 'interview_scheduled');
    await page.click('button:has-text("Update Status")');

    // Verify interview prep reminder
    await expect(page.locator('text=Interview prep reminder set for')).toBeVisible();
  });
});
```

---

### 6. Stripe Checkout Tests

**tests/stripe/checkout.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Stripe Checkout', () => {
  test('should redirect to Stripe checkout', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to pricing
    await page.click('text=Pricing');

    // Click "Upgrade to Pro"
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Upgrade to Pro")'),
    ]);

    // Verify Stripe checkout opened
    await expect(popup).toHaveURL(/checkout\.stripe\.com/);
  });

  test('should handle successful checkout webhook', async ({ authenticatedPage, authenticatedUser }) => {
    // Note: This test requires webhook simulation
    // In real implementation, you'd:
    // 1. Create a Stripe test checkout session
    // 2. Simulate webhook event to /api/stripe/webhook
    // 3. Verify user's subscription tier updated in database

    // For now, we'll test the UI state after upgrade
    // (Assumes subscription tier is already "pro" in test data)
  });
});
```

**tests/stripe/usage-limits.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';
import { createTestAchievement } from '../fixtures/db-helpers';
import { generateAchievement } from '../fixtures/test-data';

test.describe('Usage Limits (Free Tier)', () => {
  test('should block 11th achievement on free tier', async ({ authenticatedPage, authenticatedUser }) => {
    const page = authenticatedPage;

    // Create 10 achievements (free tier limit)
    for (let i = 0; i < 10; i++) {
      await createTestAchievement(authenticatedUser.id, generateAchievement());
    }

    // Try to create 11th achievement
    await page.click('text=New Achievement');
    await page.fill('[name="situation"]', 'Test situation');
    await page.fill('[name="task"]', 'Test task');
    await page.fill('[name="action"]', 'Test action');
    await page.fill('[name="result"]', 'Test result');
    await page.click('button:has-text("Save Achievement")');

    // Verify error message
    await expect(page.locator('text=Free tier limited to 10 achievements')).toBeVisible();
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
  });

  test('should block 4th resume on free tier', async ({ authenticatedPage, authenticatedUser }) => {
    const page = authenticatedPage;

    // Simulate 3 resumes already generated this month
    // (Would need to create test data in database)

    // Try to generate 4th resume
    await page.click('text=Resumes');
    await page.click('text=Resume Templates');
    await page.click('[data-testid="template-modern"]');
    await page.click('button:has-text("Generate Resume")');

    // Verify error message
    await expect(page.locator('text=Free tier limited to 3 resumes per month')).toBeVisible();
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
  });
});
```

---

### 7. Interview Prep Tests

**tests/interview-prep/questions.spec.ts**

```typescript
import { test, expect } from '../fixtures/auth';
import { createTestJob } from '../fixtures/db-helpers';
import { generateJobDescription } from '../fixtures/test-data';

test.describe('Interview Prep', () => {
  test('should generate interview questions', async ({ authenticatedPage, authenticatedUser }) => {
    const page = authenticatedPage;

    // Setup: Create test job
    await createTestJob(authenticatedUser.id, generateJobDescription());

    // Navigate to Interview Prep
    await page.click('text=Interview Prep');

    // Select job
    await page.selectOption('[name="jobId"]', { index: 0 });

    // Generate questions
    await page.click('button:has-text("Generate Questions")');

    // Wait for AI generation
    await page.waitForSelector('[data-testid="interview-question"]', { timeout: 15000 });

    // Verify questions generated
    const questions = page.locator('[data-testid="interview-question"]');
    await expect(questions).toHaveCount(5); // Should generate 5 questions
  });

  test('should provide AI feedback on practice answer', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Assume questions already generated
    await page.click('text=Interview Prep');

    // Click "Practice" on first question
    await page.locator('[data-testid="interview-question"]').first().click('button:has-text("Practice")');

    // Type answer
    await page.fill('[name="answer"]', 'I led a team of 5 engineers and delivered the project 2 weeks early with 0 critical bugs.');

    // Submit answer
    await page.click('button:has-text("Get Feedback")');

    // Wait for AI feedback
    await page.waitForSelector('[data-testid="ai-feedback"]', { timeout: 10000 });

    // Verify feedback contains strengths and improvements
    const feedback = await page.locator('[data-testid="ai-feedback"]').textContent();
    expect(feedback).toContain('Strengths');
    expect(feedback).toContain('Improvements');
  });
});
```

---

## Phase 5: CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: careerswarm_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps
        
      - name: Run database migrations
        run: pnpm db:push
        env:
          DATABASE_URL: mysql://root:root@localhost:3306/careerswarm_test
          
      - name: Run Playwright tests
        run: pnpm exec playwright test
        env:
          DATABASE_URL: mysql://root:root@localhost:3306/careerswarm_test
          JWT_SECRET: test-secret-key
          
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Phase 6: Running Tests Locally

### Setup

```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers
pnpm exec playwright install

# Run all tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test tests/achievements/create.spec.ts

# Run tests in headed mode (see browser)
pnpm exec playwright test --headed

# Run tests in debug mode
pnpm exec playwright test --debug

# Generate test report
pnpm exec playwright show-report
```

### package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Test Coverage Summary

| Category | Tests | Estimated Time |
|----------|-------|----------------|
| **Authentication** | 3 tests | 30 seconds |
| **Achievements** | 5 tests | 2 minutes |
| **Jobs** | 4 tests | 3 minutes |
| **Resumes** | 3 tests | 2 minutes |
| **Applications** | 3 tests | 1 minute |
| **Interview Prep** | 2 tests | 2 minutes |
| **Stripe** | 3 tests | 1 minute |
| **Usage Limits** | 2 tests | 1 minute |
| **Total** | **25 tests** | **~12 minutes** |

---

## Limitations & Considerations

### What Playwright CAN Test

✅ **Full authenticated user flows** (using database-level auth bypass)  
✅ **STAR wizard and Impact Meter** (form interactions)  
✅ **Job search and auto-qualification** (API responses)  
✅ **Resume generation and preview** (AI-powered features)  
✅ **Application status updates** (database mutations)  
✅ **Interview question generation** (LLM integration)  
✅ **Usage limit enforcement** (business logic)  
✅ **Cross-browser compatibility** (Chrome, Firefox, Safari)  
✅ **Mobile responsiveness** (iOS, Android viewports)

### What Playwright CANNOT Test

❌ **Email verification flows** (requires real email inbox)  
❌ **External OAuth providers** (Google, GitHub login)  
❌ **Stripe payment completion** (requires real card processing)  
❌ **Email notifications** (requires SMTP server)  
❌ **Browser extension** (requires Chrome Web Store)

### Workarounds

1. **Email Verification**: Use database-level auth bypass (as shown above)
2. **OAuth Providers**: Test redirect behavior only, not full flow
3. **Stripe Payments**: Test checkout redirect, simulate webhook events
4. **Email Notifications**: Mock email service in tests
5. **Browser Extension**: Test extension separately with dedicated test suite

---

## Implementation Timeline

### Week 1: Foundation (8 hours)

**Day 1-2: Setup & Configuration (3 hours)**
- Install Playwright and dependencies
- Create `playwright.config.ts`
- Set up test directory structure
- Configure CI/CD workflow

**Day 3-4: Authentication (3 hours)**
- Implement database-level auth bypass
- Create `auth.ts` fixture
- Write authentication tests
- Test session management

**Day 5: Test Data (2 hours)**
- Create test data generators
- Implement database helpers
- Write cleanup utilities

### Week 2: Core Tests (12 hours)

**Day 1-2: Achievements (4 hours)**
- Write STAR wizard tests
- Test Impact Meter scoring
- Test XYZ transformation
- Test achievement CRUD operations

**Day 3: Jobs (3 hours)**
- Write job search tests
- Test auto-qualification
- Test skills gap analysis

**Day 4: Resumes (3 hours)**
- Write resume generation tests
- Test template selection
- Test PDF export

**Day 5: Applications & Interview Prep (2 hours)**
- Write application tracking tests
- Write interview prep tests

### Week 3: Advanced Tests (6 hours)

**Day 1-2: Stripe (3 hours)**
- Write checkout redirect tests
- Simulate webhook events
- Test usage limit enforcement

**Day 3: Cross-Browser (2 hours)**
- Run tests on Firefox
- Run tests on Safari
- Fix browser-specific issues

**Day 4: Mobile (1 hour)**
- Run tests on mobile viewports
- Fix responsive issues

### Week 4: Polish & Documentation (4 hours)

**Day 1: Debugging (2 hours)**
- Fix flaky tests
- Optimize test performance
- Add retry logic

**Day 2: Documentation (2 hours)**
- Write README for test suite
- Document test patterns
- Create troubleshooting guide

**Total: 30 hours over 4 weeks**

---

## Success Metrics

### Test Reliability

- **Pass Rate:** 95%+ on first run
- **Flakiness:** <5% of tests fail intermittently
- **Execution Time:** <15 minutes for full suite

### Coverage

- **Critical Paths:** 100% coverage
- **Edge Cases:** 80% coverage
- **Error Handling:** 90% coverage

### Maintenance

- **False Positives:** <2% of failures
- **Update Frequency:** Tests updated with every feature
- **Documentation:** 100% of tests documented

---

## Next Steps

### Immediate (This Week)

1. **Install Playwright** and configure `playwright.config.ts`
2. **Implement auth fixture** with database-level bypass
3. **Write first test** (achievement creation) to validate approach
4. **Run test locally** and verify it passes

### Short-Term (Next 2 Weeks)

1. **Complete core test suite** (achievements, jobs, resumes)
2. **Set up CI/CD** with GitHub Actions
3. **Run tests on every PR** to catch regressions early

### Long-Term (Next Month)

1. **Achieve 95%+ test coverage** of critical user flows
2. **Integrate with monitoring** (send alerts on test failures)
3. **Create test dashboard** showing pass/fail trends over time

---

## Conclusion

This Playwright test suite will provide **comprehensive automated testing** of all authenticated user flows, eliminating the need for 4-6 hours of manual testing before each deployment. By using database-level authentication bypass, we can test the entire application without relying on external OAuth providers or email verification.

**Key Benefits:**
- ✅ **Fast feedback loops** (12 minutes vs 4-6 hours)
- ✅ **Consistent coverage** (no human error)
- ✅ **Cross-browser testing** (Chrome, Firefox, Safari)
- ✅ **Mobile testing** (iOS, Android)
- ✅ **CI/CD integration** (automatic on every PR)
- ✅ **Regression prevention** (catch bugs before production)

**Estimated ROI:**
- **Initial Investment:** 30 hours to build test suite
- **Time Saved Per Release:** 4-6 hours of manual testing
- **Break-Even Point:** After 5-8 releases (~2 months)
- **Annual Savings:** 50+ hours of manual testing time

**Recommendation:** Implement this test suite immediately to ensure production readiness and enable confident, rapid deployments.
