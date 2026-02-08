# Onboarding Deep Dive

**Purpose:** Audit of the 5-step onboarding flow (Welcome → Upload → Extraction → Review → Preferences). Ensures features work as intended and make sense to a human user.

---

## Flow Overview

| Step | Route                                  | Purpose                                                                  |
| ---- | -------------------------------------- | ------------------------------------------------------------------------ |
| 1    | `/onboarding` or `/onboarding/welcome` | Welcome + sign-in gate                                                   |
| 2    | `/onboarding/upload`                   | Upload resume(s) (PDF, DOCX, TXT)                                        |
| 3    | `/onboarding/extraction`               | Server processes & parses resumes, builds profile                        |
| 4    | `/onboarding/review`                   | Review extracted profile (superpowers, work history, achievements, etc.) |
| 5    | `/onboarding/preferences`              | Set target roles, industries, salary, location → complete onboarding     |

After step 5, user is redirected to `/dashboard`. Onboarding completion is stored in DB (`users.onboardingStep = 5`, `onboardingCompletedAt`).

---

## Step-by-Step Audit

### 1. Welcome (`Welcome.tsx`)

- **Auth:** Uses `useAuth()`. If not signed in, clicking the main CTA opens a "Sign In Required" dialog; "Sign In to CareerSwarm" goes to `/login?returnTo=/onboarding/welcome`.
- **Copy:** "Step 1 of 5", "Let's build your Master Profile in about 10 minutes", "What We'll Build Together" (Upload → Extract → Review → Preferences). When signed in: "You're signed in. Next: upload your resume to build your profile" and "Continue to Upload →".
- **Behavior:** Unauthenticated users can land here and are prompted to sign in before continuing. Authenticated users go to `/onboarding/upload`. **Works as intended.**

### 2. Upload (`Upload.tsx`)

- **API:** `onboarding.uploadResume` (per file: filename, base64 fileData, mimeType). Server stores in S3 and creates `uploadedResumes` row with `processingStatus: "pending"`.
- **UI:** Drag-and-drop or browse; PDF, DOCX, TXT; multiple files; remove before continue. Copy: "Max 10MB per file".
- **Gaps:**
  - **10MB not enforced:** The UI says "Max 10MB per file" but the tRPC `uploadResume` procedure does **not** validate file size. Large files can be uploaded and may fail later (storage/parsing) or slow the system. **Recommendation:** Add server-side check (e.g. reject if `fileBuffer.length > 10 * 1024 * 1024`) and optional client-side check before upload.
  - **No cap on number of files:** Users can add many files. No explicit "15 uploads" or similar limit in code; only practical limits are time/UX. Acceptable for now.
- **Back:** "← Back" goes to `/onboarding` (Welcome). **Makes sense.**

### 3. Extraction (`Extraction.tsx`)

- **Behavior:** On mount, opens EventSource for `/api/resume-progress`, then runs `onboarding.processResumes` then `onboarding.parseResumes`. Progress messages and a labor-illusion animation run while waiting.
- **processResumes:** Finds `uploadedResumes` with `processingStatus === "pending"`, downloads from S3, extracts text (PDF/DOCX/TXT), updates status to `completed` and stores `extractedText`. If **no pending** resumes, returns `{ message: "No resumes to process" }` (no throw).
- **parseResumes:** Finds resumes with `processingStatus === "completed"` and `extractedText`. If **none**, throws: "No processed resumes found. Upload and process resumes first, then try again."
- **Edge case:** If a user lands on Extraction without uploading (e.g. direct URL or back/forward), processResumes succeeds with "No resumes to process", then parseResumes **throws**. The UI shows "Failed to extract profile. Please try again." and a Retry button. **Makes sense** but could be friendlier (e.g. "No resumes to process. Please upload resumes first." and a link to Upload). **Optional improvement:** Detect "No processed resumes found" and redirect to `/onboarding/upload` with a toast.
- **Success:** "Extraction Complete!" and "Review Your Profile →" to `/onboarding/review`. **Works as intended.**

### 4. Review (`Review.tsx`)

- **Data:** Uses `profile.get` to show superpowers, work history, achievements, education, certifications, awards, languages, volunteer, projects, publications, clearances, portfolio.
- **Copy:** "We've extracted your career data. Review and edit as needed."
- **Gap:** There is **no edit UI** on this page. Users can only "Looks Good, Continue →". So "edit as needed" is misleading unless we consider editing to happen later on the dashboard/profile. **Recommendation:** Either add inline edit or change copy to e.g. "Review your profile below. You can edit any section later from your dashboard."

### 5. Preferences (`Preferences.tsx`)

- **API:** `onboarding.savePreferences` with roleTitles, industries, companyStages, minimumBaseSalary, targetBaseSalary, locationType, allowedCities (array). Server calls `db.upsertTargetPreferences` and `db.updateUserOnboardingStep(user.id, 5, true)`.
- **UI:** Target roles and industries (required), company stages, min/target salary, location preference, work arrangement (Remote / Hybrid / On-site). "Complete Onboarding →" saves and redirects to `/dashboard` with toast "Welcome! Your profile is saved. Here's your dashboard."
- **allowedCities:** Single text input is sent as a one-element array `[preferences.locationPreference]`. So only one city is supported from this screen. Placeholder: "e.g., Salt Lake City, UT or Remote". **Works as intended** for a simple first pass.
- **Back:** "← Back" goes to `/onboarding/review`. **Makes sense.**

---

## Auth and Deep Links

- **Welcome** is the only step that explicitly checks `useAuth()` and shows a login modal. Upload, Extraction, Review, and Preferences do **not** check auth in the component; they rely on tRPC (protected procedures). If an unauthenticated user opens e.g. `/onboarding/upload` directly, the page renders but mutations (upload, processResumes, parseResumes, savePreferences) will fail with 401. The app’s global auth handling (e.g. redirect to login) may apply depending on how 401 is handled. **Acceptable**; optional improvement is to redirect to `/login?returnTo=...` when auth is missing on any onboarding route.

---

## Summary: Human-Friendly?

| Aspect                                              | Status                                         |
| --------------------------------------------------- | ---------------------------------------------- |
| Clear 5-step progress (Step X of 5, progress bar)   | ✅                                             |
| Sign-in required before building profile            | ✅                                             |
| Upload → process → review → preferences → dashboard | ✅                                             |
| Copy matches behavior (except "edit" on Review)     | ⚠️ Review says "edit as needed" but no edit UI |
| 10MB per file stated but not enforced               | ⚠️ Add server (and optionally client) check    |
| Extraction without upload gives clear error         | ✅ (could redirect to Upload for smoother UX)  |
| Preferences required fields (roles, industries)     | ✅                                             |
| Completion redirect and toast                       | ✅                                             |

---

## 5-App Limit vs 15 Uploads (Clarification)

- **5-app limit:** This refers to **applications** (job applications), not resume uploads.
  - **Free tier:** 5 **applications per month**. An "application" is created when the user uses **1-Click Apply** (e.g. from Jobs or OpportunityDetailModal) — i.e. generating a tailored application package for a job.
  - **Enforcement:** `server/db.ts` — `FREE_TIER_APP_LIMIT = 5`. `checkApplicationLimit(userId)` is called in `applications.quickApply`; when the user has used 5 this month, the server returns `FORBIDDEN` with `cause: { type: "APPLICATION_LIMIT", applicationsUsed, limit }`. The client shows **UpgradeModal** instead of a generic alert (e.g. in OpportunityDetailModal, Jobs, SavedOpportunities).
- **15 uploads:** There is **no** limit of 15 resume uploads in the codebase. Onboarding upload allows "one or more" files with no server-side cap. The number **15** appears elsewhere (e.g. Scout returns up to 15 results, various timeouts in ms). So: **5 = free applications per month; 15 is not an upload limit.**

Pricing page correctly states: Free = "5 applications per month"; Pro = "Unlimited applications".
