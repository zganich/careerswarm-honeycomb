import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useLocation, useRoute, Redirect } from "wouter";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
const POWER_VERBS = [
  "Generated", "Engineered", "Reduced", "Accelerated", "Scaled", "Optimized",
  "Launched", "Architected", "Transformed", "Drove", "Increased", "Improved",
  "Led", "Developed", "Created", "Designed", "Implemented", "Established", "Spearheaded"
];

function calculateImpactScore(text: string): { score: number; hasVerb: boolean; hasMetric: boolean; hasMethodology: boolean } {
  const lowerText = text.toLowerCase();
  const hasVerb = POWER_VERBS.some(verb => lowerText.includes(verb.toLowerCase()));
  const hasMetric = /\d+|%|\$|percent|million|thousand|hours|days|users|customers/.test(lowerText);
  const hasMethodology = /\b(by|using|through|via|with|implementing|leveraging|utilizing|applying)\b/.test(lowerText);
  
  let score = 0;
  if (hasVerb) score += 10;
  if (hasMetric) score += 40;
  if (hasMethodology) score += 50;
  
  return { score, hasVerb, hasMetric, hasMethodology };
}

function EditAchievementContent() {
  const { user } = useAuth();
  const [, params] = useRoute("/achievements/:id/edit");
  const [, setLocation] = useLocation();
  const achievementId = params?.id ? parseInt(params.id) : null;

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

  const { data: achievement, isLoading } = trpc.achievements.get.useQuery(
    { id: achievementId! },
    { enabled: !!achievementId }
  );
  const updateMutation = trpc.achievements.update.useMutation();
  const transformMutation = trpc.achievements.transformToXYZ.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (achievement) {
      setFormData({
        situation: achievement.situation || "",
        task: achievement.task || "",
        action: achievement.action || "",
        result: achievement.result || "",
        company: achievement.company || "",
        roleTitle: achievement.roleTitle || "",
      });
      setXyzText(achievement.xyzAccomplishment || "");
    }
  }, [achievement]);

  useEffect(() => {
    if (formData.result) {
      setImpactScore(calculateImpactScore(formData.result));
    }
  }, [formData.result]);

  if (!user) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!achievement) {
    return <Redirect to="/achievements" />;
  }

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
      await updateMutation.mutateAsync({
        id: achievementId!,
        ...formData,
        xyzAccomplishment: xyzText || undefined,
        impactMeterScore: impactScore.score,
        hasStrongVerb: impactScore.hasVerb,
        hasMetric: impactScore.hasMetric,
        hasMethodology: impactScore.hasMethodology,
      });
      utils.achievements.list.invalidate();
      toast.success("Achievement updated!");
      setLocation("/achievements");
    } catch (error) {
      toast.error("Failed to update achievement");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Edit Achievement"
        description="Update your career evidence"
        backTo={{ label: "Back to Achievements", path: "/achievements" }}
      />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Situation</CardTitle>
              <CardDescription>Describe the context and challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.situation}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task</CardTitle>
              <CardDescription>What was your specific responsibility?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action</CardTitle>
              <CardDescription>What actions did you take?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Result
                {impactScore.score > 0 && (
                  <span className="ml-auto text-sm font-normal text-primary">
                    Impact Score: {impactScore.score}/100
                  </span>
                )}
              </CardTitle>
              <CardDescription>What was the measurable outcome?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                rows={4}
                className="mb-4"
              />
              {formData.result && (
                <div className="p-4 bg-muted rounded-lg">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="roleTitle">Role Title</Label>
                <Input
                  id="roleTitle"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                XYZ Format
              </CardTitle>
              <CardDescription>
                AI-transformed Google XYZ format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTransform}
                disabled={isTransforming}
                className="w-full mb-4"
                variant="outline"
              >
                {isTransforming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Re-transform to XYZ
                  </>
                )}
              </Button>
              {xyzText && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm">{xyzText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Link href="/achievements">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
    </div>
  );
}

export default function EditAchievement() {
  return (
    <DashboardLayout>
      <EditAchievementContent />
    </DashboardLayout>
  );
}
