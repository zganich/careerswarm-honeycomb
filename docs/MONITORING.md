# Monitoring via CLI

Unified monitoring for GitHub, Railway, Cloudflare, and app health — all via CLI. Use `pnpm run monitor` for quick status checks and optional desktop notifications.

---

## Prerequisites

Install and authenticate CLIs:

```bash
# GitHub CLI (required for CI status)
brew install gh
gh auth login

# Railway CLI (required for deployment status)
brew install railway
railway login
railway link   # from repo root
```

Cloudflare is optional. If you use it for DNS, add to `.env` and test with `pnpm run test:cloudflare`:

```
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
CLOUDFLARE_ZONE_ID="your-zone-id"
```

Get your token from Cloudflare → My Profile → API Tokens. Zone ID is in the dashboard when you select the zone.

---

## Commands

| Command                  | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `pnpm run monitor`       | One-shot: GitHub CI, Railway status, app health, Cloudflare (if configured) |
| `pnpm run monitor:watch` | Poll every 60s; macOS desktop notifications on failures                     |

---

## What It Checks

| Source           | Check                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| **GitHub**       | Last 5 workflow runs (`gh run list`); reports failures                    |
| **Railway**      | `railway status`; deployment state                                        |
| **Railway logs** | Recent log lines; flags ERROR/failed/500 patterns                         |
| **App health**   | `GET https://careerswarm.com/api/health`                                  |
| **Cloudflare**   | Zone status (active) if `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` set |

---

## Notifications

On macOS, `--watch` mode uses `osascript` to show desktop notifications when:

- GitHub CI run fails
- Railway status check fails
- App health returns non-2xx
- Railway logs contain error-like lines
- Cloudflare zone is not active

---

## Quick Reference

```bash
# One-time status
pnpm run monitor

# Background watch with notifications
pnpm run monitor:watch
```

Exit code: `0` if all checks pass, `1` if any fail (for CI scripting).
