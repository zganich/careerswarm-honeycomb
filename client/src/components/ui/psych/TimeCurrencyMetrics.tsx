// /src/components/ui/psych/TimeCurrencyMetrics.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Briefcase, Target } from "lucide-react";
import { PSYCH_COPY } from "./CopyConstants";

interface TimeCurrencyMetricsProps {
  applicationsCount: number;
  hoursPerApplication?: number; // Default: 4.5 hours
  responseRate?: number; // 0-100
  profileStrength?: number; // 0-100
  className?: string;
}

export function TimeCurrencyMetrics({
  applicationsCount,
  hoursPerApplication = 4.5,
  responseRate = 0,
  profileStrength = 0,
  className = "",
}: TimeCurrencyMetricsProps) {
  const [animatedHours, setAnimatedHours] = useState(0);
  const totalHoursSaved = applicationsCount * hoursPerApplication;

  // Animate the hours counter
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = totalHoursSaved / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalHoursSaved) {
        setAnimatedHours(totalHoursSaved);
        clearInterval(timer);
      } else {
        setAnimatedHours(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalHoursSaved]);

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      
      {/* PRIMARY: Hours Reclaimed (Pillar 5 Focus) */}
      <motion.div 
        className="col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-orange-100 font-medium">
            {PSYCH_COPY.dashboard.timeSaved}
          </span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">
            {animatedHours.toFixed(1)}
          </span>
          <span className="text-xl text-orange-200">hours</span>
        </div>
        
        <p className="text-orange-100 text-sm mt-2">
          {PSYCH_COPY.dashboard.timeSavedSubtext}
        </p>
        
        {/* Mini breakdown */}
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
          <span className="text-orange-200">
            {applicationsCount} applications × {hoursPerApplication}h each
          </span>
          <TrendingUp className="w-4 h-4 text-green-300" />
        </div>
      </motion.div>

      {/* Secondary: Active Applications */}
      <motion.div 
        className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-5 h-5 text-blue-500" />
          <span className="text-slate-600 text-sm font-medium">
            {PSYCH_COPY.dashboard.activeApplications}
          </span>
        </div>
        <span className="text-3xl font-bold text-slate-900">
          {applicationsCount}
        </span>
      </motion.div>

      {/* Secondary: Profile Strength */}
      <motion.div 
        className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-green-500" />
          <span className="text-slate-600 text-sm font-medium">
            {PSYCH_COPY.dashboard.profileStrength}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">
            {profileStrength}
          </span>
          <span className="text-slate-500">%</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${profileStrength}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
