# Improving the Business Agent(s)

Two meanings of “business agent” in this repo:

1. **OpenClaw Business agent** — An OpenClaw role (like Ship, Review) that focuses on GTM, strategy, positioning, and the in-app pipeline. Use it to get suggestions and “why” for business/GTM improvements.
2. **In-app GTM/business agents** — The code in `server/agents/` (Scout, Profiler, Tailor, Scribe, Assembler) and `server/agents/gtm/` (strategy, content, recruiter-finder, lead-scoring, outreach, pipeline-processor, report). These are the product’s business logic.

Use this doc to improve both.

---

## 1. Using the OpenClaw Business agent

**Add the agent (once):**

```bash
openclaw agents add business --workspace /Users/jamesknight/GitHub/careerswarm-honeycomb
openclaw agents set-identity --agent business --name "Business" --emoji "📊"
```

**Role brief (paste once at start of chat):**  
You are the Business agent. Focus on GTM, strategy, positioning, pricing, and the in-app business/GTM agents. Read docs/CAREERSWARM_GTM_STRATEGY.md, docs/GTM_PLAN.md, and server/agents/gtm/ when asked. Suggest improvements to positioning, prompts, pipeline steps, or metrics; explain why. Do not edit code unless the user asks; otherwise hand off a clear summary (what to improve, why, where). See docs/BUSINESS_AGENT_IMPROVEMENTS.md for improvement ideas.

**Example prompts:**

- “Read CAREERSWARM_GTM_STRATEGY and the strategy agent in server/agents/gtm/strategy.ts; suggest how to align the LLM prompt with our positioning and explain why.”
- “Review the GTM pipeline steps and content agent; what would make our channel content (LinkedIn, Reddit, X) more on-brand and why?”
- “What metrics or KPIs should we expose for the GTM pipeline, and where in the code would we add them?”

---

## 2. Improving the in-app GTM/business agents

**Where they live:** `server/agents/` (career pipeline: scout, profiler, tailor, scribe, assembler) and `server/agents/gtm/` (strategy, content, recruiter-finder, lead-scoring, recruiter-outreach, pipeline-processor, report, jd-builder, normalizer, types).

### Prompt and positioning

- **Align prompts with strategy** — CAREERSWARM_GTM_STRATEGY defines positioning (“career infrastructure,” “7-stage pipeline,” “Master Profile,” “bridge skills”). Inject short excerpts or bullet points into each agent’s system prompt so outputs stay on-message.
- **Strategy agent** (`strategy.ts`) — Today it’s generic (“GTM strategist for CareerSwarm”). Add 2–3 sentences from the positioning statement and value proof so themes/channels/next actions reflect our narrative.
- **Content agent** (`content.ts`) — Channel guides are good; add one line on “no fluff, evidence-based, job-seeker value first” from the strategy doc so tone is consistent.

### Observability and robustness

- **Logging** — Log step name, input hash (or key fields), and outcome (ok/fail, count) in the GTM pipeline so you can trace runs and debug. Avoid logging full PII.
- **Error handling** — Pipeline steps should return a consistent shape (e.g. `{ ok, message?, count? }`); on LLM or DB failure, return `ok: false` and a short message so the queue or caller can retry or alert.
- **Timeouts** — Use the same LLM timeout as roast (see server/_core/llm.ts) for all agent calls so one slow step doesn’t hang the pipeline.

### Schema and types

- **Structured outputs** — Strategy and content already use `response_format` / json_schema; keep using it for any new LLM-called agent so parsing is reliable.
- **Types** — Keep `RawB2BLead`, `ScoredLead`, `ContentChannel`, etc. in `gtm/types.ts` and use them in the pipeline so payloads are type-safe.

### Testing and quality

- **Unit tests** — Add tests for strategy and content with fixed prompts or mocked LLM so regressions in prompt or schema are caught. Test normalizer and lead-scoring with sample payloads.
- **Pipeline step tests** — One test per step (e.g. “lead_discovery returns ok and count”) with mocked DB and LLM so the pipeline processor’s switch/cases stay correct.

### Pipeline and product

- **Scoring step** — Currently a no-op (“use lead_discovery output”); either implement a separate scoring run or document that scoring is inline in lead_discovery and remove the step from the UI/docs if it’s redundant.
- **Metrics** — If you add agent execution logs or GTM metrics, store them in a single place (e.g. agentExecutionLogs / agentMetrics or a small GTM stats table) so the Business agent or a dashboard can reason about performance.

### Docs and handoff

- **GTM_PLAN.md / CAREERSWARM_GTM_STRATEGY.md** — Keep these the source of truth for positioning and tactics. When you change positioning, ask the OpenClaw Business agent to suggest prompt updates in the in-app agents so they stay aligned.
- **OPENCLAW_HANDOFF.md** — When the Business agent suggests code or prompt changes, it can append a handoff note so Cursor or you can implement and commit.

---

## Quick checklist (for you or the Business agent)

- [ ] Strategy and content prompts reference positioning/value from CAREERSWARM_GTM_STRATEGY.
- [ ] Pipeline steps log step + outcome; errors return `ok: false` and a message.
- [ ] LLM timeouts are set and consistent with the rest of the app.
- [ ] Structured output (json_schema) is used for all LLM-called GTM agents.
- [ ] Unit or integration tests exist for at least strategy and content (and ideally pipeline steps).
- [ ] Scoring step is either implemented or removed from the flow/docs.
- [ ] CONTEXT and todo mention GTM/business when you’re working on this area so Cursor and OpenClaw stay aligned.
