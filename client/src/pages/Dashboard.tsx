import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import {
  TrendingUp,
  TrendingDown,
  Search,
  FileText,
  User,
  BarChart3,
  AlertCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics } = trpc.analytics.getOverview.useQuery();
  const { data: applications } = trpc.applications.list.useQuery({});
  const { data: opportunities } = trpc.opportunities.list.useQuery({});

  // Calculate metrics
  const activeApplications = applications?.filter(
    (app) => ["applied", "response_received", "phone_screen"].includes(app.status || "")
  ).length || 0;

  const thisWeekApplications = applications?.filter((app) => {
    if (!app.appliedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(app.appliedAt) >= weekAgo;
  }).length || 0;

  const interviewsScheduled = applications?.filter((app) =>
    ["interview", "final_interview"].includes(app.status || "")
  ).length || 0;

  const responseRate = analytics?.responseRate || 0;

  // Recent activity
  const recentActivity = [
    ...(applications
      ?.filter((app) => app.status === "response_received")
      .slice(0, 2)
      .map((app) => ({
        type: "response" as const,
        application: app,
      })) || []),
    ...(opportunities
      ?.slice(0, 1)
      .map((opp) => ({
        type: "new_match" as const,
        opportunity: opp,
      })) || []),
  ].slice(0, 3);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "there"}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search</p>
      </div>

      {/* Metrics Cards */}
      <DashboardMetrics
        applicationsCount={activeApplications}
        weeklyApplications={thisWeekApplications}
        interviewsScheduled={interviewsScheduled}
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/jobs">
            <Button className="w-full" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Find New Opportunities
            </Button>
          </Link>
          <Link href="/applications">
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Applications
            </Button>
          </Link>
          <Link href="/profile/edit">
            <Button className="w-full" variant="outline">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
          <Link href="/analytics">
            <Button className="w-full" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Stay on top of your applications and new opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity yet</p>
              <p className="text-sm">Start by finding opportunities or creating applications</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="border rounded-lg p-4">
                {activity.type === "response" && activity.application && (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">Response Received</h4>
                        <p className="text-sm text-muted-foreground">
                          Application #{activity.application.id}
                        </p>
                        <p className="text-sm mt-1">Recruiter wants to schedule a call!</p>
                        <Link href={`/applications/${activity.application.id}`}>
                          <Button size="sm" className="mt-2">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {activity.type === "new_match" && activity.opportunity && (
                  <>
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">New Match Found</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.opportunity.companyName} - {activity.opportunity.roleTitle}
                        </p>
                        <p className="text-sm mt-1">
                          {activity.opportunity.companyStage} • {activity.opportunity.locationType} •
                          ${activity.opportunity.baseSalaryMin}-{activity.opportunity.baseSalaryMax}K
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/jobs`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                          <Button size="sm">1-Click Apply</Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}

          <Link href="/activity">
            <Button variant="link" className="w-full">
              View All Activity →
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {analytics && analytics.topAchievements && analytics.topAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm">
                  Your "{analytics.topAchievements[0]?.title?.substring(0, 50)}..." achievement
                  appears in applications that get{" "}
                  <span className="font-semibold">
                    {Math.round((analytics.topAchievements[0]?.successRate || 0) * 100)}%
                  </span>{" "}
                  response rate (vs {Math.round(responseRate)}% avg)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm">
                  Applications sent within 24 hours of posting have{" "}
                  <span className="font-semibold">2.3x higher</span> response rate
                </p>
              </div>
            </div>

            <Link href="/analytics">
              <Button variant="link" className="w-full">
                See More Insights →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
