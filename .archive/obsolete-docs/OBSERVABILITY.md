# CareerSwarm Observability & Monitoring

This document outlines the monitoring and analytics systems for CareerSwarm production environment.

---

## 🚨 Error Tracking: Sentry

**Purpose:** Real-time error tracking and performance monitoring for both frontend and backend.

### Dashboards

- **Frontend Project:** [careerswarm-frontend](https://sentry.io/organizations/your-org/projects/careerswarm-frontend/)
- **Backend Project:** [careerswarm-backend](https://sentry.io/organizations/your-org/projects/careerswarm-backend/)

### Critical Alert: New Production Error

**What:** Email alert triggered for any new error in production environment  
**Why:** Immediate notification of breaking issues before users report them  
**Response:**

1. Check Sentry dashboard for error details (stack trace, user context, breadcrumbs)
2. Assess severity: Does it block core user flows? (signup, payment, AI features)
3. If critical: Roll back to previous checkpoint via Manus UI
4. If non-critical: Create GitHub issue and fix in next deployment

### What Sentry Tracks

- **Frontend:**
  - JavaScript errors and unhandled promise rejections
  - React component errors (caught by Error Boundary)
  - Network request failures
  - Performance metrics (page load, LCP, FID)
  - User session replays on error

- **Backend:**
  - Unhandled exceptions in tRPC procedures
  - Express middleware errors
  - Database connection failures
  - External API failures (Stripe, LLM, etc.)

### Environment Variables

```bash
# Frontend (client)
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id

# Backend (server)
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
```

---

## 📊 Product Analytics: PostHog

**Purpose:** Track user behavior, measure conversion funnels, and understand product usage.

### Dashboard

- **Project:** [CareerSwarm](https://us.posthog.com/project/your-project-id)

### Critical Funnels (Check Weekly)

#### 1. User Activation Funnel

**Goal:** Measure how many visitors become active users

Steps:

1. `$pageview` (landing page visit)
2. `user_signed_up` (OAuth completion)
3. `achievement_created` (first meaningful action)

**Target:** >40% conversion from signup to first achievement  
**Action if below target:** Review onboarding flow, add tooltips, simplify achievement wizard

#### 2. Revenue Conversion Funnel

**Goal:** Track free-to-paid conversion rate

Steps:

1. `checkout_started` (clicked "Upgrade to Pro")
2. `pro_subscription_upgraded` (Stripe webhook confirmed)

**Target:** >15% conversion from checkout start to completion  
**Action if below target:** Review pricing page copy, test different price points, add social proof

### Custom Events Tracked

| Event Name                  | Trigger                      | Properties                           |
| --------------------------- | ---------------------------- | ------------------------------------ |
| `user_signed_up`            | OAuth callback success       | `email`, `tier`                      |
| `achievement_created`       | Achievement saved to DB      | `skills`, `impact_quantified`        |
| `resume_roasted`            | Roast analysis complete      | `score`, `bullet_count`              |
| `resume_generated`          | Resume PDF downloaded        | `format`, `job_id`                   |
| `career_score_calculated`   | Score calculator submit      | `score`, `currentRole`, `targetRole` |
| `checkout_started`          | Stripe checkout initiated    | `plan`, `price`                      |
| `pro_subscription_upgraded` | Stripe webhook processed     | `subscription_id`, `amount`          |
| `subscription_cancelled`    | Cancellation confirmed       | `reason`                             |
| `job_added`                 | Job description saved        | `source`                             |
| `application_created`       | Application workflow started | `job_id`                             |
| `ai_agent_used`             | Any AI agent called          | `agent_name`, `duration_ms`          |

### User Properties

- `email`: User's email address
- `tier`: Subscription tier (`free` or `pro`)
- `name`: User's display name

### Environment Variables

```bash
# Frontend only (PostHog is client-side)
VITE_POSTHOG_KEY=phc_your_project_api_key_here
VITE_POSTHOG_HOST=us.posthog.com
```

---

## 🔍 Weekly Monitoring Checklist

### Monday Morning Review (15 minutes)

1. **Sentry:** Check for new errors in production (past 7 days)
   - Any recurring errors? Create GitHub issues
   - Any performance regressions? (LCP > 2.5s, FID > 100ms)

2. **PostHog Funnels:**
   - User Activation: What % of signups create first achievement?
   - Revenue Conversion: What % of checkout starts complete?

3. **PostHog Events:**
   - Top 5 most-used features (by event count)
   - Any features with zero usage? (candidates for removal)

### Monthly Deep Dive (1 hour)

1. **User Retention:** How many users return after 7 days? 30 days?
2. **Feature Adoption:** What % of users have used each AI agent?
3. **Revenue Metrics:** MRR growth, churn rate, LTV/CAC ratio
4. **Error Budget:** Are we staying under 99.9% uptime target?

---

## 🛠️ Troubleshooting

### Sentry Not Receiving Errors

1. Check environment variables are set in Manus project settings
2. Verify DSN format: `https://<key>@<org>.ingest.sentry.io/<project>`
3. Test with intentional error: `throw new Error("Sentry test")`
4. Check browser console for Sentry SDK errors

### PostHog Not Tracking Events

1. Verify `VITE_POSTHOG_KEY` is set (starts with `phc_`)
2. Check browser console: `posthog.isFeatureEnabled('test')` should not error
3. Disable ad blockers (they may block PostHog)
4. Check PostHog project settings: Is data ingestion enabled?

### Missing User Identification

- Ensure `identifyUser()` is called after OAuth callback
- Check `useAuth()` hook returns user data correctly
- Verify user ID is passed to PostHog (not email)

---

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [PostHog Documentation](https://posthog.com/docs)
- [Manus Environment Variables Guide](https://docs.manus.im/environment-variables)

---

**Last Updated:** 2026-01-26  
**Maintained By:** CareerSwarm Team
