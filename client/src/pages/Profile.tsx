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
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const { data: profile, isLoading } = trpc.profile.get.useQuery();

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
          <Button onClick={() => setLocation("/onboarding/welcome")}>
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.profile) score += 10;
    if (profile.workExperiences?.length > 0) score += 30;
    if (profile.achievements?.length > 0) score += 25;
    if (profile.skills?.length > 0) score += 15;
    if (profile.superpowers?.length > 0) score += 20;
    return score;
  };

  const completeness = calculateCompleteness();

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
            <Button variant="outline" onClick={() => setLocation("/applications")}>
              Applications
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
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
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Completeness */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm font-bold">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-2" />
              {completeness < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Add more achievements and skills to reach 100%
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Superpowers Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Top 3 Superpowers
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.superpowers && profile.superpowers.length > 0 ? (
              <div className="space-y-4">
                {profile.superpowers.map((superpower: any, index: number) => (
                  <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{superpower.title}</h3>
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
                  No superpowers defined yet. Complete onboarding to generate them.
                </p>
                <Button onClick={() => setLocation("/onboarding/welcome")}>
                  Complete Onboarding
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
              <Button variant="ghost" size="sm">
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
                      onClick={() => setExpandedJob(expandedJob === index ? null : index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{job.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground">{job.companyName}</p>
                          {job.location && (
                            <p className="text-xs text-muted-foreground">{job.location}</p>
                          )}
                        </div>
                        <div className="text-right flex items-start gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(job.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              -{" "}
                              {job.endDate
                                ? new Date(job.endDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })
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
                            <h4 className="text-sm font-medium mb-2">Role Overview</h4>
                            <p className="text-sm text-muted-foreground">{job.roleOverview}</p>
                          </div>
                        )}

                        {/* Achievements for this role */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Key Achievements</h4>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          {profile.achievements?.filter((a: any) => a.workExperienceId === job.id)
                            .length > 0 ? (
                            <div className="space-y-2">
                              {profile.achievements
                                .filter((a: any) => a.workExperienceId === job.id)
                                .map((achievement: any, achIndex: number) => (
                                  <div
                                    key={achIndex}
                                    className="p-3 bg-gray-50 rounded-lg text-sm"
                                  >
                                    <p>{achievement.description}</p>
                                    {achievement.metricValue && (
                                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span>
                                          📊 {achievement.metricType}: {achievement.metricValue}{" "}
                                          {achievement.metricUnit}
                                        </span>
                                        {achievement.usageCount > 0 && (
                                          <span>Used in {achievement.usageCount} applications</span>
                                        )}
                                      </div>
                                    )}
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
                <p className="text-muted-foreground mb-4">No work experience added yet</p>
                <Button onClick={() => setLocation("/onboarding/welcome")}>
                  Complete Onboarding
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
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-3">
                {profile.achievements.slice(0, 10).map((achievement: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm mb-2">{achievement.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {achievement.metricValue && (
                        <span>
                          📊 {achievement.metricType}: {achievement.metricValue}{" "}
                          {achievement.metricUnit}
                        </span>
                      )}
                      {achievement.usageCount > 0 && (
                        <span>✓ Used in {achievement.usageCount} applications</span>
                      )}
                      {achievement.successRate && (
                        <span>🎯 {Math.round(achievement.successRate * 100)}% success rate</span>
                      )}
                    </div>
                  </div>
                ))}
                {profile.achievements.length > 10 && (
                  <Button variant="outline" className="w-full">
                    View All {profile.achievements.length} Achievements
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No achievements added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Skills & Education Row */}
        <div className="grid md:grid-cols-2 gap-8">
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
                <p className="text-sm text-muted-foreground">No skills added yet</p>
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
              <p className="text-sm text-muted-foreground">Education records coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
