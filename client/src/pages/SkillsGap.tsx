import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Link, Redirect } from "wouter";

import DashboardLayout from "@/components/DashboardLayout";
function SkillsGapContent() {
  const { user } = useAuth();
  const { data: gapAnalysis, isLoading } = trpc.pastEmployerJobs.getGapAnalysis.useQuery();
  const { data: pastJobs } = trpc.pastEmployerJobs.list.useQuery();

  if (!user) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading analysis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Skills Gap Analysis</h1>
          <p className="text-muted-foreground">
            See which skills from your past roles need achievement evidence
          </p>
        </div>

        {!pastJobs || pastJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Past Jobs Added</h3>
                <p className="text-muted-foreground mb-4">
                  Add your past job descriptions to see which skills need achievement evidence
                </p>
                <Link href="/past-jobs">
                  <Button>Add Past Job</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Coverage
                </CardTitle>
                <CardDescription>
                  How much of your past experience is backed by achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Skills Coverage</span>
                      <span className="text-2xl font-bold text-primary">
                        {gapAnalysis?.coveragePercent || 0}%
                      </span>
                    </div>
                    <Progress value={gapAnalysis?.coveragePercent || 0} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{gapAnalysis?.totalExpectedSkills || 0}</div>
                      <div className="text-xs text-muted-foreground">Total Skills</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {gapAnalysis?.provenSkills?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Proven</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {gapAnalysis?.missingEvidence?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Missing Evidence</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Proven Skills
                  </CardTitle>
                  <CardDescription>Skills backed by achievement evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  {gapAnalysis?.provenSkills && gapAnalysis.provenSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.provenSkills.map((skill: string, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-700"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No proven skills yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    Missing Evidence
                  </CardTitle>
                  <CardDescription>Skills that need achievement stories</CardDescription>
                </CardHeader>
                <CardContent>
                  {gapAnalysis?.missingEvidence && gapAnalysis.missingEvidence.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.missingEvidence.map((skill: string, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">All skills have evidence!</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Past Roles</CardTitle>
                <CardDescription>Jobs analyzed for this report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastJobs?.map((job: any) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="font-semibold">{job.jobTitle}</div>
                      {job.companyName && (
                        <div className="text-sm text-muted-foreground">{job.companyName}</div>
                      )}
                      {job.extractedSkills && job.extractedSkills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {job.extractedSkills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-muted rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {gapAnalysis?.missingEvidence && gapAnalysis.missingEvidence.length > 0 && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Close the gap by adding achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    You have {gapAnalysis.missingEvidence.length} skills from past roles that need
                    achievement evidence. Add stories that demonstrate these skills:
                  </p>
                  <Link href="/achievements/new">
                    <Button>Add Achievement</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
    </div>
  );
}

export default function SkillsGap() {
  return (
    <DashboardLayout>
      <SkillsGapContent />
    </DashboardLayout>
  );
}
