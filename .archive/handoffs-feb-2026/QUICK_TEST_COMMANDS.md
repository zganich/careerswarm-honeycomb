# ⚡ Quick Test Commands - CareerSwarm Honeycomb

**One-liner commands for common testing tasks**

---

## 🚀 Setup (One-Time)

```bash
# Install pnpm and Playwright
npm install -g pnpm && cd /Users/jamesknight/GitHub/careerswarm-honeycomb && pnpm install && npx playwright install chromium
```

---

## 🧪 Run Tests

```bash
# All playbook tests
npx playwright test playbook

# Specific play
npx playwright test playbook-whats-broken
npx playwright test playbook-api-validation
npx playwright test playbook-runner

# All tests (playbook + existing)
npx playwright test

# Interactive UI mode
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed
```

---

## 📊 View Results

```bash
# HTML report
npx playwright show-report

# JSON report (pretty)
cat test-results/playbook-report-honeycomb.json | jq

# Quick summary
cat test-results/playbook-report-honeycomb.json | jq '{timestamp, features, criticalIssues: .criticalIssues | length, recommendations: .recommendations | length}'
```

---

## 🔍 Debug

```bash
# Debug mode
npx playwright test --debug

# Run specific test
npx playwright test playbook-whats-broken -g "homepage"

# Show trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

---

## ✅ Validation

```bash
# Production validation (needs env vars)
pnpm validate

# Type check
pnpm check

# Build check
pnpm build
```

---

## 🎯 Most Common Commands

```bash
# Daily testing
npx playwright test playbook

# Before deployment
npx playwright test playbook && pnpm validate

# Debug failing test
npx playwright test playbook --debug --headed
```

---

**Pro Tip:** Add to your `package.json` scripts:
```json
{
  "scripts": {
    "test:playbook": "playwright test playbook",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report"
  }
}
```

Then run: `pnpm test:playbook`
