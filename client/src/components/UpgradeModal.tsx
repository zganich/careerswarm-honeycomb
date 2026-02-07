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
import { Loader2, Zap, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationsUsed?: number;
  limit?: number;
  reason?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  applicationsUsed = 5,
  limit = 5,
  reason,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: data => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: error => {
      console.error("Checkout error:", error);
      setIsLoading(false);
    },
  });

  const handleUpgrade = () => {
    setIsLoading(true);
    checkoutMutation.mutate({});
  };

  const proFeatures = [
    "Unlimited applications",
    "Cover letter generation",
    "LinkedIn message templates",
    "Advanced AI tailoring",
    "Priority support",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            You've hit your limit
          </DialogTitle>
          <DialogDescription className="text-center">
            {reason || (
              <>
                You've used <strong>{applicationsUsed}</strong> of{" "}
                <strong>{limit}</strong> free applications this month.
                <br />
                Upgrade to Pro for unlimited applications.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-lg font-semibold text-slate-900">Pro</span>
              <div>
                <span className="text-2xl font-bold text-slate-900">$29</span>
                <span className="text-slate-600 text-sm">/month</span>
              </div>
            </div>
            <ul className="space-y-2">
              {proFeatures.map(feature => (
                <li key={feature} className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to handle application limit errors and show upgrade modal
 */
export function useUpgradeModal() {
  const [showModal, setShowModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    applicationsUsed?: number;
    limit?: number;
    reason?: string;
  }>({});

  const handleApplicationError = (error: any) => {
    // Check if this is an application limit error
    const cause = error?.data?.cause;
    if (cause?.type === "APPLICATION_LIMIT") {
      setLimitInfo({
        applicationsUsed: cause.applicationsUsed,
        limit: cause.limit,
        reason: error.message,
      });
      setShowModal(true);
      return true; // Handled
    }
    return false; // Not handled
  };

  return {
    showModal,
    setShowModal,
    limitInfo,
    handleApplicationError,
    UpgradeModalComponent: (
      <UpgradeModal
        open={showModal}
        onOpenChange={setShowModal}
        applicationsUsed={limitInfo.applicationsUsed}
        limit={limitInfo.limit}
        reason={limitInfo.reason}
      />
    ),
  };
}
