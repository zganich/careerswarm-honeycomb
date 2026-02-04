# Sentry Error Monitoring Setup

CareerSwarm uses Sentry for error tracking and alerting on both frontend and backend.

## Quick Setup

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project → Select "Express" (Node.js)
3. Copy the DSN from the project settings

### 2. Configure Railway

Add these environment variables in Railway (careerswarm-app → Variables):

```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

Redeploy after adding.

### 3. Verify Integration

After deployment, trigger a test error:
1. Check Sentry dashboard for incoming events
2. The server logs `Sentry initialized` on startup when DSN is set

## Alert Configuration

### Recommended Alerts (Sentry Dashboard → Alerts)

#### 1. Error Spike Alert
- **Condition**: When number of errors > 10 in 1 hour
- **Action**: Email + Slack notification
- **Priority**: High

#### 2. New Issue Alert  
- **Condition**: When a new issue is created
- **Action**: Email notification
- **Priority**: Medium

#### 3. Critical Error Alert
- **Condition**: When error contains "FATAL" or "CRITICAL"
- **Action**: Email + Slack + PagerDuty
- **Priority**: Critical

#### 4. AI Agent Failure Alert
- **Condition**: When error message contains "LLM" or "Forge" or "agent"
- **Action**: Email notification
- **Priority**: High

### Setting Up Slack Integration

1. Sentry → Settings → Integrations → Slack
2. Connect your workspace
3. Select alert channels for each alert rule

## What's Tracked

### Backend (Express/tRPC)
- Unhandled exceptions
- tRPC procedure errors
- Database connection failures
- LLM API failures
- Rate limit violations

### Frontend (React)
- JavaScript errors
- React component errors
- Network request failures

## Environment Tags

Events are tagged with:
- `environment`: production / development
- `release`: Auto-detected from git

## Performance Monitoring

Trace sampling is set to 10% (`tracesSampleRate: 0.1`) to balance insight with cost.

To increase during debugging:
```typescript
Sentry.init({
  tracesSampleRate: 1.0, // 100% sampling
});
```

## Testing Alerts

Trigger a test error in production:
```bash
curl -X POST https://careerswarm.com/api/trpc/test.triggerError
```

Or add a temporary test route during development.

## Cost Management

Free tier: 5,000 errors/month
- Current config samples 10% of transactions
- Errors are always captured (100%)

If approaching limit:
1. Reduce `tracesSampleRate`
2. Add `beforeSend` filter for noisy errors
3. Upgrade plan
