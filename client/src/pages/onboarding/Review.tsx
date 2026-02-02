import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Sparkles, Briefcase, TrendingUp, GraduationCap, FileText, Globe, Heart, FolderGit2, BookOpen, Shield, Link2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Review() {
  const [, setLocation] = useLocation();
  
  const { data: profile, isLoading } = trpc.profile.get.useQuery();

  const handleContinue = () => {
    toast.success("Profile confirmed!");
    setLocation("/onboarding/preferences");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step 4 of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: "80%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Review Your Master Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            We've extracted your career data. Review and edit as needed.
          </p>
        </div>

        {/* Superpowers */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Your Top 3 Superpowers</h2>
            </div>
            <div className="space-y-4">
              {profile?.superpowers && profile.superpowers.length > 0 ? (
                profile.superpowers.map((superpower: any, index: number) => (
                  <div key={index} className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold mb-2">{superpower.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{superpower.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Evidence:</strong> {superpower.evidence}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No superpowers extracted yet. Continue to add them manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work History */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Work History</h2>
            </div>
            <div className="space-y-4">
              {profile?.workExperiences && profile.workExperiences.length > 0 ? (
                profile.workExperiences.map((job: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{job.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{job.companyName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.startDate).toLocaleDateString()} - {job.endDate ? new Date(job.endDate).toLocaleDateString() : "Present"}
                      </p>
                    </div>
                    {job.description && (
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No work history extracted yet. Continue to add it manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Key Achievements</h2>
            </div>
            <div className="space-y-3">
              {profile?.achievements && profile.achievements.length > 0 ? (
                profile.achievements.slice(0, 5).map((achievement: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{achievement.description}</p>
                    {achievement.metricValue && (
                      <p className="text-xs text-primary mt-1">
                        📊 {achievement.metricType}: {achievement.metricValue} {achievement.metricUnit}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No achievements extracted yet. Continue to add them manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        {profile?.profile?.professionalSummary && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Professional Summary</h2>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.profile.professionalSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Education, Certifications, Awards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {profile?.education && profile.education.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Education</h2>
                </div>
                <div className="space-y-2">
                  {profile.education.map((edu: any, i: number) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{edu.institution}</p>
                      <p className="text-muted-foreground text-xs">
                        {[edu.degreeType, edu.fieldOfStudy].filter(Boolean).join(" · ")} {edu.graduationYear && `· ${edu.graduationYear}`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.certifications && profile.certifications.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Certifications & Licenses</h2>
                </div>
                <div className="space-y-2">
                  {profile.certifications.map((c: any, i: number) => (
                    <p key={i} className="text-sm font-medium">{c.certificationName} {c.type === "license" ? "(License)" : ""}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.awards && profile.awards.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Awards</h2>
                </div>
                <div className="space-y-2">
                  {profile.awards.map((a: any, i: number) => (
                    <p key={i} className="text-sm font-medium">{a.awardName}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Languages, Volunteer, Projects, Publications, Clearances, Portfolio */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {profile?.languages && profile.languages.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Languages</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: any, i: number) => (
                    <span key={i} className="text-sm">{lang.language}{lang.proficiency ? ` (${lang.proficiency})` : ""}{lang.isNative ? " · Native" : ""}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.volunteerExperiences && profile.volunteerExperiences.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Volunteer & Community</h2>
                </div>
                <div className="space-y-2">
                  {profile.volunteerExperiences.map((v: any, i: number) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{v.organization}</p>
                      <p className="text-muted-foreground text-xs">{v.role} {v.startDate && `· ${v.startDate}`}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.projects && profile.projects.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Projects</h2>
                </div>
                <div className="space-y-2">
                  {profile.projects.map((p: any, i: number) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{p.name}</p>
                      {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs">Link</a>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.publications && profile.publications.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Publications & Patents</h2>
                </div>
                <div className="space-y-2">
                  {profile.publications.map((pub: any, i: number) => (
                    <p key={i} className="text-sm font-medium">{pub.title} {pub.year && `(${pub.year})`}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.securityClearances && profile.securityClearances.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Security Clearances</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.securityClearances.map((c: any, i: number) => (
                    <span key={i} className="text-sm font-medium">{c.clearanceType}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.profile?.portfolioUrls && Array.isArray(profile.profile.portfolioUrls) && profile.profile.portfolioUrls.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Portfolio & Links</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.portfolioUrls.map((item: { label: string; url: string }, i: number) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{item.label}</a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/onboarding/extraction")}
          >
            ← Back
          </Button>
          <Button onClick={handleContinue}>
            Looks Good, Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
