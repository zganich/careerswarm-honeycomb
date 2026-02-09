#!/usr/bin/env node
/**
 * Pre-commit gate: optional git-secrets scan, then check + format:check + lint.
 * Passes when git-secrets is not installed; runs scan when available.
 * Usage: pnpm precommit   (or node scripts/precommit.mjs)
 */
import { execSync, spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function runSecretsScan() {
  const r = spawnSync("git", ["secrets", "--scan"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
  });
  if (r.status === 0) return { skip: false, fail: false };
  const stderr = (r.stderr || "").toLowerCase();
  const notInstalled =
    stderr.includes("is not a git command") ||
    stderr.includes("not found") ||
    stderr.includes("unknown command") ||
    r.error?.code === "ENOENT";
  if (notInstalled) return { skip: true, fail: false };
  return { skip: false, fail: true };
}

console.log("Pre-commit: optional secrets scan, then check + format + lint\n");

const scan = runSecretsScan();
if (scan.skip) {
  console.log("  git-secrets not installed — skipping secrets scan.\n");
} else if (scan.fail) {
  console.error(
    "  git secrets --scan found potential secrets. Fix or allow-list before committing."
  );
  process.exit(1);
} else {
  console.log("  secrets scan: OK\n");
}

const steps = [
  ["pnpm check", "check"],
  ["pnpm format:check", "format:check"],
  ["pnpm lint", "lint"],
];

for (const [cmd, label] of steps) {
  try {
    execSync(cmd, { cwd: root, stdio: "inherit" });
    console.log(`  ${label}: OK`);
  } catch (e) {
    console.error(`  ${label}: FAIL`);
    process.exit(e.status ?? 1);
  }
}

console.log("\nPre-commit: all passed.");
