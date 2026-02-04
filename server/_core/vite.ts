import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ESM
// Lazy evaluation to avoid issues with import.meta.url in bundled production code
function getModuleDir(): string {
  if (process.env.NODE_ENV === "production") {
    return process.cwd();
  }
  // Development mode - use import.meta.url
  return path.dirname(fileURLToPath(import.meta.url));
}

export async function setupVite(app: Express, server: Server) {
  // Dynamic imports to avoid loading vite/viteConfig in production bundles
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await import("../../vite.config")).default;
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  const clientTemplatePath = path.resolve(
    getModuleDir(),
    "../..",
    "client",
    "index.html"
  );

  async function serveIndexHtml(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      let template = await fs.promises.readFile(clientTemplatePath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  }

  // SPA fallback BEFORE Vite: in middleware mode Vite does not serve index.html for paths like /roast,
  // so we handle GET requests that look like app routes (no file extension) and serve index.html first.
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/__manus__")) return next();
    if (req.path.startsWith("/@")) return next();
    // Paths with a dot are likely assets or scripts (e.g. /src/main.tsx) — let Vite handle them
    if (req.path.includes(".")) return next();
    serveIndexHtml(req, res, next);
  });

  app.use(vite.middlewares);
  app.use("*", (req, res, next) => {
    serveIndexHtml(req, res, next);
  });
}

export function serveStatic(app: Express) {
  // In production, files are served from dist/public relative to cwd
  // In development, we also use dist/public but need to go up from server/_core
  const distPath =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "public")
      : path.resolve(getModuleDir(), "../..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
