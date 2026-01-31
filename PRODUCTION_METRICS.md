# Production Metrics – Package Generation & Agent Performance

This document describes how package generation success rates and agent performance are tracked, and how to query them.

## Overview

- **Package generation** outcomes are logged to the existing **`agentExecutionLogs`** table.
- Each run records: `agentName: "PackagePipeline"`, `executionType: "package_generation"`, `status: "success" | "failed"`, and optionally `errorMessage`.
- No new tables are required; success rates can be computed by querying `agentExecutionLogs`.

## What Gets Logged

When a user triggers **Generate Package** (applications flow):

1. **On success** (after application is updated with package URLs and notification is sent):
   - `logAgentExecution({ userId, agentName: "PackagePipeline", executionType: "package_generation", status: "success" })`

2. **On failure** (in the catch block):
   - `logAgentExecution({ userId, agentName: "PackagePipeline", executionType: "package_generation", status: "failed", errorMessage: String(error) })`

## Querying Success Rates

### Package generation success rate (last 7 days)

```sql
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS successes,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failures,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) AS success_rate_pct
FROM agentExecutionLogs
WHERE agentName = 'PackagePipeline'
  AND executionType = 'package_generation'
  AND executedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Recent failures (for debugging)

```sql
SELECT id, userId, status, errorMessage, executedAt
FROM agentExecutionLogs
WHERE agentName = 'PackagePipeline'
  AND executionType = 'package_generation'
  AND status = 'failed'
ORDER BY executedAt DESC
LIMIT 20;
```

## Optional: Dashboard or Alerts

- **Dashboard:** Run the success-rate query periodically and display in an internal dashboard.
- **Alerts:** If `success_rate_pct` drops below a threshold (e.g. 90%) or failure count spikes, trigger an alert (e.g. email, Slack).

## Schema Reference

Uses existing table **`agentExecutionLogs`** in `drizzle/schema.ts`:

- `agentName` – e.g. `"PackagePipeline"`
- `executionType` – e.g. `"package_generation"`
- `status` – `"success" | "failed" | "partial"`
- `errorMessage` – populated on failure
- `executedAt` – timestamp

No migration required; the table already exists.
