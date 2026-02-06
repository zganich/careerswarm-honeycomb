# Running Playbook Tests - Honeycomb Repo

## Setup

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install chromium
```

## Run Tests

### Run All Playbook Tests

```bash
npx playwright test playbook
```

### Run Specific Plays

```bash
# Play 1: What's Actually Broken?
npx playwright test playbook-whats-broken

# Play 2: API Validation
npx playwright test playbook-api-validation

# Complete Playbook Runner
npx playwright test playbook-runner
```

### Run with UI (Interactive)

```bash
npx playwright test --ui
```

## Test Results

Results saved to:

- `test-results/playbook-report-honeycomb.json` - Comprehensive report
- `test-results/` - Screenshots, videos, traces

## Configuration

Set environment variables if testing different URLs:

```bash
export FRONTEND_URL=http://localhost:3000
export API_URL=http://localhost:3000
```
