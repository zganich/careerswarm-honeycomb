import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface SaveOpportunityButtonProps {
  opportunityId: number;
}

export default function SaveOpportunityButton({ opportunityId }: SaveOpportunityButtonProps) {
  const { data: isSaved, refetch } = trpc.opportunities.isSaved.useQuery({ opportunityId });
  
  const saveMutation = trpc.opportunities.save.useMutation({
    onSuccess: () => {
      toast.success("Opportunity saved for later");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const unsaveMutation = trpc.opportunities.unsave.useMutation({
    onSuccess: () => {
      toast.success("Opportunity removed from saved");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to unsave: ${error.message}`);
    },
  });

  const handleClick = () => {
    if (isSaved) {
      unsaveMutation.mutate({ opportunityId });
    } else {
      saveMutation.mutate({ opportunityId });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={saveMutation.isPending || unsaveMutation.isPending}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
