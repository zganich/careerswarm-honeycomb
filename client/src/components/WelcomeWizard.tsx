import { useState } from "react";
import { X, Sparkles, Target, Briefcase, FileText, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useLocation } from "wouter";

interface WelcomeWizardProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to Careerswarm!",
    description: "Your AI-powered career evidence platform",
    icon: Sparkles,
    content: "Transform your achievements into powerful resumes that stand out. Let's get you started in 3 simple steps.",
  },
  {
    id: 2,
    title: "Build Your Master Profile",
    description: "Document your career achievements",
    icon: Target,
    content: "Start by adding your achievements. Each one becomes evidence you can use across multiple resumes. Think: projects completed, metrics improved, problems solved.",
    action: { label: "Add Your First Achievement", route: "/dashboard" },
  },
  {
    id: 3,
    title: "Find Your Perfect Job",
    description: "AI-powered job search and matching",
    icon: Briefcase,
    content: "Search jobs across LinkedIn, Indeed, and Glassdoor. Our AI automatically scores how well you match each role and identifies skill gaps.",
    action: { label: "Search Jobs Now", route: "/jobs" },
  },
  {
    id: 4,
    title: "Generate Tailored Resumes",
    description: "One-click resume customization",
    icon: FileText,
    content: "Select a job, and we'll automatically generate a tailored resume using your best-matching achievements. Choose from 3 ATS-optimized templates.",
    action: { label: "View Templates", route: "/resume-templates" },
  },
  {
    id: 5,
    title: "You're All Set!",
    description: "Start your job search journey",
    icon: Rocket,
    content: "You now have everything you need to land your dream job. Track applications, prepare for interviews, and let AI handle the heavy lifting.",
    action: { label: "Go to Dashboard", route: "/dashboard" },
  },
];

export function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleAction = () => {
    if (step.action) {
      navigate(step.action.route);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full relative animate-in fade-in zoom-in duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-base">{step.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground leading-relaxed">
            {step.content}
          </p>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tour
            </Button>
            <div className="flex gap-3">
              {step.action && (
                <Button variant="outline" onClick={handleAction}>
                  {step.action.label}
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? "Next" : "Get Started"}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
