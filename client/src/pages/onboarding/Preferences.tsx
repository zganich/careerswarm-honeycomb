import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Preferences() {
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    targetRoles: "",
    targetIndustries: "",
    targetCompanyStages: "",
    minSalary: "",
    targetSalary: "",
    locationPreference: "",
    remotePreference: "remote" as "remote" | "hybrid" | "onsite",
  });

  const savePreferencesMutation = trpc.onboarding.savePreferences.useMutation();

  const handleSave = async () => {
    if (!preferences.targetRoles || !preferences.targetIndustries) {
      toast.error("Please fill in at least target roles and industries");
      return;
    }

    setIsSaving(true);

    try {
      await savePreferencesMutation.mutateAsync({
        roleTitles: preferences.targetRoles.split(",").map(r => r.trim()),
        industries: preferences.targetIndustries.split(",").map(i => i.trim()),
        companyStages: preferences.targetCompanyStages.split(",").map(s => s.trim()),
        minimumBaseSalary: preferences.minSalary ? parseInt(preferences.minSalary) : undefined,
        targetBaseSalary: preferences.targetSalary ? parseInt(preferences.targetSalary) : undefined,
        locationType: preferences.remotePreference,
        allowedCities: preferences.locationPreference ? [preferences.locationPreference] : undefined,
      });

      toast.success("Preferences saved! Onboarding complete!");
      setLocation("/profile");
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
            Step 5 of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-3xl py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Set Your Job Preferences
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us what you're looking for so our AI agents can find the perfect opportunities.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Target Roles */}
              <div>
                <Label htmlFor="targetRoles">Target Roles *</Label>
                <Input
                  id="targetRoles"
                  placeholder="e.g., Head of Partnerships, VP Partnerships, Director Strategic Alliances"
                  value={preferences.targetRoles}
                  onChange={(e) => setPreferences({ ...preferences, targetRoles: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple roles with commas</p>
              </div>

              {/* Target Industries */}
              <div>
                <Label htmlFor="targetIndustries">Target Industries *</Label>
                <Input
                  id="targetIndustries"
                  placeholder="e.g., AI, B2B SaaS, FinTech, Enterprise Software"
                  value={preferences.targetIndustries}
                  onChange={(e) => setPreferences({ ...preferences, targetIndustries: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple industries with commas</p>
              </div>

              {/* Company Stages */}
              <div>
                <Label htmlFor="targetCompanyStages">Company Stages</Label>
                <Input
                  id="targetCompanyStages"
                  placeholder="e.g., Series A, Series B, Series C"
                  value={preferences.targetCompanyStages}
                  onChange={(e) => setPreferences({ ...preferences, targetCompanyStages: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple stages with commas</p>
              </div>

              {/* Salary Range */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minSalary">Minimum Salary ($)</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="150000"
                    value={preferences.minSalary}
                    onChange={(e) => setPreferences({ ...preferences, minSalary: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="targetSalary">Target Salary ($)</Label>
                  <Input
                    id="targetSalary"
                    type="number"
                    placeholder="200000"
                    value={preferences.targetSalary}
                    onChange={(e) => setPreferences({ ...preferences, targetSalary: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="locationPreference">Location Preference</Label>
                <Input
                  id="locationPreference"
                  placeholder="e.g., Salt Lake City, UT or Remote"
                  value={preferences.locationPreference}
                  onChange={(e) => setPreferences({ ...preferences, locationPreference: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Remote Preference */}
              <div>
                <Label>Work Arrangement</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={preferences.remotePreference === "remote" ? "default" : "outline"}
                    onClick={() => setPreferences({ ...preferences, remotePreference: "remote" })}
                  >
                    Remote
                  </Button>
                  <Button
                    variant={preferences.remotePreference === "hybrid" ? "default" : "outline"}
                    onClick={() => setPreferences({ ...preferences, remotePreference: "hybrid" })}
                  >
                    Hybrid
                  </Button>
                  <Button
                    variant={preferences.remotePreference === "onsite" ? "default" : "outline"}
                    onClick={() => setPreferences({ ...preferences, remotePreference: "onsite" })}
                  >
                    On-site
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/onboarding/review")}
            disabled={isSaving}
          >
            ← Back
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Complete Onboarding →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
