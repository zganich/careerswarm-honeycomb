import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Upload, Sparkles, Target, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step 1 of 5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
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
            <h2 className="text-2xl font-bold mb-6 text-center">What We'll Build Together</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Your Resumes</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your existing resumes (PDF, DOCX). We'll extract everything automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI Extracts Your Career Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI parses your work history, achievements, skills, and identifies your top 3 "superpowers."
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
                    Edit any extracted data, add missing achievements, and confirm your superpowers.
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
                    Tell us your target roles, industries, salary range, and location preferences.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="text-lg px-12"
            onClick={() => setLocation("/onboarding/upload")}
          >
            Let's Build Your Profile →
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes about 10 minutes • Your data is private and secure
          </p>
        </div>
      </div>
    </div>
  );
}
