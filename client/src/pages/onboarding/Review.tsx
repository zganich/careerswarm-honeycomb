import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Sparkles, Briefcase, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Review() {
  const [, setLocation] = useLocation();
  
  const { data: profile, isLoading } = trpc.profile.get.useQuery();

  const handleContinue = () => {
    toast.success("Profile confirmed!");
    setLocation("/onboarding/preferences");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your profile...</p>
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
          <div className="text-sm text-muted-foreground">
            Step 4 of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: "80%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Review Your Master Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            We've extracted your career data. Review and edit as needed.
          </p>
        </div>

        {/* Superpowers */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Your Top 3 Superpowers</h2>
            </div>
            <div className="space-y-4">
              {profile?.superpowers && profile.superpowers.length > 0 ? (
                profile.superpowers.map((superpower: any, index: number) => (
                  <div key={index} className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold mb-2">{superpower.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{superpower.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Evidence:</strong> {superpower.evidence}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No superpowers extracted yet. Continue to add them manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work History */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Work History</h2>
            </div>
            <div className="space-y-4">
              {profile?.workExperiences && profile.workExperiences.length > 0 ? (
                profile.workExperiences.map((job: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{job.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{job.companyName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.startDate).toLocaleDateString()} - {job.endDate ? new Date(job.endDate).toLocaleDateString() : "Present"}
                      </p>
                    </div>
                    {job.description && (
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No work history extracted yet. Continue to add it manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Key Achievements</h2>
            </div>
            <div className="space-y-3">
              {profile?.achievements && profile.achievements.length > 0 ? (
                profile.achievements.slice(0, 5).map((achievement: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{achievement.description}</p>
                    {achievement.metricValue && (
                      <p className="text-xs text-primary mt-1">
                        📊 {achievement.metricType}: {achievement.metricValue} {achievement.metricUnit}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No achievements extracted yet. Continue to add them manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/onboarding/extraction")}
          >
            ← Back
          </Button>
          <Button onClick={handleContinue}>
            Looks Good, Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
