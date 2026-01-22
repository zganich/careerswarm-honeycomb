import { useState } from "react";
import { ResumeTemplate, RESUME_TEMPLATES } from "@/../../shared/resumeTemplates";
import { ResumeRenderer } from "@/components/ResumeRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Eye } from "lucide-react";
import { toast } from "sonner";

// Sample resume data for preview
const SAMPLE_RESUME_DATA = {
  personalInfo: {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/alexjohnson",
    github: "https://github.com/alexjohnson",
    portfolio: "https://alexjohnson.dev"
  },
  summary: "Results-driven software engineer with 5+ years of experience building scalable web applications. Proven track record of leading cross-functional teams and delivering high-impact projects that drive business growth.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: "Jan 2021",
      endDate: undefined,
      current: true,
      achievements: [
        "Led development of microservices architecture serving 10M+ users, reducing latency by 40%",
        "Mentored team of 5 junior engineers, improving code quality and deployment frequency by 60%",
        "Implemented CI/CD pipeline that reduced deployment time from 2 hours to 15 minutes"
      ]
    },
    {
      title: "Software Engineer",
      company: "Startup Inc",
      location: "Remote",
      startDate: "Jun 2019",
      endDate: "Dec 2020",
      achievements: [
        "Built real-time analytics dashboard processing 1M events/day using React and Node.js",
        "Optimized database queries reducing response time by 70% and infrastructure costs by $50K/year"
      ]
    }
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "May 2019",
      gpa: "3.8"
    }
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
    soft: ["Leadership", "Communication", "Problem Solving", "Agile/Scrum"],
    languages: ["English (Native)", "Spanish (Conversational)"]
  },
  achievements: [
    "Increased system reliability from 99.5% to 99.95% uptime through proactive monitoring",
    "Reduced customer support tickets by 35% through improved error handling and UX",
    "Won company hackathon with AI-powered code review tool adopted by 200+ developers"
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022"
    }
  ],
  projects: [
    {
      name: "OpenSource Contributor",
      description: "Active contributor to React and Next.js ecosystems with 500+ GitHub stars",
      technologies: ["React", "TypeScript", "Jest"],
      link: "https://github.com/alexjohnson"
    }
  ]
};

export default function ResumeTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("modern");
  const [showPreview, setShowPreview] = useState(false);

  const handleExportPDF = () => {
    toast.info("PDF export feature coming soon! For now, use your browser's Print to PDF feature.");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resume Templates</h1>
        <p className="text-muted-foreground">
          Choose an ATS-optimized template that matches your industry and style
        </p>
      </div>

      {!showPreview ? (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Object.values(RESUME_TEMPLATES).map((template) => (
              <Card
                key={template.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {selectedTemplate === template.id && (
                  <div className="flex justify-end mb-2">
                    <Badge className="bg-primary">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Features:</h4>
                  <ul className="text-sm space-y-1">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Best For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.bestFor.map((industry, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Template
            </Button>
            <Button
              size="lg"
              onClick={() => {
                toast.success(`${RESUME_TEMPLATES[selectedTemplate].name} template selected!`);
                // In real implementation, this would save the template preference
              }}
            >
              Use This Template
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {RESUME_TEMPLATES[selectedTemplate].name} Preview
              </h2>
              <p className="text-sm text-muted-foreground">
                This is how your resume will look with this template
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Back to Templates
              </Button>
              <Button
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="bg-gray-100 p-8 rounded-lg">
            <ResumeRenderer
              template={selectedTemplate}
              data={SAMPLE_RESUME_DATA}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              To use this template with your data, go to the Applications page and generate a tailored resume
            </p>
            <Button
              size="lg"
              onClick={() => {
                toast.success(`${RESUME_TEMPLATES[selectedTemplate].name} template selected!`);
                setShowPreview(false);
              }}
            >
              Use This Template
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
