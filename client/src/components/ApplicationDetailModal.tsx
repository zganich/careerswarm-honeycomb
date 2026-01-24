import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, Calendar, Trash2, Save, ExternalLink, Target, Lightbulb, AlertTriangle, Eye, MessageSquare, Sparkles, Copy, Mail } from "lucide-react";
import { toast } from "sonner";

interface ApplicationDetailModalProps {
  applicationId: number | null;
  open: boolean;
  onClose: () => void;
}

export function ApplicationDetailModal({ applicationId, open, onClose }: ApplicationDetailModalProps) {
  const utils = trpc.useUtils();
  const [notes, setNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: application, isLoading } = trpc.applications.get.useQuery(
    { id: applicationId! },
    { enabled: !!applicationId }
  );

  const updateMutation = trpc.applications.update.useMutation({
    onSuccess: () => {
      toast.success("Notes saved successfully");
      setHasUnsavedChanges(false);
      utils.applications.get.invalidate({ id: applicationId! });
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to save notes: ${error.message}`);
    },
  });

  const deleteMutation = trpc.applications.delete.useMutation({
    onSuccess: () => {
      toast.success("Application deleted");
      utils.applications.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to delete application: ${error.message}`);
    },
  });

  const profileMutation = trpc.applications.profile.useMutation({
    onSuccess: (data) => {
      toast.success("Strategic analysis complete!");
      utils.applications.get.invalidate({ id: applicationId! });
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const outreachMutation = trpc.applications.generateOutreach.useMutation({
    onSuccess: (data) => {
      toast.success("Outreach strategy generated!");
      utils.applications.get.invalidate({ id: applicationId! });
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to generate outreach: ${error.message}`);
    },
  });

  const successMutation = trpc.applications.predictSuccess.useMutation({
    onSuccess: (data) => {
      toast.success("Success prediction complete!");
      utils.applications.get.invalidate({ id: applicationId! });
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Prediction failed: ${error.message}`);
    },
  });

  const skillGapMutation = trpc.applications.analyzeSkillGap.useMutation({
    onSuccess: (data) => {
      toast.success("Skill gap analysis complete!");
      utils.applications.get.invalidate({ id: applicationId! });
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const pivotMutation = trpc.applications.analyzePivot.useMutation({
    onSuccess: (data) => {
      toast.success("Career pivot analysis complete!");
      utils.applications.get.invalidate({ id: applicationId! });
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Pivot analysis failed: ${error.message}`);
    },
  });

  const handleRunProfiler = () => {
    if (!applicationId) return;
    profileMutation.mutate({ applicationId });
  };

  const handleRunSuccessPredictor = () => {
    if (!applicationId) return;
    successMutation.mutate({ applicationId });
  };

  const handleRunSkillGap = () => {
    if (!applicationId) return;
    skillGapMutation.mutate({ applicationId });
  };

  const handleRunPivotAnalysis = () => {
    if (!applicationId) return;
    pivotMutation.mutate({ applicationId });
  };

  // Update notes when application loads
  useEffect(() => {
    if (application?.notes) {
      setNotes(application.notes);
      setHasUnsavedChanges(false);
    }
  }, [application]);

  const handleSaveNotes = () => {
    if (!applicationId) return;
    updateMutation.mutate({
      applicationId,
      notes,
    });
  };

  const handleDelete = () => {
    if (!applicationId) return;
    if (confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      deleteMutation.mutate({ applicationId });
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasUnsavedChanges(true);
  };

  const getMatchScoreColor = (score?: number | null) => {
    if (!score) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scouted: "Scouted",
      saved: "Saved",
      draft: "Draft",
      submitted: "Applied",
      viewed: "Viewed",
      screening: "Screening",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offer: "Offer",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    };
    return labels[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : application ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">
                    {/* @ts-ignore */}
                    {application.job?.title || "Application Details"}
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    {/* @ts-ignore */}
                    {application.job?.companyName || "Unknown Company"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {getStatusLabel(application.status || "draft")}
                  </Badge>
                  {/* @ts-ignore - job relation might not be loaded */}
                  {application.job?.qualificationScore != null && (
                    <Badge 
                      className={`${getMatchScoreColor(application.job.qualificationScore)} text-white`}
                    >
                      {/* @ts-ignore */}
                      {application.job.qualificationScore}% Match
                      {/* @ts-ignore */}
                      {application.job.qualificationScore > 80 && " 🔥"}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="career-path">Career Path</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Timeline */}
                <Card className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                    </div>
                    {application.submittedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applied:</span>
                        <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(application.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>

                {/* Job Details */}
                {/* @ts-ignore */}
                {application.job && (
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4" />
                      Job Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      {/* @ts-ignore */}
                      {application.job.location && (
                        <div>
                          <span className="text-muted-foreground">Location: </span>
                          {/* @ts-ignore */}
                          <span>{application.job.location}</span>
                        </div>
                      )}
                      {/* @ts-ignore */}
                      {application.job.jobUrl && (
                        <div>
                          {/* @ts-ignore */}
                          <a 
                            href={application.job.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Job Posting <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {/* @ts-ignore */}
                      {application.job.platform && (
                        <div>
                          <span className="text-muted-foreground">Source: </span>
                          {/* @ts-ignore */}
                          <Badge variant="outline" className="ml-1">{application.job.platform}</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Strategic Intel Section (Profiler Agent) */}
                <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Strategic Intel
                    </h3>
                    {/* @ts-ignore */}
                    {(!application.profilerAnalysis || !application.profilerAnalysis.painPoints) && (
                      <Button 
                        onClick={handleRunProfiler}
                        disabled={profileMutation.isPending}
                        size="sm"
                        className="gap-2"
                      >
                        {profileMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Run Strategic Analysis
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* @ts-ignore */}
                  {(!application.profilerAnalysis || !application.profilerAnalysis.painPoints) && !profileMutation.isPending && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No strategic analysis yet</p>
                      <p className="text-sm mt-1">Click "Run Strategic Analysis" to identify pain points,</p>
                      <p className="text-sm">generate a strategic hook, and prepare interview questions.</p>
                    </div>
                  )}

                  {/* @ts-ignore */}
                  {application.profilerAnalysis && application.profilerAnalysis.painPoints && (
                    <div className="space-y-6">
                      {/* Strategic Hook */}
                      {/* @ts-ignore */}
                      {application.profilerAnalysis.strategicHook && (
                        <div className="border-2 border-amber-500 rounded-lg p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                          <h4 className="font-semibold flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
                            <Target className="h-5 w-5" />
                            Strategic Hook
                          </h4>
                          {/* @ts-ignore */}
                          <p className="text-sm font-medium leading-relaxed">{application.profilerAnalysis.strategicHook}</p>
                        </div>
                      )}

                      <Separator />

                      {/* Pain Points */}
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          Pain Points
                        </h4>
                        <div className="space-y-2">
                          {/* @ts-ignore */}
                          {application.profilerAnalysis.painPoints.map((painPoint: string, idx: number) => (
                            <div key={idx} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-r">
                              <p className="font-medium text-sm">{painPoint}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Ask These Questions */}
                      {/* @ts-ignore */}
                      {application.profilerAnalysis?.interviewQuestions && application.profilerAnalysis.interviewQuestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                            <MessageSquare className="h-4 w-4" />
                            Ask These Questions
                          </h4>
                          <div className="space-y-2">
                            {/* @ts-ignore */}
                            {application.profilerAnalysis.interviewQuestions.map((question: string, idx: number) => (
                              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-r">
                                <p className="text-sm font-medium">{question}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Re-run button */}
                      <div className="pt-2">
                        <Button 
                          onClick={handleRunProfiler}
                          disabled={profileMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          {profileMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Re-analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Re-run Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Success Predictor Section */}
                <Card className="p-4 border-2 border-green-500/20 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Success Prediction
                    </h3>
                    {/* @ts-ignore */}
                    {(!application.analytics?.successPrediction) && (
                      <Button 
                        onClick={handleRunSuccessPredictor}
                        disabled={successMutation.isPending}
                        size="sm"
                        className="gap-2"
                      >
                        {successMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Predicting...
                          </>
                        ) : (
                          <>
                            <Target className="h-4 w-4" />
                            Predict Success
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* @ts-ignore */}
                  {(!application.analytics?.successPrediction) && !successMutation.isPending && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No success prediction yet</p>
                      <p className="text-sm mt-1">Click "Predict Success" to analyze your probability of receiving an offer.</p>
                    </div>
                  )}

                  {/* @ts-ignore */}
                  {application.analytics?.successPrediction && (
                    <div className="space-y-6">
                      {/* Success Gauge */}
                      <div className="flex flex-col items-center justify-center py-6">
                        {/* Circular Progress Ring */}
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full transform -rotate-90">
                            {/* Background circle */}
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeLinecap="round"
                              /* @ts-ignore */
                              strokeDasharray={`${2 * Math.PI * 70}`}
                              /* @ts-ignore */
                              strokeDashoffset={`${2 * Math.PI * 70 * (1 - application.analytics.successPrediction.probability / 100)}`}
                              className={
                                /* @ts-ignore */
                                application.analytics.successPrediction.probability >= 70 ? "text-green-500" :
                                /* @ts-ignore */
                                application.analytics.successPrediction.probability >= 40 ? "text-yellow-500" :
                                "text-red-500"
                              }
                            />
                          </svg>
                          {/* Center text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {/* @ts-ignore */}
                            <span className="text-4xl font-bold">{Math.round(application.analytics.successPrediction.probability)}%</span>
                            <span className="text-xs text-muted-foreground mt-1">Success Rate</span>
                          </div>
                        </div>
                        {/* Reasoning */}
                        {/* @ts-ignore */}
                        <p className="text-sm text-center mt-4 max-w-md italic text-muted-foreground">{application.analytics.successPrediction.reasoning}</p>
                      </div>

                      <Separator />

                      {/* Green Flags */}
                      {/* @ts-ignore */}
                      {application.analytics.successPrediction.greenFlags && application.analytics.successPrediction.greenFlags.length > 0 && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-600 dark:text-green-400">
                            ✓ Green Flags
                          </h4>
                          <div className="space-y-2">
                            {/* @ts-ignore */}
                            {application.analytics.successPrediction.greenFlags.map((flag: string, idx: number) => (
                              <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-950/20 rounded-r">
                                <p className="text-sm">{flag}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Red Flags */}
                      {/* @ts-ignore */}
                      {application.analytics.successPrediction.redFlags && application.analytics.successPrediction.redFlags.length > 0 && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                            Red Flags
                          </h4>
                          <div className="space-y-2">
                            {/* @ts-ignore */}
                            {application.analytics.successPrediction.redFlags.map((flag: string, idx: number) => (
                              <div key={idx} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-r">
                                <p className="text-sm">{flag}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                {/* Skill Gap Analysis Section */}
                <Card className="p-4 border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Skill Gap Analysis
                    </h3>
                    {/* @ts-ignore */}
                    {(!application.analytics?.skillGap) && (
                      <Button 
                        onClick={handleRunSkillGap}
                        disabled={skillGapMutation.isPending}
                        size="sm"
                        className="gap-2"
                      >
                        {skillGapMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4" />
                            Analyze Skill Gap
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* @ts-ignore */}
                  {(!application.analytics?.skillGap) && !skillGapMutation.isPending && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No skill gap analysis yet</p>
                      <p className="text-sm mt-1">Click "Analyze Skill Gap" to identify missing skills and get an upskilling plan.</p>
                    </div>
                  )}

                  {/* @ts-ignore */}
                  {application.analytics?.skillGap && (
                    <div className="space-y-6">
                      {/* Missing Skills */}
                      {/* @ts-ignore */}
                      {application.analytics.skillGap.missingSkills && application.analytics.skillGap.missingSkills.length > 0 && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            Missing Pieces
                          </h4>
                          <div className="space-y-2">
                            {/* @ts-ignore */}
                            {application.analytics.skillGap.missingSkills.map((skill: string, idx: number) => (
                              <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-r">
                                <p className="text-sm font-medium">{skill}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Upskilling Plan */}
                      {/* @ts-ignore */}
                      {application.analytics.skillGap.upskillingPlan && application.analytics.skillGap.upskillingPlan.length > 0 && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400">
                            <Sparkles className="h-4 w-4" />
                            Upskilling Plan
                          </h4>
                          <div className="space-y-3">
                            {/* @ts-ignore */}
                            {application.analytics.skillGap.upskillingPlan.map((step: string, idx: number) => (
                              <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-950/20 rounded-r">
                                <p className="text-sm">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4 mt-4">
                {application.resumeId ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">Tailored Resume</h3>
                          <p className="text-sm text-muted-foreground">
                            Generated for this application
                          </p>
                        </div>
                      </div>
                      <Button asChild>
                        <a href={`/resumes/${application.resumeId}`} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </a>
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No resume attached yet</p>
                      <p className="text-sm mt-2">Generate a tailored resume from the Job Matcher</p>
                    </div>
                  </Card>
                )}

                {application.coverLetterContent && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-3">Cover Letter</h3>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {application.coverLetterContent}
                      </pre>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Strategy Tab */}
              <TabsContent value="strategy" className="space-y-4 mt-4">
                {/* @ts-ignore */}
                {application.outreachContent ? (
                  <>
                    {/* LinkedIn Message Card */}
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          LinkedIn Connection Message
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText((application.outreachContent as any).linkedinMessage);
                            toast.success("Copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={(application.outreachContent as any).linkedinMessage}
                        readOnly
                        rows={4}
                        className="resize-none font-mono text-sm bg-muted/30"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {(application.outreachContent as any).linkedinMessage.length} / 300 characters
                      </p>
                    </Card>

                    {/* Cold Email Card */}
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          Cold Email
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const emailContent = `Subject: ${(application.outreachContent as any).coldEmailSubject}\n\n${(application.outreachContent as any).coldEmailBody}`;
                            navigator.clipboard.writeText(emailContent);
                            toast.success("Email copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Email
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Subject Line</label>
                          <Input
                            value={(application.outreachContent as any).coldEmailSubject}
                            readOnly
                            className="mt-1 font-mono text-sm bg-muted/30"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Email Body</label>
                          <Textarea
                            value={(application.outreachContent as any).coldEmailBody}
                            readOnly
                            rows={8}
                            className="mt-1 resize-none font-mono text-sm bg-muted/30"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Re-generate Button */}
                    <Button
                      onClick={() => {
                        outreachMutation.mutate({ applicationId: application.id });
                      }}
                      disabled={outreachMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {outreachMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Regenerate Outreach
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Card className="p-12">
                    <div className="text-center">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="font-medium mb-2">Generate Outreach Strategy</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Create peer-level LinkedIn and email outreach based on your strategic analysis
                      </p>
                      <Button
                        onClick={() => {
                          outreachMutation.mutate({ applicationId: application.id });
                        }}
                        disabled={outreachMutation.isPending}
                      >
                        {outreachMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Drafting peer-level outreach...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Outreach Strategy
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Career Path Tab */}
              <TabsContent value="career-path" className="space-y-4 mt-4">
                {application.pivotAnalysis ? (
                  <>
                    {/* Pivot Strategy */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-purple-900 dark:text-purple-100">
                        <Target className="h-5 w-5" />
                        Career Transition Strategy
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {application.pivotAnalysis.pivotStrategy}
                      </p>
                    </Card>

                    {/* Bridge Skills */}
                    <Card className="p-6">
                      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Bridge Skills (Transferable Strengths)
                      </h3>
                      <div className="space-y-6">
                        {application.pivotAnalysis.bridgeSkills.map((bridge, index) => (
                          <div key={index} className="relative pl-6 border-l-2 border-purple-300 dark:border-purple-700">
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                              {bridge.skill}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
                                  From
                                </Badge>
                                <p className="flex-1 text-gray-600 dark:text-gray-400">{bridge.fromContext}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700">
                                  To
                                </Badge>
                                <p className="flex-1 text-gray-600 dark:text-gray-400">{bridge.toContext}</p>
                              </div>
                              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md border border-purple-200 dark:border-purple-800">
                                <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Strategic Frame:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{bridge.strategicFrame}"</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Transferable Strengths */}
                    <Card className="p-6">
                      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        Your Unique Value
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {application.pivotAnalysis.transferableStrengths.map((strength, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-300 dark:from-purple-950/30 dark:to-blue-950/30 dark:text-purple-300 dark:border-purple-700 px-3 py-1"
                          >
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </Card>

                    <Button
                      onClick={handleRunPivotAnalysis}
                      disabled={pivotMutation.isPending}
                      variant="outline"
                      className="w-full border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950/30"
                    >
                      {pivotMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Re-analyzing Pivot...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Re-analyze Career Path
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Card className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-purple-100 dark:bg-purple-950/30 rounded-full">
                        <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Career Pivot Analysis</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md">
                          Identify transferable skills and strategic framing for career transitions.
                          Get 3-5 "Bridge Skills" that connect your background to this role.
                        </p>
                      </div>
                      <Button
                        onClick={handleRunPivotAnalysis}
                        disabled={pivotMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {pivotMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze Career Path
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4 mt-4">
                <Card className="p-4">
                  <Textarea
                    placeholder="Add notes about recruiter contact, interview details, follow-up actions, or any other important information..."
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={!hasUnsavedChanges || updateMutation.isPending}
                    className="w-full mt-4"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Notes
                      </>
                    )}
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            {/* Delete Button */}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Application
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Application not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
