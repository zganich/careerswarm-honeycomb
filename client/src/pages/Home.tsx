import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Target, Zap, TrendingUp, FileText, Sparkles, Award } from "lucide-react";
import { Link } from "wouter";
import NotificationBell from "@/components/NotificationBell";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/pricing">
                  <Button variant="ghost">Pricing</Button>
                </Link>
                <NotificationBell />
                <Link href="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button>Get Started</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!isAuthenticated ? (
        <section className="container py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your AI-Powered<br />Career Evidence Engine
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your resumes. AI extracts your achievements, builds your Master Profile, 
            and generates tailored applications for every opportunity.
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8">
                Start Building Your Profile
              </Button>
            </a>
          </div>
        </section>
      ) : (
        <section className="container py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Continue building your career evidence.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-8">
              Complete Onboarding
            </Button>
          </Link>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Build your career evidence library in minutes, get AI-powered feedback, 
            and generate tailored resumes for every opportunity.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="font-semibold text-xl mb-3">Upload Resumes</h3>
                <p className="text-muted-foreground text-sm">
                  Upload your existing resumes. AI extracts your work history, achievements, 
                  and skills automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="font-semibold text-xl mb-3">Build Master Profile</h3>
                <p className="text-muted-foreground text-sm">
                  AI identifies your top 3 "superpowers" and organizes your achievements 
                  with metrics and impact scores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="font-semibold text-xl mb-3">Generate Applications</h3>
                <p className="text-muted-foreground text-sm">
                  7 AI agents discover jobs, research companies, and generate tailored 
                  resumes and cover letters automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything You Need to Stand Out
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Resume Parser</h3>
                <p className="text-muted-foreground text-sm">
                  Upload any resume format. AI extracts work history, achievements, 
                  and metrics automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Superpower Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  AI identifies your top 3 differentiators with evidence from your 
                  career history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">7-Agent System</h3>
                <p className="text-muted-foreground text-sm">
                  Scout, Profiler, Qualifier, Hunter, Tailor, Scribe, and Assembler 
                  work together to automate your job search.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Master Profile</h3>
                <p className="text-muted-foreground text-sm">
                  Build once, use forever. Your career evidence library grows with 
                  every achievement you add.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
                <p className="text-muted-foreground text-sm">
                  AI selects your best 8-15 achievements for each role based on 
                  job requirements and strategic fit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tailored Output</h3>
                <p className="text-muted-foreground text-sm">
                  Generate unlimited resume versions, cover letters, and outreach 
                  messages optimized for each opportunity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Build Your Career Evidence Engine?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start with your existing resumes. AI does the rest.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-bold">CareerSwarm</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
