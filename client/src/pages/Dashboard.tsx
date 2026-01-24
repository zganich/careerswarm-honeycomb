import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { WelcomeWizard } from "@/components/WelcomeWizard";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Award, FileText, Target, TrendingUp, Plus, Loader2, Lightbulb, Briefcase } from "lucide-react";
import { Link, Redirect } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const { data: achievements, isLoading: achievementsLoading } = trpc.achievements.list.useQuery();
  const { data: jobs, isLoading: jobsLoading } = trpc.jobDescriptions.list.useQuery();
  const { data: resumes, isLoading: resumesLoading } = trpc.resumes.list.useQuery();
  const { data: suggestions } = trpc.achievements.getSuggestions.useQuery();
  const { data: usageStats } = trpc.system.usageStats.useQuery();

  // Show welcome wizard for new users (no achievements yet)
  // MUST be called before any conditional returns to avoid hooks violation
  useEffect(() => {
    if (user && achievements && achievements.length === 0 && !localStorage.getItem('welcomeCompleted')) {
      setShowWelcome(true);
    }
  }, [user, achievements]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  const stats = [
    {
      title: "Achievements",
      value: achievements?.length || 0,
      icon: Award,
      description: "Career evidence points",
      href: "/achievements",
    },
    {
      title: "Job Targets",
      value: jobs?.length || 0,
      icon: Target,
      description: "Tracked opportunities",
      href: "/jobs",
    },
    {
      title: "Resumes",
      value: resumes?.length || 0,
      icon: FileText,
      description: "Generated versions",
      href: "/resumes",
    },
  ];

  const avgImpact = achievements?.length
    ? Math.round(achievements.reduce((sum, a) => sum + (a.impactMeterScore || 0), 0) / achievements.length)
    : 0;

  return (
    <>
      {showWelcome && (
        <WelcomeWizard
          onComplete={() => {
            setShowWelcome(false);
            localStorage.setItem('welcomeCompleted', 'true');
          }}
        />
      )}
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Award className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Careerswarm</span>
              </div>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/achievements">
                <Button variant="ghost">Achievements</Button>
              </Link>
              <Link href="/jobs">
                <Button variant="ghost">Jobs</Button>
              </Link>
              <Link href="/resumes">
                <Button variant="ghost">Resumes</Button>
              </Link>
              <Link href="/applications">
                <Button variant="ghost">Applications</Button>
              </Link>
              <Link href="/past-jobs">
                <Button variant="ghost">Past Jobs</Button>
              </Link>
              <Link href="/interview-prep">
                <Button variant="ghost">Interview Prep</Button>
              </Link>
              <Link href="/resumes/templates">
                <Button variant="ghost">Templates</Button>
              </Link>
              <Link href="/skills-gap">
                <Button variant="ghost">Skills Gap</Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name?.split(" ")[0] || "there"}!</h1>
          <p className="text-muted-foreground">Here's your career evidence dashboard.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="glass-card hover:glass-card-active cursor-pointer transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Usage Stats */}
        {usageStats && (
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Usage & Limits</span>
                {usageStats.subscriptionTier === "free" && (
                  <Link href="/pricing">
                    <Button size="sm" variant="outline">Upgrade to Pro</Button>
                  </Link>
                )}
              </CardTitle>
              <CardDescription>
                {usageStats.subscriptionTier === "pro" ? "Pro Plan - Unlimited" : "Free Plan"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Achievements Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Achievements</span>
                    <span className="text-muted-foreground">
                      {usageStats.achievements.used} / {usageStats.achievements.limit === Infinity ? "∞" : usageStats.achievements.limit}
                    </span>
                  </div>
                  {usageStats.achievements.limit !== Infinity && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usageStats.achievements.percentage >= 90 ? "bg-red-500" :
                          usageStats.achievements.percentage >= 70 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(usageStats.achievements.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Resumes Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Resumes (this month)</span>
                    <span className="text-muted-foreground">
                      {usageStats.resumes.used} / {usageStats.resumes.limit === Infinity ? "∞" : usageStats.resumes.limit}
                    </span>
                  </div>
                  {usageStats.resumes.limit !== Infinity && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usageStats.resumes.percentage >= 90 ? "bg-red-500" :
                          usageStats.resumes.percentage >= 70 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(usageStats.resumes.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Average Impact Score */}
        {achievements && achievements.length > 0 && (
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Average Impact Score
              </CardTitle>
              <CardDescription>Quality of your achievement evidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary">{avgImpact}</div>
                <div className="text-sm text-muted-foreground">
                  out of 100
                  <br />
                  {avgImpact >= 70 ? "🎉 Excellent!" : avgImpact >= 50 ? "👍 Good progress" : "💪 Keep improving"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <Card className="glass-card mb-6 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Suggestions
              </CardTitle>
              <CardDescription>
                Achievements you might have forgotten to document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.slice(0, 3).map((suggestion: any, idx: number) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.prompt}</p>
                    <p className="text-xs text-primary">{suggestion.why}</p>
                  </div>
                ))}
              </div>
              <Link href="/achievements/new">
                <Button className="w-full mt-4">Add Achievement</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Achievement</CardTitle>
              <CardDescription>Capture a new career evidence point</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/achievements/new">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Achievement
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Job Target</CardTitle>
              <CardDescription>Track a new opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/jobs/new">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Job Target
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  );
}
