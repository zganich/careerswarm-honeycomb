import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, Calendar, Trash2, Save, ExternalLink, Target, Lightbulb } from "lucide-react";
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
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

                {/* Pain Points (Profiler Agent Analysis) */}
                {/* @ts-ignore */}
                {application.painPoints && application.painPoints.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Company Pain Points (AI Analysis)
                    </h3>
                    <div className="space-y-3">
                      {/* @ts-ignore */}
                      {application.painPoints.map((pain: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-amber-500 pl-3">
                          <div className="font-medium text-sm">{pain.challenge}</div>
                          <div className="text-sm text-muted-foreground mt-1">{pain.impact}</div>
                          {pain.keywords && pain.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pain.keywords.map((keyword: string, kidx: number) => (
                                <Badge key={kidx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
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
                <Card className="p-12">
                  <div className="text-center text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Strategy Tools Coming Soon</p>
                    <p className="text-sm mt-2">
                      This tab will house the "Scribe" agent for cover letter generation
                      and interview preparation strategies.
                    </p>
                  </div>
                </Card>
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
