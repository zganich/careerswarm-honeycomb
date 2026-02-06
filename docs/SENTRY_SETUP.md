# Sentry Error Monitoring Setup

CareerSwarm uses Sentry for error tracking on both frontend and backend. Use the existing project **careerswarm-backend** in the **careerswarm** organization. Do not create a new project.

## Exact setup (no choices)

Do these steps in order.

### 1. Authenticate Sentry CLI

```bash
pnpm run sentry:login
```

When prompted: open the URL in a browser, create an auth token at that page (or at [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)), paste the token into the terminal. It is stored in `~/.sentryclirc`.

### 2. Verify CLI

```bash
pnpm run sentry:info
```

This uses the project's `@sentry/cli` (see package.json). You must see an authenticated state (e.g. "Method: Token"), not "Unauthorized". If the command fails (e.g. "unknown command"), run `pnpm install` and try again; if it still fails, a successful login in step 1 is enough—continue to step 3.

### 3. Get the DSN from careerswarm-backend

- Go to: **Sentry** → **Settings** (gear icon) → organization **careerswarm** → **Projects** → **careerswarm-backend**.
- In the left sidebar for that project, click **Client Keys (DSN)**.
- Copy the **DSN** value (e.g. `https://xxxx@xxxx.ingest.sentry.io/xxxx`).

Direct link (if logged in):  
https://careerswarm.sentry.io/settings/careerswarm/projects/careerswarm-backend/keys/

### 4. Set SENTRY_DSN in Railway

- Run: `railway open`
- In the browser: select the **careerswarm-app** service.
- Open the **Variables** tab.
- Add a new variable: name `SENTRY_DSN`, value = the DSN you copied (no quotes). Save.

### 5. Redeploy and verify

```bash
railway redeploy
railway logs | grep -i sentry
```

You must see a line containing "Sentry initialized" after the app starts.

### 6. sentry-cli defaults (optional, for releases/source maps)

So `sentry-cli` targets the right project without extra flags, set in `.env` (or in `~/.sentryclirc` under `[defaults]`):

- `SENTRY_ORG=careerswarm`
- `SENTRY_PROJECT=careerswarm-backend`

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

Trigger a test error in production (CLI):

```bash
curl -X POST https://careerswarm.com/api/trpc/test.triggerError
```

Then check the Sentry project for the new event. For local/dev, add a temporary test route if needed.

## Cost Management

Free tier: 5,000 errors/month
- Current config samples 10% of transactions
- Errors are always captured (100%)

If approaching limit:
1. Reduce `tracesSampleRate`
2. Add `beforeSend` filter for noisy errors
3. Upgrade plan
