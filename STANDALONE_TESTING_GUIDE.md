# 🧪 Standalone Testing Guide - CareerSwarm Honeycomb

**Complete testing documentation for the active CareerSwarm repository**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Suite Overview](#test-suite-overview)
3. [Running Tests](#running-tests)
4. [Understanding Results](#understanding-results)
5. [Troubleshooting](#troubleshooting)
6. [Test Reports](#test-reports)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install pnpm (if not already installed)
npm install -g pnpm
# OR
brew install pnpm

# Install Playwright browsers
npx playwright install chromium
```

### Run All Tests

```bash
# Install dependencies
pnpm install

# Run all Playwright tests
npx playwright test

# Run playbook tests specifically
npx playwright test playbook

# Run with UI (interactive)
npx playwright test --ui

# View HTML report
npx playwright show-report
```

---

## 🎯 Test Suite Overview

### Test Categories

#### 1. **Playbook Tests** (Lost but Launching)
Location: `tests/playbook-*.spec.ts`

- **playbook-whats-broken.spec.ts** - Console errors, network requests, feature checks
- **playbook-api-validation.spec.ts** - tRPC endpoints, routes, client initialization
- **playbook-runner.spec.ts** - Complete playbook runner with comprehensive report

#### 2. **Existing E2E Tests**
Location: `tests/*.spec.ts`

- **auth.spec.ts** - Authentication flow tests
- **achievements.spec.ts** - Achievement tracking tests

### Test Configuration

**Playwright Config:** `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chromium (Firefox/WebKit optional)
- Video: Recorded for all tests
- Screenshots: On failure
- Traces: On retry

---

## 🏃 Running Tests

### Run Specific Test Suites

```bash
# Playbook: What's Actually Broken?
npx playwright test playbook-whats-broken

# Playbook: API Validation
npx playwright test playbook-api-validation

# Playbook: Complete Runner
npx playwright test playbook-runner

# Existing E2E tests
npx playwright test auth
npx playwright test achievements
```

### Run with Options

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Run with debug
npx playwright test --debug

# Run and update snapshots
npx playwright test --update-snapshots
```

### Run Validation Script

```bash
# Production validation (requires env vars)
pnpm validate

# This checks:
# - Environment variables
# - Database connection
# - Stripe configuration
# - tRPC routers
```

---

## 📊 Understanding Results

### Test Output

**✅ Passing Test:**
```
✓ [chromium] › tests/playbook-api-validation.spec.ts:13:3 › PLAY 2: API Validation (Honeycomb) › 1. Check tRPC endpoint accessibility (255ms)
```

**❌ Failing Test:**
```
✘ [chromium] › tests/playbook-whats-broken.spec.ts:43:7 › PLAY 1: What's Actually Broken? (Honeycomb) › 1. Open homepage and check console errors (4.8s)
```

### Test Report Structure

After running tests, check:
- **HTML Report:** `playwright-report/index.html`
- **JSON Report:** `test-results/results.json`
- **Playbook Report:** `test-results/playbook-report-honeycomb.json`

### What Tests Check

#### Play 1: What's Actually Broken?

1. **Console Errors**
   - Captures all browser console errors
   - Identifies critical vs. non-critical errors
   - Reports errors in JSON format

2. **Network Requests**
   - Monitors failed HTTP requests (status >= 400)
   - Filters for tRPC-specific errors
   - Reports network failures

3. **Key Features**
   - Homepage loads correctly
   - Dashboard accessible
   - Routes work as expected

4. **Error Report**
   - Generates comprehensive JSON report
   - Lists all console errors
   - Lists all network errors
   - Provides recommendations

#### Play 2: API Validation

1. **tRPC Endpoint**
   - Checks if `/trpc` endpoint is accessible
   - Verifies tRPC routing works

2. **Homepage**
   - Verifies homepage loads
   - Checks page title

3. **tRPC Client**
   - Detects tRPC client initialization
   - Monitors tRPC requests

4. **Dashboard Route**
   - Tests `/dashboard` route accessibility
   - Verifies route loads without errors

#### Playbook Runner

- Runs all playbook tests in sequence
- Generates comprehensive report
- Identifies critical issues
- Provides actionable recommendations

---

## 🔍 Understanding Test Results

### Expected Results

**✅ All Tests Passing:**
```
9 passed (38.6s)
```

**⚠️ Some Tests Failing:**
```
6 passed, 3 failed (45.2s)
```

### Common Issues & Solutions

#### 1. Environment Variables Missing

**Error:**
```
VITE_ANALYTICS_ENDPOINT is not defined
VITE_OAUTH_PORTAL_URL is not defined
```

**Solution:**
- These are **expected in development**
- Set in production:
  ```bash
  export VITE_ANALYTICS_ENDPOINT=<your-endpoint>
  export VITE_ANALYTICS_WEBSITE_ID=<your-id>
  export VITE_OAUTH_PORTAL_URL=<your-oauth-url>
  ```

#### 2. Analytics Endpoint Error

**Error:**
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
URL: http://localhost:3000/%VITE_ANALYTICS_ENDPOINT%/umami
```

**Impact:** Low - Analytics script fails, but app works

**Solution:**
- Set `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID`
- Or disable analytics in development

#### 3. OAuth Warnings

**Error:**
```
VITE_OAUTH_PORTAL_URL is not defined
OAUTH_SERVER_URL is not configured
```

**Impact:** None in development - Expected without OAuth setup

**Solution:**
- Configure OAuth for production
- Set `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL`

#### 4. Database Connection Errors

**Error:**
```
Database error: Cannot find module 'drizzle/schema'
```

**Solution:**
- Ensure database is set up: `pnpm db:push`
- Check `DATABASE_URL` environment variable

#### 5. tRPC Router Errors

**Error:**
```
tRPC router error: Cannot find package '@shared/const'
```

**Solution:**
- Ensure all dependencies installed: `pnpm install`
- Check TypeScript compilation: `pnpm check`

---

## 🐛 Troubleshooting

### Tests Won't Start

**Problem:** Dev server doesn't start

**Solution:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or use different port
FRONTEND_URL=http://localhost:3001 npx playwright test
```

### Tests Timeout

**Problem:** Tests timeout waiting for elements

**Solution:**
- Increase timeout in test:
  ```typescript
  await expect(element).toBeVisible({ timeout: 30000 });
  ```
- Check if dev server is running
- Verify page is loading correctly

### Browser Not Found

**Problem:** `Browser not found`

**Solution:**
```bash
# Install browsers
npx playwright install chromium
npx playwright install firefox  # Optional
npx playwright install webkit  # Optional
```

### Module Not Found

**Problem:** `Cannot find module`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors

**Problem:** Type errors in tests

**Solution:**
```bash
# Check TypeScript
pnpm check

# Fix imports if needed
```

---

## 📁 Test Reports

### Report Locations

```
careerswarm-honeycomb/
├── playwright-report/          # HTML report
│   ├── index.html             # Main report
│   └── data/                  # Test data, videos, screenshots
├── test-results/              # Test artifacts
│   ├── results.json           # JSON results
│   ├── playbook-report-honeycomb.json  # Playbook report
│   └── [test-name]/           # Individual test artifacts
│       ├── trace.zip          # Execution trace
│       ├── video.webm         # Video recording
│       └── test-failed-1.png  # Screenshot on failure
```

### Viewing Reports

```bash
# Open HTML report
npx playwright show-report

# View specific test artifacts
open playwright-report/index.html

# Check JSON report
cat test-results/playbook-report-honeycomb.json | jq
```

### Report Contents

**playbook-report-honeycomb.json:**
```json
{
  "timestamp": "2026-01-26T16:03:52.025Z",
  "url": "http://localhost:3000",
  "consoleErrors": [...],
  "networkErrors": [...],
  "trpcErrors": [...],
  "criticalIssues": [...],
  "recommendations": [...],
  "features": {
    "homepage": true,
    "dashboard": true,
    "trpcClient": true
  }
}
```

---

## 🎯 Test Checklist

Before deploying, run this checklist:

- [ ] All playbook tests pass: `npx playwright test playbook`
- [ ] No critical console errors
- [ ] No failed network requests (except expected analytics)
- [ ] Homepage loads correctly
- [ ] Dashboard accessible
- [ ] tRPC endpoints working
- [ ] Validation script passes: `pnpm validate` (requires env vars)
- [ ] Review test report: `test-results/playbook-report-honeycomb.json`

---

## 🔧 Configuration

### Environment Variables

**Required for Production:**
```bash
DATABASE_URL=mysql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
OAUTH_SERVER_URL=...
BUILT_IN_FORGE_API_KEY=...
```

**Optional (Analytics):**
```bash
VITE_ANALYTICS_ENDPOINT=...
VITE_ANALYTICS_WEBSITE_ID=...
VITE_OAUTH_PORTAL_URL=...
```

### Playwright Configuration

Edit `playwright.config.ts` to:
- Change base URL
- Add/remove browsers
- Adjust timeouts
- Modify reporters

---

## 📚 Additional Resources

- **Project Summary:** `PROJECT_SUMMARY.md`
- **Changelog:** `CHANGELOG.md`
- **Testing Docs:** `TESTING.md`
- **Existing Tests:** `tests/auth.spec.ts`, `tests/achievements.spec.ts`

---

## ✅ Quick Reference

```bash
# Install & Setup
pnpm install
npx playwright install chromium

# Run Tests
npx playwright test playbook              # All playbook tests
npx playwright test playbook-whats-broken # Specific play
npx playwright test --ui                  # Interactive mode

# View Results
npx playwright show-report               # HTML report
cat test-results/playbook-report-honeycomb.json | jq  # JSON report

# Validation
pnpm validate                            # Production validation
```

---

## 🆘 Getting Help

If tests fail:

1. **Check the report:** `test-results/playbook-report-honeycomb.json`
2. **Review screenshots:** `playwright-report/data/`
3. **Watch videos:** `playwright-report/data/*.webm`
4. **Check traces:** `test-results/[test-name]/trace.zip`
5. **Review console:** Run with `--headed` to see browser

---

**Last Updated:** 2026-01-26  
**Test Suite Version:** 1.0.0  
**Status:** ✅ All tests passing
