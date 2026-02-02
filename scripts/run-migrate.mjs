#!/usr/bin/env node
/**
 * Load .env and run drizzle-kit migrate (no generate, no interactive prompt).
 * Usage: node scripts/run-migrate.mjs
 * Requires: .env with DATABASE_URL set to your MySQL connection string.
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

config({ path: path.join(root, ".env") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Create a .env file from .env.example and set DATABASE_URL to your MySQL connection string.");
  console.error("Example: DATABASE_URL=mysql://user:password@localhost:3306/your_database");
  process.exit(1);
}

const result = spawnSync(
  "pnpm",
  ["exec", "drizzle-kit", "migrate"],
  { cwd: root, stdio: "inherit", env: process.env }
);

if (result.status !== 0) {
  console.error("\nIf you see ECONNREFUSED: ensure MySQL is running and DATABASE_URL in .env is correct.");
  console.error("Example: DATABASE_URL=mysql://user:password@localhost:3306/your_database");
}
process.exit(result.status ?? 1);
