export const achievementTemplates = [
  {
    category: "Engineering",
    role: "Software Engineer",
    templates: [
      {
        title: "Performance Optimization",
        situation: "System performance was degraded, causing slow response times",
        task: "Improve system performance to meet SLA requirements",
        action: "Profiled the application, identified bottlenecks, and optimized database queries",
        result: "Reduced average response time by [X]% and improved user satisfaction scores",
      },
      {
        title: "Feature Launch",
        situation: "Product needed a new feature to compete with market leaders",
        task: "Design and implement the feature within tight deadline",
        action: "Collaborated with PM and design, built scalable architecture, wrote comprehensive tests",
        result: "Launched feature on time, resulting in [X]% increase in user engagement",
      },
      {
        title: "Technical Debt Reduction",
        situation: "Legacy codebase was slowing down development velocity",
        task: "Refactor critical components without breaking existing functionality",
        action: "Incrementally rewrote modules, added test coverage, documented architecture",
        result: "Reduced bug rate by [X]% and decreased feature development time by [X] days",
      },
    ],
  },
  {
    category: "Product Management",
    role: "Product Manager",
    templates: [
      {
        title: "Product Launch",
        situation: "Market opportunity identified for new product line",
        task: "Define product strategy and lead cross-functional team to launch",
        action: "Conducted user research, created roadmap, coordinated with engineering and design",
        result: "Launched product that achieved [X] users and $[X] revenue in first quarter",
      },
      {
        title: "Feature Prioritization",
        situation: "Multiple stakeholders requesting conflicting features",
        task: "Establish data-driven prioritization framework",
        action: "Analyzed user data, conducted A/B tests, created scoring model",
        result: "Increased feature adoption by [X]% and reduced development waste by [X]%",
      },
    ],
  },
  {
    category: "Design",
    role: "Product Designer",
    templates: [
      {
        title: "UX Redesign",
        situation: "User research showed poor usability scores for key workflow",
        task: "Redesign the experience to improve user satisfaction",
        action: "Conducted usability testing, created prototypes, iterated based on feedback",
        result: "Improved task completion rate by [X]% and NPS score by [X] points",
      },
      {
        title: "Design System",
        situation: "Inconsistent UI across products causing brand confusion",
        task: "Create unified design system for all products",
        action: "Audited existing patterns, built component library, documented guidelines",
        result: "Reduced design-to-development time by [X]% and improved brand consistency",
      },
    ],
  },
  {
    category: "Leadership",
    role: "Engineering Manager",
    templates: [
      {
        title: "Team Building",
        situation: "Team was understaffed and struggling to meet deadlines",
        task: "Grow team while maintaining quality and culture",
        action: "Defined hiring criteria, conducted interviews, onboarded new members",
        result: "Grew team from [X] to [X] engineers, maintained [X]% retention rate",
      },
      {
        title: "Process Improvement",
        situation: "Team velocity was low due to inefficient processes",
        task: "Implement agile practices to improve delivery speed",
        action: "Introduced sprint planning, daily standups, retrospectives",
        result: "Increased sprint velocity by [X]% and reduced missed deadlines by [X]%",
      },
    ],
  },
  {
    category: "Sales & Marketing",
    role: "Sales Manager",
    templates: [
      {
        title: "Revenue Growth",
        situation: "Sales targets were not being met in key territory",
        task: "Develop strategy to increase revenue in underperforming region",
        action: "Analyzed market data, trained sales team, implemented new outreach tactics",
        result: "Increased regional revenue by [X]% and closed [X] new enterprise deals",
      },
    ],
  },
  {
    category: "Operations",
    role: "Operations Manager",
    templates: [
      {
        title: "Cost Reduction",
        situation: "Operating costs were exceeding budget projections",
        task: "Identify and implement cost-saving measures",
        action: "Analyzed spending patterns, renegotiated vendor contracts, automated manual processes",
        result: "Reduced operational costs by [X]% ($[X]) while maintaining service quality",
      },
    ],
  },
];

export function getTemplatesByRole(role: string) {
  const normalized = role.toLowerCase();
  return achievementTemplates.filter(cat => 
    cat.role.toLowerCase().includes(normalized) || 
    cat.category.toLowerCase().includes(normalized)
  );
}

export function getAllTemplates() {
  return achievementTemplates;
}
