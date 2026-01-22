import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Building2, Calendar, TrendingUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type ApplicationStatus = "draft" | "submitted" | "viewed" | "screening" | "interview_scheduled" | "interviewed" | "offer" | "rejected" | "withdrawn";

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Draft", color: "bg-gray-500", icon: "📝" },
  submitted: { label: "Submitted", color: "bg-blue-500", icon: "📤" },
  viewed: { label: "Viewed", color: "bg-cyan-500", icon: "👀" },
  screening: { label: "Screening", color: "bg-purple-500", icon: "🔍" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-yellow-500", icon: "📅" },
  interviewed: { label: "Interviewed", color: "bg-orange-500", icon: "💬" },
  offer: { label: "Offer", color: "bg-green-500", icon: "🎉" },
  rejected: { label: "Rejected", color: "bg-red-500", icon: "❌" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-400", icon: "🚫" },
};

export default function Applications() {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "all">("all");
  
  const applicationsQuery = trpc.applications.list.useQuery();
  const updateStatusMutation = trpc.applications.updateStatus.useMutation();
  const generateMaterialsMutation = trpc.applications.generateMaterials.useMutation();
  const utils = trpc.useUtils();

  const applications = applicationsQuery.data || [];
  const filteredApplications = selectedStatus === "all"
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  const handleStatusChange = async (applicationId: number, newStatus: ApplicationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status: newStatus,
      });
      
      toast.success("Application status updated");
      utils.applications.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleGenerateMaterials = async (applicationId: number) => {
    try {
      await generateMaterialsMutation.mutateAsync({ applicationId });
      toast.success("Resume and cover letter generated!");
      utils.applications.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate materials");
    }
  };

  const getStatusCounts = () => {
    const counts: Record<ApplicationStatus, number> = {
      draft: 0,
      submitted: 0,
      viewed: 0,
      screening: 0,
      interview_scheduled: 0,
      interviewed: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };
    
    applications.forEach(app => {
      if (app.status && app.status in counts) {
        counts[app.status as ApplicationStatus]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Application Tracker</h1>
        <p className="text-muted-foreground">
          Manage your job applications and track progress through the hiring pipeline
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {(Object.keys(statusConfig) as ApplicationStatus[]).map(status => (
          <Card
            key={status}
            className={`cursor-pointer transition-all ${
              selectedStatus === status ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl mb-2">{statusConfig[status].icon}</div>
                <div className="text-2xl font-bold mb-1">{statusCounts[status]}</div>
                <div className="text-sm text-muted-foreground">{statusConfig[status].label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Button
            variant={selectedStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus("all")}
          >
            All ({applications.length})
          </Button>
        </div>
      </div>

      {/* Applications List */}
      {applicationsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              {selectedStatus === "all"
                ? "Start by searching for jobs and saving ones you're interested in"
                : `No applications in ${statusConfig[selectedStatus as ApplicationStatus].label} status`}
            </p>
            <Button onClick={() => window.location.href = "/jobs"}>
              Search Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map(application => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1">
                      {application.job?.title || "Unknown Position"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {application.job?.companyName || "Unknown Company"}
                      {application.job?.location && (
                        <>
                          <span>•</span>
                          <span>{application.job.location}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusConfig[application.status as ApplicationStatus]?.color || "bg-gray-500"} text-white`}>
                    {statusConfig[application.status as ApplicationStatus]?.label || application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Left Column: Details */}
                  <div className="space-y-3">
                    {application.job && application.job.qualificationScore !== null && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Match Score:</span>
                        <Badge variant="outline">{application.job.qualificationScore}%</Badge>
                      </div>
                    )}
                    
                    {application.lastStatusUpdate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Applied:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(application.lastStatusUpdate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {application.job?.jobUrl && (
                      <a
                        href={application.job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Job Posting
                      </a>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Update Status</label>
                      <Select
                        value={application.status || ''}
                        onValueChange={(value) => handleStatusChange(application.id, value as ApplicationStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusConfig) as ApplicationStatus[]).map(status => (
                            <SelectItem key={status} value={status}>
                              {statusConfig[status].icon} {statusConfig[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!application.resumeId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateMaterials(application.id)}
                        disabled={generateMaterialsMutation.isPending}
                        className="w-full"
                      >
                        {generateMaterialsMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Resume & Cover Letter
                          </>
                        )}
                      </Button>
                    )}

                    {application.resumeId && (
                      <div className="text-sm text-muted-foreground">
                        ✓ Resume & cover letter generated
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {application.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{application.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
