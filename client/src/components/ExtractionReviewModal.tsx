import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Sparkles, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExtractedAchievement {
  situation: string;
  task: string;
  action: string;
  result: string;
  role: string;
  company?: string;
  confidenceScore?: number;
}

interface ExtractionReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievements: ExtractedAchievement[];
  onImport: (selectedAchievements: ExtractedAchievement[]) => void;
  isImporting?: boolean;
}

export function ExtractionReviewModal({
  open,
  onOpenChange,
  achievements: initialAchievements,
  onImport,
  isImporting = false,
}: ExtractionReviewModalProps) {
  const [achievements, setAchievements] = useState<
    (ExtractedAchievement & { selected: boolean; id: string })[]
  >(
    initialAchievements.map((a, i) => ({
      ...a,
      selected: true,
      id: `achievement-${i}`,
    }))
  );

  const selectedCount = achievements.filter(a => a.selected).length;

  const handleFieldChange = (
    id: string,
    field: keyof ExtractedAchievement,
    value: string
  ) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleToggle = (id: string) => {
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const handleDelete = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const handleDiscardAll = () => {
    onOpenChange(false);
  };

  const handleImport = () => {
    const selectedAchievements = achievements
      .filter(a => a.selected)
      .map(({ selected, id, confidenceScore, ...achievement }) => achievement);
    onImport(selectedAchievements);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Review Extracted Achievements
          </DialogTitle>
          <DialogDescription>
            We found {achievements.length} potential achievement
            {achievements.length !== 1 ? "s" : ""}. Review, edit, and select
            which ones to import.
          </DialogDescription>
        </DialogHeader>

        {achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No achievements found</p>
            <p className="text-sm text-muted-foreground mt-2">
              The AI couldn't extract any clear achievements from this source
              material.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <Card
                  key={achievement.id}
                  className={!achievement.selected ? "opacity-50" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="flex items-center pt-2">
                        <Checkbox
                          checked={achievement.selected}
                          onCheckedChange={() => handleToggle(achievement.id)}
                          aria-label={`Select achievement ${index + 1}`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                              Achievement #{index + 1}
                              {achievement.confidenceScore && (
                                <span
                                  className={`ml-2 text-xs ${achievement.confidenceScore >= 0.8 ? "text-green-600" : "text-yellow-600"}`}
                                >
                                  {Math.round(
                                    achievement.confidenceScore * 100
                                  )}
                                  % confidence
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">
                                {achievement.role}
                              </span>
                              {achievement.company && (
                                <>
                                  <span>•</span>
                                  <span>{achievement.company}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(achievement.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Editable STAR Fields */}
                        <div className="space-y-3">
                          <div>
                            <Label
                              htmlFor={`${achievement.id}-situation`}
                              className="text-xs font-medium"
                            >
                              Situation
                            </Label>
                            <Textarea
                              id={`${achievement.id}-situation`}
                              value={achievement.situation}
                              onChange={e =>
                                handleFieldChange(
                                  achievement.id,
                                  "situation",
                                  e.target.value
                                )
                              }
                              className="mt-1 min-h-[60px] text-sm"
                              placeholder="Context or circumstances..."
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor={`${achievement.id}-task`}
                              className="text-xs font-medium"
                            >
                              Task
                            </Label>
                            <Textarea
                              id={`${achievement.id}-task`}
                              value={achievement.task}
                              onChange={e =>
                                handleFieldChange(
                                  achievement.id,
                                  "task",
                                  e.target.value
                                )
                              }
                              className="mt-1 min-h-[60px] text-sm"
                              placeholder="Challenge or goal..."
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor={`${achievement.id}-action`}
                              className="text-xs font-medium"
                            >
                              Action
                            </Label>
                            <Textarea
                              id={`${achievement.id}-action`}
                              value={achievement.action}
                              onChange={e =>
                                handleFieldChange(
                                  achievement.id,
                                  "action",
                                  e.target.value
                                )
                              }
                              className="mt-1 min-h-[60px] text-sm"
                              placeholder="What you did..."
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor={`${achievement.id}-result`}
                              className="text-xs font-medium"
                            >
                              Result
                            </Label>
                            <Textarea
                              id={`${achievement.id}-result`}
                              value={achievement.result}
                              onChange={e =>
                                handleFieldChange(
                                  achievement.id,
                                  "result",
                                  e.target.value
                                )
                              }
                              className="mt-1 min-h-[60px] text-sm"
                              placeholder="Quantifiable outcome..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleDiscardAll}
            disabled={isImporting}
          >
            Discard All
          </Button>

          <Button
            onClick={handleImport}
            disabled={
              selectedCount === 0 || isImporting || achievements.length === 0
            }
            className="gap-2"
          >
            {isImporting ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Importing...
              </>
            ) : (
              <>
                Import {selectedCount} Selected Achievement
                {selectedCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
