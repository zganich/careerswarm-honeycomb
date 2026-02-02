# Smoke Test: Package Generation

**Purpose:** Verify the core revenue path—Quick Apply → Tailor/Scribe/Assembler → downloadable resume, cover letter, and LinkedIn message—works end-to-end before production.

**When to run:** Before deploy, after major changes to agents or `applications.generatePackage`, or when debugging "package not ready" issues.

---

## Prerequisites

- App running locally or in staging (`pnpm dev` or deployed URL).
- User has completed onboarding (resume uploaded and parsed, Master Profile has work experience).
- At least one opportunity exists (e.g. from Jobs or Saved Opportunities).
- Required env set: `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_KEY`. For S3 uploads: `AWS_ACCESS_KEY_ID`, `AWS_S3_BUCKET`, etc. (see [.env.example](../.env.example)).

---

## Steps

1. **Start the app** (if local):
   ```bash
   pnpm dev
   ```

2. **Log in** and complete onboarding if needed (upload resume → process → parse → preferences → review).

3. **Create an application:**
   - Go to Jobs or Opportunities.
   - Open one opportunity and click **Quick Apply** (or add to applications and open it).
   - Confirm the application appears on the Applications list.

4. **Trigger package generation:**
   - Open **Applications** (or the application detail page).
   - Click **Generate Package** / **Download Package** (or equivalent CTA that calls `applications.generatePackage`).
   - You should see a toast like: "Package generation started. You'll be notified when it's ready."

5. **Wait for completion:**
   - Generation runs async (Tailor → Scribe → Assembler → S3 → DB update → notification).
   - Check for a success notification (in-app or bell icon): "Application Package Ready".
   - If it fails, you should get an error notification: "Package Generation Failed" with guidance to try again.

6. **Verify outputs:**
   - On the application detail page, confirm:
     - **Resume (PDF)** and **Resume (DOCX)** links are present and downloadable.
     - **Cover letter** and **LinkedIn message** are visible and copyable (or downloadable).
   - Optional DB check: `applications` row for this application has `packageZipUrl`, `resumePdfUrl`, `resumeDocxUrl`, `tailoredResumeText`, `coverLetterText`, `linkedinMessage` populated.

---

## Success Criteria

- [ ] Application created from an opportunity.
- [ ] Generate Package triggered without immediate error.
- [ ] User receives success or error notification (no silent failure).
- [ ] On success: resume PDF, resume DOCX, cover letter, and LinkedIn message are available and sensible.

---

## If It Fails

- **No notification / silent failure:** Check server logs for `Package generation failed:` and any stack trace. Ensure agents (Tailor, Scribe, Assembler) and S3/storage env are set.
- **"Application not found" / 404:** Ensure the application belongs to the logged-in user and the correct `applicationId` is passed.
- **Profiler skipped:** Non-blocking; package generation continues. Optional to fix Profiler/company insights.
- **S3 or upload errors:** Verify `AWS_ACCESS_KEY_ID`, `AWS_S3_BUCKET`, and related env; check IAM and bucket policy.

See also: [CRITICAL_TODOS_AND_PHASES.md](CRITICAL_TODOS_AND_PHASES.md), [CLAUDE_MANUS_HANDOFF.md](../CLAUDE_MANUS_HANDOFF.md) "Phase 2: Application Package Generation Testing".
