import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TrendingUp } from "lucide-react";

/**
 * ValueDemonstrator - Shows OUTCOMES not processing
 * 
 * Features:
 * - Cycles through 3 real career transformations every 4 seconds
 * - Top: Messy LinkedIn bullet point
 * - Middle: Real-time analysis bars (Match: 32% → 94%)
 * - Bottom: Clean, tailored version with checkmarks
 * - Focuses on RESULTS users will achieve
 */

interface Transformation {
  before: string;
  matchBefore: number;
  matchAfter: number;
  after: string;
}

const transformations: Transformation[] = [
  {
    before: "Managed team projects and improved system performance",
    matchBefore: 32,
    matchAfter: 94,
    after: "Led 8-person engineering team to deliver 3 major features 2 weeks ahead of schedule, increasing user engagement by 34% (12K → 16K DAU)",
  },
  {
    before: "Worked on customer support issues",
    matchBefore: 28,
    matchAfter: 91,
    after: "Resolved 156 customer support tickets with 98% satisfaction rating (4.9/5), reducing average response time from 4 hours to 45 minutes",
  },
  {
    before: "Led initiative to enhance workflow efficiency",
    matchBefore: 35,
    matchAfter: 96,
    after: "Designed and implemented automation system that eliminated 12 hours/week of manual work, saving team $48K annually in operational costs",
  },
];

export function ValueDemonstrator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowAnalysis(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % transformations.length);
        setShowAnalysis(true);
      }, 500);
    }, 4000);

    // Initial show
    setTimeout(() => setShowAnalysis(true), 300);

    return () => clearInterval(interval);
  }, []);

  const current = transformations[currentIndex];

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Before Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Your Original
            </span>
            <span className="text-xs text-red-500 font-medium">Weak Match</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + "-before"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 bg-red-50/50 border border-red-200/50 rounded-lg"
            >
              <p className="text-sm text-slate-600 italic">{current.before}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Analysis Section */}
        <AnimatePresence mode="wait">
          {showAnalysis && (
            <motion.div
              key={currentIndex + "-analysis"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  AI Analysis
                </span>
              </div>

              {/* Match Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">ATS Match Score</span>
                  <motion.span
                    className="font-bold text-emerald-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {current.matchBefore}% → {current.matchAfter}%
                  </motion.span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                    initial={{ width: `${current.matchBefore}%` }}
                    animate={{ width: `${current.matchAfter}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">+62%</div>
                  <div className="text-xs text-slate-500">Match</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">4x</div>
                  <div className="text-xs text-slate-500">Impact</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">98%</div>
                  <div className="text-xs text-slate-500">ATS</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* After Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              AI-Optimized Version
            </span>
            <span className="text-xs text-emerald-500 font-medium">Strong Match</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + "-after"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 bg-emerald-50/50 border border-emerald-200/50 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{current.after}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {transformations.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-orange-500" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
