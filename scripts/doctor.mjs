#!/usr/bin/env node
/**
 * CareerSwarm doctor: read-only local sanity checks.
 * Runs verify-env, check, and build. Never prints secret values.
 * Usage: pnpm run doctor   (or node scripts/doctor.mjs)
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function run(label, command, opts = {}) {
  try {
    execSync(command, {
      cwd: root,
      stdio: "pipe",
      ...opts,
    });
    console.log(`  ${label}: OK`);
    return true;
  } catch (e) {
    console.error(`  ${label}: FAIL`);
    if (opts.showOutput && e.stdout) process.stdout.write(e.stdout);
    if (e.stderr) process.stderr.write(e.stderr);
    return false;
  }
}

console.log("CareerSwarm doctor (read-only, no secrets printed)\n");

const ok1 = run("verify-env", "node scripts/verify-env.mjs");
const ok2 = run("pnpm check", "pnpm check");
const ok3 = run("pnpm build", "pnpm build", { showOutput: false });

if (!ok1 || !ok2 || !ok3) {
  console.error("\nFix the failures above, then run doctor again.");
  process.exit(1);
}

console.log(
  "\nAll checks passed. Optional: run `railway status` if you use Railway."
);
