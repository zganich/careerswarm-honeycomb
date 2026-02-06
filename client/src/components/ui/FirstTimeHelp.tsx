import { useState, useEffect } from "react";
import {
  X,
  HelpCircle,
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Bookmark,
} from "lucide-react";

export function FirstTimeHelp() {
  const [showHelp, setShowHelp] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(false);

  useEffect(() => {
    // Check if user has seen the help overlay
    const seen = localStorage.getItem("hasSeenNavigationHelp");
    if (!seen) {
      // Show after 2 seconds on first visit
      setTimeout(() => setShowHelp(true), 2000);
    }
    setHasSeenHelp(!!seen);
  }, []);

  const dismissHelp = () => {
    setShowHelp(false);
    localStorage.setItem("hasSeenNavigationHelp", "true");
    setHasSeenHelp(true);
  };

  return (
    <>
      {/* Floating Help Button (always visible) */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-xl hover:bg-orange-600 hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 group"
        aria-label="Help"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute -top-10 right-0 bg-slate-900 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help?
        </span>
      </button>

      {/* Help Overlay Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Close Button */}
            <button
              onClick={dismissHelp}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome to CareerSwarm! 🐝
              </h2>
              <p className="text-slate-600">
                Here's a quick guide to help you navigate the platform
              </p>
            </div>

            {/* Navigation Guide */}
            <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
              <NavigationHelpItem
                icon={LayoutDashboard}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                title="Dashboard"
                description="Your command center. See hours reclaimed, track applications, and get AI-powered insights."
              />
              <NavigationHelpItem
                icon={Briefcase}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
                title="Jobs"
                description="Browse AI-matched opportunities. Our Scout agent finds jobs that fit your profile. Use 1-Click Apply to submit instantly."
              />
              <NavigationHelpItem
                icon={FileText}
                iconColor="text-green-600"
                bgColor="bg-green-100"
                title="Applications"
                description="Track every application through our 7-stage pipeline. View your tailored resumes, cover letters, and outreach messages."
              />
              <NavigationHelpItem
                icon={User}
                iconColor="text-orange-600"
                bgColor="bg-orange-100"
                title="Profile"
                description="Your Master Profile - the single source of truth for your career. Add achievements, skills, and work experience here."
              />
              <NavigationHelpItem
                icon={Bookmark}
                iconColor="text-yellow-600"
                bgColor="bg-yellow-100"
                title="Saved"
                description="Bookmarked job opportunities you want to apply to later. Quick apply from here when you're ready."
              />
            </div>

            {/* Quick Start Tip */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-900 mb-1 flex items-center gap-2">
                💡 Quick Start
              </h3>
              <p className="text-sm text-orange-800">
                Dashboard → Jobs → 1-Click Apply → Applications
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={dismissHelp}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Got It! Let's Get Started
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface NavigationHelpItemProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

function NavigationHelpItem({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  description,
}: NavigationHelpItemProps) {
  return (
    <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div
        className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
