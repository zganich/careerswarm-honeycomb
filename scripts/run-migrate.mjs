#!/usr/bin/env node
/**
 * Load .env and run drizzle-kit migrate (no generate, no interactive prompt).
 * Ensures userProfiles and certifications exist (required by 0015, not in journal).
 * Usage: node scripts/run-migrate.mjs
 * Requires: .env with DATABASE_URL set to your MySQL connection string.
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

config({ path: path.join(root, ".env") });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Create a .env file from .env.example and set DATABASE_URL to your MySQL connection string."
  );
  console.error(
    "Example: DATABASE_URL=mysql://user:password@localhost:3306/your_database"
  );
  process.exit(1);
}

// Create userProfiles and certifications if missing (0015 expects them; they are not in drizzle journal)
const ensureMasterProfileTables = async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`userProfiles\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL UNIQUE,
        \`phone\` varchar(20),
        \`linkedinUrl\` text,
        \`locationCity\` varchar(100),
        \`locationState\` varchar(50),
        \`locationCountry\` varchar(50) DEFAULT 'USA',
        \`workPreference\` json,
        \`profileCompleteness\` int DEFAULT 0,
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        \`updatedAt\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`certifications\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`certificationName\` varchar(255) NOT NULL,
        \`issuingOrganization\` varchar(255),
        \`issueYear\` int,
        \`credentialId\` varchar(255),
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
  } finally {
    await conn.end();
  }
};

await ensureMasterProfileTables();

// MySQL needs multipleStatements=true so migration files with multiple SQL statements run
const url = process.env.DATABASE_URL;
const migrateUrl = url.includes("?")
  ? `${url}&multipleStatements=true`
  : `${url}?multipleStatements=true`;
const env = { ...process.env, DATABASE_URL: migrateUrl };

const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  cwd: root,
  stdio: "inherit",
  env,
});

if (result.status !== 0) {
  console.error(
    "\nIf you see ECONNREFUSED: ensure MySQL is running and DATABASE_URL in .env is correct."
  );
  console.error(
    "Example: DATABASE_URL=mysql://user:password@localhost:3306/your_database"
  );
}
process.exit(result.status ?? 1);
