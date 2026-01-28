import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, TrendingUp, Target, Clock, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Achievement {
  id: number;
  workExperienceId: number;
  description: string;
  context: string | null;
  metricType: string | null;
  metricValue: string | null;
  metricUnit: string | null;
  keywords: string[];
  timesUsed: number;
  lastUsedAt: Date | null;
}

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AchievementDetailModal({
  achievement,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: AchievementDetailModalProps) {
  const { data: achievementStats } = trpc.profile.getAchievementStats.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();

  if (!achievement) return null;

  // Get stats for this achievement
  const stats = achievementStats?.find((s: any) => s.achievementId === achievement.id);
  const successRate = stats?.successRate || 0;
  const usageCount = stats?.usageCount || 0;

  // Find work experience for this achievement
  const workExperience = profile?.workExperiences.find(
    (we: any) => we.id === achievement.workExperienceId
  );

  // Find superpowers that reference this achievement
  const linkedSuperpowers = profile?.superpowers.filter((sp: any) => {
    const evidenceIds = sp.evidenceAchievementIds || [];
    return evidenceIds.includes(achievement.id);
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Achievement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Work Experience Context */}
          {workExperience && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{workExperience.companyName}</p>
              <p>{workExperience.jobTitle}</p>
              <p>
                {new Date(workExperience.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {workExperience.endDate
                  ? new Date(workExperience.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Present"}
              </p>
            </div>
          )}

          {/* Achievement Description */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{achievement.description}</p>
              {achievement.context && (
                <>
                  <h3 className="font-semibold mt-4 mb-2">Context</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {achievement.context}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Metrics */}
          {achievement.metricType && achievement.metricValue && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="font-medium">{achievement.metricType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Value</p>
                    <p className="font-medium">
                      {achievement.metricValue}
                      {achievement.metricUnit && ` ${achievement.metricUnit}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Timeframe</p>
                    <p className="font-medium">
                      {workExperience
                        ? `${Math.round(
                            (new Date(workExperience.endDate || Date.now()).getTime() -
                              new Date(workExperience.startDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )} months`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keywords/Tags */}
          {achievement.keywords && achievement.keywords.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {achievement.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Usage Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Times Used</p>
                  <p className="text-2xl font-bold">{usageCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                  <p className="text-2xl font-bold">{successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Used</p>
                  <p className="text-sm font-medium">
                    {achievement.lastUsedAt
                      ? new Date(achievement.lastUsedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Never"}
                  </p>
                </div>
              </div>

              {/* Performance Badge */}
              {usageCount > 0 && (
                <div className="mt-4">
                  {successRate >= 70 ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      🏆 Top Performer
                    </Badge>
                  ) : successRate >= 50 ? (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      ✓ Good Performance
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Needs Refinement</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Superpowers */}
          {linkedSuperpowers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Linked Superpowers
                </h3>
                <div className="space-y-2">
                  {linkedSuperpowers.map((sp: any) => (
                    <div
                      key={sp.id}
                      className="flex items-center gap-2 p-2 bg-primary/5 rounded-md"
                    >
                      <span className="text-sm font-medium">{sp.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
