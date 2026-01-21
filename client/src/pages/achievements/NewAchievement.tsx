import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useLocation, Redirect } from "wouter";
import { toast } from "sonner";

const POWER_VERBS = [
  "Generated", "Engineered", "Reduced", "Accelerated", "Scaled", "Optimized",
  "Launched", "Architected", "Transformed", "Drove", "Increased", "Improved",
  "Led", "Developed", "Created", "Designed", "Implemented", "Established", "Spearheaded"
];

function calculateImpactScore(text: string): { score: number; hasVerb: boolean; hasMetric: boolean; hasMethodology: boolean } {
  const lowerText = text.toLowerCase();
  
  // Check for power verb
  const hasVerb = POWER_VERBS.some(verb => lowerText.includes(verb.toLowerCase()));
  
  // Check for metrics (numbers, percentages, dollar signs)
  const hasMetric = /\d+|%|\$|percent|million|thousand|hours|days|users|customers/.test(lowerText);
  
  // Check for methodology (by, using, through, via, with, implementing)
  const hasMethodology = /\b(by|using|through|via|with|implementing|leveraging|utilizing|applying)\b/.test(lowerText);
  
  let score = 0;
  if (hasVerb) score += 10;
  if (hasMetric) score += 40;
  if (hasMethodology) score += 50;
  
  return { score, hasVerb, hasMetric, hasMethodology };
}

export default function NewAchievement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    situation: "",
    task: "",
    action: "",
    result: "",
    company: "",
    roleTitle: "",
  });

  const [impactScore, setImpactScore] = useState({ score: 0, hasVerb: false, hasMetric: false, hasMethodology: false });
  const [isTransforming, setIsTransforming] = useState(false);
  const [xyzText, setXyzText] = useState("");

  const createMutation = trpc.achievements.create.useMutation();
  const transformMutation = trpc.achievements.transformToXYZ.useMutation();

  // Calculate impact score whenever result changes
  useEffect(() => {
    if (formData.result) {
      setImpactScore(calculateImpactScore(formData.result));
    }
  }, [formData.result]);

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleTransform = async () => {
    if (!formData.situation || !formData.task || !formData.action || !formData.result) {
      toast.error("Please complete all STAR fields first");
      return;
    }

    setIsTransforming(true);
    try {
      const result = await transformMutation.mutateAsync({
        situation: formData.situation,
        task: formData.task,
        action: formData.action,
        result: formData.result,
      });
      setXyzText(result.xyzText);
      toast.success("Achievement transformed to XYZ format!");
    } catch (error) {
      toast.error("Failed to transform achievement");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        impactMeterScore: impactScore.score,
        hasStrongVerb: impactScore.hasVerb,
        hasMetric: impactScore.hasMetric,
        hasMethodology: impactScore.hasMethodology,
      });
      toast.success("Achievement saved!");
      setLocation("/achievements");
    } catch (error) {
      toast.error("Failed to save achievement");
    }
  };

  const steps = [
    { num: 1, title: "Situation", field: "situation" as const, placeholder: "Describe the context and challenge you faced..." },
    { num: 2, title: "Task", field: "task" as const, placeholder: "What was your specific responsibility or goal?" },
    { num: 3, title: "Action", field: "action" as const, placeholder: "What actions did you take? What was your approach?" },
    { num: 4, title: "Result", field: "result" as const, placeholder: "What was the measurable outcome or impact?" },
    { num: 5, title: "Context", field: "context" as const },
  ];

  const currentStep = steps[step - 1];
  const isLastStep = step === 5;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <Award className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Careerswarm</span>
            </div>
          </Link>
          <Link href="/achievements">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Achievements
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Achievement</h1>
          <p className="text-muted-foreground">Use the STAR method to capture your career evidence</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s.num ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
              </div>
              <div className="ml-2 hidden md:block">
                <div className={`text-sm font-medium ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep.title}
              {step === 4 && impactScore.score > 0 && (
                <span className="ml-auto text-sm font-normal text-primary">
                  Impact Score: {impactScore.score}/100
                </span>
              )}
            </CardTitle>
            {step === 4 && (
              <CardDescription>
                Include specific metrics and numbers for maximum impact
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {step < 5 ? (
              <>
                <Textarea
                  value={currentStep.field !== 'context' ? formData[currentStep.field] : ''}
                  onChange={(e) => currentStep.field !== 'context' && setFormData({ ...formData, [currentStep.field]: e.target.value })}
                  placeholder={currentStep.placeholder}
                  rows={8}
                  className="mb-4"
                />
                {step === 4 && formData.result && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Impact Meter</span>
                      <span className="text-2xl font-bold text-primary">{impactScore.score}</span>
                    </div>
                    <Progress value={impactScore.score} className="mb-3" />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${impactScore.hasVerb ? "text-green-600" : "text-muted-foreground"}`}>
                        {impactScore.hasVerb ? "✓" : "○"} Strong Verb (10pts)
                      </div>
                      <div className={`flex items-center gap-1 ${impactScore.hasMetric ? "text-green-600" : "text-muted-foreground"}`}>
                        {impactScore.hasMetric ? "✓" : "○"} Metric (40pts)
                      </div>
                      <div className={`flex items-center gap-1 ${impactScore.hasMethodology ? "text-green-600" : "text-muted-foreground"}`}>
                        {impactScore.hasMethodology ? "✓" : "○"} Methodology (50pts)
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="roleTitle">Role Title</Label>
                  <Input
                    id="roleTitle"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="Your role or title"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Transform Section */}
        {step === 5 && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Transform to XYZ Format
              </CardTitle>
              <CardDescription>
                Let AI convert your STAR achievement into Google's XYZ format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTransform}
                disabled={isTransforming}
                className="w-full mb-4"
              >
                {isTransforming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Transform to XYZ
                  </>
                )}
              </Button>
              {xyzText && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium mb-2 text-primary">XYZ Format:</p>
                  <p className="text-sm">{xyzText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {!isLastStep ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Achievement
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
