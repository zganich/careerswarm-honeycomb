# Careerswarm Production Deployment Checklist

**Version:** 337aa746  
**Date:** January 22, 2026  
**Estimated Time:** 5-8 hours

---

## Phase 1: Final Testing (2-4 hours)

### End-to-End User Flows

- [ ] **New User Signup**
  - Create account with email/password
  - Verify email confirmation
  - Complete 5-step welcome wizard
  - See empty dashboard state

- [ ] **Achievement Creation**
  - Click "Add Achievement" from dashboard
  - Complete STAR wizard (Situation, Task, Action, Result)
  - See Impact Meter score calculate in real-time
  - Transform to XYZ format with AI
  - Save achievement

- [ ] **Job Search & Qualification**
  - Navigate to Jobs page
  - Search for "Software Engineer" jobs
  - Save a job from results
  - See auto-qualification run (fit % calculation)
  - View skills gap analysis
  - Verify match score appears

- [ ] **Resume Generation**
  - Navigate to Resume Templates
  - Select "Modern" template
  - Generate resume for saved job
  - Preview resume in real-time
  - Download as PDF (browser print-to-PDF)
  - Verify formatting is correct

- [ ] **Application Tracking**
  - Navigate to Applications page
  - See saved job in "Draft" column
  - Update status to "Applied"
  - Verify follow-up reminder is scheduled (3 days)
  - Update status to "Interview Scheduled"
  - Verify interview prep reminder is scheduled (1 day before)

- [ ] **Interview Prep**
  - Navigate to Interview Prep page
  - Generate questions for saved job
  - Practice answering a question
  - Get AI feedback on answer
  - See strengths and improvements
  - Generate follow-up question

- [ ] **Stripe Checkout**
  - Click "Upgrade to Pro" from dashboard
  - See pricing comparison (Free vs Pro)
  - Click "Get Started" on Pro tier
  - Enter test card: 4242 4242 4242 4242
  - Complete checkout
  - Verify subscription is active
  - See usage limits removed

- [ ] **Usage Limits (Free Tier)**
  - Create new test account (don't upgrade)
  - Add 10 achievements
  - Try to add 11th achievement → see error "Free tier limited to 10 achievements"
  - Generate 3 resumes
  - Try to generate 4th resume → see error "Free tier limited to 3 resumes per month"

### Cross-Browser Testing

- [ ] **Chrome (latest)**
  - All pages load correctly
  - Forms submit successfully
  - Animations work smoothly
  - No console errors

- [ ] **Firefox (latest)**
  - All pages load correctly
  - Forms submit successfully
  - Animations work smoothly
  - No console errors

- [ ] **Safari (latest)**
  - All pages load correctly
  - Forms submit successfully
  - Animations work smoothly
  - No console errors

- [ ] **Edge (latest)**
  - All pages load correctly
  - Forms submit successfully
  - Animations work smoothly
  - No console errors

### Mobile Testing

- [ ] **iOS Safari**
  - Homepage responsive
  - Dashboard usable on mobile
  - Forms easy to fill
  - Buttons large enough to tap
  - No horizontal scroll

- [ ] **Chrome Android**
  - Homepage responsive
  - Dashboard usable on mobile
  - Forms easy to fill
  - Buttons large enough to tap
  - No horizontal scroll

### Performance Testing

- [ ] **Lighthouse Audit**
  - Run audit on homepage
  - Performance score: 90+ ✅
  - Accessibility score: 100 ✅
  - Best Practices score: 90+ ✅
  - SEO score: 100 ✅

- [ ] **Page Load Times**
  - Homepage: <3 seconds ✅
  - Dashboard: <3 seconds ✅
  - Jobs page: <3 seconds ✅
  - Applications page: <3 seconds ✅

- [ ] **Console Errors**
  - No errors in browser console
  - No 404 errors for assets
  - No broken links

---

## Phase 2: Content & Copy (1-2 hours)

### Homepage

- [ ] **Hero Section**
  - Headline is compelling and clear
  - Subheadline explains value proposition
  - CTA button text is action-oriented
  - No typos or grammatical errors

- [ ] **How It Works**
  - 3 steps are clear and concise
  - Each step has descriptive text
  - Icons match step content

- [ ] **Features**
  - 6 feature cards have clear titles
  - Descriptions explain benefits (not just features)
  - No typos or grammatical errors

- [ ] **Final CTA**
  - Compelling call-to-action
  - Social proof or urgency element
  - Button text is clear

### Pricing Page

- [ ] **Free Tier**
  - Clear feature list (10 achievements, 3 resumes/month)
  - Limitations are honest and transparent
  - CTA button: "Get Started"

- [ ] **Pro Tier**
  - Clear feature list (unlimited achievements, unlimited resumes)
  - Price is displayed prominently
  - CTA button: "Upgrade to Pro"

- [ ] **Enterprise Tier** (if applicable)
  - Custom pricing or "Contact Us"
  - Enterprise features listed
  - CTA button: "Contact Sales"

### FAQ Section

- [ ] **Add FAQ page or section with common questions:**
  - What is Careerswarm?
  - How does the Impact Meter work?
  - What is the STAR methodology?
  - How does AI resume generation work?
  - What's included in the Free tier?
  - What's included in the Pro tier?
  - How do I cancel my subscription?
  - Is my data secure?
  - Do you sell my data?
  - How do I export my data?

### Legal Pages

- [ ] **Privacy Policy**
  - Create privacy policy page
  - Explain data collection (email, achievements, resumes)
  - Explain data usage (AI processing, analytics)
  - Explain data sharing (none, except Stripe for payments)
  - GDPR compliance statement
  - Link from footer

- [ ] **Terms of Service**
  - Create terms of service page
  - Usage guidelines
  - Subscription terms
  - Refund policy
  - Liability limitations
  - Link from footer

- [ ] **Cookie Policy** (if using cookies beyond session)
  - Explain cookie usage
  - Link from footer

### Email Templates

- [ ] **Welcome Email**
  - Subject: "Welcome to Careerswarm!"
  - Body: Introduce platform, link to welcome wizard

- [ ] **Follow-Up Reminder**
  - Subject: "Don't forget to follow up on [Job Title]"
  - Body: Remind user to follow up, link to application

- [ ] **Interview Prep Reminder**
  - Subject: "Your interview with [Company] is tomorrow!"
  - Body: Remind user to prepare, link to interview prep

### SEO & Meta Tags

- [ ] **Homepage**
  - `<title>`: "Careerswarm - AI-Powered Career Evidence Platform"
  - `<meta name="description">`: Compelling 150-character description
  - Open Graph tags (og:title, og:description, og:image)
  - Twitter Card tags

- [ ] **Other Pages**
  - Unique titles for each page
  - Unique descriptions for each page
  - Proper heading hierarchy (H1, H2, H3)

---

## Phase 3: Production Configuration (30 minutes)

### Stripe Setup

- [ ] **Claim Stripe Sandbox**
  - Visit: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU3NCVFJESHZ1NFM0dk9CLDE3Njk2NDUzNDAv100pu2IaHJA
  - Claim before March 23, 2026
  - Verify test mode is active

- [ ] **Test Checkout Flow**
  - Use test card: 4242 4242 4242 4242
  - Complete checkout for Pro tier
  - Verify webhook receives `checkout.session.completed` event
  - Verify subscription is created in database
  - Verify user's subscription status is updated

- [ ] **Configure Webhooks**
  - In Stripe Dashboard → Developers → Webhooks
  - Verify endpoint: `https://your-domain.com/api/stripe/webhook`
  - Verify events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Verify webhook secret matches `STRIPE_WEBHOOK_SECRET` env var

- [ ] **Live Keys (After KYC)**
  - Complete Stripe KYC verification
  - Get live publishable key and secret key
  - Update keys in Manus Settings → Payment
  - Test with real card (use 99% discount promo code)
  - Verify minimum order value ($0.50 USD)

### Domain & Hosting

- [ ] **Custom Domain** (Optional)
  - Purchase domain (e.g., careerswarm.com) from registrar
  - In Manus Settings → Domains, add custom domain
  - Update DNS records (CNAME or A record)
  - Wait for DNS propagation (up to 48 hours)
  - Verify HTTPS certificate is issued

- [ ] **Manus Subdomain** (Default)
  - In Manus Settings → Domains, modify auto-generated prefix
  - Example: `careerswarm.manus.space`
  - Verify HTTPS is enabled (automatic)

### Environment Variables

- [ ] **Verify All Env Vars Are Set**
  - `DATABASE_URL` ✅ (automatic)
  - `JWT_SECRET` ✅ (automatic)
  - `STRIPE_SECRET_KEY` ✅ (automatic)
  - `STRIPE_WEBHOOK_SECRET` ✅ (automatic)
  - `VITE_STRIPE_PUBLISHABLE_KEY` ✅ (automatic)
  - `BUILT_IN_FORGE_API_KEY` ✅ (automatic)
  - `OAUTH_SERVER_URL` ✅ (automatic)
  - `VITE_APP_ID` ✅ (automatic)
  - `VITE_APP_LOGO` ✅ (automatic)
  - `VITE_APP_TITLE` ✅ (automatic)

No additional configuration needed.

---

## Phase 4: Security & Performance (1 hour)

### Security Audit

- [ ] **SQL Injection Prevention**
  - Verify all database queries use Drizzle ORM parameterized queries
  - No raw SQL with user input
  - Test with malicious input: `'; DROP TABLE users; --`

- [ ] **XSS Prevention**
  - Verify React escapes user input by default
  - No `dangerouslySetInnerHTML` without sanitization
  - Test with malicious input: `<script>alert('XSS')</script>`

- [ ] **CSRF Prevention**
  - Verify tRPC uses session cookies with SameSite=Lax
  - Verify all mutations require authentication

- [ ] **Rate Limiting**
  - Add rate limiting to API endpoints (e.g., 100 requests/minute per IP)
  - Test by making rapid requests

- [ ] **Authentication Checks**
  - Verify protected routes redirect to login
  - Verify protected procedures return 401 Unauthorized
  - Test by accessing protected routes without session

- [ ] **CORS Configuration**
  - Verify CORS allows only your domain
  - Test by making cross-origin requests from different domain

### Performance Optimization

- [ ] **Image Optimization**
  - Compress images (use TinyPNG or similar)
  - Convert to WebP format
  - Add `loading="lazy"` to images below fold
  - Add `width` and `height` attributes to prevent layout shift

- [ ] **JavaScript Optimization**
  - Run `pnpm build` to create production bundle
  - Verify bundle size is reasonable (<500KB gzipped)
  - Use code splitting for large pages
  - Lazy load non-critical components

- [ ] **Caching Headers**
  - Verify static assets have long cache headers (1 year)
  - Verify HTML has short cache headers (5 minutes)
  - Verify API responses have appropriate cache headers

- [ ] **Load Testing**
  - Use tool like Apache Bench or k6
  - Simulate 100 concurrent users
  - Verify response times stay under 1 second
  - Verify no errors or timeouts

---

## Phase 5: Monitoring & Analytics (15 minutes)

### Error Monitoring

- [ ] **Set Up Sentry** (or similar)
  - Create Sentry account
  - Add Sentry SDK to project
  - Configure DSN in environment variables
  - Test by triggering error
  - Verify error appears in Sentry dashboard

### Analytics

- [ ] **Verify Manus Analytics**
  - Manus built-in analytics is automatic
  - Check Manus Dashboard → Analytics
  - Verify page views are tracked
  - Verify unique visitors are tracked

### Uptime Monitoring

- [ ] **Set Up Uptime Monitor** (optional)
  - Use service like UptimeRobot or Pingdom
  - Monitor homepage URL
  - Set up alerts for downtime
  - Configure check interval (5 minutes)

### Database Backups

- [ ] **Verify Backups Are Enabled**
  - Manus handles database backups automatically
  - Verify backup schedule in Manus settings
  - Test restore process (if available)

---

## Phase 6: Launch (30 minutes)

### Pre-Launch

- [ ] **Create Final Checkpoint**
  - In Manus, create checkpoint
  - Description: "Production-ready: All features complete, design finalized, tested and ready for launch"
  - Verify checkpoint is created successfully

- [ ] **Final Review**
  - Review all checklist items above
  - Verify all critical items are complete
  - Fix any remaining issues

### Launch

- [ ] **Click Publish Button**
  - In Manus Management UI, click "Publish"
  - Wait for deployment to complete
  - Verify live site URL

- [ ] **Verify Live Site**
  - Visit live site URL
  - Test homepage loads correctly
  - Test signup flow
  - Test login flow
  - Test dashboard loads
  - Check for console errors

- [ ] **Test Critical Flows**
  - Signup → achievement → job → resume → application
  - Stripe checkout (use test card in test mode, or real card with discount in live mode)
  - Verify all features work on production

### Post-Launch

- [ ] **Monitor Error Logs**
  - Check Sentry dashboard (if set up)
  - Check Manus logs (if available)
  - Check browser console for errors
  - Fix critical bugs immediately

- [ ] **Announce Launch**
  - Social media (Twitter, LinkedIn, Facebook)
  - Email list (if you have one)
  - Product Hunt (consider launching here)
  - Reddit (r/entrepreneur, r/resumes, r/jobs, r/cscareerquestions)
  - Hacker News (Show HN)
  - Indie Hackers

---

## Phase 7: Post-Launch Monitoring (First Week)

### Daily Tasks

- [ ] **Day 1: Monitor Closely**
  - Check error logs every 2 hours
  - Monitor user signups
  - Track Stripe conversions
  - Respond to user feedback
  - Fix critical bugs immediately

- [ ] **Day 2-7: Regular Monitoring**
  - Check error logs daily
  - Monitor user signups and conversions
  - Collect user feedback
  - Plan first feature update
  - Respond to support requests

### Metrics to Track

- [ ] **User Acquisition**
  - Total signups
  - Signups per day
  - Signup conversion rate (visitors → signups)
  - Traffic sources (direct, social, search)

- [ ] **User Engagement**
  - Daily active users (DAU)
  - Weekly active users (WAU)
  - Average achievements per user
  - Average resumes generated per user
  - Average applications tracked per user

- [ ] **Revenue**
  - Free tier users
  - Pro tier users
  - Conversion rate (Free → Pro)
  - Monthly recurring revenue (MRR)
  - Churn rate

- [ ] **Technical**
  - Error rate
  - Response times
  - Uptime percentage
  - Database query performance

### First Update

- [ ] **Plan First Feature Update**
  - Review user feedback
  - Identify most requested features
  - Prioritize based on impact and effort
  - Plan development timeline
  - Announce upcoming features to users

---

## Summary

**Total Estimated Time:** 5-8 hours

**Phase Breakdown:**

1. Final Testing: 2-4 hours
2. Content & Copy: 1-2 hours
3. Production Configuration: 30 minutes
4. Security & Performance: 1 hour
5. Monitoring & Analytics: 15 minutes
6. Launch: 30 minutes
7. Post-Launch Monitoring: Ongoing

**Critical Path:**

1. Complete final testing (Phase 1)
2. Claim Stripe sandbox (Phase 3)
3. Create final checkpoint (Phase 6)
4. Click Publish (Phase 6)
5. Monitor and iterate (Phase 7)

**Recommendation:** Block out a full day to complete Phases 1-6, then monitor closely for the first week.
