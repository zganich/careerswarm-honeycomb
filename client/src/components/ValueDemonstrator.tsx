import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TrendingUp, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * ValueDemonstrator - Shows OUTCOMES with premium visual polish
 * 
 * Enhanced Features:
 * - Glassmorphism effect (backdrop-blur-xl, bg-white/70)
 * - 3D tilt on hover (perspective-1000, rotateY)
 * - Scanner beam animation (vertical gradient line)
 * - Metric pulse animation on badges
 * - Smooth transitions and micro-interactions
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
  const [roastInput, setRoastInput] = useState("");
  const roastMutation = trpc.public.roast.useMutation();

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
    <div className="w-full max-w-md mx-auto perspective-1000">
      <motion.div
        className="relative bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-6 border border-white/30 transition-all duration-500"
        style={{
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, y: 20, rotateY: -8, rotateX: 3 }}
        animate={{ opacity: 1, y: 0, rotateY: -5, rotateX: 2 }}
        whileHover={{ rotateY: -3, rotateX: 1, scale: 1.02 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Scanner Beam Animation */}
        <div 
          className="absolute inset-x-4 top-0 h-[2px] rounded-full z-10 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.7) 50%, transparent 100%)",
            animation: "scan 4s linear infinite",
          }}
        />

        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/30 to-transparent pointer-events-none" />

        {/* Before Section */}
        <div className="space-y-2 relative z-20">
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
              className="p-3 bg-red-50/50 border border-red-200/50 rounded-lg backdrop-blur-sm"
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
              className="space-y-3 relative z-20"
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

              {/* Impact Metrics with Pulse Animation */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <motion.div 
                  className="p-2 bg-emerald-50 rounded-lg"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="text-lg font-bold text-emerald-600">+62%</div>
                  <div className="text-xs text-slate-500">Match</div>
                </motion.div>
                <motion.div 
                  className="p-2 bg-emerald-50 rounded-lg"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                >
                  <div className="text-lg font-bold text-emerald-600">4x</div>
                  <div className="text-xs text-slate-500">Impact</div>
                </motion.div>
                <motion.div 
                  className="p-2 bg-emerald-50 rounded-lg"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                  <div className="text-lg font-bold text-emerald-600">98%</div>
                  <div className="text-xs text-slate-500">ATS</div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* After Section */}
        <div className="space-y-2 relative z-20">
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
              className="p-3 bg-emerald-50/50 border border-emerald-200/50 rounded-lg backdrop-blur-sm"
            >
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{current.after}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-1.5 relative z-20">
          {transformations.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-orange-500" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Instant Roast Section */}
        <div className="pt-6 border-t border-white/40 relative z-20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Test the Swarm Instantly
            </h4>
          </div>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (roastInput.trim().length < 50) return;
              roastMutation.mutate({ resumeText: roastInput });
            }}
            className="space-y-3"
          >
            <input
              type="text"
              value={roastInput}
              onChange={(e) => setRoastInput(e.target.value)}
              placeholder="Paste a resume bullet to roast... (min 50 chars)"
              className="w-full px-4 py-3 rounded-lg bg-white/60 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
              disabled={roastMutation.isPending}
            />
            <button
              type="submit"
              disabled={roastInput.trim().length < 50 || roastMutation.isPending}
              className="w-full px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {roastMutation.isPending ? "Roasting..." : "Get Brutal AI Roast"}
            </button>
          </form>
          
          {/* Roast Result Display */}
          <AnimatePresence>
            {roastMutation.data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Roast Result
                  </span>
                  <span className="text-sm font-bold text-amber-900">
                    Score: {roastMutation.data.score}/100
                  </span>
                </div>
                <p className="text-sm text-amber-800 mb-3">{roastMutation.data.verdict}</p>
                {roastMutation.data.mistakes && roastMutation.data.mistakes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-amber-700">Top Mistakes:</p>
                    {roastMutation.data.mistakes.slice(0, 2).map((mistake: any, idx: number) => (
                      <div key={idx} className="text-xs text-amber-700">
                        <span className="font-medium">{mistake.title}:</span> {mistake.explanation}
                      </div>
                    ))}
                  </div>
                )}
                <a
                  href="/dashboard"
                  className="inline-block mt-3 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Fix these issues in your Master Profile →
                </a>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Error Display */}
          {roastMutation.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-700">
                {roastMutation.error.message || "Failed to roast. Please try again."}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
