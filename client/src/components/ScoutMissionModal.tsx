import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ScoutMissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScoutMissionModal({ open, onOpenChange, onSuccess }: ScoutMissionModalProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");

  const utils = trpc.useUtils();

  const scoutMutation = trpc.jobs.scout.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Mission Complete: Added ${data.createdCount} high-match jobs to your board!`,
        {
          description: `Scanned ${data.totalScanned} candidates, qualified ${data.qualifiedCount}`,
        }
      );
      utils.applications.list.invalidate();
      onOpenChange(false);
      setQuery("");
      setLocation("");
      setMinSalary("");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Scout mission failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    scoutMutation.mutate({
      query: query.trim(),
      location: location.trim() || undefined,
      minSalary: minSalary ? parseInt(minSalary) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Launch Scout Mission
          </DialogTitle>
          <DialogDescription>
            The Scout Agent will search external job boards, qualify matches using AI, and add high-quality opportunities to your board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="query">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="query"
              placeholder="e.g., Software Engineer, Product Manager"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={scoutMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="e.g., San Francisco, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={scoutMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minSalary">Minimum Salary (optional)</Label>
            <Input
              id="minSalary"
              type="number"
              placeholder="e.g., 150000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              disabled={scoutMutation.isPending}
            />
          </div>

          {scoutMutation.isPending && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-orange-900">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Scouting the web...</span>
              </div>
              <p className="text-sm text-orange-700">
                Searching job boards and qualifying candidates with AI. This may take 30-60 seconds.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={scoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={scoutMutation.isPending || !query.trim()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {scoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scouting...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Launch Mission
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
