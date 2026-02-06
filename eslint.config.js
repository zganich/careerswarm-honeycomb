import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: { react: react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-empty": "warn",
      "no-empty-pattern": "warn",
      "no-constant-binary-expression": "warn",
      "prefer-const": "warn",
      "react/prop-types": "off",
    },
  },
  prettierConfig,
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      ".archive/**",
      "playwright-report*/**",
      "test-results/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
      "scripts/*.mjs",
      "drizzle/**",
      "browser-extension/**",
      "client/public/**",
    ],
  },
];
