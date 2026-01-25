import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Loader2, Download, Copy, Award, FileDown } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

import DashboardLayout from "@/components/DashboardLayout";
function ResumesListContent() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedAchievements, setSelectedAchievements] = useState<number[]>([]);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [matchedAchievements, setMatchedAchievements] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const { data: resumes, isLoading: resumesLoading } = trpc.resumes.list.useQuery();
  const { data: jobs } = trpc.jobDescriptions.list.useQuery();
  const { data: achievements } = trpc.achievements.list.useQuery();
  const generateMutation = trpc.resumes.generate.useMutation();
  const matchMutation = trpc.jobDescriptions.matchAchievements.useMutation();
  const exportPDFMutation = trpc.resumes.exportPDF.useMutation();
  const utils = trpc.useUtils();

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleGenerate = async () => {
    if (!selectedJobId || selectedAchievements.length === 0) {
      toast.error("Please select a job and at least one achievement");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        jobDescriptionId: parseInt(selectedJobId),
        selectedAchievementIds: selectedAchievements,
      });
      setPreviewContent(result.content);
      utils.resumes.list.invalidate();
      toast.success("Resume generated!");
    } catch (error) {
      toast.error("Failed to generate resume");
    }
  };

  const handleCopy = () => {
    if (previewContent) {
      navigator.clipboard.writeText(previewContent);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (previewContent) {
      const blob = new Blob([previewContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    }
  };

  const handleExportPDF = async (resumeId: number) => {
    try {
      const result = await exportPDFMutation.mutateAsync({ resumeId });
      const blob = new Blob(
        [Uint8Array.from(atob(result.pdfData), c => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${resumeId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleJobSelect = async (jobId: string) => {
    setSelectedJobId(jobId);
    setIsMatching(true);
    try {
      const result = await matchMutation.mutateAsync({ jobDescriptionId: parseInt(jobId) });
      setMatchedAchievements(result.matches);
      const topMatches = result.matches
        .filter((m: any) => m.matchScore >= 70)
        .map((m: any) => m.achievement.id);
      setSelectedAchievements(topMatches);
      toast.success(`Found ${topMatches.length} strong matches!`);
    } catch (error) {
      toast.error("Failed to match achievements");
      setMatchedAchievements([]);
    } finally {
      setIsMatching(false);
    }
  };

  const toggleAchievement = (id: number) => {
    setSelectedAchievements(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const getMatchData = (achievementId: number) => {
    return matchedAchievements.find((m: any) => m.achievement?.id === achievementId);
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
            <h1 className="text-3xl font-bold mb-2">My Resumes</h1>
            <p className="text-muted-foreground">Generated tailored resumes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Resume
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Tailored Resume</DialogTitle>
                <DialogDescription>
                  Select a job target and choose your best achievements
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Configuration */}
                <div className="space-y-4">
                  <div>
                    <Label>Target Job</Label>
                    <Select value={selectedJobId} onValueChange={handleJobSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job target" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs?.map((job) => (
                          <SelectItem key={job.id} value={job.id!.toString()}>
                            {job.jobTitle} {job.companyName && `at ${job.companyName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Select Achievements</Label>
                      {isMatching && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing matches...
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {matchedAchievements.length > 0 ? (
                        matchedAchievements.map((match: any) => {
                          const achievement = match.achievement;
                          return (
                            <div
                              key={achievement.id}
                              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                              onClick={() => toggleAchievement(achievement.id!)}
                            >
                              <Checkbox
                                checked={selectedAchievements.includes(achievement.id!)}
                                onCheckedChange={() => toggleAchievement(achievement.id!)}
                              />
                              <div className="flex-1 text-sm">
                                <div className="font-medium mb-1">
                                  {achievement.result || achievement.action || "Untitled"}
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {achievement.company} • Impact: {achievement.impactMeterScore || 0}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      match.matchScore >= 80 ? "bg-green-500" :
                                      match.matchScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    }`} />
                                    <span className="font-medium">Match: {match.matchScore}%</span>
                                  </div>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-muted-foreground">{match.reason}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        achievements?.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleAchievement(achievement.id!)}
                          >
                            <Checkbox
                              checked={selectedAchievements.includes(achievement.id!)}
                              onCheckedChange={() => toggleAchievement(achievement.id!)}
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-medium mb-1">
                                {achievement.result || achievement.action || "Untitled"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {achievement.company} • Score: {achievement.impactMeterScore || 0}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Resume"
                    )}
                  </Button>
                </div>

                {/* Right: Preview */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Preview</h3>
                    {previewContent && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleCopy}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDownload}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {previewContent ? (
                      <Streamdown>{previewContent}</Streamdown>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Select a job and achievements to generate a preview
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumes List */}
        {resumesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resumes && resumes.length > 0 ? (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id}>
                <CardHeader>
                  <CardTitle>Resume v{resume.version}</CardTitle>
                  <CardDescription>
                    Generated {new Date(resume.createdAt).toLocaleDateString()} •{" "}
                    {resume.selectedAchievementIds?.length || 0} achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(resume.resumeContent);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([resume.resumeContent], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `resume-${resume.id}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Downloaded!");
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Markdown
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExportPDF(resume.id!)}
                      disabled={exportPDFMutation.isPending}
                    >
                      {exportPDFMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <FileDown className="h-3 w-3 mr-1" />
                      )}
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first tailored resume
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function ResumesList() {
  return (
    <DashboardLayout>
      <ResumesListContent />
    </DashboardLayout>
  );
}
