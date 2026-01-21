import * as cheerio from "cheerio";

/**
 * Scrape job description from URL
 * Supports LinkedIn, Indeed, and generic job pages
 */
export async function scrapeJobDescription(url: string): Promise<{
  title?: string;
  company?: string;
  description: string;
  raw: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and navigation
    $("script, style, nav, header, footer, aside").remove();

    let title = "";
    let company = "";
    let description = "";

    // LinkedIn-specific selectors
    if (url.includes("linkedin.com")) {
      title = $("h1.top-card-layout__title, h1.topcard__title").text().trim();
      company = $("a.topcard__org-name-link, span.topcard__flavor").text().trim();
      description = $(".description__text, .show-more-less-html__markup").text().trim();
    }
    // Indeed-specific selectors
    else if (url.includes("indeed.com")) {
      title = $("h1.jobsearch-JobInfoHeader-title, h1").first().text().trim();
      company = $(".jobsearch-InlineCompanyRating-companyHeader a, .icl-u-lg-mr--sm").text().trim();
      description = $("#jobDescriptionText, .jobsearch-jobDescriptionText").text().trim();
    }
    // Generic fallback
    else {
      // Try common patterns
      title = $("h1").first().text().trim() || $('[class*="title"], [class*="Title"]').first().text().trim();
      company = $('[class*="company"], [class*="Company"]').first().text().trim();
      
      // Get main content - try multiple strategies
      const mainContent = $("main").text() || $('[role="main"]').text() || $("article").text() || $("body").text();
      description = mainContent.trim();
    }

    // Clean up whitespace
    description = description.replace(/\s+/g, " ").trim();

    return {
      title: title || undefined,
      company: company || undefined,
      description,
      raw: html,
    };
  } catch (error) {
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Extract job description from raw text
 * Useful for pasted content or email parsing
 */
export function extractJobInfo(text: string): {
  title?: string;
  company?: string;
  description: string;
} {
  // Try to extract title (usually first line or after "Position:" etc.)
  const titleMatch = text.match(/(?:Position|Role|Title|Job):\s*(.+)/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // Try to extract company
  const companyMatch = text.match(/(?:Company|Organization|Employer):\s*(.+)/i);
  const company = companyMatch ? companyMatch[1].trim() : undefined;

  return {
    title,
    company,
    description: text.trim(),
  };
}
