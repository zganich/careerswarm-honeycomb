import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Sparkles,
  Briefcase,
  TrendingUp,
  GraduationCap,
  FileText,
  Edit,
  Plus,
  ChevronDown,
  ChevronUp,
  Globe,
  BookOpen,
  Shield,
  Link2,
  Heart,
  FolderGit2,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AchievementDetailModal } from "@/components/AchievementDetailModal";
import { SuperpowerEditModal } from "@/components/SuperpowerEditModal";
import { PreferencesEditModal } from "@/components/PreferencesEditModal";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(
    null
  );
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [superpowerModalOpen, setSuperpowerModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

  const { data: profile, isLoading } = trpc.profile.get.useQuery();
  const { data: achievementStats } =
    trpc.profile.getAchievementStats.useQuery();
  const { data: completeness } = trpc.profile.getCompleteness.useQuery();

  // Helper to get stats for an achievement
  const getAchievementStat = (achievementId: number) => {
    return achievementStats?.find(
      (s: any) => s.achievementId === achievementId
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No profile found</p>
          <Button onClick={() => setLocation("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const completenessScore = completeness?.score || 0;
  const completenessColor =
    completenessScore >= 80
      ? "text-green-600"
      : completenessScore >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/jobs")}>
              Find Jobs
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/applications")}
            >
              Applications
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-6xl py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Master Profile</h1>
              <p className="text-muted-foreground">
                Your comprehensive career evidence library
              </p>
            </div>
            <Button onClick={() => setLocation("/profile/edit")}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Completeness */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Profile Completeness
                </span>
                <span className="text-sm font-bold">{completenessScore}%</span>
              </div>
              <Progress value={completenessScore} className="h-2" />
              {completenessScore < 100 &&
                completeness &&
                completeness.missing.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs font-medium text-yellow-900 mb-1">
                      Missing fields:
                    </p>
                    <ul className="text-xs text-yellow-800 space-y-0.5">
                      {completeness.missing.slice(0, 3).map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                      {completeness.missing.length > 3 && (
                        <li>• and {completeness.missing.length - 3} more...</li>
                      )}
                    </ul>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-xs text-yellow-900"
                      onClick={() => setLocation("/achievements")}
                    >
                      Complete Your Profile →
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Professional Summary */}
        {profile?.profile?.professionalSummary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.profile.professionalSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Superpowers Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Top 3 Superpowers
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuperpowerModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.superpowers && profile.superpowers.length > 0 ? (
              <div className="space-y-4">
                {profile.superpowers.map((superpower: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">
                          {superpower.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {superpower.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Evidence:</strong> {superpower.evidence}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No superpowers defined yet. Complete onboarding to generate
                  them.
                </p>
                <Button onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Experience Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Work Experience
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/profile/edit")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.workExperiences && profile.workExperiences.length > 0 ? (
              <div className="space-y-4">
                {profile.workExperiences.map((job: any, index: number) => (
                  <div key={index} className="border rounded-lg">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedJob(expandedJob === index ? null : index)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{job.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.companyName}
                          </p>
                          {job.location && (
                            <p className="text-xs text-muted-foreground">
                              {job.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex items-start gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(job.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}{" "}
                              -{" "}
                              {job.endDate
                                ? new Date(job.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "Present"}
                            </p>
                            {job.isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          {expandedJob === index ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedJob === index && (
                      <div className="px-4 pb-4 border-t">
                        {job.roleOverview && (
                          <div className="mt-4 mb-4">
                            <h4 className="text-sm font-medium mb-2">
                              Role Overview
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {job.roleOverview}
                            </p>
                          </div>
                        )}

                        {/* Achievements for this role */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">
                              Key Achievements
                            </h4>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          {profile.achievements?.filter(
                            (a: any) => a.workExperienceId === job.id
                          ).length > 0 ? (
                            <div className="space-y-2">
                              {profile.achievements
                                .filter(
                                  (a: any) => a.workExperienceId === job.id
                                )
                                .map((achievement: any, achIndex: number) => (
                                  <div
                                    key={achIndex}
                                    className="p-3 bg-gray-50 rounded-lg text-sm"
                                  >
                                    <p>{achievement.description}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      {achievement.metricValue && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          📊 {achievement.metricType}:{" "}
                                          {achievement.metricValue}{" "}
                                          {achievement.metricUnit}
                                        </Badge>
                                      )}
                                      {(() => {
                                        const stats = getAchievementStat(
                                          achievement.id
                                        );
                                        if (stats && stats.usageCount > 0) {
                                          return (
                                            <>
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                📝 Used in {stats.usageCount}{" "}
                                                applications
                                              </Badge>
                                              {stats.successRate > 0 && (
                                                <Badge
                                                  variant={
                                                    stats.successRate >= 50
                                                      ? "default"
                                                      : "secondary"
                                                  }
                                                  className="text-xs"
                                                >
                                                  ✨ {stats.successRate}%
                                                  success rate
                                                </Badge>
                                              )}
                                              {stats.successRate >= 70 && (
                                                <Badge
                                                  variant="default"
                                                  className="text-xs bg-green-600"
                                                >
                                                  🏆 Top Performer
                                                </Badge>
                                              )}
                                            </>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No achievements added yet
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No work experience added yet
                </p>
                <Button onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                All Achievements ({profile.achievements?.length || 0})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/profile/edit")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-3">
                {profile.achievements
                  .slice(0, 10)
                  .map((achievement: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setSelectedAchievement(achievement);
                        setAchievementModalOpen(true);
                      }}
                    >
                      <p className="text-sm mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {achievement.metricValue && (
                          <span>
                            📊 {achievement.metricType}:{" "}
                            {achievement.metricValue} {achievement.metricUnit}
                          </span>
                        )}
                        {achievement.usageCount > 0 && (
                          <span>
                            ✓ Used in {achievement.usageCount} applications
                          </span>
                        )}
                        {achievement.successRate && (
                          <span>
                            🎯 {Math.round(achievement.successRate * 100)}%
                            success rate
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {profile.achievements.length > 10 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/achievements")}
                  >
                    View All {profile.achievements.length} Achievements
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No achievements added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills & Education Row */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Target Preferences */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Target Preferences
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreferencesModalOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile?.preferences ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Target Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences.roleTitles?.map(
                        (role: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {role}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences.industries?.map(
                        (industry: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {industry}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Location Preference
                    </p>
                    <Badge variant="outline">
                      {profile.preferences.locationType}
                    </Badge>
                  </div>
                  {profile.preferences.minimumBaseSalary && (
                    <div>
                      <p className="text-sm font-medium mb-2">Minimum Salary</p>
                      <p className="text-sm">
                        $
                        {profile.preferences.minimumBaseSalary.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No preferences set yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill.skillName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills added yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.education && profile.education.length > 0 ? (
                <div className="space-y-3">
                  {profile.education.map((edu: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{edu.institution}</p>
                      {(edu.degreeType || edu.fieldOfStudy) && (
                        <p className="text-muted-foreground">
                          {[edu.degreeType, edu.fieldOfStudy]
                            .filter(Boolean)
                            .join(" in ")}
                        </p>
                      )}
                      {edu.graduationYear && (
                        <p className="text-xs text-muted-foreground">
                          {edu.graduationYear}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No education added yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Certifications & Awards Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Certifications & Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.certifications && profile.certifications.length > 0 ? (
                <div className="space-y-2">
                  {profile.certifications.map((cert: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{cert.certificationName}</p>
                        {cert.issuingOrganization && (
                          <p className="text-muted-foreground text-xs">
                            {cert.issuingOrganization}
                          </p>
                        )}
                        {cert.issueYear && (
                          <p className="text-xs text-muted-foreground">
                            {cert.issueYear}
                          </p>
                        )}
                      </div>
                      {cert.type === "license" && (
                        <Badge variant="outline" className="text-xs">
                          License
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No certifications or licenses added yet
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Awards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.awards && profile.awards.length > 0 ? (
                <div className="space-y-2">
                  {profile.awards.map((award: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{award.awardName}</p>
                      {(award.organization || award.year) && (
                        <p className="text-muted-foreground text-xs">
                          {[award.organization, award.year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      {award.context && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {award.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No awards added yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Languages, Volunteer, Projects, Publications, Clearances, Portfolio */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {profile?.languages && profile.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {lang.language}
                      {lang.proficiency && ` (${lang.proficiency})`}
                      {lang.isNative && " · Native"}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.volunteerExperiences &&
            profile.volunteerExperiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Volunteer & Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.volunteerExperiences.map(
                      (v: any, index: number) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium">{v.organization}</p>
                          {v.role && (
                            <p className="text-muted-foreground text-xs">
                              {v.role}
                            </p>
                          )}
                          {(v.startDate || v.endDate) && (
                            <p className="text-xs text-muted-foreground">
                              {v.startDate || "?"} – {v.endDate || "Present"}
                            </p>
                          )}
                          {v.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {v.description}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          {profile?.projects && profile.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.projects.map((p: any, index: number) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{p.name}</p>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-xs flex items-center gap-1"
                          >
                            <Link2 className="h-3 w-3" /> Link
                          </a>
                        )}
                      </div>
                      {p.role && (
                        <p className="text-muted-foreground text-xs">
                          {p.role}
                        </p>
                      )}
                      {(p.startDate || p.endDate) && (
                        <p className="text-xs text-muted-foreground">
                          {p.startDate || "?"} – {p.endDate || "Present"}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.publications && profile.publications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Publications & Patents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.publications.map((pub: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{pub.title}</p>
                      {(pub.publisherOrVenue || pub.year) && (
                        <p className="text-muted-foreground text-xs">
                          {[pub.publisherOrVenue, pub.year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs flex items-center gap-1 mt-1"
                        >
                          <Link2 className="h-3 w-3" /> View
                        </a>
                      )}
                      {pub.context && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {pub.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {profile?.securityClearances &&
            profile.securityClearances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Clearances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.securityClearances.map((c: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm flex items-center gap-2 flex-wrap"
                      >
                        <Badge variant="secondary">{c.clearanceType}</Badge>
                        {c.level && (
                          <span className="text-muted-foreground text-xs">
                            {c.level}
                          </span>
                        )}
                        {c.expiryDate && (
                          <span className="text-xs text-muted-foreground">
                            Expires: {c.expiryDate}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          {profile?.profile?.portfolioUrls &&
            Array.isArray(profile.profile.portfolioUrls) &&
            profile.profile.portfolioUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    Portfolio & Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.portfolioUrls.map(
                      (
                        item: string | { label: string; url: string },
                        index: number
                      ) => {
                        // Handle both string[] and {label, url}[] formats
                        const isObject =
                          typeof item === "object" && item !== null;
                        const url = isObject ? item.url : item;
                        const label = isObject ? item.label : item;
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Link2 className="h-4 w-4" />
                            {label}
                          </a>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        open={achievementModalOpen}
        onOpenChange={setAchievementModalOpen}
        onEdit={() => {
          // Edit functionality - redirect to profile edit page
          window.location.href = `/profile/edit?highlight=achievement-${selectedAchievement?.id}`;
        }}
        onDelete={() => {
          // Delete handled via mutation - show confirmation
          if (selectedAchievement) {
            const confirmed = window.confirm(
              "Are you sure you want to delete this achievement?"
            );
            if (confirmed) {
              // Deletion would be handled by tRPC mutation
              window.location.reload();
            }
          }
        }}
      />

      {/* Superpower Edit Modal */}
      <SuperpowerEditModal
        open={superpowerModalOpen}
        onOpenChange={setSuperpowerModalOpen}
        superpowers={profile?.superpowers || []}
        achievements={profile?.achievements || []}
        onSuccess={() => {
          // Refetch profile data
          window.location.reload();
        }}
      />

      {/* Preferences Edit Modal */}
      <PreferencesEditModal
        open={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        preferences={
          profile?.preferences
            ? {
                roleTitles: profile.preferences.roleTitles || [],
                industries: profile.preferences.industries || [],
                companyStages: profile.preferences.companyStages || [],
                locationType:
                  (profile.preferences.locationType as
                    | "remote"
                    | "hybrid"
                    | "onsite"
                    | "flexible") || "remote",
                allowedCities: profile.preferences.allowedCities || [],
                minimumBaseSalary: profile.preferences.minimumBaseSalary,
                dealBreakers: profile.preferences.dealBreakers || [],
              }
            : null
        }
      />
    </div>
  );
}
