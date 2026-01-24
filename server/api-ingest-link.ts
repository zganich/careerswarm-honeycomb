import express, { Request, Response } from "express";
import { scrapeURL } from "./url-scraper";
import { createSourceMaterial } from "./db";
import { sdk } from "./_core/sdk";

const router = express.Router();

interface LinkIngestRequest {
  url: string;
}

interface LinkIngestResponse {
  success: boolean;
  title?: string;
  id?: number;
  error?: string;
  suggestion?: string;
}

/**
 * POST /api/ingest/link
 * Scrape and ingest content from a URL
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Get authenticated user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate request body
    const { url } = req.body as LinkIngestRequest;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    // Scrape URL
    const scrapeResult = await scrapeURL(url);

    // Check for errors
    if (scrapeResult.error || !scrapeResult.content) {
      return res.status(200).json({
        success: false,
        title: scrapeResult.title,
        error: scrapeResult.error || "Failed to scrape URL",
        suggestion: scrapeResult.suggestion,
      } as LinkIngestResponse);
    }

    // Calculate word count
    const wordCount = scrapeResult.content.split(/\s+/).length;

    // Extract domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Save to database
    const id = await createSourceMaterial({
      userId: user.id,
      type: "URL",
      title: scrapeResult.title,
      content: scrapeResult.content,
      metadata: {
        url,
        domain,
        scrapedAt: new Date().toISOString(),
        wordCount,
      },
    });

    return res.status(200).json({
      success: true,
      title: scrapeResult.title,
      id,
    } as LinkIngestResponse);
  } catch (error: any) {
    console.error("[Ingest Link] Unexpected error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
