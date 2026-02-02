#!/usr/bin/env node
import * as Sentry from "@sentry/node";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { verifyEnv } from "./env";
import { serveStatic, setupVite } from "./vite";

// Fail fast in production if required env vars are missing
if (process.env.NODE_ENV === "production") {
  verifyEnv();
}

// Initialize Sentry for backend error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
    debug: false,
  });
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Sentry error handler setup (must be called before routes)
  if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
  
  // Stripe webhook MUST come before express.json() for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { handleStripeWebhook } = await import("./stripeWebhook");
      return handleStripeWebhook(req, res);
    }
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Source material ingestion APIs - DISABLED (old system)
  // const ingestFileRouter = (await import("../api-ingest-file")).default;
  // const ingestLinkRouter = (await import("../api-ingest-link")).default;
  // app.use("/api/ingest/file", ingestFileRouter);
  // app.use("/api/ingest/link", ingestLinkRouter);
  
  // PDF upload for Resume Roaster - DISABLED (old system)
  // const { createPDFUploadRouter } = await import("../pdf-upload-route");
  // app.use(createPDFUploadRouter());
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Sentry error handler is already set up via setupExpressErrorHandler above
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);

    // Start GTM pipeline worker if Redis available
    try {
      const queueModule = await import("../queue");
      const { processGtmJob } = await import("../agents/gtm/pipeline-processor");
      const { createGtmJobRun, finishGtmJobRun } = await import("../db");
      const worker = queueModule.createWorker<import("../queue").GtmPipelineData>(
        queueModule.QueueName.GTM_PIPELINE,
        async (job) => {
          const data = job.data;
          const runId = await createGtmJobRun(data.step, data.channel ?? null, job.id);
          try {
            const result = await processGtmJob(data);
            if (runId) await finishGtmJobRun(runId, result.ok ? "success" : "failed", result.message, JSON.stringify({ count: result.count }));
            return result;
          } catch (err: any) {
            if (runId) await finishGtmJobRun(runId, "failed", err?.message ?? String(err));
            throw err;
          }
        },
        { concurrency: 2 }
      );
      worker.on("completed", () => {});
      worker.on("failed", (job, err) => console.error("[GTM Worker] Job failed:", job?.id, err));

      // Enqueue weekly strategy and report (every 7 days)
      const enqueueWeekly = () => {
        queueModule.addJob(queueModule.QueueName.GTM_PIPELINE, { step: "strategy", payload: {} });
        queueModule.addJob(queueModule.QueueName.GTM_PIPELINE, { step: "report", payload: {} });
      };
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      setTimeout(enqueueWeekly, 60 * 1000); // first run 1 min after start
      setInterval(enqueueWeekly, SEVEN_DAYS_MS);
    } catch (err) {
      console.warn("[GTM Worker] Not started (Redis or queue unavailable):", (err as Error).message);
    }
  });
}

startServer().catch(console.error);
