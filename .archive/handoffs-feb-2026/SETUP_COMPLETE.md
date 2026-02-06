# ✅ Setup Complete - Playbook Tests Ready!

## What Was Done

1. ✅ **Cloned `careerswarm-honeycomb`** repo
2. ✅ **Copied all rules/configs** from old repo:
   - `.cursorrules` → Copied
   - `.claude/` → Copied (with flywheel, pivot, roast rules)
   - `.cursor/` → Copied (with same rules)
3. ✅ **Created Playbook Tests** for honeycomb:
   - `tests/playbook-whats-broken.spec.ts` - Console errors, network requests
   - `tests/playbook-api-validation.spec.ts` - tRPC endpoint validation
   - `tests/playbook-runner.spec.ts` - Complete playbook runner with report

## Next Steps

### 1. Install pnpm (Required for honeycomb)

```bash
npm install -g pnpm
# OR
brew install pnpm
```

### 2. Install Dependencies

```bash
cd /Users/jamesknight/GitHub/careerswarm-honeycomb
pnpm install
npx playwright install chromium
```

### 3. Run Playbook Tests

```bash
# Run all playbook tests
npx playwright test playbook

# Or run specific plays
npx playwright test playbook-whats-broken
npx playwright test playbook-api-validation
npx playwright test playbook-runner
```

### 4. Run Validation Script

```bash
pnpm validate
# (runs scripts/validate-production.mjs)
```

## Test Both Repos

### Test Honeycomb (Active)

```bash
cd /Users/jamesknight/GitHub/careerswarm-honeycomb
pnpm install && npx playwright install chromium
npx playwright test playbook
```

### Test Old Repo (For Comparison)

```bash
cd /Users/jamesknight/GitHub/careerswarm
npm install && npx playwright install chromium
npm run test:browser
```

## What the Tests Do

### Play 1: What's Actually Broken?

- Opens homepage
- Captures console errors
- Monitors network requests (especially tRPC)
- Tests key features
- Generates error report

### Play 2: API Validation

- Checks tRPC endpoint accessibility
- Tests homepage/dashboard routes
- Verifies tRPC client initialization

### Playbook Runner

- Runs all tests
- Generates `test-results/playbook-report-honeycomb.json`
- Provides actionable recommendations

## Files Created

```
careerswarm-honeycomb/
├── .cursorrules                    # ✅ Copied from old repo
├── .claude/                        # ✅ Copied from old repo
├── .cursor/                        # ✅ Copied from old repo
├── tests/
│   ├── playbook-whats-broken.spec.ts    # ✅ New
│   ├── playbook-api-validation.spec.ts   # ✅ New
│   └── playbook-runner.spec.ts           # ✅ New
└── RUN_PLAYBOOK_TESTS.md          # ✅ New
```

## Status

✅ **Ready to test!** Just need to:

1. Install pnpm
2. Run `pnpm install`
3. Run the tests

All your rules and configs are preserved! 🎯
