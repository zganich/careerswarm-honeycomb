#!/usr/bin/env node
/**
 * Test Cloudflare API connectivity and zone status.
 * Loads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID from .env
 *
 * Usage: pnpm run test:cloudflare
 */

import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return {};
  const buf = readFileSync(p, "utf8");
  const env = {};
  for (const line of buf.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const token = env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  let zoneId = env.CLOUDFLARE_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID;

  console.log("Cloudflare API test\n");

  if (!token) {
    console.error("❌ CLOUDFLARE_API_TOKEN not set. Add to .env:");
    console.error('   CLOUDFLARE_API_TOKEN="your-api-token"');
    process.exit(1);
  }
  console.log("✅ CLOUDFLARE_API_TOKEN is set");

  if (!zoneId) {
    console.log(
      "   CLOUDFLARE_ZONE_ID not set — fetching zone ID for careerswarm.com..."
    );
    const listRes = await fetch(
      "https://api.cloudflare.com/client/v4/zones?name=careerswarm.com",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    let listData;
    try {
      listData = await listRes.json();
    } catch {
      console.error(
        "❌ Invalid JSON response when listing zones:",
        listRes.status,
        listRes.statusText
      );
      process.exit(1);
    }
    if (!listRes.ok) {
      console.error(
        "❌ Failed to list zones:",
        listRes.status,
        listData.errors?.[0]?.message || JSON.stringify(listData.errors)
      );
      process.exit(1);
    }
    if (!listData.success || !listData.result?.length) {
      console.error(
        "❌ Failed to list zones:",
        listData.errors?.[0]?.message || "No zones found"
      );
      process.exit(1);
    }
    zoneId = listData.result[0].id;
    console.log("   Zone ID:", zoneId);
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  let data;
  try {
    data = await res.json();
  } catch {
    console.error("❌ Invalid JSON response:", res.status, res.statusText);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(
      "❌ Zone fetch failed:",
      res.status,
      data.errors?.[0]?.message || JSON.stringify(data.errors)
    );
    process.exit(1);
  }

  if (!data.success) {
    console.error("❌ API error:", data.errors?.[0]?.message);
    process.exit(1);
  }

  const zone = data.result;
  console.log("✅ Cloudflare API OK");
  console.log("   Zone:", zone.name);
  console.log("   Status:", zone.status);
  console.log("   Nameservers:", zone.name_servers?.join(", ") || "—");
}

main().catch(e => {
  console.error("❌", e.message);
  process.exit(1);
});
