import * as cheerio from "cheerio";

export interface ScrapeResult {
  title: string;
  content: string;
  error?: string;
  suggestion?: string;
}

/**
 * Scrape text content from a URL
 */
export async function scrapeURL(url: string): Promise<ScrapeResult> {
  try {
    // Validate URL
    const urlObj = new URL(url);

    // Check if LinkedIn (special handling)
    if (urlObj.hostname.includes("linkedin.com")) {
      return {
        title: "LinkedIn Profile",
        content: "",
        error: "LinkedIn protects their data with anti-scraping measures",
        suggestion:
          "Please use the 'Save to PDF' feature on your LinkedIn profile and upload the file instead.",
      };
    }

    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CareerswarmBot/1.0)",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        title: urlObj.hostname,
        content: "",
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();

    // Load HTML into cheerio
    const $ = cheerio.load(html);

    // Remove script and style tags
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    $("iframe").remove();

    // Extract title
    const title = $("title").text().trim() || urlObj.hostname;

    // Extract body text
    let content = $("body").text();

    // Clean up whitespace
    content = content
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, "\n") // Remove empty lines
      .trim();

    // Check if content is too short (likely blocked or empty page)
    if (content.length < 100) {
      return {
        title,
        content: "",
        error:
          "Extracted content is too short. The page may be protected or empty.",
        suggestion:
          "Try using 'Save as PDF' in your browser and upload the file instead.",
      };
    }

    return {
      title,
      content,
    };
  } catch (error: any) {
    console.error("[URL Scraper] Error:", error.message);

    if (error.name === "TypeError" && error.message.includes("Invalid URL")) {
      return {
        title: "",
        content: "",
        error: "Invalid URL format",
      };
    }

    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return {
        title: "",
        content: "",
        error:
          "Request timed out. The website may be slow or blocking requests.",
      };
    }

    return {
      title: "",
      content: "",
      error: error.message || "Failed to scrape URL",
    };
  }
}
