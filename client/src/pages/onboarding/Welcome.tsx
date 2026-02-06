import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Upload,
  Sparkles,
  Target,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check authentication status when component mounts
  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, show login modal
      setShowLoginModal(true);
    }
  }, [user, loading]);

  const handleContinue = () => {
    if (!user) {
      // Show login modal if not authenticated
      setShowLoginModal(true);
    } else {
      // User is authenticated, proceed to next step
      setLocation("/onboarding/upload");
    }
  };

  const handleLogin = () => {
    setLocation("/login?returnTo=/onboarding/welcome");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* OAuth Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <DialogTitle>Sign In Required</DialogTitle>
            </div>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                To build your Master Profile and save your career data securely,
                you need to create a free account.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-orange-900 mb-1">Why sign in?</p>
                <ul className="text-orange-800 space-y-1 text-xs">
                  <li>• Save your profile securely in the cloud</li>
                  <li>• Access your data from any device</li>
                  <li>• Track your application history</li>
                  <li>• Get personalized job recommendations</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button size="lg" className="w-full" onClick={handleLogin}>
              Sign In to CareerSwarm
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Free forever • No credit card required • Takes 30 seconds
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="text-sm text-muted-foreground">Step 1 of 5</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 break-words">
            Welcome to CareerSwarm
          </h1>
          <p className="text-xl text-muted-foreground">
            Let's build your Master Profile in about 10 minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          <Card className="border-2 border-primary">
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <p className="text-sm font-medium">Welcome</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <p className="text-sm text-muted-foreground">Upload</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <p className="text-sm text-muted-foreground">Extract</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto mb-2">
                4
              </div>
              <p className="text-sm text-muted-foreground">Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto mb-2">
                5
              </div>
              <p className="text-sm text-muted-foreground">Preferences</p>
            </CardContent>
          </Card>
        </div>

        {/* What We'll Build */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              What We'll Build Together
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Your Resumes</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your existing resumes (PDF, DOCX). We'll
                    extract everything automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    AI Extracts Your Career Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI parses your work history, achievements, skills, and
                    identifies your top 3 "superpowers."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Review & Refine</h3>
                  <p className="text-sm text-muted-foreground">
                    Edit any extracted data, add missing achievements, and
                    confirm your superpowers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Set Your Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us your target roles, industries, salary range, and
                    location preferences.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          {user ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                You're signed in. Next: upload your resume to build your profile.
              </p>
              <Button size="lg" className="text-lg px-12" onClick={handleContinue}>
                Continue to Upload →
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="text-lg px-12" onClick={handleContinue}>
                Let's Build Your Profile →
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Takes about 10 minutes • Your data is private and secure
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
