# Cursor Review Checklist - CareerSwarm Database Issue

**Status:** ✅ Documents Already Pushed to GitHub  
**Commit:** 03a9b17  
**Repository:** https://github.com/zganich/careerswarm-honeycomb

---

## 📋 Documents to Review

All documents are already in the GitHub repo. Cursor should review them in this order:

### 1. **CURSOR_SUMMARY.md** (Primary Action Document)
**Location:** `/CURSOR_SUMMARY.md` in repo root  
**Purpose:** Quick-start guide with all commands and next steps

**What to Review:**
- [ ] Investigation results (database confirmed missing)
- [ ] Support ticket template (ready to copy-paste)
- [ ] Step-by-step commands for after database recreation
- [ ] Current status table
- [ ] Quick checklist
- [ ] Timeline estimate (~1 hour after DB recreation)
- [ ] Success criteria

**Action Required:**
- [ ] Copy support ticket template
- [ ] Submit at https://help.manus.im
- [ ] Bookmark the 5 commands to run after database recreation

---

### 2. **DATABASE_STATUS_REPORT.md** (Detailed Investigation)
**Location:** `/DATABASE_STATUS_REPORT.md` in repo root  
**Purpose:** Complete investigation findings and analysis

**What to Review:**
- [ ] Database existence check results
- [ ] Error details and root cause
- [ ] Alternative approaches (if support is slow)
- [ ] Lessons learned
- [ ] Deployment status checklist

**Action Required:**
- [ ] Understand why database is missing
- [ ] Note alternative approaches if needed

---

### 3. **MANUS_TO_CURSOR_HANDOFF.md** (Original Testing Report)
**Location:** `/MANUS_TO_CURSOR_HANDOFF.md` in repo root  
**Purpose:** Initial comprehensive testing findings (900+ lines)

**What to Review:**
- [ ] Original bugs documented (BUG-001 through BUG-004)
- [ ] Testing procedures for Phase 1 & 2
- [ ] Complete testing checklist

**Action Required:**
- [ ] Use this for reference after database is recreated
- [ ] Follow testing procedures to verify everything works

---

### 4. **TEAM_EMAIL_SUMMARY.md** (Optional - For Team Communication)
**Location:** `/TEAM_EMAIL_SUMMARY.md` in repo root  
**Purpose:** Email-ready summary for team updates

**What to Review:**
- [ ] Concise issue summary
- [ ] Timeline and impact

**Action Required:**
- [ ] Forward to team if needed
- [ ] Keep stakeholders informed

---

## 🚀 Immediate Action Steps for Cursor

### Step 1: Review Documents (10 minutes)
```bash
# Open GitHub repo
open https://github.com/zganich/careerswarm-honeycomb

# Review these files in order:
1. CURSOR_SUMMARY.md (PRIORITY)
2. DATABASE_STATUS_REPORT.md
3. MANUS_TO_CURSOR_HANDOFF.md (reference)
4. TEAM_EMAIL_SUMMARY.md (optional)
```

---

### Step 2: Submit Support Ticket (5 minutes)

**URL:** https://help.manus.im

**Copy this template from CURSOR_SUMMARY.md:**
```
Subject: Database Recreation Request - Project zfvp3dr5t953xyc34e9psq

Hi Manus Support,

I accidentally dropped the database for project "careerswarm" (ID: zfvp3dr5t953xyc34e9psq) 
while following deployment instructions. The database was managed by TiDB Cloud and I cannot 
recreate it via SQL commands.

Could you please recreate the database with the name: ZfVp3DR5T953XYC34e9PSQ

Once recreated, I will run the migrations to create the tables.

Thank you!
```

**Checklist:**
- [ ] Go to https://help.manus.im
- [ ] Paste subject line
- [ ] Paste message body
- [ ] Submit ticket
- [ ] Note ticket number for reference

---

### Step 3: Wait for Manus Support Response (Unknown Duration)

**While Waiting:**
- [ ] Review MANUS_TO_CURSOR_HANDOFF.md for post-database testing procedures
- [ ] Familiarize yourself with the 5 commands to run after database recreation
- [ ] Review deployment steps in MANUS_PROMPT.md (if not already done)

**Expected Response:**
- Manus support will confirm database recreation
- You'll receive notification when database is ready
- Database name will be: `ZfVp3DR5T953XYC34e9PSQ`

---

### Step 4: After Database is Recreated (1 hour)

**Run these 5 commands in order** (all in CURSOR_SUMMARY.md):

#### Command 1: Verify Database Exists
```bash
cd /home/ubuntu/careerswarm
node -e "
const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL.replace(/\/[^\/]+\?/, '/?');
mysql.createConnection(url).then(async conn => {
  const [dbs] = await conn.query('SHOW DATABASES');
  console.log('Available databases:');
  dbs.forEach(db => console.log('  -', db.Database));
  await conn.end();
}).catch(console.error);
"
```
**Expected:** Should show `ZfVp3DR5T953XYC34e9PSQ` in the list

---

#### Command 2: Run Migrations
```bash
cd /home/ubuntu/careerswarm
pnpm db:migrate
```
**Expected:** "Migrations complete" message, no errors

---

#### Command 3: Verify Tables Created
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL).then(async conn => {
  const [tables] = await conn.query('SHOW TABLES');
  console.log('Total tables:', tables.length);
  console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));
  await conn.end();
}).catch(console.error);
"
```
**Expected:** 30+ tables including users, userProfiles, workExperiences, etc.

---

#### Command 4: Continue Deployment
```bash
# Verify environment
pnpm run verify-env

# Build
pnpm run build

# Run
pnpm start
```
**Expected:** Server starts on port 3000, no errors

---

#### Command 5: Test Onboarding Flow
```
1. Navigate to /login
2. Sign in with Dev Login: test@careerswarm.com
3. Complete onboarding steps 1-5
4. Verify data saves to database
5. Check profile page shows data (NOT "No profile found")
```
**Expected:** Profile page shows Master Profile with data

---

## ✅ Success Criteria

You'll know everything is working when:

- [x] Documents reviewed and understood
- [ ] Support ticket submitted
- [ ] Database recreated by Manus support
- [ ] Command 1: Database exists ✅
- [ ] Command 2: Migrations complete ✅
- [ ] Command 3: 30+ tables created ✅
- [ ] Command 4: Deployment complete ✅
- [ ] Command 5: Onboarding flow works ✅
- [ ] Profile page shows data (not "No profile found")
- [ ] No database connection errors in logs

---

## 📊 Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Review documents | 10 minutes | ✅ TODO |
| Submit ticket | 5 minutes | ⏳ TODO |
| Wait for support | Unknown | ⏳ WAITING |
| Run 5 commands | 30 minutes | ⏸️ BLOCKED |
| Test onboarding | 20 minutes | ⏸️ BLOCKED |
| **Total (after DB)** | **~1 hour** | ⏸️ BLOCKED |

---

## 📁 GitHub Repository Status

**Repository:** https://github.com/zganich/careerswarm-honeycomb  
**Branch:** main  
**Latest Commit:** 03a9b17

**Files Already Pushed:**
- ✅ CURSOR_SUMMARY.md (action guide)
- ✅ DATABASE_STATUS_REPORT.md (detailed investigation)
- ✅ MANUS_TO_CURSOR_HANDOFF.md (original testing report)
- ✅ MANUS_UPDATE_DATABASE_ISSUE.md (initial analysis)
- ✅ TEAM_EMAIL_SUMMARY.md (team communication)
- ✅ CURSOR_REVIEW_CHECKLIST.md (this file)

**No Action Required:** All documents are already in the repo and pushed.

---

## 🔄 After Completing All Steps

**Update this checklist:**
1. Mark completed items with [x]
2. Add any issues encountered
3. Document resolution time
4. Create new handoff document if needed

**Commit message template:**
```
Database recreated and deployment complete

✅ Database ZfVp3DR5T953XYC34e9PSQ recreated by Manus support
✅ Migrations completed successfully (30+ tables created)
✅ Deployment complete (verify-env, build, start)
✅ Onboarding flow tested and working
✅ Profile page shows Master Profile data

Manus support ticket: [ticket number]
Resolution time: [X hours/days]

Next steps:
- Continue with Phase 2 testing (Application Package Generation)
- Run automated tests (pnpm test, playwright)
- Complete testing checklist from MANUS_TO_CURSOR_HANDOFF.md
```

---

## 💡 Quick Tips

**If support is slow:**
- Check DATABASE_STATUS_REPORT.md for alternative approaches
- Consider local development setup while waiting
- Review testing procedures to be ready when database is available

**If migration fails:**
- Check error message carefully
- See "Step 3" in CURSOR_SUMMARY.md for "Duplicate column name" handling
- Use `npx drizzle-kit push --force` if no important data exists

**If onboarding fails:**
- Check server logs: `tail -100 .manus-logs/devserver.log`
- Verify database tables exist
- Check Profiler agent error handling (see MANUS_TO_CURSOR_HANDOFF.md)

---

## 📞 Support Information

**Manus Support:** https://help.manus.im  
**Project ID:** zfvp3dr5t953xyc34e9psq  
**Database Name:** ZfVp3DR5T953XYC34e9PSQ  
**Repository:** https://github.com/zganich/careerswarm-honeycomb

---

**End of Checklist**

*Generated by Manus AI - February 2, 2026*  
*All documents already pushed to GitHub - Ready for Cursor review*
