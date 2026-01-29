import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Linkedin,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface OpportunityDetailModalProps {
  opportunityId: number | null;
  open: boolean;
  onClose: () => void;
}

export function OpportunityDetailModal({
  opportunityId,
  open,
  onClose,
}: OpportunityDetailModalProps) {
  const [isApplying, setIsApplying] = useState(false);

  const { data: opportunity, isLoading } = trpc.opportunities.getById.useQuery(
    { id: opportunityId! },
    { enabled: !!opportunityId }
  );

  const quickApplyMutation = trpc.applications.quickApply.useMutation({
    onSuccess: () => {
      alert("Application generated successfully!");
      onClose();
    },
    onError: (error) => {
      alert(`Failed to generate application: ${error.message}`);
    },
  });

  const handleQuickApply = async () => {
    if (!opportunityId) return;
    setIsApplying(true);
    try {
      await quickApplyMutation.mutateAsync({ opportunityId });
    } finally {
      setIsApplying(false);
    }
  };

  if (!open || !opportunityId) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {opportunity?.roleTitle || "Loading..."}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {opportunity?.companyName}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {opportunity?.locationCity || opportunity?.locationType}
                </div>
                {(opportunity?.baseSalaryMin || opportunity?.baseSalaryMax) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${opportunity.baseSalaryMin?.toLocaleString()} - ${opportunity.baseSalaryMax?.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <p>Loading opportunity details...</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Match Score */}
            {((opportunity as any)?.matchScore !== undefined && (opportunity as any)?.matchScore !== null) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Match Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                      {(opportunity as any).matchScore}%
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                          style={{ width: `${(opportunity as any).matchScore}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {(opportunity as any).matchScore >= 80
                          ? "Excellent match for your profile"
                          : (opportunity as any).matchScore >= 60
                          ? "Good match for your skills"
                          : "Moderate match"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {opportunity?.jobDescription || "No description available"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Analysis (from Profiler Agent) */}
            {opportunity?.whyNow && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Strategic Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {opportunity.whyNow}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contacts */}
            {(opportunity?.hiringManagerName || opportunity?.recruiterName) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-purple-500" />
                    Key Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunity.hiringManagerName && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Hiring Manager</Badge>
                          <span className="font-medium">
                            {opportunity.hiringManagerName}
                          </span>
                        </div>
                        {opportunity.hiringManagerTitle && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {opportunity.hiringManagerTitle}
                          </p>
                        )}
                        {opportunity.hiringManagerLinkedin && (
                          <a
                            href={opportunity.hiringManagerLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Linkedin className="h-4 w-4" />
                            View LinkedIn Profile
                          </a>
                        )}
                      </div>
                    )}
                    {opportunity.recruiterName && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Recruiter</Badge>
                          <span className="font-medium">
                            {opportunity.recruiterName}
                          </span>
                        </div>
                        {opportunity.recruiterEmail && (
                          <a
                            href={`mailto:${opportunity.recruiterEmail}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-4 w-4" />
                            {opportunity.recruiterEmail}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {opportunity?.companyStage && (
                    <div>
                      <span className="text-muted-foreground">Company Stage:</span>
                      <p className="font-medium">{opportunity.companyStage}</p>
                    </div>
                  )}
                  {opportunity?.companyIndustry && (
                    <div>
                      <span className="text-muted-foreground">Industry:</span>
                      <p className="font-medium">{opportunity.companyIndustry}</p>
                    </div>
                  )}
                  {opportunity?.postedDate && (
                    <div>
                      <span className="text-muted-foreground">Posted:</span>
                      <p className="font-medium">
                        {new Date(opportunity.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {opportunity?.jobUrl && (
                    <div>
                      <span className="text-muted-foreground">Apply URL:</span>
                      <a
                        href={opportunity.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block truncate"
                      >
                        {opportunity.jobUrl}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleQuickApply}
                disabled={isApplying}
                className="flex-1"
                size="lg"
              >
                {isApplying ? "Generating Application..." : "🚀 1-Click Apply"}
              </Button>
              <Button variant="outline" size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
