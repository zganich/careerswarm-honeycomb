/**
 * Resume template types and configurations
 */

export type ResumeTemplate = "modern" | "classic" | "tech";

export interface TemplateConfig {
  id: ResumeTemplate;
  name: string;
  description: string;
  preview: string; // Preview image URL
  features: string[];
  bestFor: string[];
}

export const RESUME_TEMPLATES: Record<ResumeTemplate, TemplateConfig> = {
  modern: {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, contemporary design with subtle color accents. Perfect for creative and tech roles.",
    preview: "/templates/modern-preview.png",
    features: [
      "Two-column layout",
      "Color-coded sections",
      "Icon support",
      "Skills bar visualization",
      "ATS-friendly structure"
    ],
    bestFor: ["Tech", "Marketing", "Design", "Startups"]
  },
  classic: {
    id: "classic",
    name: "Classic Executive",
    description: "Traditional, professional format. Ideal for corporate and executive positions.",
    preview: "/templates/classic-preview.png",
    features: [
      "Single-column layout",
      "Conservative typography",
      "Emphasis on experience",
      "Formal section headers",
      "Maximum ATS compatibility"
    ],
    bestFor: ["Finance", "Legal", "Healthcare", "Government"]
  },
  tech: {
    id: "tech",
    name: "Tech Stack",
    description: "Developer-focused layout with emphasis on technical skills and projects.",
    preview: "/templates/tech-preview.png",
    features: [
      "GitHub/portfolio links prominent",
      "Technical skills matrix",
      "Project highlights section",
      "Code-friendly formatting",
      "Dark mode option"
    ],
    bestFor: ["Software Engineering", "DevOps", "Data Science", "Cybersecurity"]
  }
};

/**
 * Resume section order by template
 */
export const TEMPLATE_SECTION_ORDER: Record<ResumeTemplate, string[]> = {
  modern: [
    "header",
    "summary",
    "skills",
    "experience",
    "education",
    "achievements",
    "certifications"
  ],
  classic: [
    "header",
    "summary",
    "experience",
    "education",
    "skills",
    "achievements",
    "certifications"
  ],
  tech: [
    "header",
    "summary",
    "skills",
    "projects",
    "experience",
    "education",
    "certifications"
  ]
};

/**
 * Template-specific styling configurations
 */
export interface TemplateStyles {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: {
    name: string;
    title: string;
    heading: string;
    body: string;
  };
  spacing: {
    section: string;
    item: string;
  };
  layout: "single-column" | "two-column";
}

export const TEMPLATE_STYLES: Record<ResumeTemplate, TemplateStyles> = {
  modern: {
    primaryColor: "#2563eb", // Blue
    secondaryColor: "#64748b", // Slate
    accentColor: "#3b82f6",
    fontFamily: "'Inter', sans-serif",
    fontSize: {
      name: "28px",
      title: "11px",
      heading: "14px",
      body: "10px"
    },
    spacing: {
      section: "16px",
      item: "8px"
    },
    layout: "two-column"
  },
  classic: {
    primaryColor: "#1e293b", // Dark slate
    secondaryColor: "#475569",
    accentColor: "#334155",
    fontFamily: "'Times New Roman', serif",
    fontSize: {
      name: "24px",
      title: "10px",
      heading: "12px",
      body: "10px"
    },
    spacing: {
      section: "12px",
      item: "6px"
    },
    layout: "single-column"
  },
  tech: {
    primaryColor: "#10b981", // Green
    secondaryColor: "#6b7280",
    accentColor: "#059669",
    fontFamily: "'Roboto Mono', monospace",
    fontSize: {
      name: "26px",
      title: "10px",
      heading: "13px",
      body: "9px"
    },
    spacing: {
      section: "14px",
      item: "7px"
    },
    layout: "two-column"
  }
};
