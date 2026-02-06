# Production Metrics Monitoring

## Overview

This document outlines the production metrics monitoring system for CareerSwarm, tracking package generation success rates, agent performance, and user conversion.

## Current Monitoring Infrastructure

### Built-in Analytics

CareerSwarm already has analytics infrastructure via environment variables:

- `VITE_ANALYTICS_ENDPOINT` - Analytics API endpoint
- `VITE_ANALYTICS_WEBSITE_ID` - Website tracking ID
- `VITE_POSTHOG_HOST` - PostHog analytics host
- `VITE_POSTHOG_KEY` - PostHog API key

### Database Tables for Metrics

#### 1. Applications Table

Already tracks package generation:

```sql
- packageZipUrl (TEXT)
- resumePdfUrl (TEXT)
- resumeDocxUrl (TEXT)
- resumeTxtUrl (TEXT)
- coverLetterTxtUrl (TEXT)
- linkedinMessageTxtUrl (TEXT)
- tailoredResumeText (TEXT)
- coverLetterText (TEXT)
- linkedinMessage (TEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 2. Notifications Table

Tracks system events:

```sql
- type (ENUM: 'application_package_ready', 'application_package_error', etc.)
- title (TEXT)
- content (TEXT)
- isRead (BOOLEAN)
- createdAt (TIMESTAMP)
```

## Key Metrics to Track

### 1. Package Generation Success Rate

**Metric:** Percentage of successful package generations  
**Formula:** `(successful_packages / total_attempts) * 100`

**Implementation:**

```sql
-- Query for success rate
SELECT
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN packageZipUrl IS NOT NULL THEN 1 END) as successful,
  (COUNT(CASE WHEN packageZipUrl IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) as success_rate
FROM applications
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

**Dashboard Query (tRPC):**

```typescript
// Add to server/routers.ts
packageGenerationMetrics: protectedProcedure
  .query(async () => {
    const last24h = await db.execute(sql`
      SELECT
        COUNT(*) as totalAttempts,
        COUNT(CASE WHEN packageZipUrl IS NOT NULL THEN 1 END) as successful,
        (COUNT(CASE WHEN packageZipUrl IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) as successRate
      FROM applications
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    return last24h[0];
  }),
```

### 2. Agent Performance Metrics

**Metrics:**

- Average generation time per agent
- Error rates by agent type
- Keyword match rates (Tailor agent)
- Output length compliance (Scribe agent)

**Implementation:**
Add timing and error tracking to each agent:

```typescript
// In server/agents/tailor.ts, scribe.ts, assembler.ts
const startTime = Date.now();
try {
  // Agent logic
  const result = await generateResume(...);
  const duration = Date.now() - startTime;

  // Log performance metric
  await db.insert(agentMetrics).values({
    agentType: 'tailor',
    duration,
    success: true,
    applicationId: input.applicationId
  });

  return result;
} catch (error) {
  const duration = Date.now() - startTime;

  // Log error metric
  await db.insert(agentMetrics).values({
    agentType: 'tailor',
    duration,
    success: false,
    errorMessage: error.message,
    applicationId: input.applicationId
  });

  throw error;
}
```

**New Table Schema:**

```typescript
export const agentMetrics = sqliteTable("agent_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentType: text("agent_type").notNull(), // 'tailor', 'scribe', 'assembler'
  duration: integer("duration").notNull(), // milliseconds
  success: integer("success", { mode: "boolean" }).notNull(),
  errorMessage: text("error_message"),
  applicationId: integer("application_id").references(() => applications.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

### 3. User Conversion Metrics

**Funnel Stages:**

1. Homepage visit
2. Resume Roast usage
3. Onboarding start
4. Master Profile completion
5. First job application
6. First package generation

**Implementation:**
Track conversion events with PostHog or custom analytics:

```typescript
// In client/src/pages/ResumeRoast.tsx
import posthog from "posthog-js";

// After roast completes
posthog.capture("resume_roast_completed", {
  score: result.score,
  verdict: result.verdict,
});

// When user clicks "Build My Master Profile"
posthog.capture("conversion_cta_clicked", {
  source: "resume_roast",
  destination: "/onboarding",
});
```

### 4. Real-time Dashboard

**Create Analytics Page:**

```typescript
// client/src/pages/Analytics.tsx (already exists)
// Add package generation metrics

const { data: metrics } = trpc.analytics.packageGenerationMetrics.useQuery();

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <MetricCard
    title="Package Success Rate"
    value={`${metrics?.successRate.toFixed(1)}%`}
    subtitle="Last 24 hours"
  />
  <MetricCard
    title="Total Packages"
    value={metrics?.successful}
    subtitle={`${metrics?.totalAttempts} attempts`}
  />
  <MetricCard
    title="Avg Generation Time"
    value={`${metrics?.avgDuration}s`}
    subtitle="Across all agents"
  />
</div>
```

## Monitoring Alerts

### Set up notifications for:

1. **Success rate drops below 90%** → Email owner
2. **Agent duration exceeds 60 seconds** → Log warning
3. **3+ consecutive failures** → Trigger investigation

**Implementation:**

```typescript
// In server/routers.ts - generatePackage procedure
if (successRate < 0.9) {
  await notifyOwner({
    title: "Package Generation Success Rate Alert",
    content: `Success rate dropped to ${(successRate * 100).toFixed(1)}% in the last hour.`,
  });
}
```

## Implementation Checklist

- [ ] Add `agentMetrics` table to schema
- [ ] Implement timing tracking in all agents
- [ ] Create `analytics.packageGenerationMetrics` tRPC endpoint
- [ ] Add PostHog event tracking to key conversion points
- [ ] Build metrics dashboard in Analytics page
- [ ] Set up automated alerts for low success rates
- [ ] Add error logging to all agent failures

## Quick Start Queries

### Check recent package generation success

```sql
SELECT
  id,
  opportunityId,
  packageZipUrl IS NOT NULL as hasPackage,
  createdAt
FROM applications
ORDER BY createdAt DESC
LIMIT 10;
```

### Count failures in last hour

```sql
SELECT COUNT(*) as failures
FROM applications
WHERE packageZipUrl IS NULL
  AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Average generation time (requires agentMetrics table)

```sql
SELECT
  agentType,
  AVG(duration) as avgDuration,
  COUNT(*) as totalRuns,
  SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successCount
FROM agent_metrics
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY agentType;
```

## Next Steps

1. **Implement agentMetrics table** - Track performance of each agent
2. **Add PostHog tracking** - Monitor user conversion funnel
3. **Build dashboard** - Visualize metrics in Analytics page
4. **Set up alerts** - Notify on critical failures

All infrastructure is in place - just need to add the tracking code and queries!
