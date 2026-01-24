import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  FileText,
  Loader2,
  Briefcase,
  Shield,
  RefreshCw,
  XCircle,
  Check
} from "lucide-react";

interface ResumePreviewProps {
  resumeId?: number;
  resumeContent: string;
  matchScore: number;
  missingKeywords: string[];
  professionalSummary: string;
  selectedAchievements: any[];
  onExport: () => void;
  onClose: () => void;
  onCreateApplication?: () => void;
  isCreatingApplication?: boolean;
}

export function ResumePreview({
  resumeId,
  resumeContent,
  matchScore,
  missingKeywords,
  professionalSummary,
  selectedAchievements,
  onExport,
  onClose,
  onCreateApplication,
  isCreatingApplication = false,
}: ResumePreviewProps) {
  const [atsAnalysis, setAtsAnalysis] = useState<{
    atsScore: number;
    formattingIssues: string[];
    keywordMatch: string[];
    recommendedChanges: string[];
  } | null>(null);

  const checkATSMutation = trpc.resumes.checkATS.useMutation({
    onSuccess: (data) => {
      setAtsAnalysis(data);
      toast.success("ATS analysis complete!");
    },
    onError: (error) => {
      toast.error(`ATS check failed: ${error.message}`);
    },
  });

  // Auto-run ATS check on mount if resumeId is provided
  useEffect(() => {
    if (resumeId && !atsAnalysis && !checkATSMutation.isPending) {
      checkATSMutation.mutate({ resumeId });
    }
  }, [resumeId]);

  const handleRescan = () => {
    if (resumeId) {
      checkATSMutation.mutate({ resumeId });
    }
  };
  // Determine match score color and label
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Needs Improvement";
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getATSScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
      {/* Match Score Card */}
      <Card className={`border-2 ${getMatchScoreColor(matchScore)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">
                  {matchScore}% Match
                </CardTitle>
                <CardDescription className="font-medium">
                  {getMatchScoreLabel(matchScore)}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {selectedAchievements.length} achievements selected
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gap Analysis */}
      {missingKeywords && missingKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Gap Analysis
            </CardTitle>
            <CardDescription>
              Skills or keywords the job requires that aren't strongly represented in your selected achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-amber-700 border-amber-300">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              💡 Tip: Consider adding achievements that demonstrate these skills, or mention them in your cover letter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Professional Summary
          </CardTitle>
          <CardDescription>
            AI-generated summary tailored to this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">
            {professionalSummary}
          </p>
        </CardContent>
      </Card>

      {/* Selected Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Selected Achievements
          </CardTitle>
          <CardDescription>
            {selectedAchievements.length} achievements chosen for maximum impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedAchievements.map((achievement, index) => (
            <div key={achievement.id || index} className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-base">
                    {achievement.roleTitle || "Role"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.company || "Company"}
                  </p>
                </div>
                {achievement.impactMeterScore > 0 && (
                  <Badge variant="secondary">
                    Impact: {achievement.impactMeterScore}/100
                  </Badge>
                )}
              </div>
              
              <div className="pl-4 border-l-2 border-amber-200 space-y-2 text-sm">
                {achievement.situation && (
                  <div>
                    <span className="font-medium text-muted-foreground">Situation:</span>{" "}
                    <span>{achievement.situation}</span>
                  </div>
                )}
                {achievement.task && (
                  <div>
                    <span className="font-medium text-muted-foreground">Task:</span>{" "}
                    <span>{achievement.task}</span>
                  </div>
                )}
                {achievement.action && (
                  <div>
                    <span className="font-medium text-muted-foreground">Action:</span>{" "}
                    <span>{achievement.action}</span>
                  </div>
                )}
                {achievement.result && (
                  <div>
                    <span className="font-medium text-muted-foreground">Result:</span>{" "}
                    <span>{achievement.result}</span>
                  </div>
                )}
              </div>
              
              {index < selectedAchievements.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      </div>

      {/* ATS Analysis Sidebar */}
      {resumeId && (
        <div className="w-96 space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  ATS Analysis
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRescan}
                  disabled={checkATSMutation.isPending}
                  className="gap-2"
                >
                  {checkATSMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Re-scan
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Applicant Tracking System compatibility check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {checkATSMutation.isPending && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-muted-foreground mt-2">Analyzing resume...</p>
                </div>
              )}

              {!checkATSMutation.isPending && !atsAnalysis && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No ATS analysis yet</p>
                  <p className="text-sm mt-1">Click "Re-scan" to check compatibility</p>
                </div>
              )}

              {atsAnalysis && (
                <>
                  {/* ATS Score Gauge */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                          className="text-gray-200"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - atsAnalysis.atsScore / 100)}`}
                          className={getATSScoreColor(atsAnalysis.atsScore)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{atsAnalysis.atsScore}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <p className={`font-semibold mt-2 ${getATSScoreColor(atsAnalysis.atsScore)}`}>
                      {getATSScoreLabel(atsAnalysis.atsScore)}
                    </p>
                  </div>

                  <Separator />

                  {/* Formatting Issues */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      {atsAnalysis.formattingIssues.length === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      Formatting Check
                    </h4>
                    {atsAnalysis.formattingIssues.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        <Check className="h-4 w-4" />
                        <span>No formatting issues detected</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {atsAnalysis.formattingIssues.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Keyword Matches */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Keyword Matches
                    </h4>
                    {atsAnalysis.keywordMatch.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No keywords matched</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keywordMatch.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-green-100 text-green-700">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Recommended Changes */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                      Recommendations
                    </h4>
                    {atsAnalysis.recommendedChanges.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recommendations</p>
                    ) : (
                      <div className="space-y-2">
                        {atsAnalysis.recommendedChanges.map((change, idx) => (
                          <div key={idx} className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <p>{change}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end col-span-full">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export to PDF
        </Button>
        {onCreateApplication && (
          <Button 
            onClick={onCreateApplication} 
            className="gap-2"
            disabled={isCreatingApplication}
          >
            {isCreatingApplication ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4" />
                Create Application
              </>
            )}
          </Button>
        )}
      </div>

      {/* Hidden print content */}
      <div className="hidden print:block">
        <div className="max-w-4xl mx-auto p-8 bg-white">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {resumeContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
