#!/usr/bin/env node
/**
 * Tech Debt Elimination Script
 * Scans codebase for stale context, unused code, and inconsistencies
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { execSync } from "child_process";

const SCAN_DIRS = ["server", "client/src", "shared"];
const IGNORE_PATTERNS = ["node_modules", ".git", "dist", "build", ".next"];

console.log("🔍 TECH DEBT ELIMINATION SCANNER\n");
console.log("=".repeat(60));

const issues = {
  unusedImports: [],
  deadCode: [],
  staleComments: [],
  typeInconsistencies: [],
  deprecatedPatterns: [],
  duplicateCode: [],
};

// Recursively get all files
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);

    if (IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))) {
      return;
    }

    if (statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(filePath))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Check for unused imports
function checkUnusedImports(filePath, content) {
  const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  const matches = [...content.matchAll(importRegex)];

  matches.forEach(match => {
    const namedImports = match[1] ? match[1].split(",").map(s => s.trim()) : [];
    const defaultImport = match[2];
    const allImports = [...namedImports, defaultImport].filter(Boolean);

    allImports.forEach(importName => {
      // Remove type annotations
      const cleanName = importName.replace(/\s+as\s+\w+/, "").trim();

      // Check if used in file (simple heuristic)
      const usageRegex = new RegExp(`\\b${cleanName}\\b`, "g");
      const usages = (content.match(usageRegex) || []).length;

      // If only appears once (in the import itself), likely unused
      if (usages === 1) {
        issues.unusedImports.push({
          file: filePath,
          import: cleanName,
          line: content.substring(0, match.index).split("\n").length,
        });
      }
    });
  });
}

// Check for dead code (exported but never imported)
function checkDeadCode(files) {
  const exports = new Map(); // file -> [exports]
  const imports = new Set(); // all imported names

  files.forEach(filePath => {
    const content = readFileSync(filePath, "utf-8");

    // Find exports
    const exportRegex =
      /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const exportMatches = [...content.matchAll(exportRegex)];
    exportMatches.forEach(match => {
      if (!exports.has(filePath)) exports.set(filePath, []);
      exports.get(filePath).push(match[1]);
    });

    // Find imports
    const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from/g;
    const importMatches = [...content.matchAll(importRegex)];
    importMatches.forEach(match => {
      if (match[1]) {
        match[1].split(",").forEach(name => imports.add(name.trim()));
      }
      if (match[2]) imports.add(match[2]);
    });
  });

  // Find exports that are never imported
  exports.forEach((exportList, filePath) => {
    exportList.forEach(exportName => {
      if (!imports.has(exportName)) {
        issues.deadCode.push({
          file: filePath,
          export: exportName,
          type: "unused_export",
        });
      }
    });
  });
}

// Check for stale comments/TODOs
function checkStaleComments(filePath, content) {
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // Check for old-style TODOs
    if (
      line.includes("TODO") ||
      line.includes("FIXME") ||
      line.includes("HACK")
    ) {
      issues.staleComments.push({
        file: filePath,
        line: idx + 1,
        content: line.trim(),
        type: "todo",
      });
    }

    // Check for commented-out code (lines starting with //)
    if (line.trim().startsWith("//") && line.length > 50) {
      issues.staleComments.push({
        file: filePath,
        line: idx + 1,
        content: line.trim().substring(0, 60) + "...",
        type: "commented_code",
      });
    }
  });
}

// Check for type inconsistencies
function checkTypeInconsistencies(filePath, content) {
  // Check for any usage
  if (content.includes(": any")) {
    const matches = content.match(/:\s*any/g) || [];
    issues.typeInconsistencies.push({
      file: filePath,
      count: matches.length,
      type: "any_type",
    });
  }

  // Check for @ts-ignore
  if (content.includes("@ts-ignore") || content.includes("@ts-expect-error")) {
    const matches = content.match(/@ts-(ignore|expect-error)/g) || [];
    issues.typeInconsistencies.push({
      file: filePath,
      count: matches.length,
      type: "ts_suppression",
    });
  }
}

// Check for deprecated patterns
function checkDeprecatedPatterns(filePath, content) {
  const patterns = [
    {
      pattern:
        /componentWillMount|componentWillReceiveProps|componentWillUpdate/,
      name: "deprecated_react_lifecycle",
    },
    { pattern: /var\s+\w+\s*=/, name: "var_keyword" },
    { pattern: /require\(['"]/, name: "require_instead_of_import" },
    { pattern: /==(?!=)/, name: "loose_equality" },
  ];

  patterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.deprecatedPatterns.push({
        file: filePath,
        pattern: name,
        count: matches.length,
      });
    }
  });
}

// Main scan
console.log("\n📂 Scanning directories:", SCAN_DIRS.join(", "));
const allFiles = [];
SCAN_DIRS.forEach(dir => {
  try {
    getAllFiles(dir, allFiles);
  } catch (e) {
    console.log(`⚠️  Skipping ${dir} (not found)`);
  }
});

console.log(`📄 Found ${allFiles.length} files to analyze\n`);

// Run checks
console.log("🔎 Running checks...\n");

allFiles.forEach(filePath => {
  const content = readFileSync(filePath, "utf-8");

  checkUnusedImports(filePath, content);
  checkStaleComments(filePath, content);
  checkTypeInconsistencies(filePath, content);
  checkDeprecatedPatterns(filePath, content);
});

checkDeadCode(allFiles);

// Generate report
console.log("=".repeat(60));
console.log("\n📊 TECH DEBT REPORT\n");

const totalIssues = Object.values(issues).reduce(
  (sum, arr) => sum + arr.length,
  0
);

if (totalIssues === 0) {
  console.log("✨ No tech debt found! Codebase is clean.\n");
} else {
  console.log(`⚠️  Found ${totalIssues} issues:\n`);

  if (issues.unusedImports.length > 0) {
    console.log(`\n🔴 Unused Imports (${issues.unusedImports.length}):`);
    issues.unusedImports.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.import}`);
    });
    if (issues.unusedImports.length > 10) {
      console.log(`   ... and ${issues.unusedImports.length - 10} more`);
    }
  }

  if (issues.deadCode.length > 0) {
    console.log(`\n🔴 Dead Code (${issues.deadCode.length}):`);
    issues.deadCode.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file} - export ${issue.export} (never imported)`);
    });
    if (issues.deadCode.length > 10) {
      console.log(`   ... and ${issues.deadCode.length - 10} more`);
    }
  }

  if (issues.staleComments.length > 0) {
    console.log(`\n🟡 Stale Comments/TODOs (${issues.staleComments.length}):`);
    issues.staleComments.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.type}`);
      console.log(`      ${issue.content}`);
    });
    if (issues.staleComments.length > 10) {
      console.log(`   ... and ${issues.staleComments.length - 10} more`);
    }
  }

  if (issues.typeInconsistencies.length > 0) {
    console.log(
      `\n🟡 Type Inconsistencies (${issues.typeInconsistencies.length}):`
    );
    issues.typeInconsistencies.forEach(issue => {
      console.log(`   ${issue.file} - ${issue.count}x ${issue.type}`);
    });
  }

  if (issues.deprecatedPatterns.length > 0) {
    console.log(
      `\n🟡 Deprecated Patterns (${issues.deprecatedPatterns.length}):`
    );
    issues.deprecatedPatterns.forEach(issue => {
      console.log(`   ${issue.file} - ${issue.count}x ${issue.pattern}`);
    });
  }
}

// Save detailed report
const reportPath = "tech-debt-report.json";
writeFileSync(reportPath, JSON.stringify(issues, null, 2));
console.log(`\n📝 Detailed report saved to: ${reportPath}`);

console.log("\n" + "=".repeat(60));
console.log("\n💡 RECOMMENDATIONS:\n");
console.log("1. Run `pnpm check` to fix TypeScript errors");
console.log("2. Use ESLint auto-fix: `pnpm eslint --fix`");
console.log("3. Remove unused imports with your IDE");
console.log(
  "4. Address high-priority issues first (unused exports, any types)"
);
console.log("5. Schedule tech debt cleanup in next sprint\n");

process.exit(totalIssues > 0 ? 1 : 0);
