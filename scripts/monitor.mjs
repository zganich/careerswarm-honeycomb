#!/usr/bin/env node
/**
 * Unified monitoring script — GitHub, Railway, Cloudflare via CLI
 *
 * Aggregates CI status, deployment logs, and optional Cloudflare zone health.
 * Sends macOS desktop notifications when failures are detected.
 *
 * Usage:
 *   pnpm run monitor           # One-shot status check
 *   pnpm run monitor --watch   # Poll every 60s, notify on failures
 *
 * Env (optional): CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID for Cloudflare checks
 */

import { spawn, spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function run(cmd, args = [], cwd = ROOT) {
  return new Promise(resolve => {
    const proc = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    proc.stdout?.on("data", d => {
      out += d.toString();
    });
    proc.stderr?.on("data", d => {
      err += d.toString();
    });
    proc.on("close", code => resolve({ code, out, err }));
  });
}

function notify(title, msg, success = true) {
  const app = success ? "Terminal" : "System Events";
  const script = `display notification "${String(msg).replace(/"/g, '\\"')}" with title "${String(title).replace(/"/g, '\\"')}"`;
  spawn("osascript", ["-e", script], { stdio: "ignore" }).on("error", () => {});
}

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return {};
  const buf = readFileSync(p, "utf8");
  const env = {};
  for (const line of buf.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function getGhRepo() {
  const { stdout } = spawnSync("git", ["remote", "get-url", "origin"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const m = (stdout || "").match(
    /github\.com[:/]([\w-]+\/[\w.-]+?)(?:\.git)?$/
  );
  return m ? m[1] : "zganich/careerswarm-honeycomb";
}

async function githubStatus() {
  const repo = getGhRepo();
  const { code, out } = await run("gh", [
    "run",
    "list",
    "--limit",
    "5",
    "--json",
    "status,conclusion,name,displayTitle,createdAt",
    "--repo",
    repo,
  ]);
  if (code !== 0)
    return {
      ok: false,
      runs: [],
      failed: [],
      inProgress: false,
      error: "gh run list failed",
    };
  let runs;
  try {
    runs = JSON.parse(out);
  } catch {
    return {
      ok: false,
      runs: [],
      failed: [],
      inProgress: false,
      error: "gh output parse failed",
    };
  }
  const failed = runs.filter(r => r.conclusion === "failure");
  const latest = runs[0];
  const inProgress = latest?.status === "in_progress";
  // CI is OK when latest succeeded or is in progress; only fail when latest completed with failure
  const ok = latest
    ? latest.conclusion === "success" || latest.status === "in_progress"
    : failed.length === 0;
  return { ok, runs, failed, inProgress };
}

async function railwayStatus() {
  const { code, out } = await run("railway", ["status"]);
  if (code !== 0) return { ok: false, text: out || "railway status failed" };
  return { ok: true, text: out.trim() };
}

async function railwayLogs(lines = 15) {
  return new Promise(resolve => {
    const proc = spawn("railway", ["logs"], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    proc.stdout?.on("data", d => {
      out += d.toString();
    });
    proc.stderr?.on("data", d => {
      out += d.toString();
    });
    const t = setTimeout(() => {
      proc.kill("SIGTERM");
      const ln = out.trim().split("\n").filter(Boolean).slice(-lines);
      const hasError = ln.some(l =>
        /error|Error|ERR|500|failed|Fatal/i.test(l)
      );
      resolve({ ok: !hasError, lines: ln });
    }, 4000);
    proc.on("close", () => {
      clearTimeout(t);
      const ln = out.trim().split("\n").filter(Boolean).slice(-lines);
      const hasError = ln.some(l =>
        /error|Error|ERR|500|failed|Fatal/i.test(l)
      );
      resolve({ ok: !hasError, lines: ln });
    });
  });
}

async function cloudflareStatus() {
  const env = loadEnv();
  const token = env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = env.CLOUDFLARE_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId)
    return {
      ok: true,
      skipped: true,
      msg: "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID not set",
    };

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) return { ok: false, msg: `Cloudflare API ${res.status}` };
  const data = await res.json();
  const active = data.success && data.result?.status === "active";
  return { ok: active, msg: data.result?.status || "unknown", skipped: false };
}

async function appHealth() {
  try {
    const res = await fetch("https://careerswarm.com/api/health", {
      signal: AbortSignal.timeout(10000),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function runMonitor(notifyOnFail = false) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`\n═══ CareerSwarm Monitor ${ts} ═══\n`);

  const results = [];

  // GitHub CI
  const gh = await githubStatus();
  results.push({ name: "GitHub CI", ok: gh.ok });
  if (gh.ok) {
    if (gh.inProgress) {
      const latest = gh.runs[0];
      console.log("  ⏳ GitHub CI: latest run in progress");
      console.log(
        `     ${latest?.name}: ${latest?.displayTitle || latest?.createdAt}`
      );
    }
    const recent = gh.runs.slice(0, 3);
    for (const r of recent) {
      const icon =
        r.conclusion === "success"
          ? "✅"
          : r.conclusion === "failure"
            ? "❌"
            : "⏳";
      console.log(
        `  ${icon} ${r.name}: ${r.conclusion || r.status} — ${r.displayTitle || r.createdAt}`
      );
    }
  } else {
    if (gh.error) {
      console.log("  ❌ GitHub CI:", gh.error);
    } else {
      console.log("  ❌ GitHub CI: failures detected");
      for (const r of gh.failed || []) {
        console.log(`     - ${r.name}: ${r.displayTitle}`);
      }
    }
    const hasFailures = (gh.failed?.length ?? 0) > 0;
    if (notifyOnFail && !gh.inProgress && hasFailures)
      notify(
        "CareerSwarm",
        `GitHub CI failed: ${gh.failed.map(f => f.name).join(", ")}`,
        false
      );
  }
  console.log("");

  // Railway
  const rw = await railwayStatus();
  results.push({ name: "Railway", ok: rw.ok });
  if (rw.ok) {
    console.log("  ✅ Railway:", rw.text.replace(/\n/g, " | "));
  } else {
    console.log("  ❌ Railway:", rw.text);
    if (notifyOnFail)
      notify("CareerSwarm", "Railway status check failed", false);
  }
  console.log("");

  // App health
  const health = await appHealth();
  results.push({ name: "App health", ok: health.ok });
  if (health.ok) {
    console.log("  ✅ App health: careerswarm.com OK");
  } else {
    console.log("  ❌ App health:", health.status, health.error || "");
    if (notifyOnFail)
      notify(
        "CareerSwarm",
        `App health check failed: ${health.status || health.error}`,
        false
      );
  }
  console.log("");

  // Railway logs (last 5)
  const logs = await railwayLogs(5);
  if (!logs.ok && logs.lines.length) {
    results.push({ name: "Railway logs", ok: false });
    console.log("  ⚠️ Recent log lines (possible errors):");
    logs.lines.slice(-3).forEach(l => console.log("     ", l.slice(0, 100)));
    if (notifyOnFail)
      notify("CareerSwarm", "Possible errors in Railway logs", false);
  } else {
    results.push({ name: "Railway logs", ok: true });
  }
  console.log("");

  // Cloudflare (optional)
  const cf = await cloudflareStatus();
  if (!cf.skipped) {
    results.push({ name: "Cloudflare", ok: cf.ok });
    if (cf.ok) {
      console.log("  ✅ Cloudflare zone:", cf.msg);
    } else {
      console.log("  ❌ Cloudflare:", cf.msg);
      if (notifyOnFail) notify("CareerSwarm", `Cloudflare: ${cf.msg}`, false);
    }
    console.log("");
  }

  const allOk = results.every(r => r.ok);
  if (allOk) {
    console.log("  ✅ All checks passed\n");
  } else {
    const failed = results.filter(r => !r.ok).map(r => r.name);
    console.log("  ❌ Failures:", failed.join(", "), "\n");
  }

  return allOk;
}

const watch = process.argv.includes("--watch");
const interval = 60 * 1000; // 60s

async function main() {
  const ok = await runMonitor(watch);
  if (watch) {
    console.log(`  Next check in ${interval / 1000}s (Ctrl+C to stop)\n`);
    setInterval(() => runMonitor(true), interval);
  } else {
    process.exit(ok ? 0 : 1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
