# CareerSwarm Monetization Strategy

**Date:** 2026-02-06  
**Author:** Business Agent  
**Status:** Ready for execution

---

## Executive Summary

CareerSwarm has the infrastructure to monetize today: Stripe is wired, pricing is defined, the lead magnet (Resume Roast) works, and the JD Builder exists for B2B. The gap is **connecting these pieces** — buttons to checkout, tier-gating, and a working sign-in flow.

This document provides a complete monetization strategy covering pricing, first revenue path, conversion points, priorities, metrics, and shoestring constraints — all tied to the existing positioning (career infrastructure, 7-stage pipeline, Master Profile, bridge skills) and flywheel.

---

## 1. Pricing Strategy

### 1.1 B2C: Job Seekers

| Tier | Price | Target | Value Proposition |
|------|-------|--------|-------------------|
| **Free** | $0 | Tire-kickers, early funnel | Try before you buy; get hooked on Roast + Master Profile |
| **Pro** | $29/mo | Active job seekers (applying weekly) | "Minutes per application, not hours" — unlimited everything |
| **Pro Annual** | $199/yr (~$17/mo) | Committed job seekers | 30% savings; reduces churn; better LTV |

**Why $29/mo:**
- Sweet spot for individual SaaS (Grammarly $30, LinkedIn Premium $30, Jobscan $50)
- Low enough for impulse purchase during job search stress
- High enough to signal value and filter serious users
- Matches "active job seeker" willingness-to-pay (they're motivated)

**Free tier limits (gates):**
- 5 application packages/month
- 3 roasts/day
- 1 Master Profile
- Basic resume tailoring only
- No cover letters or LinkedIn messages

**Pro unlocks:**
- Unlimited application packages
- Unlimited roasts
- Unlimited Master Profiles (for different target roles)
- Cover letter generation
- LinkedIn message templates
- Application tracking
- Priority support

### 1.2 B2B: Recruiters & Companies

| Tier | Price | Target | Value Proposition |
|------|-------|--------|-------------------|
| **Recruiter Free** | $0 | Try JD Builder | 1 JD/month to prove value |
| **Recruiter Pro** | $49/mo | Individual recruiters, small agencies | Unlimited JDs, ATS-optimized |
| **Team** | $199/mo | TA teams (3-5 seats) | Shared templates, team collaboration |
| **Enterprise** | Custom | Large orgs, staffing agencies | API, SSO, dedicated support |

**Why separate B2B pricing:**
- Recruiters have budget; job seekers often don't
- JD writing is a daily task (high usage = higher willingness-to-pay)
- B2B can be sold without viral/PLG — direct outreach works
- Flywheel: recruiters using CareerSwarm JDs attract CareerSwarm applicants

**Defer for now:** Team and Enterprise tiers. Focus on Recruiter Pro ($49/mo) first.

### 1.3 Pricing Philosophy

- **No credit card for free tier** — maximize top-of-funnel
- **7-day Pro trial** — let them feel unlimited before asking for money
- **Annual discount** — improve LTV and reduce churn
- **Student/nonprofit discount (50%)** — goodwill + virality in those networks

---

## 2. First Revenue: Lowest-Friction Path

### 2.1 B2C Path (Priority #1)

```
Resume Roast (free, no login)
    ↓
Score + 3 "Million-Dollar Mistakes" + fixes
    ↓
CTA: "Build my Master Profile" (requires sign-in)
    ↓
Onboarding → Master Profile created
    ↓
Generate 1-2 application packages (free tier)
    ↓
Hit limit: "You've used 5 of 5 applications this month"
    ↓
Upgrade CTA: "Go Pro for unlimited applications — $29/mo"
    ↓
Stripe Checkout → Payment → Pro tier activated
```

**Why this works:**
- Roast is the hook (no friction, instant value)
- Master Profile is the investment (sunk cost, they've built something)
- Limit creates urgency ("I'm applying to jobs NOW, I need more")
- Stripe is already wired — just connect the button

**Time to implement:** ~4 hours total
1. Wire "Go Pro" button to `stripeRouter.createCheckoutSession` (1 hour)
2. Add application counter to user record + check before generating (2 hours)
3. Add upgrade modal when limit hit (1 hour)

### 2.2 B2B Path (Priority #2)

```
/recruiters landing page
    ↓
JD Builder form (no login required for first JD)
    ↓
Generate JD → show result
    ↓
"Save this JD" or "Generate another" → requires sign-in
    ↓
Sign in → hit 1 JD/month limit
    ↓
Upgrade CTA: "Unlimited JDs — $49/mo"
    ↓
Stripe Checkout (separate Recruiter price)
```

**Why this works:**
- No-login first JD mirrors Roast (prove value before asking for anything)
- Recruiters write JDs constantly; one free isn't enough
- Direct path to revenue without complex B2B sales

**Time to implement:** ~6 hours total
1. Allow anonymous first JD (store in localStorage or temp table) (2 hours)
2. Add Recruiter Pro price to Stripe + env (30 min)
3. Wire upgrade button on /recruiters (1 hour)
4. Add JD counter + limit check (2 hours)

### 2.3 Recommendation: Do B2C First

- B2C flow is 80% built (Roast works, onboarding being fixed)
- Faster to complete and test
- Generates revenue while you build B2B
- Proves the model before investing in recruiter outreach

---

## 3. Conversion Points: Where to Insert Paywalls

### 3.1 Hard Gates (Must upgrade to continue)

| Point | Trigger | CTA |
|-------|---------|-----|
| **Application limit** | 5 apps/month used | "Unlock unlimited applications — $29/mo" |
| **Roast limit** | 3 roasts/day used | "Roast unlimited resumes — upgrade to Pro" |
| **JD limit (B2B)** | 1 JD/month used | "Generate unlimited JDs — $49/mo" |
| **Cover letter** | Free user clicks "Generate Cover Letter" | "Cover letters are Pro-only — upgrade" |
| **LinkedIn message** | Free user clicks "LinkedIn Outreach" | "LinkedIn templates are Pro-only — upgrade" |

### 3.2 Soft Upsells (Suggest but don't block)

| Point | Trigger | CTA |
|-------|---------|-----|
| **Post-roast** | After showing roast results | "Fix all 3 mistakes automatically with Pro" |
| **Profile complete** | After finishing Master Profile | "You're ready! Go Pro for unlimited applications" |
| **High match score** | Qualifier shows 85%+ fit | "Great match! Apply with one click — upgrade to Pro" |
| **Weekly email** | Engagement email | "You have 2 apps left this month. Go unlimited?" |

### 3.3 Implementation Priority

1. **Application limit gate** — highest leverage (active users hit this)
2. **Cover letter gate** — easy to implement, clear value
3. **Post-roast soft upsell** — high-traffic conversion point
4. **Roast limit** — prevents abuse, encourages sign-up

---

## 4. Priorities: Order of Steps

### Week 1: First Dollar

| # | Task | Time | Impact |
|---|------|------|--------|
| 1 | Fix sign-in flow (in progress) | — | Unblocks everything |
| 2 | Wire Pro button to Stripe checkout | 1 hr | Enables payment |
| 3 | Add app counter + limit (5/month free) | 2 hr | Creates upgrade trigger |
| 4 | Add upgrade modal at limit | 1 hr | Captures conversion |
| 5 | Set STRIPE_PRO_PRICE_ID in production | 10 min | Activates checkout |

**Outcome:** Live payment flow, first revenue possible.

### Week 2: Optimize B2C

| # | Task | Time | Impact |
|---|------|------|--------|
| 6 | Post-roast upsell CTA | 1 hr | High-traffic conversion |
| 7 | Cover letter gate (Pro-only) | 1 hr | Clear value gate |
| 8 | Pro trial (7-day) implementation | 2 hr | Reduces friction |
| 9 | Basic analytics: Roast → Signup → App → Upgrade | 2 hr | Measure funnel |

**Outcome:** Optimized conversion, data on what works.

### Week 3-4: B2B Revenue

| # | Task | Time | Impact |
|---|------|------|--------|
| 10 | Anonymous first JD (no login) | 2 hr | B2B lead magnet |
| 11 | Recruiter Pro Stripe price + checkout | 1 hr | B2B payment |
| 12 | JD counter + limit | 2 hr | B2B upgrade trigger |
| 13 | /recruiters landing page polish | 2 hr | B2B conversion |

**Outcome:** Two revenue streams (B2C + B2B).

### Month 2+: Scale & Optimize

- Annual pricing option
- Referral rewards (30 days Pro)
- Recruiter outreach pipeline (GTM agents)
- Team/Enterprise tiers
- Watermarks on free-tier output (A/B test)

---

## 5. Metrics: What to Measure

### 5.1 Funnel Metrics (Track Daily/Weekly)

| Metric | Formula | Target |
|--------|---------|--------|
| **Roast → Signup** | Signups / Roasts | >10% |
| **Signup → First App** | Users with 1+ app / Total signups | >30% |
| **Free → Pro** | Pro conversions / Free users who hit limit | >5% |
| **Trial → Paid** | Paid after trial / Trial starts | >40% |

### 5.2 Revenue Metrics (Track Weekly/Monthly)

| Metric | What it tells you |
|--------|-------------------|
| **MRR** | Monthly Recurring Revenue (Pro × $29 + Recruiter × $49) |
| **New MRR** | Revenue from new subscribers this period |
| **Churned MRR** | Revenue lost from cancellations |
| **Net MRR Growth** | New MRR - Churned MRR |
| **ARPU** | Average Revenue Per User (MRR / paying users) |

### 5.3 Health Metrics (Track Monthly)

| Metric | Formula | Target |
|--------|---------|--------|
| **Churn Rate** | Cancellations / Start-of-period subscribers | <5%/month |
| **LTV** | ARPU / Churn rate | >$200 |
| **CAC** | Acquisition cost (currently $0 with organic) | <$50 |
| **LTV:CAC** | LTV / CAC | >3:1 |

### 5.4 What to Track in PostHog

Add these events (some may exist):
- `roast_completed` (with score)
- `signup_completed` (with source: roast, direct, referral)
- `application_generated` (with count for user)
- `upgrade_modal_shown`
- `upgrade_clicked`
- `checkout_completed`
- `subscription_canceled`
- `jd_generated` (B2B)

---

## 6. Shoestring Constraints: Minimal Spend, No New Infra

### 6.1 What You Have (Use It)

| Asset | Status | Cost |
|-------|--------|------|
| Stripe | Wired, ready | 2.9% + $0.30/txn |
| PostHog | Already integrated | Free tier |
| Railway hosting | Already deployed | ~$20/mo |
| LLM (GPT-4o-mini) | Already integrated | ~$0.01/roast |
| Manus OAuth | Already integrated | Free |

### 6.2 What NOT to Buy

- ❌ Paid ads (organic first; prove conversion before spending)
- ❌ Analytics tools (PostHog is enough)
- ❌ Email marketing platform (use simple transactional email first)
- ❌ Customer support tool (email is fine at low volume)
- ❌ Separate B2B CRM (spreadsheet until 50+ leads)

### 6.3 Shoestring Launch Tactics

| Tactic | Cost | Expected Impact |
|--------|------|-----------------|
| Reddit posts (r/resumes, r/jobs) | $0 | 100-500 roasts/week |
| LinkedIn posts (personal account) | $0 | Network effect |
| HN "Show HN" | $0 | Tech-savvy early adopters |
| University career office outreach | $0 | Student segment |
| Product Hunt launch | $0 | One-day traffic spike |

### 6.4 Cost Structure at Scale

| Users | LLM Cost | Hosting | Stripe Fees | Net Margin |
|-------|----------|---------|-------------|------------|
| 100 free | ~$10/mo | $20 | $0 | -$30 |
| 100 free + 10 Pro | ~$15/mo | $25 | ~$9 | +$240 |
| 500 free + 50 Pro | ~$50/mo | $40 | ~$45 | +$1,315 |

**Breakeven:** ~4 Pro subscribers covers costs.

---

## 7. Tying to Positioning & Flywheel

### 7.1 Positioning Alignment

Every monetization touchpoint should reinforce the positioning:

| Positioning | How Monetization Reflects It |
|-------------|------------------------------|
| "Career infrastructure, not resume writer" | Pro unlocks the full pipeline (7 stages), not just "better resumes" |
| "Master Profile as single source of truth" | Free tier limits applications, not the Profile — you own your data |
| "Minutes per application, not hours" | Upgrade CTA: "You've saved 4 hours. Imagine unlimited." |
| "Bridge skills for career pivots" | Pivot analysis is Pro-only (high-value feature) |

### 7.2 Flywheel Monetization

```
Job Seekers (B2C)              Recruiters (B2B)
      ↓                              ↓
   Roast → Pro ($29)           JD Builder → Pro ($49)
      ↓                              ↓
  Better applications          Better job posts
      ↓                              ↓
  Apply to recruiter jobs ←——→ Get CareerSwarm applicants
      ↓                              ↓
  "This works" → tell friends   "Quality candidates" → tell other recruiters
      ↓                              ↓
   Referral program            B2B referral discount
      ↓                              ↓
  More job seekers      ←——→     More recruiters
```

**Key insight:** Each side makes the other more valuable. Monetize both, but don't gate the connection — let free users apply to jobs, let recruiters see CareerSwarm-quality applicants. Gate the *volume* and *advanced features*, not the core loop.

---

## 8. Summary: Do This First

### Immediate (This Week)

1. **Fix sign-in flow** — unblocks everything (in progress)
2. **Wire Pro checkout** — 1 hour, enables revenue
3. **Add 5-app limit** — 2 hours, creates upgrade trigger
4. **Deploy to production** — flip the switch

### Soon (Next 2 Weeks)

5. Post-roast upsell CTA
6. Cover letter Pro-gate
7. 7-day trial flow
8. Basic funnel tracking in PostHog

### Defer (Month 2+)

- B2B recruiter outreach pipeline
- Lead scoring agents
- Referral rewards
- Team/Enterprise tiers
- Annual pricing
- Paid acquisition

---

## Appendix: Quick Reference

### Stripe Setup Checklist

- [ ] Create "Pro Monthly" product in Stripe ($29/mo)
- [ ] Create "Pro Annual" product ($199/yr) — optional for now
- [ ] Create "Recruiter Pro" product ($49/mo)
- [ ] Set `STRIPE_PRO_PRICE_ID` in production env
- [ ] Set `STRIPE_RECRUITER_PRICE_ID` in production env
- [ ] Verify webhook endpoint is receiving events
- [ ] Test checkout flow end-to-end

### Database Changes Needed

```sql
-- Add application counter (if not exists)
ALTER TABLE users ADD COLUMN applicationsThisMonth INT DEFAULT 0;
ALTER TABLE users ADD COLUMN applicationsResetAt TIMESTAMP;

-- Add JD counter for recruiters
ALTER TABLE users ADD COLUMN jdsThisMonth INT DEFAULT 0;
ALTER TABLE users ADD COLUMN jdsResetAt TIMESTAMP;
```

### Feature Flags (If Using)

```
GATE_APPLICATIONS=true       # Enable 5-app limit
GATE_COVER_LETTERS=true      # Pro-only cover letters
GATE_JD_BUILDER=true         # Enable 1-JD limit for recruiters
ENABLE_TRIAL=true            # 7-day Pro trial
```

---

*This strategy is designed for a shoestring launch. Iterate based on real data. The goal is first revenue, not perfect revenue.*
