import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Target, Zap, TrendingUp, FileText, Sparkles, Award } from "lucide-react";
import { KineticHoneycomb } from "@/components/KineticHoneycomb";
import { Link } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [gridCompletion, setGridCompletion] = useState(0);
  const shouldPulse = gridCompletion >= 80;

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
      <section className="hero-honeycomb container py-24 md:py-32 relative" style={{
        background: 'linear-gradient(to bottom, #FEFDFB 0%, #FEFDFB 85%, rgba(254, 253, 251, 0) 100%)'
      }}>
        <KineticHoneycomb onGridCompletion={setGridCompletion} />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Career Evidence Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Turn Career Chaos into{" "}
            <span className="relative inline-block">
              <span className="text-primary relative z-10" style={{ letterSpacing: '-0.02em' }}>Structured Success</span>
              <span className="absolute inset-0 bg-primary/10 blur-xl animate-pulse" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The job market is messy. Your resume shouldn't be. Let the Swarm assemble your fragmented experience into a perfect fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className={`text-lg px-8 transition-all duration-300 ${
                    shouldPulse ? 'animate-pulse shadow-lg shadow-primary/50' : ''
                  }`}
                >
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

      {/* How It Works Section */}
      <section className="py-20 md:py-32 relative" style={{
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #FFFFFF 15%, #FFFFFF 85%, rgba(255, 255, 255, 0) 100%)'
      }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-primary"></div>
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Easy as one, two, three.
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Build your career evidence library in minutes, get AI-powered feedback, and generate tailored resumes for every opportunity.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300 relative overflow-visible">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#9B87D9] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                1
              </div>
              <CardContent className="pt-8">
                <h3 className="font-semibold text-xl mb-3">Build Your Master Profile</h3>
                <p className="text-muted-foreground text-sm">
                  Capture your achievements using our STAR methodology wizard. Add metrics, context, and impact for each accomplishment.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300 relative overflow-visible">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#E8D399] text-[#2A2D34] flex items-center justify-center font-bold text-xl shadow-lg">
                2
              </div>
              <CardContent className="pt-8">
                <h3 className="font-semibold text-xl mb-3">Get Real-Time Feedback</h3>
                <p className="text-muted-foreground text-sm">
                  Watch your Impact Meter score rise as you add strong verbs, quantifiable results, and methodology. AI guides you to excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300 relative overflow-visible">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#5BA88D] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                3
              </div>
              <CardContent className="pt-8">
                <h3 className="font-semibold text-xl mb-3">Generate Tailored Resumes</h3>
                <p className="text-muted-foreground text-sm">
                  Paste any job description. Our AI matches your best achievements and generates optimized resumes in seconds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 relative" style={{
        background: 'linear-gradient(to bottom, rgba(255, 248, 231, 0) 0%, #FFF8E7 15%, #FFF8E7 85%, rgba(255, 248, 231, 0) 100%)'
      }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-primary"></div>
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything You Need to Stand Out
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-[#E8D399]/20 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-[#D4A55B]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Impact Meter</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant feedback on achievement quality. See your score rise as you add metrics,
                  strong verbs, and methodology.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-[#E8E3F5]/40 w-12 h-12 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-[#9B87D9]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Google XYZ Format</h3>
                <p className="text-muted-foreground text-sm">
                  AI transforms your achievements into the proven "Accomplished [X] by doing [Z], measured by [Y]" format.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-[#E3F5F0]/60 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-[#5BA88D]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
                <p className="text-muted-foreground text-sm">
                  Paste any job description. We extract requirements and match your best achievements automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-[#F5E3E0]/60 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-[#D4A574]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">STAR Methodology</h3>
                <p className="text-muted-foreground text-sm">
                  Guided wizard walks you through Situation, Task, Action, Result to capture complete stories.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-[#BAE6FD]/40 w-12 h-12 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-[#0EA5E9]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Master Profile</h3>
                <p className="text-muted-foreground text-sm">
                  Build once, use forever. Your career evidence library grows with every achievement you add.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-[#FED7AA]/40 w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-[#F97316]" />
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

      {/* Social Proof Section */}
      <section className="py-20 md:py-32 relative" style={{
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #FFFFFF 15%, #FFFFFF 85%, rgba(255, 255, 255, 0) 100%)'
      }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-primary"></div>
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Trusted by Professionals</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Real Results, Real Impact
          </h2>
          
          {/* Success Metrics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card tilt-on-hover text-center">
              <CardContent className="pt-8">
                <div className="text-5xl font-bold text-primary mb-2">5,000+</div>
                <p className="text-muted-foreground">Resumes Generated</p>
              </CardContent>
            </Card>
            <Card className="glass-card tilt-on-hover text-center">
              <CardContent className="pt-8">
                <div className="text-5xl font-bold text-primary mb-2">87%</div>
                <p className="text-muted-foreground">Interview Rate Increase</p>
              </CardContent>
            </Card>
            <Card className="glass-card tilt-on-hover text-center">
              <CardContent className="pt-8">
                <div className="text-5xl font-bold text-primary mb-2">4.9/5</div>
                <p className="text-muted-foreground">Average User Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-4">
                    "The Impact Meter changed how I write about my work. I landed 3 interviews in 2 weeks after using Careerswarm."
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Product Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-4">
                    "Finally, a tool that understands the difference between tasks and achievements. My resume went from generic to compelling."
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                    MC
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Michael Chen</p>
                    <p className="text-xs text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-card-active tilt-on-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-4">
                    "The AI matching is incredible. It pulls exactly the right achievements for each job. Saved me hours of manual editing."
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                    EP
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Emily Parker</p>
                    <p className="text-xs text-muted-foreground">Marketing Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative" style={{
        background: 'linear-gradient(to bottom, rgba(245, 243, 255, 0) 0%, rgba(245, 243, 255, 1) 15%, rgba(232, 227, 245, 1) 100%)'
      }}>
        <div className="container mx-auto max-w-3xl text-center bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-[#E8E3F5]">
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
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐝</span>
              <span className="text-lg font-bold text-foreground">Careerswarm</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="/faq" className="hover:text-foreground transition-colors">FAQ</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2026 Careerswarm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
