import { useState, useEffect } from "react";
import { Clock, TrendingUp, Briefcase, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardMetricsProps {
  applicationsCount: number;
  weeklyApplications: number;
  interviewsScheduled: number;
  profileStrength?: number;
}

export function DashboardMetrics({
  applicationsCount,
  weeklyApplications,
  interviewsScheduled,
  profileStrength = 0,
}: DashboardMetricsProps) {
  const HOURS_PER_APPLICATION = 4.5;
  const totalHoursSaved = applicationsCount * HOURS_PER_APPLICATION;
  
  // Animated counter
  const [displayHours, setDisplayHours] = useState(0);
  
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* HERO METRIC: Hours Reclaimed (2x width) */}
      <div className="col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-orange-100 font-medium text-sm uppercase tracking-wide">
              Hours Reclaimed
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold tabular-nums">
              {displayHours.toFixed(1)}
            </span>
            <span className="text-xl text-orange-200">hours</span>
          </div>
          
          <p className="text-orange-100 text-sm">
            Time you'd spend manually applying
          </p>
          
          {/* Calculation breakdown */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
            <span className="text-orange-200">
              {applicationsCount} applications × {HOURS_PER_APPLICATION}h each
            </span>
            <div className="flex items-center gap-1 text-green-300">
              <TrendingUp className="w-4 h-4" />
              <span>Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary: Active Applications */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-slate-500 text-sm font-medium">Active Applications</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{applicationsCount}</span>
          {applicationsCount > 0 && (
            <span className="text-xs text-green-600 font-medium">+2 vs last week</span>
          )}
        </div>
      </div>

      {/* Secondary: This Week */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-slate-500 text-sm font-medium">This Week Applied</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{weeklyApplications}</span>
          <span className="text-xs text-slate-500 font-medium">
            {weeklyApplications > 0 ? "On track" : "Get started"}
          </span>
        </div>
      </div>

      {/* Secondary: Interviews */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-slate-500 text-sm font-medium">Interviews Scheduled</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{interviewsScheduled}</span>
          <span className="text-xs text-slate-500 font-medium">
            {interviewsScheduled > 0 ? "Upcoming" : "None scheduled"}
          </span>
        </div>
      </div>

      {/* Secondary: Profile Strength (optional) */}
      {profileStrength > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-slate-500 text-sm font-medium">Profile Strength</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{profileStrength}%</span>
            <span className="text-xs text-slate-500 font-medium">Complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
