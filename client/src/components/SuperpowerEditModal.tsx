import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SuperpowerEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  superpowers: any[];
  achievements: any[];
  onSuccess?: () => void;
}

export function SuperpowerEditModal({
  open,
  onOpenChange,
  superpowers,
  achievements,
  onSuccess,
}: SuperpowerEditModalProps) {
  const [editedSuperpowers, setEditedSuperpowers] = useState<any[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<{
    [key: number]: number[];
  }>({});

  const updateSuperpowerMutation = trpc.profile.updateSuperpower.useMutation({
    onSuccess: () => {
      toast.success("Superpowers updated successfully");
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update superpowers: ${error.message}`);
    },
  });

  useEffect(() => {
    if (open && superpowers) {
      // Initialize with existing superpowers or create 3 empty slots
      const initialized = Array.from({ length: 3 }, (_, i) => {
        const existing = superpowers[i];
        return existing
          ? { ...existing }
          : {
              id: null,
              title: "",
              description: "",
              evidence: "",
              evidenceAchievementIds: [],
            };
      });
      setEditedSuperpowers(initialized);

      // Initialize selected achievements
      const selected: { [key: number]: number[] } = {};
      initialized.forEach((sp, idx) => {
        selected[idx] = sp.evidenceAchievementIds || [];
      });
      setSelectedAchievements(selected);
    }
  }, [open, superpowers]);

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...editedSuperpowers];
    updated[index] = { ...updated[index], title: value };
    setEditedSuperpowers(updated);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...editedSuperpowers];
    updated[index] = { ...updated[index], description: value };
    setEditedSuperpowers(updated);
  };

  const toggleAchievement = (
    superpowerIndex: number,
    achievementId: number
  ) => {
    setSelectedAchievements(prev => {
      const current = prev[superpowerIndex] || [];
      const updated = current.includes(achievementId)
        ? current.filter(id => id !== achievementId)
        : [...current, achievementId];
      return { ...prev, [superpowerIndex]: updated };
    });
  };

  const handleSave = async () => {
    // Update each superpower with selected achievements
    const promises = editedSuperpowers.map((sp, idx) => {
      if (!sp.title || !sp.description) return null;

      const evidenceIds = selectedAchievements[idx] || [];
      const evidence = evidenceIds
        .map(id => {
          const achievement = achievements.find(a => a.id === id);
          return achievement ? achievement.description : "";
        })
        .filter(Boolean)
        .join(" | ");

      return updateSuperpowerMutation.mutateAsync({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        evidence,
        evidenceAchievementIds: evidenceIds,
      });
    });

    await Promise.all(promises.filter(Boolean));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Edit Your Top 3 Superpowers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {editedSuperpowers.map((superpower, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold">Superpower {index + 1}</h3>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor={`title-${index}`}>Title *</Label>
                    <Input
                      id={`title-${index}`}
                      value={superpower.title}
                      onChange={e => handleTitleChange(index, e.target.value)}
                      placeholder="e.g., Revenue Growth Architect"
                      className="mt-1"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor={`description-${index}`}>
                      Description *
                    </Label>
                    <Textarea
                      id={`description-${index}`}
                      value={superpower.description}
                      onChange={e =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      placeholder="Describe this superpower and how it sets you apart..."
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  {/* Evidence Achievements */}
                  <div>
                    <Label>Select Evidence Achievements</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Choose achievements that demonstrate this superpower
                    </p>
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 space-y-2">
                      {achievements && achievements.length > 0 ? (
                        achievements.map((achievement: any) => (
                          <div
                            key={achievement.id}
                            className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded"
                          >
                            <Checkbox
                              id={`achievement-${index}-${achievement.id}`}
                              checked={selectedAchievements[index]?.includes(
                                achievement.id
                              )}
                              onCheckedChange={() =>
                                toggleAchievement(index, achievement.id)
                              }
                            />
                            <label
                              htmlFor={`achievement-${index}-${achievement.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {achievement.description}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No achievements available. Add achievements to your
                          profile first.
                        </p>
                      )}
                    </div>
                    {selectedAchievements[index]?.length > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {selectedAchievements[index].length} achievement
                          {selectedAchievements[index].length !== 1
                            ? "s"
                            : ""}{" "}
                          selected
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                updateSuperpowerMutation.isPending ||
                editedSuperpowers.every(sp => !sp.title || !sp.description)
              }
            >
              {updateSuperpowerMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
