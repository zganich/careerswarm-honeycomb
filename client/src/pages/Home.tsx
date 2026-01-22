import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Target, Zap, TrendingUp, FileText, Sparkles, Award } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Careerswarm</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/pricing">
                  <Button variant="ghost">Pricing</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
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
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Career Evidence Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Transform Your Achievements Into{" "}
            <span className="text-primary">Powerful Resumes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop guessing what recruiters want. Build a Master Profile of your career evidence,
            get real-time quality feedback, and generate tailored resumes that stand out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8">
                    Start Building Free
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Stand Out
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Impact Meter</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant feedback on achievement quality. See your score rise as you add metrics,
                  strong verbs, and methodology.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Google XYZ Format</h3>
                <p className="text-muted-foreground text-sm">
                  AI transforms your achievements into the proven "Accomplished [X] by doing [Z], measured by [Y]" format.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
                <p className="text-muted-foreground text-sm">
                  Paste any job description. We extract requirements and match your best achievements automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">STAR Methodology</h3>
                <p className="text-muted-foreground text-sm">
                  Guided wizard walks you through Situation, Task, Action, Result to capture complete stories.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Master Profile</h3>
                <p className="text-muted-foreground text-sm">
                  Build once, use forever. Your career evidence library grows with every achievement you add.
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
                  Generate unlimited resume versions, each optimized for specific roles and companies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center bg-primary/5 rounded-2xl p-12 border">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career Story?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join professionals who are landing interviews with evidence-based resumes.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8">
                Start Free Today
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Careerswarm. Built with AI to help you stand out.</p>
        </div>
      </footer>
    </div>
  );
}
