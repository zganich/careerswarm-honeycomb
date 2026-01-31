# Prompt for Manus: Use the Right Repo and Run Setup

**Copy everything below the line into a new Manus task. Manus will use the correct repo and follow the handoff.**

---

Use the **careerswarm-honeycomb** repository as the only source of truth. Do not use any repo named "CareerSwarm" or "careerswarm" without "-honeycomb"—that is the old repo.

**Canonical repo:** `careerswarm-honeycomb`  
**URL:** https://github.com/zganich/careerswarm-honeycomb

**Do this:**

1. **Clone or connect** the repo `careerswarm-honeycomb` from the URL above. If you already have a project open, confirm it is this repo (path or URL should include `careerswarm-honeycomb`). If you have the old "CareerSwarm" repo, switch to or clone `careerswarm-honeycomb` instead.

2. **Open and read** `CLAUDE_MANUS_HANDOFF.md` in the project root. Follow its instructions. Do not redo the fixes it describes (TypeScript/package generation fixes are already done). Do the testing phases it outlines (environment setup, package generation, agent integration, E2E).

3. **Use this repo for all work**—code changes, validation, and tests. Ignore or do not clone the older CareerSwarm repo.

Reply with: (1) which repo you are using (should be careerswarm-honeycomb), (2) that you have read the handoff doc, and (3) what you will do next (e.g. run `pnpm validate`, then the testing phases from the handoff).
