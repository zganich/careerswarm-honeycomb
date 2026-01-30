import { useLocation } from 'wouter';
import { Rocket, Briefcase, User, ArrowRight, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrimaryCTAProps {
  applicationsCount: number;
  savedJobsCount: number;
  hasIncompleteProfile: boolean;
  profileCompleteness: number;
}

export function PrimaryCTA({
  applicationsCount,
  savedJobsCount,
  hasIncompleteProfile,
  profileCompleteness,
}: PrimaryCTAProps) {
  const [, setLocation] = useLocation();

  // Determine primary action
  const getPrimaryAction = () => {
    if (applicationsCount === 0) {
      return {
        icon: Rocket,
        label: 'Apply to Your First Job',
        description: 'Browse AI-matched opportunities and apply with one click',
        action: () => setLocation('/jobs'),
        color: 'orange',
      };
    }

    if (hasIncompleteProfile) {
      return {
        icon: User,
        label: 'Complete Your Profile',
        description: `${profileCompleteness}% complete - Add achievements to improve match scores`,
        action: () => setLocation('/profile'),
        color: 'blue',
      };
    }

    if (savedJobsCount > 0) {
      return {
        icon: Bookmark,
        label: `Apply to ${savedJobsCount} Saved ${savedJobsCount === 1 ? 'Job' : 'Jobs'}`,
        description: 'You have bookmarked opportunities waiting for you',
        action: () => setLocation('/saved'),
        color: 'purple',
      };
    }

    return {
      icon: Briefcase,
      label: 'Browse New Jobs',
      description: 'Discover fresh opportunities matched to your profile',
      action: () => setLocation('/jobs'),
      color: 'orange',
    };
  };

  // Determine secondary action
  const getSecondaryAction = () => {
    if (applicationsCount === 0) {
      return {
        label: 'Complete Your Profile',
        action: () => setLocation('/profile'),
      };
    }

    if (hasIncompleteProfile) {
      return {
        label: 'Browse Jobs',
        action: () => setLocation('/jobs'),
      };
    }

    if (savedJobsCount > 0) {
      return {
        label: 'Find More Jobs',
        action: () => setLocation('/jobs'),
      };
    }

    return {
      label: 'View Applications',
        action: () => setLocation('/applications'),
    };
  };

  const primary = getPrimaryAction();
  const secondary = getSecondaryAction();
  const PrimaryIcon = primary.icon;

  const colorClasses = {
    orange: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      light: 'bg-orange-100',
      text: 'text-orange-600',
    },
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      light: 'bg-blue-100',
      text: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      light: 'bg-purple-100',
      text: 'text-purple-600',
    },
  };

  const colors = colorClasses[primary.color as keyof typeof colorClasses];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
      {/* Header */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        What's Next?
      </h2>
      <p className="text-slate-600 mb-6">
        Your recommended next step
      </p>

      {/* Primary CTA */}
      <motion.button
        onClick={primary.action}
        className={`w-full ${colors.bg} ${colors.hover} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group mb-4`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <PrimaryIcon className={`w-7 h-7 ${colors.text}`} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">{primary.label}</h3>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {primary.description}
            </p>
          </div>
        </div>
      </motion.button>

      {/* Secondary CTA */}
      <button
        onClick={secondary.action}
        className="w-full text-slate-600 hover:text-slate-900 font-medium py-3 rounded-lg hover:bg-slate-50 transition-colors group"
      >
        <span className="flex items-center justify-center gap-2">
          {secondary.label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  );
}
