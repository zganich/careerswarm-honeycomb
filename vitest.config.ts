import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig(({ mode }) => {
  // Load env vars from .env file for tests
  const env = loadEnv(mode, templateRoot, "");

  return {
    root: templateRoot,
    resolve: {
      alias: {
        "@": path.resolve(templateRoot, "client", "src"),
        "@shared": path.resolve(templateRoot, "shared"),
        "@assets": path.resolve(templateRoot, "attached_assets"),
      },
    },
    test: {
      environment: "node",
      include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
      env,
    },
  };
});
