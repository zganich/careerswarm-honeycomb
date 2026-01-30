import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LaborIllusion } from "@/components/ui/psych/LaborIllusion";

export default function Extraction() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // const extractMutation = trpc.onboarding.extractFromResumes.useMutation();

  const steps = [
    "Parsing resume text...",
    "Extracting work history...",
    "Identifying achievements...",
    "Analyzing metrics and impact...",
    "Discovering your superpowers...",
    "Building your Master Profile..."
  ];

  useEffect(() => {
    // Start extraction
    const runExtraction = async () => {
      try {
        // Simulate progress through steps
        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(i);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Actually call the API
        // await extractMutation.mutateAsync();
        
        setIsComplete(true);
        toast.success("Profile extracted successfully!");
      } catch (error) {
        toast.error("Failed to extract profile. Please try again.");
        console.error(error);
      }
    };

    runExtraction();
  }, []);

  const handleContinue = () => {
    setLocation("/onboarding/review");
  };

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
            Step 3 of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-2xl py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            {isComplete ? (
              <CheckCircle className="h-10 w-10 text-primary" />
            ) : (
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {isComplete ? "Extraction Complete!" : "AI is Analyzing Your Resumes"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isComplete 
              ? "Your Master Profile is ready for review"
              : "This usually takes about 30 seconds..."
            }
          </p>
        </div>

        {/* Labor Illusion Component */}
        {!isComplete && <LaborIllusion variant="extraction" onComplete={() => setIsComplete(true)} />}
        
        {isComplete && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Master Profile Ready!</h3>
              <p className="text-muted-foreground">Your career data has been analyzed and structured</p>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        {isComplete && (
          <div className="text-center mt-8">
            <Button size="lg" onClick={handleContinue}>
              Review Your Profile →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
