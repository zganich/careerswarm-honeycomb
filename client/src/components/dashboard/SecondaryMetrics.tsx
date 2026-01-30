import { Briefcase, Calendar, Target, TrendingUp } from 'lucide-react';

interface SecondaryMetricsProps {
  applicationsCount: number;
  weeklyApplications: number;
  interviewsScheduled: number;
  responseRate: number;
}

export function SecondaryMetrics({
  applicationsCount,
  weeklyApplications,
  interviewsScheduled,
  responseRate,
}: SecondaryMetricsProps) {
  const metrics = [
    {
      icon: Briefcase,
      label: 'Active Applications',
      value: applicationsCount,
      change: weeklyApplications > 0 ? `+${weeklyApplications} this week` : null,
      color: 'blue',
    },
    {
      icon: Calendar,
      label: 'This Week',
      value: weeklyApplications,
      subtext: weeklyApplications > 0 ? 'On track' : 'Get started',
      color: 'purple',
    },
    {
      icon: Target,
      label: 'Interviews',
      value: interviewsScheduled,
      subtext: interviewsScheduled > 0 ? 'Scheduled' : 'None yet',
      color: 'green',
    },
    {
      icon: TrendingUp,
      label: 'Response Rate',
      value: `${responseRate}%`,
      subtext: responseRate > 15 ? 'Above average' : 'Building momentum',
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const colorClass = colorClasses[metric.color as keyof typeof colorClasses];

        return (
          <div
            key={metric.label}
            className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-slate-600 text-sm font-medium">{metric.label}</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
              {metric.change && (
                <span className="text-xs text-green-600 font-medium">{metric.change}</span>
              )}
            </div>
            
            {metric.subtext && (
              <p className="text-xs text-slate-500 font-medium">{metric.subtext}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
