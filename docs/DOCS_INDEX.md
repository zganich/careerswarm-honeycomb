# Documentation index

One-place index for all project docs. Use this to find the right doc quickly (humans and agents).

## Root (context and workflow)

| File                                                  | Purpose                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| [CONTEXT_FOR_NEW_CHAT.md](../CONTEXT_FOR_NEW_CHAT.md) | Project context, handoff, last session, next steps. Read first in a new chat. |
| [todo.md](../todo.md)                                 | Priorities, completed items, quick commands.                                  |
| [OPENCLAW.md](../OPENCLAW.md)                         | OpenClaw workspace summary, key paths, sync points.                           |
| [TASKS.md](../TASKS.md)                               | Named tasks (monitor, ship-check, etc.) and handoff rule.                     |
| [TOOLS.md](../TOOLS.md)                               | Agents and commands (doctor, monitor, ship:check).                            |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                 | How to contribute: setup, doctor, precommit, PR.                              |
| [SECURITY.md](../SECURITY.md)                         | How to report security vulnerabilities.                                       |
| [CHANGELOG.md](../CHANGELOG.md)                       | Version history.                                                              |

## Setup and deploy

| Doc                                                               | Purpose                                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------- |
| [CRITICAL_SETUP_CHECKLIST.md](./CRITICAL_SETUP_CHECKLIST.md)      | Env, auth, DB, production config. Do once and correctly. |
| [SETUP_GUIDE.md](../SETUP_GUIDE.md)                               | Quick 5‑minute setup.                                    |
| [SHIP_CHECKLIST.md](./SHIP_CHECKLIST.md)                          | Pre-deploy checklist.                                    |
| [SHIP_STEP_BY_STEP.md](./SHIP_STEP_BY_STEP.md)                    | Step-by-step deploy.                                     |
| [RAILWAY_DEPLOYMENT_HANDOFF.md](../RAILWAY_DEPLOYMENT_HANDOFF.md) | Railway deploy and “if you see errors.”                  |

## Operations and debugging

| Doc                                      | Purpose                                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| [DEBUGGING.md](./DEBUGGING.md)           | Production debugging: platform limits → env → minimal fix. Read first when something breaks. |
| [MONITORING.md](./MONITORING.md)         | `pnpm run monitor` / monitor:watch — GitHub CI, Railway, app health, Cloudflare.             |
| [BACKUP_RESTORE.md](./BACKUP_RESTORE.md) | Backup and restore (DB, etc.).                                                               |
| [MIGRATION.md](./MIGRATION.md)           | Migration notes.                                                                             |

## Optional infrastructure

| Doc                                                        | Purpose                                         |
| ---------------------------------------------------------- | ----------------------------------------------- |
| [OPTIONAL_INFRASTRUCTURE.md](./OPTIONAL_INFRASTRUCTURE.md) | DNS, Redis, Sentry — not required for core app. |
| [CLOUDFLARE_DNS.md](./CLOUDFLARE_DNS.md)                   | DNS setup (careerswarm.com).                    |
| [SENTRY_SETUP.md](./SENTRY_SETUP.md)                       | Sentry error tracking (optional).               |

## OpenClaw and agents

| Doc                                                                      | Purpose                                                                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| [IDEAL_WORKFLOW_AND_ASSIGNMENTS.md](./IDEAL_WORKFLOW_AND_ASSIGNMENTS.md) | **What Cursor needs; task and agent assignments** (Ship, Server, Client, Docs, Review, Business, Cursor, you). |
| [OPENCLAW_INTEGRATION.md](./OPENCLAW_INTEGRATION.md)                     | OpenClaw setup, cron, agents, role briefs, quick reference.                                                    |
| [OPENCLAW_FUTURE_SHOESTRING.md](./OPENCLAW_FUTURE_SHOESTRING.md)         | Future needs and shoestring budget — what to do next, cheap.                                                   |
| [OPENCLAW_INSPIRATION.md](./OPENCLAW_INSPIRATION.md)                     | Ideas from OpenClaw org; what we adopted; sketchiness check.                                                   |
| [BUSINESS_AGENT_IMPROVEMENTS.md](./BUSINESS_AGENT_IMPROVEMENTS.md)       | OpenClaw Business agent and in-app GTM agents — how to improve.                                                |

## Product and GTM

| Doc                                                                            | Purpose                                  |
| ------------------------------------------------------------------------------ | ---------------------------------------- |
| [CAREERSWARM_GTM_STRATEGY.md](./CAREERSWARM_GTM_STRATEGY.md)                   | GTM strategy and positioning.            |
| [GTM_PLAN.md](./GTM_PLAN.md)                                                   | GTM plan.                                |
| [CAREERSWARM_SUMMARY_FOR_MARKETING.md](./CAREERSWARM_SUMMARY_FOR_MARKETING.md) | Summary for marketing.                   |
| [HUMAN_TESTING_REPORT.md](./HUMAN_TESTING_REPORT.md)                           | Human testing report (production flows). |
