import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LaborIllusion } from "@/components/ui/psych/LaborIllusion";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Extraction() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    const returnTo =
      window.location.pathname + window.location.search ||
      "/onboarding/extraction";
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  }, [user, loading]);

  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processResumesMutation = trpc.onboarding.processResumes.useMutation();
  const parseResumesMutation = trpc.onboarding.parseResumes.useMutation();
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressEventSourceRef = useRef<EventSource | null>(null);

  const steps = [
    "Parsing resume text...",
    "Extracting work history...",
    "Identifying achievements...",
    "Analyzing metrics and impact...",
    "Discovering your superpowers...",
    "Building your Master Profile...",
  ];

  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;

    const runExtraction = async () => {
      setError(null);
      setProgressMessage(null);
      try {
        const progressUrl = `${window.location.origin}/api/resume-progress`;
        const es = new EventSource(progressUrl);
        progressEventSourceRef.current = es;
        es.onmessage = ev => {
          try {
            const data = JSON.parse(ev.data) as {
              phase?: string;
              message?: string;
              current?: number;
              total?: number;
            };
            if (data.message) setProgressMessage(data.message);
            if (data.phase === "done" || data.phase === "error") es.close();
          } catch (_) {}
        };
        es.onerror = () => es.close();

        stepIntervalRef.current = setInterval(() => {
          setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);

        await processResumesMutation.mutateAsync();
        await parseResumesMutation.mutateAsync();

        if (cancelled) return;
        progressEventSourceRef.current?.close();
        progressEventSourceRef.current = null;
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        setCurrentStep(steps.length - 1);
        setProgressMessage("Profile saved.");
        setIsComplete(true);
        toast.success("Profile extracted successfully!");
      } catch (err: any) {
        if (cancelled) return;
        progressEventSourceRef.current?.close();
        progressEventSourceRef.current = null;
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        const message = err?.message || "";
        const noResumes =
          /no processed resumes found|upload and process resumes first/i.test(
            message
          );
        if (noResumes) {
          toast.info("No resumes to process. Please upload your resume first.");
          setLocation("/onboarding/upload");
          return;
        }
        setError(message || "Failed to extract profile. Please try again.");
        toast.error("Failed to extract profile. Please try again.");
        console.error(err);
      }
    };

    runExtraction();
    return () => {
      cancelled = true;
      progressEventSourceRef.current?.close();
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [user, loading]);

  const handleContinue = () => {
    setLocation("/onboarding/review");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="text-sm text-muted-foreground">Step 3 of 5</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: "60%" }}
            />
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
            {isComplete
              ? "Extraction Complete!"
              : "AI is Analyzing Your Resumes"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isComplete
              ? "Your Master Profile is ready for review"
              : progressMessage || "This usually takes about 30 seconds..."}
          </p>
        </div>

        {/* Labor Illusion Component */}
        {!isComplete && !error && (
          <LaborIllusion variant="extraction" onComplete={() => {}} />
        )}

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {isComplete && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Master Profile Ready!</h3>
              <p className="text-muted-foreground">
                Your career data has been analyzed and structured
              </p>
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
