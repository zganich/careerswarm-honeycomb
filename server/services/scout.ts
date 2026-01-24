/**
 * Scout Agent - Job Scraper Service
 * 
 * This service searches external job boards (LinkedIn, Indeed, Glassdoor) for matching opportunities.
 * Currently implements a mock scraper with realistic dummy data.
 * Future: Integrate with ZenRows or scraping proxy for real data.
 */

export interface JobRaw {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  postedDate?: string;
  employmentType?: string;
  experienceLevel?: string;
}

/**
 * Mock job database with realistic variety
 * Includes different seniority levels, companies, and locations
 */
const MOCK_JOBS: JobRaw[] = [
  {
    title: "Senior Software Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    salary: "$180,000 - $250,000",
    description: "Join Stripe's Payments Infrastructure team to build scalable systems processing billions of dollars. We're looking for experienced engineers who can design distributed systems, reduce technical debt, and mentor junior developers. Must have 5+ years of experience with microservices, Kubernetes, and high-throughput systems.",
    url: "https://stripe.com/jobs/senior-software-engineer",
    postedDate: "2 days ago",
    employmentType: "Full-time",
    experienceLevel: "Senior",
  },
  {
    title: "Staff Product Manager",
    company: "Airbnb",
    location: "Remote",
    salary: "$200,000 - $280,000",
    description: "Lead product strategy for Airbnb's Host Tools platform. Drive 0-to-1 product development, work with cross-functional teams, and define metrics for success. Looking for someone with 7+ years PM experience, strong technical background, and proven track record of launching successful products at scale.",
    url: "https://airbnb.com/careers/staff-pm",
    postedDate: "1 week ago",
    employmentType: "Full-time",
    experienceLevel: "Staff",
  },
  {
    title: "Junior Frontend Developer",
    company: "Shopify",
    location: "Toronto, ON",
    salary: "$70,000 - $95,000",
    description: "Join Shopify's merchant experience team as a junior frontend developer. Build React components, work with design systems, and learn from senior engineers. Looking for 1-2 years of experience with JavaScript, React, and CSS. Great opportunity for early-career developers.",
    url: "https://shopify.com/careers/junior-frontend",
    postedDate: "3 days ago",
    employmentType: "Full-time",
    experienceLevel: "Junior",
  },
  {
    title: "Principal Engineer - Infrastructure",
    company: "Netflix",
    location: "Los Gatos, CA",
    salary: "$300,000 - $450,000",
    description: "Lead Netflix's cloud infrastructure evolution. Design systems serving 200M+ users, mentor engineering teams, and set technical direction. Must have 12+ years of experience, deep expertise in distributed systems, and proven ability to drive org-wide technical initiatives.",
    url: "https://netflix.com/jobs/principal-engineer",
    postedDate: "5 days ago",
    employmentType: "Full-time",
    experienceLevel: "Principal",
  },
  {
    title: "Senior Product Designer",
    company: "Figma",
    location: "San Francisco, CA",
    salary: "$160,000 - $220,000",
    description: "Design the future of collaborative design tools. Work on Figma's core editing experience, conduct user research, and collaborate with engineering. Looking for 5+ years of product design experience, strong portfolio, and expertise in design systems.",
    url: "https://figma.com/careers/senior-designer",
    postedDate: "1 day ago",
    employmentType: "Full-time",
    experienceLevel: "Senior",
  },
  {
    title: "Software Engineer II",
    company: "Microsoft",
    location: "Redmond, WA",
    salary: "$130,000 - $180,000",
    description: "Join Microsoft Azure's compute team. Build features for virtual machines, work with C++ and distributed systems, and collaborate with teams worldwide. Looking for 3-5 years of experience with systems programming and cloud infrastructure.",
    url: "https://microsoft.com/careers/swe-ii",
    postedDate: "4 days ago",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
  },
  {
    title: "VP of Engineering",
    company: "Notion",
    location: "San Francisco, CA",
    salary: "$350,000 - $500,000",
    description: "Lead Notion's engineering organization (100+ engineers). Set technical vision, build scalable teams, and drive product execution. Must have 15+ years of experience including 5+ years in engineering leadership at high-growth startups.",
    url: "https://notion.so/careers/vp-engineering",
    postedDate: "2 weeks ago",
    employmentType: "Full-time",
    experienceLevel: "Executive",
  },
  {
    title: "Senior Data Scientist",
    company: "Uber",
    location: "San Francisco, CA",
    salary: "$170,000 - $240,000",
    description: "Build ML models for Uber's pricing and marketplace optimization. Work with petabyte-scale data, deploy models to production, and drive business impact. Looking for PhD or 5+ years of industry experience with Python, SQL, and ML frameworks.",
    url: "https://uber.com/careers/senior-data-scientist",
    postedDate: "6 days ago",
    employmentType: "Full-time",
    experienceLevel: "Senior",
  },
  {
    title: "Product Manager",
    company: "Slack",
    location: "Remote",
    salary: "$140,000 - $190,000",
    description: "Own Slack's notifications and settings experience. Define product roadmap, work with design and engineering, and analyze user feedback. Looking for 3-5 years of PM experience, strong analytical skills, and passion for developer tools.",
    url: "https://slack.com/careers/product-manager",
    postedDate: "1 week ago",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
  },
  {
    title: "Senior Backend Engineer",
    company: "DoorDash",
    location: "New York, NY",
    salary: "$175,000 - $245,000",
    description: "Build DoorDash's logistics platform. Design APIs, optimize database queries, and improve system reliability. Must have 5+ years of backend experience with Java/Go, microservices, and SQL/NoSQL databases.",
    url: "https://doordash.com/careers/senior-backend",
    postedDate: "3 days ago",
    employmentType: "Full-time",
    experienceLevel: "Senior",
  },
  {
    title: "Engineering Manager",
    company: "GitHub",
    location: "Remote",
    salary: "$190,000 - $260,000",
    description: "Lead a team of 6-8 engineers building GitHub Actions. Manage performance, mentor team members, and collaborate with product. Looking for 3+ years of management experience and strong technical background.",
    url: "https://github.com/careers/engineering-manager",
    postedDate: "5 days ago",
    employmentType: "Full-time",
    experienceLevel: "Manager",
  },
  {
    title: "Senior DevOps Engineer",
    company: "Coinbase",
    location: "Remote",
    salary: "$165,000 - $230,000",
    description: "Build and maintain Coinbase's infrastructure. Work with Kubernetes, Terraform, and AWS. Improve deployment pipelines and system reliability. Must have 5+ years of DevOps experience and strong security mindset.",
    url: "https://coinbase.com/careers/senior-devops",
    postedDate: "2 days ago",
    employmentType: "Full-time",
    experienceLevel: "Senior",
  },
  {
    title: "Staff Software Engineer",
    company: "Square",
    location: "San Francisco, CA",
    salary: "$220,000 - $310,000",
    description: "Lead technical initiatives across Square's payments platform. Design system architecture, mentor engineers, and drive technical excellence. Looking for 8+ years of experience with distributed systems and proven leadership.",
    url: "https://square.com/careers/staff-engineer",
    postedDate: "1 week ago",
    employmentType: "Full-time",
    experienceLevel: "Staff",
  },
  {
    title: "Senior Mobile Engineer (iOS)",
    company: "Instagram",
    location: "Menlo Park, CA",
    salary: "$180,000 - $250,000",
    description: "Build Instagram's iOS app used by billions. Work with Swift, optimize performance, and collaborate with design. Must have 5+ years of iOS development experience and strong understanding of mobile architecture.",
    url: "https://instagram.com/careers/senior-ios",
    postedDate: "4 days ago",
    employmentType: "Full-time",
    experienceLevel: "Senior",
  },
  {
    title: "Principal Product Manager",
    company: "Atlassian",
    location: "Sydney, Australia",
    salary: "$180,000 - $250,000 AUD",
    description: "Lead product strategy for Jira's enterprise offerings. Define long-term vision, work with executive team, and drive multi-quarter initiatives. Looking for 10+ years of PM experience with enterprise B2B products.",
    url: "https://atlassian.com/careers/principal-pm",
    postedDate: "1 week ago",
    employmentType: "Full-time",
    experienceLevel: "Principal",
  },
];

/**
 * Search for jobs matching the given criteria
 * 
 * @param query - Job title or keywords (e.g., "Software Engineer", "Product Manager")
 * @param location - Location filter (e.g., "San Francisco", "Remote")
 * @returns Array of raw job listings
 */
export async function searchJobs(
  query: string,
  location?: string
): Promise<JobRaw[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Filter jobs based on query (case-insensitive)
  const queryLower = query.toLowerCase();
  let results = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(queryLower) ||
    job.description.toLowerCase().includes(queryLower)
  );

  // Filter by location if provided
  if (location) {
    const locationLower = location.toLowerCase();
    results = results.filter(job =>
      job.location.toLowerCase().includes(locationLower) ||
      job.location.toLowerCase() === "remote"
    );
  }

  // Return up to 15 results
  return results.slice(0, 15);
}

/**
 * Future: Real scraper implementation
 * 
 * async function searchJobsReal(query: string, location?: string): Promise<JobRaw[]> {
 *   const apiKey = process.env.ZENROWS_API_KEY;
 *   if (!apiKey) throw new Error("ZENROWS_API_KEY not configured");
 *   
 *   // Use ZenRows to scrape LinkedIn/Indeed
 *   const response = await axios.get(`https://api.zenrows.com/v1/`, {
 *     params: {
 *       url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`,
 *       apikey: apiKey,
 *       js_render: true,
 *     }
 *   });
 *   
 *   // Parse HTML and extract job listings
 *   const $ = cheerio.load(response.data);
 *   const jobs: JobRaw[] = [];
 *   
 *   $('.job-card').each((i, el) => {
 *     jobs.push({
 *       title: $(el).find('.job-title').text(),
 *       company: $(el).find('.company-name').text(),
 *       location: $(el).find('.location').text(),
 *       description: $(el).find('.description').text(),
 *       url: $(el).find('a').attr('href') || '',
 *     });
 *   });
 *   
 *   return jobs;
 * }
 */
