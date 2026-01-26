/**
 * Seed data for CareerSwarm database
 * Contains power verbs, skills taxonomy, and ATS keywords
 */

export const powerVerbs = [
  // Growth & Achievement
  { verb: "Accelerated", category: "growth", strength: "strong" },
  { verb: "Achieved", category: "growth", strength: "medium" },
  { verb: "Advanced", category: "growth", strength: "medium" },
  { verb: "Expanded", category: "growth", strength: "strong" },
  { verb: "Grew", category: "growth", strength: "medium" },
  { verb: "Increased", category: "growth", strength: "strong" },
  { verb: "Scaled", category: "growth", strength: "strong" },
  
  // Technical & Building
  { verb: "Architected", category: "technical", strength: "strong" },
  { verb: "Built", category: "technical", strength: "medium" },
  { verb: "Created", category: "technical", strength: "medium" },
  { verb: "Designed", category: "technical", strength: "medium" },
  { verb: "Developed", category: "technical", strength: "medium" },
  { verb: "Engineered", category: "technical", strength: "strong" },
  { verb: "Implemented", category: "technical", strength: "medium" },
  { verb: "Programmed", category: "technical", strength: "medium" },
  
  // Leadership & Management
  { verb: "Directed", category: "leadership", strength: "strong" },
  { verb: "Led", category: "leadership", strength: "strong" },
  { verb: "Managed", category: "leadership", strength: "medium" },
  { verb: "Mentored", category: "leadership", strength: "medium" },
  { verb: "Supervised", category: "leadership", strength: "medium" },
  { verb: "Trained", category: "leadership", strength: "medium" },
  
  // Efficiency & Optimization
  { verb: "Automated", category: "efficiency", strength: "strong" },
  { verb: "Optimized", category: "efficiency", strength: "strong" },
  { verb: "Reduced", category: "efficiency", strength: "strong" },
  { verb: "Streamlined", category: "efficiency", strength: "strong" },
  { verb: "Improved", category: "efficiency", strength: "medium" },
];

export const skillsTaxonomy = [
  // Technical Skills
  { skill: "Python", category: "Technical", subcategory: "Programming Languages" },
  { skill: "JavaScript", category: "Technical", subcategory: "Programming Languages" },
  { skill: "TypeScript", category: "Technical", subcategory: "Programming Languages" },
  { skill: "Java", category: "Technical", subcategory: "Programming Languages" },
  { skill: "C++", category: "Technical", subcategory: "Programming Languages" },
  { skill: "React", category: "Technical", subcategory: "Frontend Frameworks" },
  { skill: "Node.js", category: "Technical", subcategory: "Backend Frameworks" },
  { skill: "SQL", category: "Technical", subcategory: "Databases" },
  { skill: "PostgreSQL", category: "Technical", subcategory: "Databases" },
  { skill: "MongoDB", category: "Technical", subcategory: "Databases" },
  { skill: "AWS", category: "Technical", subcategory: "Cloud Platforms" },
  { skill: "Azure", category: "Technical", subcategory: "Cloud Platforms" },
  { skill: "Docker", category: "Technical", subcategory: "DevOps" },
  { skill: "Kubernetes", category: "Technical", subcategory: "DevOps" },
  
  // Business Skills
  { skill: "Project Management", category: "Business", subcategory: "Management" },
  { skill: "Agile/Scrum", category: "Business", subcategory: "Methodologies" },
  { skill: "Data Analysis", category: "Business", subcategory: "Analytics" },
  { skill: "Financial Modeling", category: "Business", subcategory: "Finance" },
  { skill: "Strategic Planning", category: "Business", subcategory: "Strategy" },
  { skill: "Business Development", category: "Business", subcategory: "Growth" },
  
  // Product Skills
  { skill: "Product Strategy", category: "Product", subcategory: "Strategy" },
  { skill: "User Research", category: "Product", subcategory: "Research" },
  { skill: "A/B Testing", category: "Product", subcategory: "Experimentation" },
  { skill: "Product Analytics", category: "Product", subcategory: "Analytics" },
  { skill: "Roadmap Planning", category: "Product", subcategory: "Planning" },
  
  // Leadership Skills
  { skill: "Team Leadership", category: "Leadership", subcategory: "Management" },
  { skill: "Stakeholder Management", category: "Leadership", subcategory: "Communication" },
  { skill: "Cross-functional Collaboration", category: "Leadership", subcategory: "Collaboration" },
  { skill: "Mentoring", category: "Leadership", subcategory: "Development" },
  { skill: "Conflict Resolution", category: "Leadership", subcategory: "Management" },
];

export const atsKeywords = [
  // Common ATS keywords by category
  { keyword: "results-driven", category: "General", importance: "high" },
  { keyword: "team player", category: "General", importance: "medium" },
  { keyword: "problem solver", category: "General", importance: "high" },
  { keyword: "detail-oriented", category: "General", importance: "medium" },
  { keyword: "self-starter", category: "General", importance: "medium" },
  { keyword: "fast-paced environment", category: "General", importance: "medium" },
  { keyword: "cross-functional", category: "General", importance: "high" },
  { keyword: "stakeholder management", category: "General", importance: "high" },
  { keyword: "data-driven", category: "General", importance: "high" },
  { keyword: "continuous improvement", category: "General", importance: "medium" },
  
  // Technical keywords
  { keyword: "full-stack", category: "Technical", importance: "high" },
  { keyword: "microservices", category: "Technical", importance: "high" },
  { keyword: "CI/CD", category: "Technical", importance: "high" },
  { keyword: "RESTful API", category: "Technical", importance: "high" },
  { keyword: "machine learning", category: "Technical", importance: "high" },
  { keyword: "cloud architecture", category: "Technical", importance: "high" },
  { keyword: "scalability", category: "Technical", importance: "high" },
  { keyword: "security best practices", category: "Technical", importance: "high" },
  
  // Business keywords
  { keyword: "revenue growth", category: "Business", importance: "high" },
  { keyword: "cost reduction", category: "Business", importance: "high" },
  { keyword: "ROI", category: "Business", importance: "high" },
  { keyword: "KPIs", category: "Business", importance: "high" },
  { keyword: "market analysis", category: "Business", importance: "medium" },
  { keyword: "competitive advantage", category: "Business", importance: "medium" },
];
