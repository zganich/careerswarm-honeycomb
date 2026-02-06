# Prompt for Manus: Create New Database (Workaround)

**Copy everything below the line and give to Manus:**

---

## Database Workaround - Create New Database Immediately

The original TiDB database was dropped and Manus support may take days to respond. Let's create a new database now using one of these approaches.

---

## Prerequisites

Before setting up the database, ensure you have these environment variables ready (see `.env.example`):

| Variable                 | Description                        | Required |
| ------------------------ | ---------------------------------- | -------- |
| `DATABASE_URL`           | MySQL connection string            | Yes      |
| `JWT_SECRET`             | Session signing key (min 32 chars) | Yes      |
| `OAUTH_SERVER_URL`       | Manus OAuth server URL             | Yes      |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API key for LLM        | Yes      |

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

### Step 1: Start MySQL Container

```bash
# Remove any existing container with same name
docker rm -f careerswarm-mysql 2>/dev/null || true

# Start MySQL in Docker
docker run -d \
  --name careerswarm-mysql \
  -e MYSQL_ROOT_PASSWORD=localdev \
  -e MYSQL_DATABASE=careerswarm \
  -p 3306:3306 \
  mysql:8

# Wait for MySQL to be ready (check health)
echo "Waiting for MySQL to be ready..."
for i in {1..30}; do
  if docker exec careerswarm-mysql mysqladmin ping -h localhost -u root -plocaldev --silent 2>/dev/null; then
    echo "MySQL is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 2
done

# Verify it's running
docker ps | grep careerswarm-mysql
```

**Expected output:** Container running on port 3306, "MySQL is ready!" message

### Step 2: Update DATABASE_URL

Edit `.env` in the project root:

```bash
# Comment out the old TiDB URL
# DATABASE_URL=mysql://...tidbcloud.com:4000/...

# Add the new Docker MySQL URL (multipleStatements is required for migrations)
DATABASE_URL="mysql://root:localdev@localhost:3306/careerswarm?multipleStatements=true"
```

**Important:** The `multipleStatements=true` parameter is required for the migration scripts to work.

### Step 3: Test Database Connection

```bash
# Quick connectivity test
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection(process.env.DATABASE_URL)
  .then(conn => {
    console.log('Database connection successful!');
    return conn.end();
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
"
```

**Expected:** "Database connection successful!"

---

## Option 3: Use PlanetScale (Free Tier - 5 minutes)

If Docker isn't available:

1. **Go to:** https://planetscale.com
2. **Sign up** (free tier available)
3. **Create database:** Name it `careerswarm`
4. **Get connection string** from dashboard
5. **Update `.env`:**

   ```
   DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/careerswarm?ssl={\"rejectUnauthorized\":true}"
   ```

   Or use the simpler format if SSL issues occur:

   ```
   DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/careerswarm?sslmode=require"
   ```

6. **Run migrations:** `pnpm db:migrate`

---

## After Database is Ready

### 1. Run Migrations

```bash
cd /home/ubuntu/careerswarm
pnpm db:migrate
```

**Expected output:** Migrations complete, no errors. You should see output like:

```
Running migrations...
Migration 0000_lucky_secret_warriors done
Migration 0001_natural_orphan done
... (more migrations)
Migration 0015_master_profile_new_sections done
```

### 2. Verify Tables Created (24 tables expected)

```bash
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection(process.env.DATABASE_URL).then(async conn => {
  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log('Total tables:', tableNames.length);
  console.log('Tables:', tableNames.join(', '));

  // Check for critical tables
  const required = ['users', 'userProfiles', 'workExperiences', 'achievements', 'skills',
                    'education', 'targetPreferences', 'opportunities', 'applications'];
  const missing = required.filter(t => !tableNames.includes(t));
  if (missing.length > 0) {
    console.log('WARNING: Missing critical tables:', missing.join(', '));
  } else {
    console.log('All critical tables present.');
  }
  await conn.end();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
"
```

**Expected:** 24 tables including:

- `users` - User accounts
- `userProfiles` - Contact info, professional summary
- `workExperiences` - Job history
- `achievements` - Quantified accomplishments (CAR format)
- `skills` - Technical and soft skills
- `certifications` - Professional certifications
- `awards` - Recognition and awards
- `education` - Degrees and institutions
- `superpowers` - Top 3 unique strengths
- `uploadedResumes` - Resume file metadata
- `targetPreferences` - Job search criteria
- `opportunities` - Job listings
- `applications` - Application tracking
- `agentExecutionLogs` - AI agent activity logs
- `agentMetrics` - Agent performance metrics
- `notifications` - User notifications
- `savedOpportunities` - Bookmarked jobs
- `applicationNotes` - Notes on applications
- `languages` - Language proficiencies
- `volunteerExperiences` - Volunteer work
- `projects` - Personal/professional projects
- `publications` - Published works
- `securityClearances` - Security clearance info

**Note:** This codebase uses `userProfiles`, `workExperiences`, etc. (NOT a single `masterProfiles` table). See `drizzle/schema.ts` for the full schema.

### 3. Verify Environment

```bash
pnpm run verify-env
```

**Expected output:** "Required env vars OK."

### 4. Start the Application

```bash
# Development mode
pnpm run dev

# OR Production mode
pnpm run build
pnpm start
```

### 5. Test Onboarding

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

### 6. Verify Database Has Data

```bash
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection(process.env.DATABASE_URL).then(async conn => {
  const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
  const [profiles] = await conn.query('SELECT COUNT(*) as count FROM userProfiles');
  const [experiences] = await conn.query('SELECT COUNT(*) as count FROM workExperiences');
  const [achievements] = await conn.query('SELECT COUNT(*) as count FROM achievements');
  console.log('Users:', users[0].count);
  console.log('Profiles:', profiles[0].count);
  console.log('Work Experiences:', experiences[0].count);
  console.log('Achievements:', achievements[0].count);
  await conn.end();
}).catch(err => {
  console.error('Error:', err.message);
});
"
```

**Expected:** At least 1 user, 1 profile after completing onboarding

---

## Troubleshooting

### Error: Duplicate column name 'professionalSummary' (or similar)

**Cause:** Partial migration from previous attempt left database in inconsistent state.

**Solution - Clean Slate (Development Only):**

```bash
# Connect to MySQL and drop the database
docker exec -it careerswarm-mysql mysql -u root -plocaldev -e "DROP DATABASE IF EXISTS careerswarm; CREATE DATABASE careerswarm;"

# Re-run migrations
pnpm db:migrate
```

**For non-Docker databases:**

```sql
-- Run this in MySQL client
DROP DATABASE IF EXISTS careerswarm;
CREATE DATABASE careerswarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run `pnpm db:migrate` again.

### Error: ECONNREFUSED or Connection refused

**Cause:** MySQL server not running or wrong host/port.

**Solutions:**

1. **Docker:** Check container is running: `docker ps | grep careerswarm-mysql`
2. **Start container:** `docker start careerswarm-mysql`
3. **Check port:** Ensure nothing else is using port 3306
4. **Verify URL:** Check `DATABASE_URL` has correct host (`localhost` for Docker, actual host for remote)

### Error: Access denied for user

**Cause:** Wrong credentials in DATABASE_URL.

**Solution:** Verify username/password match what was set when creating the database:

- Docker default: `root` / `localdev`
- Check your database provider's dashboard for credentials

### Error: Unknown database 'careerswarm'

**Cause:** Database doesn't exist yet.

**Solution:**

```bash
# For Docker:
docker exec -it careerswarm-mysql mysql -u root -plocaldev -e "CREATE DATABASE IF NOT EXISTS careerswarm;"

# Then run migrations
pnpm db:migrate
```

### Error: Table 'X' doesn't exist (after migrations)

**Cause:** Migrations didn't complete successfully.

**Solution:**

1. Check migration output for errors
2. Try running migrations again: `pnpm db:migrate`
3. If still failing, use clean slate approach (drop and recreate database)

### Docker Container Cleanup

If you need to start fresh:

```bash
# Stop and remove container
docker stop careerswarm-mysql
docker rm careerswarm-mysql

# Remove volume data (complete reset)
docker volume rm $(docker volume ls -q | grep mysql) 2>/dev/null || true

# Start fresh (go back to Option 2, Step 1)
```

---

## Reply Format

**After completing database setup:**

```
Database created using: [Option 1/2/3]
DATABASE_URL: [redact password, show host and database name]

Running migrations...
[paste output of pnpm db:migrate]

Tables created: [count] (expected: 24)

Environment verification:
[paste output of pnpm run verify-env]

Proceeding with deployment...
```

---

## Quick Summary

| Option             | Time  | Requires         | Best For                   |
| ------------------ | ----- | ---------------- | -------------------------- |
| 1. Manus Dashboard | 2 min | Dashboard access | Production deployments     |
| 2. Docker MySQL    | 5 min | Docker installed | Local development, testing |
| 3. PlanetScale     | 5 min | Internet, email  | When Docker unavailable    |

**Recommended:** Try Option 1 first (check Manus dashboard). If not available, use Option 2 (Docker).

---

## Schema Reference

The database schema is defined in `drizzle/schema.ts`. Key relationships:

- `users` (1) → `userProfiles` (1) - One profile per user
- `users` (1) → `workExperiences` (many) - Multiple jobs
- `workExperiences` (1) → `achievements` (many) - Achievements per job
- `users` (1) → `skills`, `certifications`, `education` (many each)
- `users` (1) → `targetPreferences` (1) - Job search preferences
- `users` (1) → `applications` (many) → `opportunities` (1 per app)

For the complete schema, see: `drizzle/schema.ts`

---

**End of Prompt**
