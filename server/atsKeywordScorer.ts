/**
 * ATS Keyword Scorer
 *
 * Extracts keywords from job descriptions and scores resume text
 * for ATS compatibility (0-100).
 */

import { atsKeywords } from "../scripts/seed-data";

const COMMON_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "must",
  "can",
]);

/** Extract meaningful keywords from text (JD or resume) */
export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !COMMON_WORDS.has(w));

  const phrases =
    text
      .toLowerCase()
      .match(/\b[\w\s-]{3,30}\b/g)
      ?.map(p => p.trim())
      .filter(
        p => p.length >= 4 && !COMMON_WORDS.has(p.split(/\s+/)[0] || "")
      ) ?? [];

  const keywords = new Set<string>();

  words.forEach(w => keywords.add(w));

  atsKeywords
    .filter(ak => text.toLowerCase().includes(ak.keyword.toLowerCase()))
    .forEach(ak => keywords.add(ak.keyword));

  return Array.from(keywords);
}

/**
 * Score resume text against JD keywords.
 * Returns 0-100: % of JD keywords found in resume.
 */
export function scoreResumeAgainstJD(
  resumeText: string,
  jobDescription: string
): { score: number; matchedKeywords: string[]; totalKeywords: number } {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matchedKeywords = jdKeywords.filter(kw =>
    resumeLower.includes(kw.toLowerCase())
  );

  const totalKeywords = jdKeywords.length || 1;
  const score = Math.min(
    100,
    Math.round((matchedKeywords.length / totalKeywords) * 100)
  );

  return {
    score,
    matchedKeywords,
    totalKeywords,
  };
}

/**
 * Get JD keywords + relevant ATS keywords for Tailor prompt injection.
 */
export function getKeywordHintsForPrompt(jobDescription: string): string[] {
  const jdKeywords = extractKeywords(jobDescription);
  const jdLower = jobDescription.toLowerCase();

  const relevantAts = atsKeywords
    .filter(ak => jdLower.includes(ak.keyword.toLowerCase()))
    .map(ak => ak.keyword);

  const combined = new Set([...jdKeywords, ...relevantAts]);
  return Array.from(combined).slice(0, 50);
}
