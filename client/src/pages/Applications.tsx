import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  FileText,
  MapPin,
  Building2,
  Calendar,
  TrendingUp,
  Loader2,
  ExternalLink,
  Download,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Applications() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"appliedDate" | "status" | "company">("appliedDate");

  const { data: applications, isLoading, refetch } = trpc.applications.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  
  // Sort applications
  const sortedApplications = useMemo(() => {
    if (!applications) return [];
    
    const sorted = [...applications];
    sorted.sort((a, b) => {
      if (sortBy === "appliedDate") {
        const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return dateB - dateA; // Newest first
      } else if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "");
      } else if (sortBy === "company") {
        const companyA = (a as any).opportunity?.companyName || "";
        const companyB = (b as any).opportunity?.companyName || "";
        return companyA.localeCompare(companyB);
      }
      return 0;
    });
    
    return sorted;
  }, [applications, sortBy]);

  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const generatePackage = trpc.applications.generatePackage.useMutation({
    onSuccess: () => {
      toast.success("Package generation started. You'll be notified when it's ready.");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      applied: "bg-blue-500",
      response_received: "bg-purple-500",
      phone_screen: "bg-yellow-500",
      interview: "bg-orange-500",
      final_interview: "bg-pink-500",
      offer: "bg-green-500",
      accepted: "bg-emerald-600",
      rejected: "bg-red-500",
      withdrawn: "bg-gray-400",
      ghosted: "bg-gray-600",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={() => setLocation("/jobs")}>
              Jobs
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track your job applications and follow-ups
          </p>
        </div>

        {/* Status Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              {[
                "draft",
                "applied",
                "response_received",
                "phone_screen",
                "interview",
                "final_interview",
                "offer",
              ].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sort Control */}
        {applications && applications.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appliedDate">Applied Date (Newest)</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="company">Company Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Applications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {sortedApplications.length} Application{sortedApplications.length !== 1 ? "s" : ""}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Sorted by {sortBy === "appliedDate" ? "applied date" : sortBy === "status" ? "status" : "company name"}
              </div>
            </div>

            {sortedApplications.map((app: any) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {app.opportunity?.roleTitle || "Role Title"}
                          </h3>
                          <p className="text-muted-foreground">
                            {app.opportunity?.companyName || "Company Name"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {app.opportunity?.location || "Location"}
                        </div>
                        {app.appliedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        )}
                        {app.matchScore && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {app.matchScore}% match
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getStatusColor(app.status || "draft")}>
                          {getStatusLabel(app.status || "draft")}
                        </Badge>
                        {app.priorityLevel && (
                          <Badge variant="outline">{app.priorityLevel} priority</Badge>
                        )}
                        {app.nextFollowUpDue && new Date(app.nextFollowUpDue) <= new Date() && (
                          <Badge className="bg-orange-500">
                            Follow-up Due
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/applications/${app.id}`)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        {(app.resumePdfUrl || app.packageZipUrl) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {app.resumePdfUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={app.resumePdfUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-3 w-3 mr-2" />
                                    Resume (PDF)
                                  </a>
                                </DropdownMenuItem>
                              )}
                              {app.resumeDocxUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={app.resumeDocxUrl} target="_blank" rel="noopener noreferrer">
                                    <FileDown className="h-3 w-3 mr-2" />
                                    Resume (DOCX)
                                  </a>
                                </DropdownMenuItem>
                              )}
                              {app.packageZipUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={app.packageZipUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-3 w-3 mr-2" />
                                    Full package (ZIP)
                                  </a>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePackage.mutate({ applicationId: app.id })}
                            disabled={generatePackage.isPending}
                          >
                            {generatePackage.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3 mr-1" />
                            )}
                            Generate package
                          </Button>
                        )}
                        {app.opportunity?.jobUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={app.opportunity.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Job Post
                            </a>
                          </Button>
                        )}
                        {app.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({ id: app.id, status: "applied" })
                            }
                            disabled={updateStatus.isPending}
                          >
                            Mark as Applied
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Timeline indicator */}
                    <div className="ml-4 text-right">
                      <div className="text-xs text-muted-foreground mb-1">Created</div>
                      <div className="text-sm font-medium">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                      {app.nextFollowUpDue && (
                        <>
                          <div className="text-xs text-muted-foreground mt-2 mb-1">
                            Follow-up Due
                          </div>
                          <div className="text-sm font-medium text-orange-600">
                            {new Date(app.nextFollowUpDue).toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by discovering jobs and using 1-Click Apply
                </p>
                <Button onClick={() => setLocation("/jobs")}>
                  Discover Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
