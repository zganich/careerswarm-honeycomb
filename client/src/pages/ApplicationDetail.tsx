import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Briefcase,
  Download,
  Loader2,
  FileDown,
  Target,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GitBranch,
} from "lucide-react";
import StatusPipeline from "@/components/StatusPipeline";
import NotesSection from "@/components/NotesSection";
import { useState } from "react";
import { toast } from "sonner";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  // Using sonner toast
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const {
    data: application,
    isLoading,
    refetch,
  } = trpc.applications.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  const { data: packageStatus, isLoading: packageStatusLoading } =
    trpc.applications.getPackageStatus.useQuery(
      { applicationId: parseInt(id!) },
      { enabled: !!id && !!application }
    );

  const generatePackage = trpc.applications.generatePackage.useMutation({
    onSuccess: () => {
      toast.success(
        "Package generation started. You'll be notified when it's ready."
      );
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const predictSuccess = trpc.applications.predictSuccess.useMutation({
    onSuccess: () => {
      toast.success("Success prediction generated.");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const analyzeSkillGap = trpc.applications.analyzeSkillGap.useMutation({
    onSuccess: () => {
      toast.success("Skill gap analysis generated.");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const analyzePivot = trpc.applications.analyzePivot.useMutation({
    onSuccess: () => {
      toast.success("Pivot analysis generated.");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const [predictionExpanded, setPredictionExpanded] = useState(false);
  const [skillGapExpanded, setSkillGapExpanded] = useState(false);
  const [pivotExpanded, setPivotExpanded] = useState(false);

  const { data: opportunity } = trpc.opportunities.getById.useQuery(
    { id: application?.opportunityId! },
    { enabled: !!application?.opportunityId }
  );

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error("Could not copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Application not found</p>
          <Button onClick={() => navigate("/applications")} className="mt-4">
            Back to Applications
          </Button>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500",
    submitted: "bg-blue-500",
    under_review: "bg-yellow-500",
    interview: "bg-purple-500",
    offer: "bg-green-500",
    rejected: "bg-red-500",
    withdrawn: "bg-gray-400",
  };

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/applications")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {opportunity?.roleTitle || "Job Title"}
            </h1>
            <p className="text-xl text-muted-foreground mb-3">
              {opportunity?.companyName || "Company"}
            </p>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[application.status || "draft"]}>
                {(application.status || "draft")
                  .replace("_", " ")
                  .toUpperCase()}
              </Badge>
              {typeof packageStatus?.atsScore === "number" && (
                <Badge
                  variant="outline"
                  className="font-mono"
                  title="ATS keyword match: resume vs job description"
                >
                  ATS: {packageStatus.atsScore}%
                </Badge>
              )}
              {(() => {
                const pred = application.analytics?.successPrediction as
                  | { probability?: number }
                  | undefined;
                return pred && typeof pred.probability === "number" ? (
                  <Badge
                    variant="outline"
                    className="font-mono"
                    title="AI estimate: likelihood of advancing to interview/offer"
                  >
                    Success: {pred.probability}%
                  </Badge>
                ) : null;
              })()}
              {application.appliedAt && (
                <span className="text-sm text-muted-foreground">
                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {packageStatusLoading ? (
              <Button variant="outline" disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking package…
              </Button>
            ) : packageStatus?.ready ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {packageStatus.files?.resumePDF && (
                    <DropdownMenuItem asChild>
                      <a
                        href={packageStatus.files.resumePDF}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Resume (PDF)
                      </a>
                    </DropdownMenuItem>
                  )}
                  {packageStatus.files?.resumeDOCX && (
                    <DropdownMenuItem asChild>
                      <a
                        href={packageStatus.files.resumeDOCX}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Resume (DOCX)
                      </a>
                    </DropdownMenuItem>
                  )}
                  {packageStatus.packageUrl && (
                    <DropdownMenuItem asChild>
                      <a
                        href={packageStatus.packageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Full package (ZIP)
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  generatePackage.mutate({ applicationId: application!.id! })
                }
                disabled={generatePackage.isPending}
              >
                {generatePackage.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate package
                  </>
                )}
              </Button>
            )}
            {application.tailoredResumeText ? (
              <Button
                variant="outline"
                onClick={() =>
                  predictSuccess.mutate({ applicationId: application!.id! })
                }
                disabled={predictSuccess.isPending}
                title="Estimate likelihood of advancing to interview or offer"
              >
                {predictSuccess.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Predicting…
                  </>
                ) : (() => {
                    const p = application.analytics?.successPrediction as
                      | { probability?: number }
                      | undefined;
                    return p && typeof p.probability === "number";
                  })() ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Re-predict success
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Predict success
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                title="Run 1-Click Apply or generate a tailored resume first"
              >
                <Target className="w-4 h-4 mr-2" />
                Predict success
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                analyzePivot.mutate({ applicationId: application!.id! })
              }
              disabled={analyzePivot.isPending}
              title="Identify bridge skills for career pivot"
            >
              {analyzePivot.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing…
                </>
              ) : (() => {
                  const pv = application.pivotAnalysis as
                    | { bridgeSkills?: unknown[] }
                    | undefined;
                  return (
                    pv &&
                    Array.isArray(pv.bridgeSkills) &&
                    pv.bridgeSkills.length > 0
                  );
                })() ? (
                <>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Re-analyze pivot
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Analyze pivot
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                analyzeSkillGap.mutate({ applicationId: application!.id! })
              }
              disabled={analyzeSkillGap.isPending}
              title="Identify missing skills and get upskilling steps"
            >
              {analyzeSkillGap.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing…
                </>
              ) : (() => {
                  const sg = application.analytics?.skillGap as
                    | { missingSkills?: unknown[] }
                    | undefined;
                  return (
                    sg &&
                    Array.isArray(sg.missingSkills) &&
                    sg.missingSkills.length > 0
                  );
                })() ? (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Re-analyze skill gap
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Analyze skill gap
                </>
              )}
            </Button>
            {opportunity?.jobUrl && (
              <Button variant="outline" asChild>
                <a
                  href={opportunity.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Job Posting
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Generated Materials Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="timeline">
            <Briefcase className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="resume">
            <FileText className="w-4 h-4 mr-2" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="cover-letter">
            <Mail className="w-4 h-4 mr-2" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="linkedin">
            <MessageSquare className="w-4 h-4 mr-2" />
            LinkedIn Message
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email Outreach
          </TabsTrigger>
          <TabsTrigger value="notes">
            <MessageSquare className="w-4 h-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {/* Success Prediction */}
          {(() => {
            const pred = application.analytics?.successPrediction as
              | {
                  probability?: number;
                  reasoning?: string;
                  greenFlags?: string[];
                  redFlags?: string[];
                }
              | undefined;
            if (!pred || typeof pred.probability !== "number") return null;
            return (
              <Card className="p-6 mb-4">
                <button
                  type="button"
                  onClick={() => setPredictionExpanded(!predictionExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Success prediction: {pred.probability}%
                  </h3>
                  {predictionExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {predictionExpanded && (
                  <div className="mt-4 space-y-4 pt-4 border-t">
                    {pred.reasoning && (
                      <p className="text-sm text-muted-foreground">
                        {pred.reasoning}
                      </p>
                    )}
                    {(pred.greenFlags?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                          Strengths
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {pred.greenFlags!.map((flag, i) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(pred.redFlags?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                          Areas to address
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {pred.redFlags!.map((flag, i) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Skill Gap */}
          {(() => {
            const sg = application.analytics?.skillGap as
              | {
                  missingSkills?: string[];
                  upskillingPlan?: string[];
                }
              | undefined;
            if (
              !sg ||
              !Array.isArray(sg.missingSkills) ||
              sg.missingSkills.length === 0
            )
              return null;
            return (
              <Card className="p-6 mb-4">
                <button
                  type="button"
                  onClick={() => setSkillGapExpanded(!skillGapExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Skill gap: {sg.missingSkills.length} missing areas
                  </h3>
                  {skillGapExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {skillGapExpanded && (
                  <div className="mt-4 space-y-4 pt-4 border-t">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Missing skills
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {sg.missingSkills!.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    {(sg.upskillingPlan?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Upskilling plan
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {sg.upskillingPlan!.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Pivot / Bridge Skills */}
          {(() => {
            const pv = application.pivotAnalysis as
              | {
                  bridgeSkills?: Array<{
                    skill: string;
                    fromContext: string;
                    toContext: string;
                    strategicFrame: string;
                  }>;
                  pivotStrategy?: string;
                  transferableStrengths?: string[];
                }
              | undefined;
            if (
              !pv ||
              !Array.isArray(pv.bridgeSkills) ||
              pv.bridgeSkills.length === 0
            )
              return null;
            return (
              <Card className="p-6 mb-4">
                <button
                  type="button"
                  onClick={() => setPivotExpanded(!pivotExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <GitBranch className="w-5 h-5 mr-2" />
                    Career pivot: {pv.bridgeSkills.length} bridge skills
                  </h3>
                  {pivotExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {pivotExpanded && (
                  <div className="mt-4 space-y-4 pt-4 border-t">
                    {pv.pivotStrategy && (
                      <p className="text-sm text-muted-foreground">
                        {pv.pivotStrategy}
                      </p>
                    )}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Bridge skills
                      </div>
                      <ul className="space-y-3">
                        {pv.bridgeSkills!.map((b, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium">{b.skill}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              — {b.fromContext} → {b.toContext}
                            </span>
                            {b.strategicFrame && (
                              <p className="mt-1 text-muted-foreground italic">
                                {b.strategicFrame}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {(pv.transferableStrengths?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Transferable strengths
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pv.transferableStrengths!.map((s, i) => (
                            <Badge key={i} variant="secondary">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Status Pipeline */}
          <StatusPipeline currentStatus={application.status || "draft"} />

          <Card className="p-6 mt-4">
            <h3 className="text-lg font-semibold mb-6">Application Timeline</h3>
            <div className="space-y-6">
              {/* Timeline events */}
              <div className="relative pl-8 border-l-2 border-primary/20">
                {application.createdAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(application.createdAt).toLocaleDateString()} at{" "}
                      {new Date(application.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Application Created</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Draft application generated by AI agents
                    </div>
                  </div>
                )}

                {application.appliedAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(application.appliedAt).toLocaleDateString()} at{" "}
                      {new Date(application.appliedAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Application Submitted</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Applied via {application.appliedVia || "company website"}
                    </div>
                  </div>
                )}

                {application.responseReceivedAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(
                        application.responseReceivedAt
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        application.responseReceivedAt
                      ).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Response Received</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Recruiter responded to your application
                    </div>
                  </div>
                )}

                {application.phoneScreenAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-yellow-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(application.phoneScreenAt).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(application.phoneScreenAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Phone Screen Completed</div>
                  </div>
                )}

                {application.interviewScheduledAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(
                        application.interviewScheduledAt
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        application.interviewScheduledAt
                      ).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Interview Scheduled</div>
                  </div>
                )}

                {application.offerReceivedAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(
                        application.offerReceivedAt
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        application.offerReceivedAt
                      ).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Offer Received</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      🎉 Congratulations!
                    </div>
                  </div>
                )}

                {application.lastFollowUpAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-blue-400 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(
                        application.lastFollowUpAt
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        application.lastFollowUpAt
                      ).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Follow-up Sent</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Follow-up count: {application.followUpCount || 0}
                    </div>
                  </div>
                )}
              </div>

              {application.nextFollowUpDue && (
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium text-orange-900 dark:text-orange-100">
                        Next Follow-up Due
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        {new Date(
                          application.nextFollowUpDue
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Resume Tab */}
        <TabsContent value="resume">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tailored Resume</h3>
              <div className="flex gap-2">
                {application.tailoredResumeText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(application.tailoredResumeText!, "Resume")
                    }
                  >
                    {copiedItem === "Resume" ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy Text
                  </Button>
                )}
                {application.tailoredResumeUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={application.tailoredResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {application.tailoredResumeText ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
                  {application.tailoredResumeText}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Resume not yet generated
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Cover Letter Tab */}
        <TabsContent value="cover-letter">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cover Letter</h3>
              {application.coverLetterText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      application.coverLetterText!,
                      "Cover Letter"
                    )
                  }
                >
                  {copiedItem === "Cover Letter" ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy
                </Button>
              )}
            </div>

            {application.coverLetterText ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
                  {application.coverLetterText}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Cover letter not yet generated
              </p>
            )}
          </Card>
        </TabsContent>

        {/* LinkedIn Message Tab */}
        <TabsContent value="linkedin">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                LinkedIn Connection Message
              </h3>
              {application.linkedinMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      application.linkedinMessage!,
                      "LinkedIn Message"
                    )
                  }
                >
                  {copiedItem === "LinkedIn Message" ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy
                </Button>
              )}
            </div>

            {application.linkedinMessage ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    To: {opportunity?.hiringManagerName || "Hiring Manager"}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {application.linkedinMessage}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Personalize this message before sending. Mention a
                  specific post or achievement from their profile.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                LinkedIn message not yet generated
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Email Outreach Tab */}
        <TabsContent value="email">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Email Outreach</h3>
              {application.emailTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(application.emailTemplate!, "Email")
                  }
                >
                  {copiedItem === "Email" ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy
                </Button>
              )}
            </div>

            {application.emailTemplate ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Subject:</p>
                    <p className="text-sm font-medium">
                      Application for {opportunity?.roleTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">To:</p>
                    <p className="text-sm">
                      {opportunity?.hiringManagerEmail ||
                        opportunity?.hiringManagerName ||
                        "hiring@company.com"}
                    </p>
                  </div>
                  <hr className="border-muted-foreground/20" />
                  <p className="text-sm whitespace-pre-wrap">
                    {application.emailTemplate}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Send this within 24 hours of applying to stand out.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Email outreach not yet generated
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <NotesSection applicationId={application.id!} />
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="p-6 mt-6 bg-primary/5 border-primary/20">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Next Steps
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Review and customize the resume and cover letter</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Submit application through company portal or email</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>
              Send LinkedIn connection request to hiring manager within 24 hours
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Follow up with email outreach 3-5 days after applying</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">5.</span>
            <span>Update application status as you hear back</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
