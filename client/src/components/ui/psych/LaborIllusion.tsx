// /src/components/ui/psych/LaborIllusion.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  Target,
  BarChart2,
  Sparkles,
  CheckCircle,
  Brain,
} from "lucide-react";

interface LaborStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  detail?: string;
  duration: number; // ms
}

const EXTRACTION_STEPS: LaborStep[] = [
  {
    id: "read",
    icon: <FileSearch className="w-5 h-5" />,
    label: "Reading your resume...",
    duration: 1200,
  },
  {
    id: "skills",
    icon: <Target className="w-5 h-5" />,
    label: "Identifying top skills...",
    detail: "Found 23 skills across 5 domains",
    duration: 1500,
  },
  {
    id: "metrics",
    icon: <BarChart2 className="w-5 h-5" />,
    label: "Extracting quantified achievements...",
    detail: "Found 12 measurable results",
    duration: 1800,
  },
  {
    id: "narrative",
    icon: <Sparkles className="w-5 h-5" />,
    label: "Building career narrative...",
    detail: "Identified $2.4M total impact",
    duration: 1500,
  },
  {
    id: "complete",
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Master Profile ready!",
    duration: 800,
  },
];

const QUICK_APPLY_STEPS: LaborStep[] = [
  {
    id: "analyze",
    icon: <Brain className="w-5 h-5" />,
    label: "Analyzing company culture...",
    duration: 2000,
  },
  {
    id: "match",
    icon: <Target className="w-5 h-5" />,
    label: "Matching your best achievements...",
    detail: "Selected 5 high-impact stories",
    duration: 2500,
  },
  {
    id: "tailor",
    icon: <FileSearch className="w-5 h-5" />,
    label: "Tailoring resume for ATS...",
    duration: 3000,
  },
  {
    id: "write",
    icon: <Sparkles className="w-5 h-5" />,
    label: "Writing personalized cover letter...",
    duration: 2500,
  },
  {
    id: "package",
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Packaging application...",
    duration: 1000,
  },
];

interface LaborIllusionProps {
  variant: "extraction" | "quickApply";
  onComplete?: () => void;
  className?: string;
}

export function LaborIllusion({
  variant,
  onComplete,
  className = "",
}: LaborIllusionProps) {
  const steps = variant === "extraction" ? EXTRACTION_STEPS : QUICK_APPLY_STEPS;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps(
        prev => new Set(Array.from(prev).concat(steps[currentStep].id))
      );
      setCurrentStep(prev => prev + 1);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  const progress = (currentStep / steps.length) * 100;

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-orange-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {variant === "extraction"
                ? "AI is analyzing your career data"
                : "AI is building your application"}
            </h3>
            <p className="text-sm text-slate-500">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <AnimatePresence>
          {steps.map((step, index) => {
            const isComplete = completedSteps.has(step.id);
            const isCurrent = index === currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.4,
                  x: 0,
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent
                    ? "bg-orange-50 border border-orange-200"
                    : isComplete
                      ? "bg-green-50 border border-green-200"
                      : "bg-slate-50 border border-transparent"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? "bg-green-100 text-green-600"
                      : isCurrent
                        ? "bg-orange-100 text-orange-600 animate-pulse"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {isComplete ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      isComplete
                        ? "text-green-700"
                        : isCurrent
                          ? "text-orange-700"
                          : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Detail (shows after completion) */}
                  {isComplete && step.detail && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-green-600 mt-1"
                    >
                      ✓ {step.detail}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
