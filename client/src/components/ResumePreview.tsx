import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  FileText,
  Loader2,
  Briefcase
} from "lucide-react";

interface ResumePreviewProps {
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

  return (
    <div className="space-y-6">
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

      {/* Actions */}
      <div className="flex gap-3 justify-end">
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
