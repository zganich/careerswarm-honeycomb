/**
 * Complete Playbook Runner for Honeycomb
 *
 * Runs all tests from the "Lost but Launching" playbook
 * and generates a comprehensive report
 */

import { test, expect } from "@playwright/test";
import { writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

interface TestReport {
  timestamp: string;
  url: string;
  consoleErrors: string[];
  networkErrors: Array<{ url: string; status: number; error: string }>;
  trpcErrors: Array<{ url: string; status: number; error: string }>;
  criticalIssues: string[];
  recommendations: string[];
  features: {
    homepage: boolean;
    dashboard: boolean;
    trpcClient: boolean;
  };
}

test.describe("Complete Playbook Runner (Honeycomb)", () => {
  test("Run full playbook and generate report", async ({ page }) => {
    const report: TestReport = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      consoleErrors: [],
      networkErrors: [],
      trpcErrors: [],
      criticalIssues: [],
      recommendations: [],
      features: {
        homepage: false,
        dashboard: false,
        trpcClient: false,
      },
    };

    // Capture console errors
    page.on("console", msg => {
      if (msg.type() === "error") {
        report.consoleErrors.push(msg.text());
      }
    });

    // Capture network errors
    page.on("response", response => {
      if (response.status() >= 400) {
        const error = {
          url: response.url(),
          status: response.status(),
          error: response.statusText(),
        };
        report.networkErrors.push(error);

        if (response.url().includes("trpc")) {
          report.trpcErrors.push(error);
        }
      }
    });

    // Step 1: Check homepage
    console.log("\n📋 Step 1: Checking homepage...");
    try {
      await page.goto(BASE_URL);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      report.features.homepage = true;
      console.log("✅ Homepage: OK");
    } catch (error) {
      report.criticalIssues.push(`Homepage failed: ${error}`);
    }

    // Step 2: Check dashboard
    console.log("\n📋 Step 2: Checking dashboard...");
    try {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      report.features.dashboard = true;
      console.log("✅ Dashboard: OK");
    } catch (error) {
      report.criticalIssues.push(`Dashboard failed: ${error}`);
    }

    // Step 3: Check tRPC client
    console.log("\n📋 Step 3: Checking tRPC client...");
    const trpcRequests: string[] = [];
    page.on("request", request => {
      if (request.url().includes("trpc") || request.url().includes("/api/")) {
        trpcRequests.push(request.url());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    if (trpcRequests.length > 0) {
      report.features.trpcClient = true;
      console.log(`✅ tRPC Client: Active (${trpcRequests.length} requests)`);
    } else {
      console.log("⚠️ tRPC Client: No requests detected");
    }

    // Analyze results and generate recommendations
    if (report.consoleErrors.length > 0) {
      report.recommendations.push(
        "Fix console errors - check browser DevTools"
      );
    }

    if (report.trpcErrors.length > 0) {
      report.recommendations.push(
        "Fix tRPC endpoint errors - check server logs"
      );
    }

    if (!report.features.homepage) {
      report.recommendations.push(
        "Homepage is broken - this is a launch blocker"
      );
    }

    if (!report.features.dashboard) {
      report.recommendations.push(
        "Dashboard is broken - this is a launch blocker"
      );
    }

    // Generate report file
    const reportPath = join(
      process.cwd(),
      "test-results",
      "playbook-report-honeycomb.json"
    );
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("PLAYBOOK TEST SUMMARY (Honeycomb)");
    console.log("=".repeat(70));
    console.log(`Console Errors: ${report.consoleErrors.length}`);
    console.log(`Network Errors: ${report.networkErrors.length}`);
    console.log(`tRPC Errors: ${report.trpcErrors.length}`);
    console.log(
      `Homepage: ${report.features.homepage ? "✅ PASS" : "❌ FAIL"}`
    );
    console.log(
      `Dashboard: ${report.features.dashboard ? "✅ PASS" : "❌ FAIL"}`
    );
    console.log(
      `tRPC Client: ${report.features.trpcClient ? "✅ PASS" : "⚠️ UNKNOWN"}`
    );
    console.log(`Critical Issues: ${report.criticalIssues.length}`);
    console.log(`Recommendations: ${report.recommendations.length}`);
    console.log("=".repeat(70) + "\n");

    // Fail test if critical issues found
    if (report.criticalIssues.length > 0 || !report.features.homepage) {
      throw new Error("Critical issues found - see report for details");
    }
  });
});
