import type { Request, Response } from "express";
import { sdk } from "./sdk";
import { getResumeProgress } from "../resumeProgress";

const POLL_MS = 500;
const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/resume-progress
 * SSE stream of resume processing progress for the authenticated user.
 */
export async function handleResumeProgress(
  req: Request,
  res: Response
): Promise<void> {
  let user: { id: number };
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const start = Date.now();
  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ("flush" in res && typeof (res as any).flush === "function")
      (res as any).flush();
  };

  const interval = setInterval(() => {
    if (Date.now() - start > MAX_DURATION_MS) {
      clearInterval(interval);
      send({ phase: "error", message: "Timeout" });
      res.end();
      return;
    }
    const progress = getResumeProgress(user.id);
    if (progress) {
      send(progress);
      if (progress.phase === "done" || progress.phase === "error") {
        clearInterval(interval);
        res.end();
      }
    }
  }, POLL_MS);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}
