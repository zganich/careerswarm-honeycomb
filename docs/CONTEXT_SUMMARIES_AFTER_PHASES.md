# CONTEXT_FOR_NEW_CHAT.md — Summaries After Each Phase

**Workflow:** Complete one phase → append the corresponding summary below to [CONTEXT_FOR_NEW_CHAT.md](../CONTEXT_FOR_NEW_CHAT.md) (in "Last Session Summary" or a new dated section) → commit → **start a new chat** before starting the next phase.

Use these blocks so the next chat has full context without re-reading the whole plan.

---

## After Phase 1 (Documentation and hygiene)

Append to CONTEXT_FOR_NEW_CHAT.md:

```markdown
## Last Session Summary (YYYY-MM-DD) — Features-complete plan Phase 1

- **Phase 1 done:** Documentation and hygiene. todo.md synced with CONTEXT: Feature Completeness & Gaps and Feature Gaps (from completeness audit) now mark Success Predictor, Skill Gap Analyzer, Roast CTA, and Pivot / Bridge Skills as done. estimateQualification documented as stub (Option B) complete; Option A (LLM + UI) is a future product decision. Optional "Last synced with CONTEXT" note added if used.
- **Next:** Phase 2 — make `pnpm precommit` pass when git-secrets is not installed (optional scan when available). See docs/CONTEXT_SUMMARIES_AFTER_PHASES.md and the features-complete plan. **Start a new chat before Phase 2.**
```

**Then:** Commit, push if desired, **start a new chat** before Phase 2.

---

## After Phase 2 (Precommit)

Append to CONTEXT_FOR_NEW_CHAT.md:

```markdown
## Last Session Summary (YYYY-MM-DD) — Features-complete plan Phase 2

- **Phase 2 done:** Precommit now passes when `git secrets` is not installed. Script runs secret scan only when available (e.g. wrapper or conditional), then check + format:check + lint. `pnpm precommit` no longer fails on machines without git-secrets. CONTRIBUTING.md or CRITICAL_SETUP_CHECKLIST updated if needed.
- **Next:** Phase 3 (optional) — estimateQualification Option A only if product wants LLM + UI; otherwise skip. Phase 4 — human config (Stripe Pro, S3, Sentry, Redis) in any order. See docs/CONTEXT_SUMMARIES_AFTER_PHASES.md. **Start a new chat before Phase 3 or Phase 4.**
```

**Then:** Commit, push if desired, **start a new chat** before Phase 3 (if doing it) or Phase 4.

---

## After Phase 3 (Optional — estimateQualification Option A)

Append to CONTEXT_FOR_NEW_CHAT.md:

```markdown
## Last Session Summary (YYYY-MM-DD) — Features-complete plan Phase 3

- **Phase 3 done:** estimateQualification Option A implemented. Replaced stub in server/routers.ts with LLM-based implementation (same public shape: score, gaps, reasoning). Tests updated or skipped for LLM behavior; public.estimateQualification.test.ts still validates contract. Optional UI added if applicable (e.g. surface calling public.estimateQualification).
- **Next:** Phase 4 — human config (Stripe Pro, S3, Sentry, Redis) per docs/CRITICAL_SETUP_CHECKLIST.md. **Start a new chat before Phase 4.**
```

**Then:** Commit, push if desired, **start a new chat** before Phase 4.

---

## After Phase 4 (Human config)

Append to CONTEXT_FOR_NEW_CHAT.md:

```markdown
## Last Session Summary (YYYY-MM-DD) — Features-complete plan Phase 4

- **Phase 4 done:** Human-only config completed as needed: Stripe Pro (product + STRIPE_PRO_PRICE_ID in Railway), S3-compatible storage (if required for onboarding/Assembler), Sentry DSN (if not already set), Redis (optional, only for GTM worker). Redeploy performed after variable changes; relevant flows verified (e.g. Pro checkout, upload, health).
- **Features-complete plan:** All phases done. Code and doc state aligned; precommit passes; config set per checklist. Remaining work is product/backlog (e.g. estimateQualification Option A if deferred, email automation, LinkedIn OAuth). See todo.md and CONTEXT § Feature Completeness.
```

**Then:** Commit, push. No required "new chat" for this phase; start a new chat when beginning the next unrelated task if desired.
