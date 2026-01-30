import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { HeroMetric } from "@/components/dashboard/HeroMetric";
import { PrimaryCTA } from "@/components/dashboard/PrimaryCTA";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { SecondaryMetrics } from "@/components/dashboard/SecondaryMetrics";
import { FirstTimeHelp } from '@/components/ui/FirstTimeHelp';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics } = trpc.analytics.getOverview.useQuery();
  const { data: applications, isLoading: applicationsLoading } = trpc.applications.list.useQuery({});
  const { data: opportunities } = trpc.opportunities.list.useQuery({});
  // Saved opportunities count - using isSaved query
  const savedJobsCount = 0; // TODO: Implement saved opportunities count
  const { data: profile } = trpc.profile.get.useQuery();

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
  // Calculate profile completeness based on available fields
  const profileCompleteness = profile ? (
    (profile.profile ? 25 : 0) +
    (profile.workExperiences?.length ? 25 : 0) +
    (profile.achievements?.length ? 25 : 0) +
    (profile.skills?.length ? 25 : 0)
  ) : 0;
  const hasIncompleteProfile = profileCompleteness < 100;

  // Recent activity - convert to Activity type
  const recentActivity = [
    ...(applications
      ?.filter((app) => app.status === "response_received")
      .slice(0, 2)
      .map((app) => ({
        id: `app-${app.id}`,
        type: "response_received" as const,
        title: "Response Received",
        description: `Application #${app.id} - Recruiter wants to schedule a call!`,
        timestamp: app.appliedAt ? new Date(app.appliedAt) : new Date(),
        applicationId: app.id.toString(),
      })) || []),
    ...(applications
      ?.filter((app) => app.status === "applied")
      .slice(0, 2)
      .map((app) => ({
        id: `app-${app.id}`,
        type: "application_submitted" as const,
        title: "Application Submitted",
        description: `Applied to ${app.opportunityId ? 'opportunity' : 'position'}`,
        timestamp: app.appliedAt ? new Date(app.appliedAt) : new Date(),
        applicationId: app.id.toString(),
      })) || []),
    ...(applications
      ?.filter((app) => app.status === "interview")
      .slice(0, 1)
      .map((app) => ({
        id: `app-${app.id}`,
        type: "interview_scheduled" as const,
        title: "Interview Scheduled",
        description: `Interview scheduled for application #${app.id}`,
        timestamp: app.appliedAt ? new Date(app.appliedAt) : new Date(),
        applicationId: app.id.toString(),
      })) || []),
  ].slice(0, 5);

  if (applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name || 'there'}! 👋
          </h1>
          <p className="text-slate-600">
            Here's your job search progress at a glance
          </p>
        </div>

        {/* ZONE 1: Hero Metric */}
        <div className="mb-8">
          <HeroMetric 
            applicationsCount={activeApplications}
            hoursPerApplication={4.5}
          />
        </div>

        {/* ZONE 2: Primary CTA */}
        <div className="mb-8">
          <PrimaryCTA
            applicationsCount={activeApplications}
            savedJobsCount={savedJobsCount}
            hasIncompleteProfile={hasIncompleteProfile}
            profileCompleteness={profileCompleteness}
          />
        </div>

        {/* ZONE 3: Activity & Secondary Metrics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <ActivityCard 
            activities={recentActivity}
            onViewAll={() => window.location.href = '/activity'}
          />

          {/* Secondary Metrics */}
          <div>
            <SecondaryMetrics
              applicationsCount={activeApplications}
              weeklyApplications={thisWeekApplications}
              interviewsScheduled={interviewsScheduled}
              responseRate={responseRate}
            />
          </div>
        </div>

        {/* FirstTimeHelp Overlay */}
        <FirstTimeHelp />
      </div>
    </div>
  );
}
