// /src/components/ui/psych/AsyncQuickApply.tsx

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PSYCH_COPY } from "./CopyConstants";

interface AsyncQuickApplyProps {
  jobId: string;
  companyName: string;
  roleTitle: string;
  onApplyStart: (jobId: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

type ApplyState = "idle" | "initiating" | "processing" | "complete";

export function AsyncQuickApply({
  jobId,
  companyName,
  roleTitle,
  onApplyStart,
  disabled = false,
  className = "",
}: AsyncQuickApplyProps) {
  const [state, setState] = useState<ApplyState>("idle");

  const handleApply = useCallback(async () => {
    if (state !== "idle" || disabled) return;

    // Phase 1: Brief initiation feedback (1.5s max)
    setState("initiating");

    // Fire the background process
    onApplyStart(jobId).catch(console.error);

    // After 1.5s, close/minimize and show toast
    setTimeout(() => {
      setState("processing");

      // Show toast notification
      toast.success(PSYCH_COPY.quickApply.toastStarted.title, {
        description: PSYCH_COPY.quickApply.toastStarted.message(
          companyName,
          roleTitle
        ),
        action: {
          label: PSYCH_COPY.quickApply.toastStarted.action,
          onClick: () => {
            window.location.href = "/applications";
          },
        },
      });
    }, 1500);
  }, [jobId, companyName, roleTitle, onApplyStart, state, disabled]);

  return (
    <motion.button
      onClick={handleApply}
      disabled={disabled || state !== "idle"}
      className={`
        relative overflow-hidden
        px-6 py-3 rounded-xl font-semibold text-white
        transition-all duration-300
        ${
          state === "idle"
            ? "bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5"
            : "bg-orange-400 cursor-not-allowed"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      whileTap={state === "idle" ? { scale: 0.98 } : {}}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            {PSYCH_COPY.quickApply.button}
          </motion.span>
        )}

        {state === "initiating" && (
          <motion.span
            key="initiating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Initiating...
          </motion.span>
        )}

        {state === "processing" && (
          <motion.span
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Started!
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulse animation on hover (idle state only) */}
      {state === "idle" && (
        <span className="absolute inset-0 rounded-xl bg-orange-400 animate-ping opacity-20 pointer-events-none" />
      )}
    </motion.button>
  );
}
