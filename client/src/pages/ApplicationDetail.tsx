import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Copy, CheckCircle2, ExternalLink, 
  FileText, Mail, MessageSquare, Briefcase 
} from "lucide-react";
import StatusPipeline from "@/components/StatusPipeline";
import { useState } from "react";
import { toast } from "sonner";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  // Using sonner toast
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const { data: application, isLoading } = trpc.applications.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

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
            <h1 className="text-3xl font-bold mb-2">{opportunity?.roleTitle || "Job Title"}</h1>
            <p className="text-xl text-muted-foreground mb-3">{opportunity?.companyName || "Company"}</p>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[application.status || 'draft']}>
                {(application.status || 'draft').replace('_', ' ').toUpperCase()}
              </Badge>
              {application.appliedAt && (
                <span className="text-sm text-muted-foreground">
                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {opportunity?.jobUrl && (
            <Button variant="outline" asChild>
              <a href={opportunity.jobUrl} target="_blank" rel="noopener noreferrer">
                View Job Posting
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Generated Materials Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
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
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
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
                      {new Date(application.createdAt).toLocaleDateString()} at {new Date(application.createdAt).toLocaleTimeString()}
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
                      {new Date(application.appliedAt).toLocaleDateString()} at {new Date(application.appliedAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Application Submitted</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Applied via {application.appliedVia || 'company website'}
                    </div>
                  </div>
                )}

                {application.responseReceivedAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(application.responseReceivedAt).toLocaleDateString()} at {new Date(application.responseReceivedAt).toLocaleTimeString()}
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
                      {new Date(application.phoneScreenAt).toLocaleDateString()} at {new Date(application.phoneScreenAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Phone Screen Completed</div>
                  </div>
                )}

                {application.interviewScheduledAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(application.interviewScheduledAt).toLocaleDateString()} at {new Date(application.interviewScheduledAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">Interview Scheduled</div>
                  </div>
                )}

                {application.offerReceivedAt && (
                  <div className="mb-6">
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(application.offerReceivedAt).toLocaleDateString()} at {new Date(application.offerReceivedAt).toLocaleTimeString()}
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
                      {new Date(application.lastFollowUpAt).toLocaleDateString()} at {new Date(application.lastFollowUpAt).toLocaleTimeString()}
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
                        {new Date(application.nextFollowUpDue).toLocaleDateString()}
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
                    onClick={() => copyToClipboard(application.tailoredResumeText!, "Resume")}
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
                    <a href={application.tailoredResumeUrl} target="_blank" rel="noopener noreferrer">
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
                  onClick={() => copyToClipboard(application.coverLetterText!, "Cover Letter")}
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
              <h3 className="text-lg font-semibold">LinkedIn Connection Message</h3>
              {application.linkedinMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(application.linkedinMessage!, "LinkedIn Message")}
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
                  <p className="text-sm font-medium mb-2">To: {opportunity?.hiringManagerName || "Hiring Manager"}</p>
                  <p className="text-sm whitespace-pre-wrap">{application.linkedinMessage}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Personalize this message before sending. Mention a specific post or achievement from their profile.
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
                  onClick={() => copyToClipboard(application.emailTemplate!, "Email")}
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
                    <p className="text-sm font-medium">Application for {opportunity?.roleTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">To:</p>
                    <p className="text-sm">{opportunity?.hiringManagerEmail || opportunity?.hiringManagerName || "hiring@company.com"}</p>
                  </div>
                  <hr className="border-muted-foreground/20" />
                  <p className="text-sm whitespace-pre-wrap">{application.emailTemplate}</p>
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
      </Tabs>

      {/* Application Notes */}
      {application.outcomeNotes && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3">Notes</h3>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {application.outcomeNotes}
          </p>
        </Card>
      )}

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
            <span>Send LinkedIn connection request to hiring manager within 24 hours</span>
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
