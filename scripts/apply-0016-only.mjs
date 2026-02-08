#!/usr/bin/env node
/**
 * Apply only migration 0016 (applicationsThisMonth, applicationsResetAt).
 * Run with: railway run node scripts/apply-0016-only.mjs
 * Requires DATABASE_URL (from Railway or .env). Fails from local if DB is internal-only.
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    await conn.query(`
      ALTER TABLE \`users\` ADD \`applicationsThisMonth\` int DEFAULT 0 NOT NULL;
    `);
    console.log("Added applicationsThisMonth");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME")
      console.log("applicationsThisMonth already exists");
    else throw e;
  }
  try {
    await conn.query(`
      ALTER TABLE \`users\` ADD \`applicationsResetAt\` timestamp DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log("Added applicationsResetAt");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME")
      console.log("applicationsResetAt already exists");
    else throw e;
  }
  await conn.end();
  console.log("Done. Sign-in should work.");
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
