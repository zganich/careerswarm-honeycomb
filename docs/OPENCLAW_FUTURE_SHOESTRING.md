# Future Needs & Shoestring Budget

**Purpose:** OpenClaw (especially Business and main agents) and Cursor use this to prioritize **future needs** and **best ways to incorporate them today on a shoestring** (free or very low cost). Goal: ship fast, stay lean.

---

## Standing instruction for OpenClaw

When asked to "look at future needs" or "shoestring improvements":

1. Read **CONTEXT_FOR_NEW_CHAT.md** and **todo.md** (current state, next steps).
2. Read this file and **docs/OPTIONAL_INFRASTRUCTURE.md** (what we’ve deferred).
3. Consider: **What do we need next to ship or grow?** (reliability, GTM, UX, conversion, retention.)
4. For each need: **What’s the cheapest way to do it this week?** (no new paid services unless unavoidable; use existing stack, CLI, cron, docs, small code changes.)
5. Output: **3–5 concrete suggestions** (what, why, rough effort, cost). Append a short summary to **OPENCLAW_HANDOFF.md** with date and "Future/shoestring" so the human or Cursor can pick what to do.

Do not commit. Hand off for review and decision.

---

## Shoestring principles (this repo)

- **Already have:** Railway (app + MySQL), GitHub (CI), Cloudflare (DNS), OpenAI API (Roast, Tailor, Scribe). Email-only auth. No OAuth required.
- **Prefer:** CLI, scripts, docs, small code changes. Avoid new SaaS unless it replaces something or is free tier and critical.
- **Optional infra we’ve deferred:** Redis (GTM worker), Sentry (errors), email automation (SendGrid/SES), LinkedIn OAuth. See docs/OPTIONAL_INFRASTRUCTURE.md.
- **Backlog (todo.md):** Email automation, LinkedIn OAuth, Interview Prep Agent, Salary Negotiation Agent — all "when we have time/budget."

---

## Example future needs (prompt ideas)

- **Reliability:** Better error visibility without Sentry (e.g. structured logs, one-off log review prompts).
- **GTM:** Improve in-app GTM agents (server/agents/gtm/) and prompts with no new infra; align with CAREERSWARM_GTM_STRATEGY.
- **Conversion:** Small UX or copy changes that could improve signup or onboarding completion.
- **Retention:** Lightweight "come back" or value reminders using what we already have (e.g. in-app, or one manual email flow later).
- **Cost control:** Reduce or cap OpenAI usage (caching, shorter prompts, cheaper model where acceptable).
- **Docs and handoff:** Keep CONTEXT, todo, DEBUGGING, MONITORING up to date so any agent or human can ship without reinventing.

When you suggest something, say **what**, **why**, **effort** (hours/days), and **cost** (free / existing / new $).
