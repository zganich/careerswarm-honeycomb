import mammoth from "mammoth";
import { invokeLLM } from "./_core/llm";

// ================================================================
// TEXT EXTRACTION
// ================================================================

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid ESM issues
    const pdfParse = await import("pdf-parse");
    // @ts-ignore - pdf-parse has weird export structure
    const pdf = pdfParse.default || pdfParse;
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("[Resume Parser] PDF extraction failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("[Resume Parser] DOCX extraction failed:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

/**
 * Extract text from resume file based on MIME type
 */
export async function extractTextFromResume(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractTextFromPDF(buffer);
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return extractTextFromDOCX(buffer);
  } else if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

// ================================================================
// LLM-BASED PARSING
// ================================================================

interface ParsedWorkExperience {
  companyName: string;
  jobTitle: string;
  startDate: string; // YYYY-MM format
  endDate: string | null; // YYYY-MM format or null if current
  isCurrent: boolean;
  location: string;
  companyStage?: string;
  companyFunding?: string;
  companyIndustry?: string;
  companySizeEmployees?: number;
  roleOverview: string;
  achievements: ParsedAchievement[];
}

interface ParsedAchievement {
  description: string;
  context?: string;
  metricType?: string; // 'revenue', 'pipeline', 'efficiency', 'scale', 'innovation'
  metricValue?: number;
  metricUnit?: string; // 'percent', 'dollars', 'count'
  metricTimeframe?: string;
  keywords: string[];
  importanceScore: number; // 0-100
}

interface ParsedSkill {
  skillName: string;
  skillCategory: string; // 'technical', 'domain', 'soft', 'tools'
  proficiencyLevel?: string;
  yearsExperience?: number;
}

interface ParsedResume {
  workExperiences: ParsedWorkExperience[];
  skills: ParsedSkill[];
  certifications: Array<{ name: string; organization?: string; year?: number }>;
  education: Array<{
    degree?: string;
    field?: string;
    institution: string;
    graduationYear?: number;
  }>;
  awards: Array<{
    name: string;
    organization?: string;
    year?: number;
    context?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency?: string;
    isNative?: boolean;
  }>;
  volunteerExperiences: Array<{
    organization: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    url?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  }>;
  publications: Array<{
    title: string;
    publisherOrVenue?: string;
    year?: number;
    url?: string;
    context?: string;
  }>;
  securityClearances: Array<{
    clearanceType: string;
    level?: string;
    expiryDate?: string;
  }>;
  // Additional fields for Master Profile
  professionalSummary?: string;
  portfolioUrls?: string[];
  parsedContact?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  licenses?: Array<{ name: string; organization?: string; year?: number }>;
}

export type { ParsedResume };

/**
 * Parse work history and achievements from resume text using LLM
 */
export async function parseResumeWithLLM(
  resumeText: string
): Promise<ParsedResume> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert resume parser. Extract structured career data from resumes with high accuracy.

CRITICAL RULES:
1. Extract EVERY achievement with quantifiable metrics
2. Identify metric type (revenue, pipeline, efficiency, scale, innovation)
3. Extract numeric values and units precisely
4. Assign importance scores (0-100) based on impact and specificity
5. Generate relevant keywords for each achievement
6. Extract company context (stage, funding, industry, size)
7. Parse dates in YYYY-MM format
8. Identify current vs past roles
9. Extract skills with categories and proficiency
10. Extract certifications, education, and awards
11. Extract languages with proficiency levels (Native, Fluent, Conversational, Basic)
12. Extract volunteer experiences with organizations, roles, and impact
13. Extract personal/professional projects with descriptions and URLs
14. Extract publications (papers, articles, books) with publishers and years
15. Extract security clearances with types, levels, and expiry dates

Return valid JSON matching the schema.`,
      },
      {
        role: "user",
        content: `Parse this resume and extract all career data:\n\n${resumeText}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "parsed_resume",
        strict: true,
        schema: {
          type: "object",
          properties: {
            workExperiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  jobTitle: { type: "string" },
                  startDate: { type: "string", description: "YYYY-MM format" },
                  endDate: {
                    type: ["string", "null"],
                    description: "YYYY-MM format or null if current",
                  },
                  isCurrent: { type: "boolean" },
                  location: { type: "string" },
                  companyStage: { type: "string" },
                  companyFunding: { type: "string" },
                  companyIndustry: { type: "string" },
                  companySizeEmployees: { type: "number" },
                  roleOverview: { type: "string" },
                  achievements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        context: { type: "string" },
                        metricType: { type: "string" },
                        metricValue: { type: "number" },
                        metricUnit: { type: "string" },
                        metricTimeframe: { type: "string" },
                        keywords: { type: "array", items: { type: "string" } },
                        importanceScore: {
                          type: "number",
                          description: "0-100",
                        },
                      },
                      required: ["description", "keywords", "importanceScore"],
                      additionalProperties: false,
                    },
                  },
                },
                required: [
                  "companyName",
                  "jobTitle",
                  "startDate",
                  "isCurrent",
                  "location",
                  "roleOverview",
                  "achievements",
                ],
                additionalProperties: false,
              },
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skillName: { type: "string" },
                  skillCategory: { type: "string" },
                  proficiencyLevel: { type: "string" },
                  yearsExperience: { type: "number" },
                },
                required: ["skillName", "skillCategory"],
                additionalProperties: false,
              },
            },
            certifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  organization: { type: "string" },
                  year: { type: "number" },
                },
                required: ["name"],
                additionalProperties: false,
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  field: { type: "string" },
                  institution: { type: "string" },
                  graduationYear: { type: "number" },
                },
                required: ["institution"],
                additionalProperties: false,
              },
            },
            awards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  organization: { type: "string" },
                  year: { type: "number" },
                  context: { type: "string" },
                },
                required: ["name"],
                additionalProperties: false,
              },
            },
            languages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  language: { type: "string" },
                  proficiency: { type: "string" },
                  isNative: { type: "boolean" },
                },
                required: ["language"],
                additionalProperties: false,
              },
            },
            volunteerExperiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  organization: { type: "string" },
                  role: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  description: { type: "string" },
                },
                required: ["organization"],
                additionalProperties: false,
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" },
                  role: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                },
                required: ["name"],
                additionalProperties: false,
              },
            },
            publications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  publisherOrVenue: { type: "string" },
                  year: { type: "number" },
                  url: { type: "string" },
                  context: { type: "string" },
                },
                required: ["title"],
                additionalProperties: false,
              },
            },
            securityClearances: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clearanceType: { type: "string" },
                  level: { type: "string" },
                  expiryDate: { type: "string" },
                },
                required: ["clearanceType"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "workExperiences",
            "skills",
            "certifications",
            "education",
            "awards",
            "languages",
            "volunteerExperiences",
            "projects",
            "publications",
            "securityClearances",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== "string") {
    throw new Error("LLM returned empty response");
  }

  return JSON.parse(content) as ParsedResume;
}

/**
 * Generate top 3 "superpowers" from achievements
 */
export async function generateSuperpowers(
  achievements: ParsedAchievement[]
): Promise<Array<{ title: string; evidence: string }>> {
  // Get top achievements by importance score
  const topAchievements = achievements
    .sort((a, b) => b.importanceScore - a.importanceScore)
    .slice(0, 10);

  const achievementText = topAchievements
    .map((a, i) => `${i + 1}. ${a.description}`)
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a career branding expert. Analyze achievements and identify the candidate's top 3 unique strengths or "superpowers".

RULES:
1. Identify patterns across achievements
2. Focus on unique differentiators (not generic skills)
3. Use specific, memorable language
4. Provide concrete evidence from achievements
5. Make it compelling and authentic

Return JSON with 3 superpowers.`,
      },
      {
        role: "user",
        content: `Analyze these achievements and identify the top 3 superpowers:\n\n${achievementText}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "superpowers",
        strict: true,
        schema: {
          type: "object",
          properties: {
            superpowers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Short, memorable superpower title",
                  },
                  evidence: {
                    type: "string",
                    description: "Specific evidence from achievements",
                  },
                },
                required: ["title", "evidence"],
                additionalProperties: false,
              },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["superpowers"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== "string") {
    throw new Error("LLM returned empty response");
  }

  const result = JSON.parse(content) as {
    superpowers: Array<{ title: string; evidence: string }>;
  };
  return result.superpowers;
}

/**
 * Consolidate multiple parsed resumes into a single Master Profile
 */
export function consolidateResumes(
  parsedResumes: ParsedResume[]
): ParsedResume {
  if (parsedResumes.length === 0) {
    throw new Error("No resumes to consolidate");
  }

  if (parsedResumes.length === 1) {
    return parsedResumes[0];
  }

  // Merge work experiences (deduplicate by company + title + start date)
  const workExpMap = new Map<string, ParsedWorkExperience>();
  for (const resume of parsedResumes) {
    for (const exp of resume.workExperiences) {
      const key = `${exp.companyName}|${exp.jobTitle}|${exp.startDate}`;
      if (!workExpMap.has(key)) {
        workExpMap.set(key, exp);
      } else {
        // Merge achievements from duplicate work experiences
        const existing = workExpMap.get(key)!;
        existing.achievements = [...existing.achievements, ...exp.achievements];
      }
    }
  }

  // Deduplicate achievements within each work experience
  for (const exp of Array.from(workExpMap.values())) {
    const achievementSet = new Set<string>();
    exp.achievements = exp.achievements.filter(a => {
      const key = a.description.toLowerCase().trim();
      if (achievementSet.has(key)) {
        return false;
      }
      achievementSet.add(key);
      return true;
    });
  }

  // Merge skills (deduplicate by skill name)
  const skillsMap = new Map<string, ParsedSkill>();
  for (const resume of parsedResumes) {
    for (const skill of resume.skills) {
      const key = skill.skillName.toLowerCase();
      if (!skillsMap.has(key)) {
        skillsMap.set(key, skill);
      }
    }
  }

  // Merge certifications (deduplicate by name)
  const certsMap = new Map<
    string,
    (typeof parsedResumes)[0]["certifications"][0]
  >();
  for (const resume of parsedResumes) {
    for (const cert of resume.certifications) {
      const key = cert.name.toLowerCase();
      if (!certsMap.has(key)) {
        certsMap.set(key, cert);
      }
    }
  }

  // Merge education (deduplicate by institution + degree)
  const eduMap = new Map<string, (typeof parsedResumes)[0]["education"][0]>();
  for (const resume of parsedResumes) {
    for (const edu of resume.education) {
      const key = `${edu.institution}|${edu.degree || ""}`.toLowerCase();
      if (!eduMap.has(key)) {
        eduMap.set(key, edu);
      }
    }
  }

  // Merge awards (deduplicate by name)
  const awardsMap = new Map<string, (typeof parsedResumes)[0]["awards"][0]>();
  for (const resume of parsedResumes) {
    for (const award of resume.awards) {
      const key = award.name.toLowerCase();
      if (!awardsMap.has(key)) {
        awardsMap.set(key, award);
      }
    }
  }

  // Merge languages (deduplicate by language name)
  const languagesMap = new Map<
    string,
    (typeof parsedResumes)[0]["languages"][0]
  >();
  for (const resume of parsedResumes) {
    for (const lang of resume.languages || []) {
      const key = lang.language.toLowerCase();
      if (!languagesMap.has(key)) {
        languagesMap.set(key, lang);
      }
    }
  }

  // Merge volunteer experiences (deduplicate by organization + role)
  const volunteerMap = new Map<
    string,
    (typeof parsedResumes)[0]["volunteerExperiences"][0]
  >();
  for (const resume of parsedResumes) {
    for (const vol of resume.volunteerExperiences || []) {
      const key = `${vol.organization.toLowerCase()}-${(vol.role || "").toLowerCase()}`;
      if (!volunteerMap.has(key)) {
        volunteerMap.set(key, vol);
      }
    }
  }

  // Merge projects (deduplicate by name)
  const projectsMap = new Map<
    string,
    (typeof parsedResumes)[0]["projects"][0]
  >();
  for (const resume of parsedResumes) {
    for (const proj of resume.projects || []) {
      const key = proj.name.toLowerCase();
      if (!projectsMap.has(key)) {
        projectsMap.set(key, proj);
      }
    }
  }

  // Merge publications (deduplicate by title)
  const publicationsMap = new Map<
    string,
    (typeof parsedResumes)[0]["publications"][0]
  >();
  for (const resume of parsedResumes) {
    for (const pub of resume.publications || []) {
      const key = pub.title.toLowerCase();
      if (!publicationsMap.has(key)) {
        publicationsMap.set(key, pub);
      }
    }
  }

  // Merge security clearances (deduplicate by clearance type)
  const clearancesMap = new Map<
    string,
    (typeof parsedResumes)[0]["securityClearances"][0]
  >();
  for (const resume of parsedResumes) {
    for (const clearance of resume.securityClearances || []) {
      const key = clearance.clearanceType.toLowerCase();
      if (!clearancesMap.has(key)) {
        clearancesMap.set(key, clearance);
      }
    }
  }

  return {
    workExperiences: Array.from(workExpMap.values()).sort((a, b) => {
      // Sort by start date descending (most recent first)
      return (b.startDate || "").localeCompare(a.startDate || "");
    }),
    skills: Array.from(skillsMap.values()),
    certifications: Array.from(certsMap.values()),
    education: Array.from(eduMap.values()),
    awards: Array.from(awardsMap.values()),
    languages: Array.from(languagesMap.values()),
    volunteerExperiences: Array.from(volunteerMap.values()),
    projects: Array.from(projectsMap.values()),
    publications: Array.from(publicationsMap.values()),
    securityClearances: Array.from(clearancesMap.values()),
  };
}
