# Database Backup & Restore Procedures

## Overview

CareerSwarm uses MySQL on Railway. This document covers backup and restore procedures.

## Automated Backups (Railway)

Railway automatically creates daily backups for MySQL databases on paid plans.

### Accessing Railway Backups

1. Go to Railway Dashboard → Your Project → MySQL service
2. Click "Backups" tab
3. Download or restore from available snapshots

## Manual Backup

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to project
railway link

# Dump database
railway run mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Option 2: Direct mysqldump

Get connection details from Railway → MySQL → Variables:

```bash
# Set connection vars (from Railway)
export MYSQL_HOST="xxx.railway.app"
export MYSQL_PORT="xxxx"
export MYSQL_USER="root"
export MYSQL_PASSWORD="xxx"
export MYSQL_DATABASE="railway"

# Create backup
mysqldump -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup (recommended for large DBs)
mysqldump -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Option 3: Drizzle Studio Export

1. Run `pnpm drizzle-kit studio`
2. Select tables to export
3. Export as SQL or JSON

## Restore Procedures

### Restore to Railway (Same Instance)

```bash
# Restore from SQL file
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < backup_file.sql

# Restore from compressed file
gunzip < backup_file.sql.gz | mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
```

### Restore to New Railway Instance

1. Create new MySQL service in Railway
2. Get new connection credentials
3. Run restore command with new credentials
4. Update `DATABASE_URL` in careerswarm-app Variables
5. Redeploy application

### Restore to Local Development

```bash
# Create local database
mysql -u root -p -e "CREATE DATABASE careerswarm_restore;"

# Restore backup
mysql -u root -p careerswarm_restore < backup_file.sql

# Update .env
DATABASE_URL=mysql://root:password@localhost:3306/careerswarm_restore
```

## Backup Schedule Recommendations

| Environment | Frequency | Retention |
|-------------|-----------|-----------|
| Production | Daily (automated by Railway) | 7 days |
| Pre-major-deploy | Manual backup | Until deploy verified |
| Before migrations | Manual backup | Until migration verified |

## Pre-Migration Backup Script

Run before any schema changes:

```bash
#!/bin/bash
# scripts/pre-migration-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/pre_migration_${TIMESTAMP}.sql.gz"

mkdir -p backups

echo "Creating pre-migration backup..."
mysqldump -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE | gzip > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
echo "Size: $(ls -lh $BACKUP_FILE | awk '{print $5}')"
```

## Disaster Recovery Checklist

### If Production Database is Corrupted

1. **Stop the bleeding**: Set maintenance mode or scale down app
2. **Assess damage**: Check Railway logs, identify scope
3. **Get latest backup**: Railway Backups tab or your manual backup
4. **Restore**:
   - Option A: Restore to same instance (downtime: ~5-15 min)
   - Option B: Spin up new MySQL, restore, update DATABASE_URL (downtime: ~10-20 min)
5. **Verify**: Check critical tables, run smoke tests
6. **Resume**: Scale app back up, monitor closely
7. **Post-mortem**: Document what happened, improve procedures

### Contact Points

- Railway Support: support@railway.app
- Railway Status: status.railway.app

## Data Retention & Compliance

- User data is encrypted at rest (Fernet encryption for PII)
- Backups inherit encryption from source database
- For GDPR deletion requests: Delete user record (cascades to related data), create new backup to purge old data

## Testing Restore Procedure

Quarterly, test the restore process:

1. Create fresh backup
2. Spin up local MySQL or Railway dev instance
3. Restore backup
4. Run `pnpm test` against restored DB
5. Document any issues

This ensures backups are valid and the team knows the procedure.
