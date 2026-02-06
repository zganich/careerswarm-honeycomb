import { useState, useEffect } from "react";
import { Clock, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroMetricProps {
  applicationsCount: number;
  hoursPerApplication?: number;
}

export function HeroMetric({
  applicationsCount,
  hoursPerApplication = 4.5,
}: HeroMetricProps) {
  const totalHoursSaved = applicationsCount * hoursPerApplication;
  const [displayHours, setDisplayHours] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Animated counter
  useEffect(() => {
    if (totalHoursSaved === 0) {
      setDisplayHours(0);
      return;
    }

    const duration = 1500;
    const steps = 30;
    const increment = totalHoursSaved / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalHoursSaved) {
        setDisplayHours(totalHoursSaved);
        clearInterval(timer);
      } else {
        setDisplayHours(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalHoursSaved]);

  const getContextMessage = () => {
    if (applicationsCount === 0) {
      return "Ready to start applying? Let's get your first application out there.";
    }
    if (applicationsCount < 5) {
      return `You've applied to ${applicationsCount} ${applicationsCount === 1 ? "job" : "jobs"} without lifting a finger`;
    }
    if (applicationsCount < 10) {
      return `You're on a roll! ${applicationsCount} applications submitted automatically`;
    }
    return `Crushing it! ${applicationsCount} applications submitted while you focused on what matters`;
  };

  const getComparisonText = () => {
    const weeks = Math.floor(totalHoursSaved / 40);
    const days = Math.floor(totalHoursSaved / 8);

    if (weeks > 0) {
      return `That's ${weeks} work ${weeks === 1 ? "week" : "weeks"} of time saved`;
    }
    if (days > 0) {
      return `That's ${days} work ${days === 1 ? "day" : "days"} of time saved`;
    }
    return `That's ${totalHoursSaved.toFixed(1)} hours you'd spend manually customizing`;
  };

  return (
    <div className="relative">
      {/* Hero Metric Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">
                Hours Reclaimed
              </p>
              <p className="text-orange-200 text-xs">
                Time saved by AI automation
              </p>
            </div>
          </div>

          {/* Big Number */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3">
              <motion.span
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tabular-nums"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {displayHours.toFixed(1)}
              </motion.span>
              <span className="text-3xl text-orange-200 font-medium">
                hours
              </span>
            </div>
          </div>

          {/* Context Message */}
          <div className="flex items-start gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <p className="text-lg text-white/95 font-medium leading-snug">
              {getContextMessage()}
            </p>
          </div>

          {/* Comparison Text */}
          {totalHoursSaved > 0 && (
            <div className="flex items-start gap-2 mb-6">
              <span className="text-2xl">📈</span>
              <p className="text-orange-100 leading-snug">
                {getComparisonText()}
              </p>
            </div>
          )}

          {/* Breakdown Toggle */}
          {applicationsCount > 0 && (
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <span className="text-sm font-medium">View Breakdown</span>
              {showBreakdown ? (
                <ChevronUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 group-hover:translate-y-[2px] transition-transform" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Breakdown */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Time Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Applications submitted</span>
                  <span className="font-semibold text-slate-900">
                    {applicationsCount}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Time per application</span>
                  <span className="font-semibold text-slate-900">
                    {hoursPerApplication}h
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">AI processing time</span>
                  <span className="font-semibold text-green-600">
                    ~60 seconds
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-orange-50 rounded-lg px-3">
                  <span className="font-semibold text-slate-900">
                    Total time saved
                  </span>
                  <span className="font-bold text-orange-600 text-xl">
                    {totalHoursSaved.toFixed(1)}h
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-4 italic">
                * Based on average 4.5 hours to manually tailor resume, write
                cover letter, and draft outreach message per application
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
