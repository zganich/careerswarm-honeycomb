/**
 * Scout Agent - Job Scraping & Discovery
 * 
 * Responsibilities:
 * - Scrape jobs from LinkedIn, Indeed, Glassdoor
 * - Deduplicate job listings
 * - Extract structured job data
 * - Cache results for 24 hours
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { cacheGetOrSet, cacheKey, CachePrefix, CacheTTL } from "../cache";
import type { InsertJob } from "../../drizzle/schema";

export interface ScrapedJob {
  title: string;
  companyName: string;
  location: string;
  jobUrl: string;
  description: string;
  platform: "linkedin" | "indeed" | "glassdoor";
  postedDate?: Date;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string;
  experienceLevel?: string;
}

/**
 * Scrape jobs from LinkedIn
 */
export async function scrapeLinkedIn(
  keywords: string,
  location?: string,
  limit: number = 25
): Promise<ScrapedJob[]> {
  const cacheKeyStr = cacheKey(
    CachePrefix.JOB_LISTING,
    "linkedin",
    keywords,
    location || "remote"
  );

  return cacheGetOrSet(
    cacheKeyStr,
    async () => {
      // In production, use LinkedIn API or scraping service
      // For MVP, return mock data
      const jobs: ScrapedJob[] = [];

      for (let i = 0; i < Math.min(limit, 10); i++) {
        jobs.push({
          title: `${keywords} Engineer ${i + 1}`,
          companyName: `Tech Company ${i + 1}`,
          location: location || "Remote",
          jobUrl: `https://linkedin.com/jobs/view/${Math.random().toString(36).substring(7)}`,
          description: `We are looking for a talented ${keywords} professional to join our team. Requirements: 3+ years experience, strong problem-solving skills.`,
          platform: "linkedin",
          postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          salaryMin: 80000 + Math.floor(Math.random() * 50000),
          salaryMax: 120000 + Math.floor(Math.random() * 80000),
          employmentType: "full-time",
          experienceLevel: "mid-level",
        });
      }

      return jobs;
    },
    CacheTTL.JOB_LISTING
  );
}

/**
 * Scrape jobs from Indeed
 */
export async function scrapeIndeed(
  keywords: string,
  location?: string,
  limit: number = 25
): Promise<ScrapedJob[]> {
  const cacheKeyStr = cacheKey(
    CachePrefix.JOB_LISTING,
    "indeed",
    keywords,
    location || "remote"
  );

  return cacheGetOrSet(
    cacheKeyStr,
    async () => {
      // In production, use Indeed API or scraping service
      // For MVP, return mock data
      const jobs: ScrapedJob[] = [];

      for (let i = 0; i < Math.min(limit, 10); i++) {
        jobs.push({
          title: `${keywords} Specialist ${i + 1}`,
          companyName: `Company ${i + 1} Inc`,
          location: location || "Remote",
          jobUrl: `https://indeed.com/viewjob?jk=${Math.random().toString(36).substring(7)}`,
          description: `Join our team as a ${keywords} specialist. We offer competitive salary and benefits.`,
          platform: "indeed",
          postedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
          salaryMin: 70000 + Math.floor(Math.random() * 40000),
          salaryMax: 110000 + Math.floor(Math.random() * 70000),
          employmentType: "full-time",
          experienceLevel: "entry-level",
        });
      }

      return jobs;
    },
    CacheTTL.JOB_LISTING
  );
}

/**
 * Scrape jobs from Glassdoor
 */
export async function scrapeGlassdoor(
  keywords: string,
  location?: string,
  limit: number = 25
): Promise<ScrapedJob[]> {
  const cacheKeyStr = cacheKey(
    CachePrefix.JOB_LISTING,
    "glassdoor",
    keywords,
    location || "remote"
  );

  return cacheGetOrSet(
    cacheKeyStr,
    async () => {
      // In production, use Glassdoor API or scraping service
      // For MVP, return mock data
      const jobs: ScrapedJob[] = [];

      for (let i = 0; i < Math.min(limit, 10); i++) {
        jobs.push({
          title: `${keywords} Developer ${i + 1}`,
          companyName: `Startup ${i + 1}`,
          location: location || "Remote",
          jobUrl: `https://glassdoor.com/job-listing/${Math.random().toString(36).substring(7)}`,
          description: `Exciting opportunity for ${keywords} professionals. Great culture and growth potential.`,
          platform: "glassdoor",
          postedDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
          salaryMin: 85000 + Math.floor(Math.random() * 45000),
          salaryMax: 130000 + Math.floor(Math.random() * 90000),
          employmentType: "full-time",
          experienceLevel: "senior-level",
        });
      }

      return jobs;
    },
    CacheTTL.JOB_LISTING
  );
}

/**
 * Deduplicate jobs based on title and company
 */
export function deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
  const seen = new Set<string>();
  const unique: ScrapedJob[] = [];

  for (const job of jobs) {
    const key = `${job.title.toLowerCase().trim()}-${job.companyName.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  return unique;
}

/**
 * Scrape jobs from all platforms
 */
export async function scrapeAllPlatforms(
  keywords: string,
  location?: string,
  platforms: ("linkedin" | "indeed" | "glassdoor")[] = ["linkedin", "indeed", "glassdoor"]
): Promise<ScrapedJob[]> {
  const results = await Promise.all([
    platforms.includes("linkedin") ? scrapeLinkedIn(keywords, location) : Promise.resolve([]),
    platforms.includes("indeed") ? scrapeIndeed(keywords, location) : Promise.resolve([]),
    platforms.includes("glassdoor") ? scrapeGlassdoor(keywords, location) : Promise.resolve([]),
  ]);

  const allJobs = results.flat();
  return deduplicateJobs(allJobs);
}

/**
 * Convert scraped job to database format
 */
export function scrapedJobToInsert(job: ScrapedJob, userId: number): Omit<InsertJob, "id"> {
  return {
    userId,
    companyId: null,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    jobUrl: job.jobUrl,
    description: job.description,
    platform: job.platform,
    postedDate: job.postedDate || null,
    salaryMin: job.salaryMin || null,
    salaryMax: job.salaryMax || null,
    salaryCurrency: "USD",
    employmentType: job.employmentType || null,
    experienceLevel: job.experienceLevel || null,
    requiredSkills: null,
    preferredSkills: null,
    responsibilities: null,
    benefits: null,
    qualificationScore: null,
    matchedSkills: null,
    missingSkills: null,
    status: "new",
  };
}
