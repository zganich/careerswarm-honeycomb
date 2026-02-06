# CareerSwarm Manual Testing Checklist

This document outlines the manual tests that should be performed before each production deployment.

## Pre-Launch Validation

### Automated Checks

Run these commands before manual testing:

```bash
# TypeScript compilation
pnpm exec tsc --noEmit

# Unit tests
pnpm test

# Build verification
pnpm build

# Database seed
pnpm seed

# Production validation
pnpm validate

# Git secrets scan
git secrets --scan
```

## Manual Test Scenarios

### 1. Authentication Flow

- [ ] Visit landing page (unauthenticated)
- [ ] Click "Start Application" button
- [ ] Verify redirect to Manus OAuth login
- [ ] Complete OAuth flow
- [ ] Verify redirect back to dashboard
- [ ] Verify user name displays in header
- [ ] Click logout
- [ ] Verify redirect to landing page

### 2. Resume Roaster (Free Feature)

- [ ] Navigate to Resume Roaster
- [ ] Paste sample resume text (100+ characters)
- [ ] Click "Roast My Resume"
- [ ] Verify loading state shows
- [ ] Verify roast result displays with score
- [ ] Verify improvements list shows
- [ ] Test with short text (< 50 chars) - expect validation error

### 3. Career Score Calculator (Landing Page)

- [ ] Scroll to Career Score Calculator section
- [ ] Select "Current Role" from dropdown
- [ ] Select "Target Role" from dropdown
- [ ] Click "Calculate Score"
- [ ] Verify loading spinner shows
- [ ] Verify score displays (0-100)
- [ ] Verify gaps and recommendations show
- [ ] Click "Fix These Gaps" CTA - verify redirect to signup

### 4. Stripe Checkout (Pro Upgrade)

- [ ] Sign in as free user
- [ ] Navigate to Pricing page
- [ ] Click "Upgrade to Pro" on Pro tier card
- [ ] Verify redirect to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify redirect to dashboard with success message
- [ ] Verify "Pro" badge shows in user profile
- [ ] Verify usage limits updated (unlimited analyses)

### 5. Subscription Management

- [ ] Navigate to Settings → Billing
- [ ] Verify current subscription displays (Pro, $29/month)
- [ ] Click "Manage Subscription"
- [ ] Verify redirect to Stripe Customer Portal
- [ ] Test cancel subscription
- [ ] Verify downgrade to Free tier
- [ ] Verify usage limits restored (5 analyses/month)

### 6. Job Application Workflow

- [ ] Create new job application
- [ ] Paste job description URL
- [ ] Verify JD scraping works
- [ ] Fill in company name, job title
- [ ] Click "Generate Tailored Resume"
- [ ] Verify all 7 agents run:
  - [ ] Evidence Collector
  - [ ] Relevance Ranker
  - [ ] Achievement Enhancer
  - [ ] Keyword Optimizer
  - [ ] Profiler (company research)
  - [ ] Outreach Generator
  - [ ] Final Assembler
- [ ] Verify tailored resume displays
- [ ] Click "Download PDF"
- [ ] Verify PDF downloads correctly

### 7. Data Export

- [ ] Navigate to Settings → Data
- [ ] Click "Export All Data"
- [ ] Verify JSON file downloads
- [ ] Verify file contains:
  - [ ] User profile
  - [ ] Achievements
  - [ ] Job applications
  - [ ] Tailored resumes

### 8. Mobile Responsive

- [ ] Open site on mobile device (or DevTools mobile view)
- [ ] Test landing page layout
- [ ] Test dashboard navigation (hamburger menu)
- [ ] Test Resume Roaster on mobile
- [ ] Test Stripe checkout on mobile
- [ ] Verify all CTAs are tappable
- [ ] Verify no horizontal scroll

### 9. Error Handling

- [ ] Disconnect internet, try to roast resume
  - [ ] Verify "Please check your connection" toast
- [ ] Log out, try to access protected route
  - [ ] Verify redirect to login
- [ ] Submit invalid form data
  - [ ] Verify validation errors show
- [ ] Test Stripe webhook with malformed data
  - [ ] Verify graceful failure (no server crash)

### 10. Performance

- [ ] Run Lighthouse audit (target: all scores > 90)
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO
- [ ] Test page load time (target: < 3s)
- [ ] Test AI agent latency (target: < 10s per agent)

## E2E Test Credentials (Playwright / CI)

To run E2E tests that use a real login (instead of auth bypass), set these in `.env` or your CI environment:

- **`TEST_USER_EMAIL`** – Email of the test user (e.g. `test@example.com`).
- **`TEST_USER_PASSWORD`** – Password for that user.

If these are **not** set, Playwright tests use the auth-bypass flow (mock JWT) and do not hit real OAuth. That is sufficient for most local and CI runs. Set them only when you need to exercise the full OAuth flow in E2E.

See `.env.example` for the placeholder variables.

## Success Criteria

All checkboxes above must be checked ✅ before deploying to production.

If any test fails:

1. Document the issue in GitHub Issues
2. Fix the bug
3. Re-run all tests
4. Create new checkpoint after fixes

## Notes

- Use Stripe test mode for all payment tests
- Test card: `4242 4242 4242 4242` (any future expiry, any CVC)
- Promo code for testing: `LAUNCH99` (99% discount)
- Minimum Stripe transaction: $0.50 USD

## Last Tested

- Date: [YYYY-MM-DD]
- Tester: [Name]
- Version: [Checkpoint ID]
- Result: [PASS/FAIL]
