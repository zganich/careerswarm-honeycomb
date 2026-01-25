import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Target, Plus, Loader2, Sparkles, Award } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
function JobsListContent() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescriptionText: "",
    jobUrl: "",
  });
  const [analyzedData, setAnalyzedData] = useState<any>(null);

  const { data: jobs, isLoading } = trpc.jobDescriptions.list.useQuery();
  const createMutation = trpc.jobDescriptions.create.useMutation();
  const analyzeMutation = trpc.jobDescriptions.analyze.useMutation();
  const utils = trpc.useUtils();

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleAnalyze = async () => {
    if (!formData.jobDescriptionText) {
      toast.error("Please enter a job description");
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync({
        jobDescriptionText: formData.jobDescriptionText,
      });
      setAnalyzedData(result);
      toast.success("Job description analyzed!");
    } catch (error) {
      toast.error("Failed to analyze job description");
    }
  };

  const handleSave = async () => {
    if (!formData.jobTitle || !formData.jobDescriptionText) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      utils.jobDescriptions.list.invalidate();
      toast.success("Job target saved!");
      setIsDialogOpen(false);
      setFormData({ jobTitle: "", companyName: "", jobDescriptionText: "", jobUrl: "" });
      setAnalyzedData(null);
    } catch (error) {
      toast.error("Failed to save job target");
    }
  };

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
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Targets</h1>
            <p className="text-muted-foreground">Track opportunities and match your achievements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Job Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Job Target</DialogTitle>
                <DialogDescription>
                  Paste the job description and we'll extract key requirements
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Senior Product Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="jobUrl">Job URL</Label>
                  <Input
                    id="jobUrl"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="jobDescriptionText">Job Description *</Label>
                  <Textarea
                    id="jobDescriptionText"
                    value={formData.jobDescriptionText}
                    onChange={(e) => setFormData({ ...formData, jobDescriptionText: e.target.value })}
                    placeholder="Paste the full job description here..."
                    rows={10}
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>

                {analyzedData && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyzedData.requiredSkills?.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="default">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Preferred Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyzedData.preferredSkills?.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Responsibilities</h4>
                      <ul className="text-sm space-y-1">
                        {analyzedData.keyResponsibilities?.map((resp: string, idx: number) => (
                          <li key={idx}>• {resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={createMutation.isPending} className="flex-1">
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Job Target"
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{job.jobTitle}</CardTitle>
                      <CardDescription>
                        {job.companyName && <span>{job.companyName} • </span>}
                        Added {new Date(job.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge>{job.applicationStatus}</Badge>
                  </div>
                </CardHeader>
                {(job.requiredSkills || job.preferredSkills) && (
                  <CardContent>
                    <div className="space-y-3">
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.map((skill, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.preferredSkills && job.preferredSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Preferred Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {job.preferredSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No job targets yet</h3>
              <p className="text-muted-foreground mb-4">
                Add job descriptions to match with your achievements
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Job Target
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function JobsList() {
  return (
    <DashboardLayout>
      <JobsListContent />
    </DashboardLayout>
  );
}
