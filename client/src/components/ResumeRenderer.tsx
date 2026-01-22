import { ResumeTemplate, TEMPLATE_STYLES, TEMPLATE_SECTION_ORDER } from "@/../../shared/resumeTemplates";

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
  };
  achievements?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

interface ResumeRendererProps {
  template: ResumeTemplate;
  data: ResumeData;
  className?: string;
}

export function ResumeRenderer({ template, data, className = "" }: ResumeRendererProps) {
  const styles = TEMPLATE_STYLES[template];
  const sectionOrder = TEMPLATE_SECTION_ORDER[template];

  const renderHeader = () => (
    <div className="resume-header" style={{ marginBottom: styles.spacing.section }}>
      <h1 style={{ 
        fontSize: styles.fontSize.name, 
        color: styles.primaryColor,
        fontWeight: "bold",
        marginBottom: "4px"
      }}>
        {data.personalInfo.name}
      </h1>
      <div style={{ 
        fontSize: styles.fontSize.title, 
        color: styles.secondaryColor,
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        {data.personalInfo.linkedin && (
          <a href={data.personalInfo.linkedin} style={{ color: styles.accentColor }}>
            LinkedIn
          </a>
        )}
        {data.personalInfo.github && (
          <a href={data.personalInfo.github} style={{ color: styles.accentColor }}>
            GitHub
          </a>
        )}
        {data.personalInfo.portfolio && (
          <a href={data.personalInfo.portfolio} style={{ color: styles.accentColor }}>
            Portfolio
          </a>
        )}
      </div>
    </div>
  );

  const renderSummary = () => {
    if (!data.summary) return null;
    return (
      <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
        <h2 style={{ 
          fontSize: styles.fontSize.heading, 
          color: styles.primaryColor,
          fontWeight: "bold",
          marginBottom: styles.spacing.item,
          textTransform: "uppercase",
          borderBottom: `2px solid ${styles.primaryColor}`,
          paddingBottom: "4px"
        }}>
          Professional Summary
        </h2>
        <p style={{ fontSize: styles.fontSize.body, lineHeight: "1.5" }}>
          {data.summary}
        </p>
      </div>
    );
  };

  const renderExperience = () => (
    <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
      <h2 style={{ 
        fontSize: styles.fontSize.heading, 
        color: styles.primaryColor,
        fontWeight: "bold",
        marginBottom: styles.spacing.item,
        textTransform: "uppercase",
        borderBottom: `2px solid ${styles.primaryColor}`,
        paddingBottom: "4px"
      }}>
        Experience
      </h2>
      {data.experience.map((exp, idx) => (
        <div key={idx} style={{ marginBottom: styles.spacing.item }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <strong style={{ fontSize: styles.fontSize.body, color: styles.primaryColor }}>
              {exp.title}
            </strong>
            <span style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor }}>
              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
            </span>
          </div>
          <div style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor, marginBottom: "4px" }}>
            {exp.company} {exp.location && `• ${exp.location}`}
          </div>
          <ul style={{ fontSize: styles.fontSize.body, marginLeft: "16px", lineHeight: "1.4" }}>
            {exp.achievements.map((achievement, i) => (
              <li key={i} style={{ marginBottom: "2px" }}>{achievement}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
      <h2 style={{ 
        fontSize: styles.fontSize.heading, 
        color: styles.primaryColor,
        fontWeight: "bold",
        marginBottom: styles.spacing.item,
        textTransform: "uppercase",
        borderBottom: `2px solid ${styles.primaryColor}`,
        paddingBottom: "4px"
      }}>
        Education
      </h2>
      {data.education.map((edu, idx) => (
        <div key={idx} style={{ marginBottom: styles.spacing.item }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong style={{ fontSize: styles.fontSize.body, color: styles.primaryColor }}>
              {edu.degree}
            </strong>
            <span style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor }}>
              {edu.graduationDate}
            </span>
          </div>
          <div style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor }}>
            {edu.school} {edu.location && `• ${edu.location}`}
            {edu.gpa && ` • GPA: ${edu.gpa}`}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => {
    const hasSkills = data.skills.technical?.length || data.skills.soft?.length || data.skills.languages?.length;
    if (!hasSkills) return null;

    return (
      <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
        <h2 style={{ 
          fontSize: styles.fontSize.heading, 
          color: styles.primaryColor,
          fontWeight: "bold",
          marginBottom: styles.spacing.item,
          textTransform: "uppercase",
          borderBottom: `2px solid ${styles.primaryColor}`,
          paddingBottom: "4px"
        }}>
          Skills
        </h2>
        {data.skills.technical && data.skills.technical.length > 0 && (
          <div style={{ marginBottom: "4px" }}>
            <strong style={{ fontSize: styles.fontSize.body }}>Technical: </strong>
            <span style={{ fontSize: styles.fontSize.body }}>{data.skills.technical.join(", ")}</span>
          </div>
        )}
        {data.skills.soft && data.skills.soft.length > 0 && (
          <div style={{ marginBottom: "4px" }}>
            <strong style={{ fontSize: styles.fontSize.body }}>Soft Skills: </strong>
            <span style={{ fontSize: styles.fontSize.body }}>{data.skills.soft.join(", ")}</span>
          </div>
        )}
        {data.skills.languages && data.skills.languages.length > 0 && (
          <div>
            <strong style={{ fontSize: styles.fontSize.body }}>Languages: </strong>
            <span style={{ fontSize: styles.fontSize.body }}>{data.skills.languages.join(", ")}</span>
          </div>
        )}
      </div>
    );
  };

  const renderProjects = () => {
    if (!data.projects || data.projects.length === 0) return null;

    return (
      <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
        <h2 style={{ 
          fontSize: styles.fontSize.heading, 
          color: styles.primaryColor,
          fontWeight: "bold",
          marginBottom: styles.spacing.item,
          textTransform: "uppercase",
          borderBottom: `2px solid ${styles.primaryColor}`,
          paddingBottom: "4px"
        }}>
          Projects
        </h2>
        {data.projects.map((project, idx) => (
          <div key={idx} style={{ marginBottom: styles.spacing.item }}>
            <strong style={{ fontSize: styles.fontSize.body, color: styles.primaryColor }}>
              {project.name}
              {project.link && (
                <a href={project.link} style={{ color: styles.accentColor, marginLeft: "8px" }}>
                  Link
                </a>
              )}
            </strong>
            <p style={{ fontSize: styles.fontSize.body, marginTop: "2px", marginBottom: "2px" }}>
              {project.description}
            </p>
            <div style={{ fontSize: styles.fontSize.body, color: styles.secondaryColor }}>
              <strong>Tech:</strong> {project.technologies.join(", ")}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAchievements = () => {
    if (!data.achievements || data.achievements.length === 0) return null;

    return (
      <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
        <h2 style={{ 
          fontSize: styles.fontSize.heading, 
          color: styles.primaryColor,
          fontWeight: "bold",
          marginBottom: styles.spacing.item,
          textTransform: "uppercase",
          borderBottom: `2px solid ${styles.primaryColor}`,
          paddingBottom: "4px"
        }}>
          Key Achievements
        </h2>
        <ul style={{ fontSize: styles.fontSize.body, marginLeft: "16px", lineHeight: "1.4" }}>
          {data.achievements.map((achievement, idx) => (
            <li key={idx} style={{ marginBottom: "2px" }}>{achievement}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!data.certifications || data.certifications.length === 0) return null;

    return (
      <div className="resume-section" style={{ marginBottom: styles.spacing.section }}>
        <h2 style={{ 
          fontSize: styles.fontSize.heading, 
          color: styles.primaryColor,
          fontWeight: "bold",
          marginBottom: styles.spacing.item,
          textTransform: "uppercase",
          borderBottom: `2px solid ${styles.primaryColor}`,
          paddingBottom: "4px"
        }}>
          Certifications
        </h2>
        {data.certifications.map((cert, idx) => (
          <div key={idx} style={{ marginBottom: "4px", fontSize: styles.fontSize.body }}>
            <strong>{cert.name}</strong> - {cert.issuer} ({cert.date})
          </div>
        ))}
      </div>
    );
  };

  const sectionRenderers: Record<string, () => JSX.Element | null> = {
    header: renderHeader,
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    achievements: renderAchievements,
    certifications: renderCertifications
  };

  return (
    <div 
      className={`resume-container ${className}`}
      style={{
        fontFamily: styles.fontFamily,
        padding: "40px",
        backgroundColor: "white",
        maxWidth: "8.5in",
        minHeight: "11in",
        margin: "0 auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}
    >
      {sectionOrder.map((section) => (
        <div key={section}>
          {sectionRenderers[section]?.()}
        </div>
      ))}
    </div>
  );
}
