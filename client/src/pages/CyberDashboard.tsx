import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { OnboardingSentence } from '@/components/OnboardingSentence';
import { DashboardHero } from '@/components/DashboardHero';
import { EvidenceGrid } from '@/components/EvidenceGrid';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { Redirect } from 'wouter';
import { toast } from 'sonner';

export default function CyberDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileData, setProfileData] = useState<{ jobTitle: string; skill: string } | null>(null);

  const { data: achievements, isLoading: achievementsLoading } = trpc.achievements.list.useQuery();
  const { data: resumes } = trpc.resumes.list.useQuery();
  const { data: jobs } = trpc.jobDescriptions.list.useQuery();

  // Check if user needs onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('cyberOnboardingCompleted');
    if (user && !hasCompletedOnboarding && !profileData) {
      setShowOnboarding(true);
    }
  }, [user, profileData]);

  // Handle onboarding completion
  const handleOnboardingComplete = (data: { jobTitle: string; skill: string }) => {
    setProfileData(data);
    setShowOnboarding(false);
    localStorage.setItem('cyberOnboardingCompleted', 'true');
    localStorage.setItem('profileData', JSON.stringify(data));
    toast.success(`Welcome, ${data.jobTitle}! Let's build your career evidence.`);
  };

  // Load profile data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('profileData');
    if (saved) {
      setProfileData(JSON.parse(saved));
    }
  }, []);

  // Calculate Swarm Score (0-100)
  const calculateSwarmScore = () => {
    const achievementCount = achievements?.length || 0;
    const resumeCount = resumes?.length || 0;
    const jobCount = jobs?.length || 0;

    // Simple scoring algorithm
    const achievementScore = Math.min(achievementCount * 5, 50); // Max 50 points
    const resumeScore = Math.min(resumeCount * 10, 30); // Max 30 points
    const jobScore = Math.min(jobCount * 5, 20); // Max 20 points

    return Math.min(achievementScore + resumeScore + jobScore, 100);
  };

  // Determine profile status for dynamic button
  const getProfileStatus = (): 'empty' | 'imported' | 'verified' => {
    if (!achievements || achievements.length === 0) return 'empty';
    if (achievements.length < 5) return 'imported';
    return 'verified';
  };

  // Handle dynamic button action
  const handleAction = () => {
    const status = getProfileStatus();
    switch (status) {
      case 'empty':
        toast.info('Import LinkedIn PDF feature coming soon!');
        // TODO: Implement LinkedIn PDF import
        break;
      case 'imported':
        toast.info('Verify Employment feature coming soon!');
        // TODO: Implement employment verification
        break;
      case 'verified':
        window.location.href = '/achievements/new';
        break;
    }
  };

  // Convert data to Evidence Cards
  const evidenceCards = [
    ...(resumes?.map(resume => ({
      id: resume.id.toString(),
      type: 'resume' as const,
      title: `Resume v${resume.version || 1}`,
      subtitle: `Created ${new Date(resume.createdAt).toLocaleDateString()}`,
      score: resume.atsAnalysis?.atsScore || undefined,
      date: new Date(resume.createdAt).toLocaleDateString(),
    })) || []),
    ...(achievements?.slice(0, 6).map(achievement => ({
      id: achievement.id.toString(),
      type: 'achievement' as const,
      title: achievement.xyzAccomplishment || 'Untitled Achievement',
      subtitle: achievement.company || 'Personal Achievement',
      score: achievement.impactMeterScore || undefined,
      date: achievement.startDate ? new Date(achievement.startDate).toLocaleDateString() : undefined,
    })) || []),
  ];

  if (authLoading || achievementsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (showOnboarding) {
    return <OnboardingSentence onComplete={handleOnboardingComplete} />;
  }

  const swarmScore = calculateSwarmScore();
  const profileStatus = getProfileStatus();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              CareerSwarm
            </h1>
            {profileData && (
              <p className="text-slate-400 text-sm mt-1">
                {profileData.jobTitle} • Proving {profileData.skill}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Classic View
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-amber-500 flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <DashboardHero
          swarmScore={swarmScore}
          profileStatus={profileStatus}
          onAction={handleAction}
        />

        <EvidenceGrid
          cards={evidenceCards}
          onCardClick={(card) => {
            if (card.type === 'resume') {
              window.location.href = `/resumes/${card.id}`;
            } else if (card.type === 'achievement') {
              window.location.href = `/achievements/${card.id}`;
            }
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 CareerSwarm. Your career evidence engine.</p>
        </div>
      </footer>
    </div>
  );
}
