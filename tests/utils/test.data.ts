/**
 * Centralized test data constants for Playwright E2E tests
 * Use these to ensure consistency across test suites
 */

export const SAMPLE_STAR_ACHIEVEMENTS = [
  {
    situation:
      "Led a cross-functional team to migrate legacy monolith to microservices",
    task: "Reduce deployment time and improve system reliability",
    action:
      "Architected and implemented containerized microservices using Docker and Kubernetes, established CI/CD pipeline with GitHub Actions",
    result:
      "Reduced deployment time by 75% (from 2 hours to 30 minutes), decreased system downtime by 90%, enabled independent team deployments",
    skills: [
      "Kubernetes",
      "Docker",
      "Microservices",
      "CI/CD",
      "System Architecture",
    ],
  },
  {
    situation: "Company faced declining user engagement (30% drop in 6 months)",
    task: "Identify root causes and implement data-driven improvements",
    action:
      "Conducted user interviews, analyzed behavioral data with Mixpanel, A/B tested 12 UX improvements",
    result:
      "Increased user engagement by 45%, improved retention rate from 35% to 52%, generated $2.3M additional revenue",
    skills: [
      "Product Analytics",
      "A/B Testing",
      "User Research",
      "Data-Driven Decision Making",
    ],
  },
  {
    situation:
      "Manual data entry process consuming 20 hours/week across 5 team members",
    task: "Automate repetitive data processing workflow",
    action:
      "Built Python automation script with pandas and requests library, integrated with Salesforce API",
    result:
      "Eliminated 100 hours/month of manual work, reduced data entry errors by 95%, saved $150K annually in labor costs",
    skills: ["Python", "Automation", "API Integration", "Process Optimization"],
  },
];

export const WEAK_RESUME_BULLETS = [
  "Worked on improving website performance",
  "Helped with customer support tickets",
  "Participated in team meetings and code reviews",
  "Responsible for maintaining database",
];

export const SAMPLE_JOB_DESCRIPTIONS = {
  seniorSoftwareEngineer: {
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    url: "https://example.com/jobs/senior-engineer",
    description: `
We are seeking a Senior Software Engineer to join our Platform team. You will design and build scalable backend systems that power our SaaS product used by 10M+ users.

Responsibilities:
- Design and implement RESTful APIs and microservices
- Optimize database queries and system performance
- Mentor junior engineers and conduct code reviews
- Collaborate with product and design teams

Requirements:
- 5+ years of software engineering experience
- Strong proficiency in Node.js, Python, or Go
- Experience with PostgreSQL, Redis, and message queues
- Kubernetes and Docker experience preferred
- Bachelor's degree in Computer Science or equivalent

Benefits: Competitive salary, equity, health insurance, remote work
    `.trim(),
    keywords: [
      "Node.js",
      "Python",
      "PostgreSQL",
      "Kubernetes",
      "Docker",
      "Microservices",
      "RESTful API",
    ],
  },

  productManager: {
    title: "Senior Product Manager",
    company: "GrowthCo",
    url: "https://example.com/jobs/product-manager",
    description: `
Join our product team to drive strategy and execution for our B2B SaaS platform. You will own the roadmap for our analytics product line.

Responsibilities:
- Define product vision and strategy
- Conduct user research and competitive analysis
- Prioritize features based on impact and effort
- Work closely with engineering and design teams
- Track KPIs and iterate based on data

Requirements:
- 4+ years of product management experience
- Strong analytical and data-driven decision making
- Experience with B2B SaaS products
- Excellent communication and stakeholder management
- MBA or technical background preferred

Benefits: $150K-$200K base + equity, unlimited PTO
    `.trim(),
    keywords: [
      "Product Strategy",
      "User Research",
      "B2B SaaS",
      "Data-Driven",
      "Stakeholder Management",
    ],
  },
};

export const TEST_USERS = {
  free: {
    email: "test-free@careerswarm.test",
    name: "Free Tier User",
    role: "user" as const,
    subscriptionTier: "free" as const,
  },
  pro: {
    email: "test-pro@careerswarm.test",
    name: "Pro Tier User",
    role: "user" as const,
    subscriptionTier: "pro" as const,
  },
  admin: {
    email: "test-admin@careerswarm.test",
    name: "Admin User",
    role: "admin" as const,
    subscriptionTier: "pro" as const,
  },
};

export const STRIPE_TEST_CARDS = {
  success: "4242424242424242",
  decline: "4000000000000002",
  requiresAuth: "4000002500003155",
};

export const CAREER_SCORE_INPUTS = {
  currentRole: "Software Engineer",
  targetRole: "Senior Software Engineer",
  yearsExperience: 3,
};
