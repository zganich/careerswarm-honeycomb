# Prompt for Manus: Create New Database (Workaround)

**Copy everything below the line and give to Manus:**

---

## Database Workaround - Create New Database Immediately

The original TiDB database was dropped and Manus support may take days to respond. Let's create a new database now using one of these approaches.

---

## Option 1: Check Manus Dashboard for New Database (Fastest if available)

1. **Go to your Manus dashboard**
2. **Look for:**
   - "Create Database" or "Add Database" option
   - "Database" or "Storage" section in project settings
   - Any way to provision a new TiDB/MySQL database
3. **If you can create a new database:**
   - Create it with any name (e.g., `careerswarm` or `careerswarm_new`)
   - Copy the new `DATABASE_URL`
   - Update `.env` with the new `DATABASE_URL`
   - Run `pnpm db:migrate`

**If Manus dashboard has no database creation option, proceed to Option 2.**

---

## Option 2: Use Docker MySQL (Works Everywhere)

Run this to start a MySQL database locally:

```bash
# Start MySQL in Docker
docker run -d \
  --name careerswarm-mysql \
  -e MYSQL_ROOT_PASSWORD=localdev \
  -e MYSQL_DATABASE=careerswarm \
  -p 3306:3306 \
  mysql:8

# Wait for MySQL to be ready (10-15 seconds)
sleep 15

# Verify it's running
docker ps | grep careerswarm-mysql
```

**Expected output:** Container running on port 3306

---

### Update DATABASE_URL

Edit `.env` in the project root:

```bash
# Comment out the old TiDB URL
# DATABASE_URL=mysql://...tidbcloud.com:4000/...

# Add the new Docker MySQL URL
DATABASE_URL="mysql://root:localdev@localhost:3306/careerswarm"
```

---

### Run Migrations

```bash
cd /home/ubuntu/careerswarm
pnpm db:migrate
```

**Expected output:** Migrations complete, no errors

---

### Verify Tables Created

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

**Expected:** 30+ tables including `users`, `userProfiles`, `workExperiences`, `achievements`, `skills`, `certifications`, `education`, `awards`, `languages`, `volunteerExperiences`, `projects`, `publications`, `securityClearances`, `superpowers`, `targetPreferences`, `opportunities`, `applications`, etc.

**Note:** This codebase uses `userProfiles`, `workExperiences`, etc. (NOT a single `masterProfiles` table). See `drizzle/schema.ts` for the full schema.

---

## Option 3: Use PlanetScale (Free Tier - 5 minutes)

If Docker isn't available:

1. **Go to:** https://planetscale.com
2. **Sign up** (free tier available)
3. **Create database:** Name it `careerswarm`
4. **Get connection string** from dashboard
5. **Update `.env`:**
   ```
   DATABASE_URL="mysql://username:password@host.planetscale.com/careerswarm?ssl={"rejectUnauthorized":true}"
   ```
6. **Run migrations:** `pnpm db:migrate`

---

## After Database is Ready

### 1. Run Migrations
```bash
pnpm db:migrate
```

### 2. Verify Tables
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL).then(async conn => {
  const [tables] = await conn.query('SHOW TABLES');
  console.log('Total tables:', tables.length);
  await conn.end();
}).catch(console.error);
"
```

### 3. Continue Deployment
```bash
pnpm run verify-env
pnpm run build
pnpm start
```

### 4. Test Onboarding
1. Go to `/login`
2. Sign in with Dev Login (any email, e.g., `test@careerswarm.com`)
3. Complete onboarding steps 1-5:
   - Step 1: Welcome → Click "Get Started"
   - Step 2: Upload → Upload a resume (PDF/DOCX)
   - Step 3: Extract → Wait for AI to parse resume
   - Step 4: Review → Verify extracted data shows (NOT empty)
   - Step 5: Preferences → Fill in job preferences
4. Click "Complete Onboarding"
5. Verify profile page shows data (NOT "No profile found")

### 5. Verify Database Has Data
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL).then(async conn => {
  const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
  const [profiles] = await conn.query('SELECT COUNT(*) as count FROM userProfiles');
  const [experiences] = await conn.query('SELECT COUNT(*) as count FROM workExperiences');
  console.log('Users:', users[0].count);
  console.log('Profiles:', profiles[0].count);
  console.log('Work Experiences:', experiences[0].count);
  await conn.end();
}).catch(console.error);
"
```
**Expected:** At least 1 user, 1 profile after completing onboarding

---

## Reply Format

**After completing database setup:**

```
✅ Database created using: [Option 1/2/3]
DATABASE_URL: [redact password, show host and database name]

Running migrations...
[paste output of pnpm db:migrate]

Tables created: [count]

Proceeding with deployment...
```

---

## Quick Summary

| Option | Time | Requires |
|--------|------|----------|
| 1. Manus Dashboard | 2 min | Dashboard access |
| 2. Docker MySQL | 5 min | Docker installed |
| 3. PlanetScale | 5 min | Internet, email |

**Recommended:** Try Option 1 first (check Manus dashboard). If not available, use Option 2 (Docker).

---

**End of Prompt**
