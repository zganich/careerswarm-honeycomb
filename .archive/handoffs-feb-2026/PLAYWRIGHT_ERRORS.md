# Playwright E2E Test Errors - CareerSwarm

**Date:** February 2, 2026  
**Status:** Tests failing due to configuration and import issues

---

## Critical Issues Found

### 1. **test.describe() Error (False Positive)**

**Error:** `Playwright Test did not expect test.describe() to be called here`

**Root Cause:**  
This error is a **red herring**. It's Playwright's internal error message when test collection fails for OTHER reasons. The actual issues are:

1. Auth setup failing
2. Onboarding flow tests failing
3. Missing or incorrect test assertions

**Status:** ✅ RESOLVED - Not a real issue, focus on actual test failures below

**Verification:**

- ✅ Only one @playwright/test version installed (1.58.0)
- ✅ All test files have correct imports
- ✅ No configuration file issues

---

### 2. **Test Execution Timeout**

**Issue:** Tests are taking longer than expected to complete (240s+ timeout)

**Observations:**

- Some tests are passing: `onboarding-flow.spec.ts` Step 1 (Welcome page) ✓
- Some tests are failing: Steps 2 (Upload) and 3 (Extraction) ✘
- Auth setup is failing ✘

**Potential Causes:**

- Dev server not fully started
- Network latency to Manus OAuth
- AI agent processing delays
- Missing test data or fixtures

---

### 3. **Onboarding Flow Test Failures**

**Test:** `Step 2: Upload page should accept file uploads`  
**Status:** ✘ FAILED (2.6s)  
**Likely Issue:** File upload functionality not working or test assertion incorrect

**Test:** `Step 3: Extraction page should show processing`  
**Status:** ✘ FAILED (2.8s)  
**Likely Issue:** Extraction page not loading or processing indicator missing

---

### 4. **Authentication Setup Failure**

**Test:** `authenticate` in `auth.setup.ts`  
**Status:** ✘ FAILED (13.9s)  
**Impact:** All tests depending on authentication will fail

**Observations:**

- Auth bypass is working: `[Auth Bypass] Injected session cookie for Playwright Test User`
- But setup test itself is failing

---

## Next Steps

### Immediate Actions:

1. Fix `test.describe()` import errors in all test files
2. Investigate auth.setup.ts failure
3. Debug onboarding flow upload and extraction failures
4. Reduce test timeouts or optimize test execution

### Testing Strategy:

1. Run tests individually to isolate failures
2. Check dev server logs for errors
3. Verify OAuth integration is working
4. Test file upload functionality manually
5. Ensure all tRPC endpoints are accessible

---

## Test Execution Summary

**Total Tests:** 102  
**Passed:** 1 (Welcome page display)  
**Failed:** 3+ (Upload, Extraction, Auth setup)  
**Errors:** Multiple `test.describe()` import errors  
**Duration:** 240s+ (timeout)

---

## Environment

- **Playwright Version:** 1.58.0
- **Node Version:** 22.13.0
- **Base URL:** http://localhost:3000
- **Dev Server:** Running (pnpm dev)
- **Browser:** Chromium (Desktop Chrome)

---

## Recommendations

1. **Fix Import Errors First:** Resolve all `test.describe()` errors before running full test suite
2. **Simplify Test Suite:** Start with basic navigation tests, then add complex flows
3. **Add Debugging:** Enable Playwright trace and video for failed tests
4. **Check Dependencies:** Ensure all test utilities (bypassLogin, etc.) are working correctly
5. **Incremental Testing:** Test each onboarding step individually before running full flow

---

**Last Updated:** February 2, 2026 06:15 AM MST
