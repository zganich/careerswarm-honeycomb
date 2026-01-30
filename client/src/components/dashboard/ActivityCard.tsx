import { Clock, CheckCircle, Mail, Calendar, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'application_submitted' | 'follow_up_due' | 'response_received' | 'interview_scheduled';
  title: string;
  description: string;
  timestamp: Date;
  applicationId?: string;
}

interface ActivityCardProps {
  activities: Activity[];
  onViewAll?: () => void;
}

export function ActivityCard({ activities, onViewAll }: ActivityCardProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'application_submitted':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'follow_up_due':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'response_received':
        return { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'interview_scheduled':
        return { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' };
      default:
        return { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  // Show max 5 activities
  const recentActivities = activities.slice(0, 5);

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No activity yet</p>
          <p className="text-sm text-slate-400 mt-2">
            Your applications and updates will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
        {activities.length > 5 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {recentActivities.map((activity) => {
          const { icon: Icon, color, bg } = getActivityIcon(activity.type);
          
          return (
            <div
              key={activity.id}
              className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 mb-1">{activity.title}</p>
                <p className="text-sm text-slate-600 mb-1">{activity.description}</p>
                <p className="text-xs text-slate-400">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
