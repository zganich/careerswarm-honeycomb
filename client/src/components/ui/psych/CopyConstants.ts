// /src/components/ui/psych/CopyConstants.ts

export const PSYCH_COPY = {
  // Hero Section
  hero: {
    headline: "Stop Rewriting Your Resume.",
    subheadline: "Build One Master Profile. Auto-Apply to Hundreds of Jobs While You Sleep.",
    ctaPrimary: "Build My Master Profile",
    ctaSecondary: "Get free feedback (Resume Roast)",
  },
  
  // Onboarding
  onboarding: {
    welcome: {
      title: "Build Your Career Asset",
      subtitle: "In 5 minutes, you'll have a Master Profile that powers unlimited applications.",
      cta: "Start Building",
    },
    extraction: {
      title: "AI is Analyzing Your Career",
      subtitle: "Watch as we transform your resume into a structured evidence graph.",
    },
    review: {
      title: "Review Your Master Profile",
      subtitle: "Edit anything before we start matching you with opportunities.",
    },
  },
  
  // Dashboard
  dashboard: {
    greeting: (name: string) => `Welcome back, ${name}`,
    timeSaved: "Hours Reclaimed",
    timeSavedSubtext: "Time you'd spend manually applying",
    activeApplications: "Active Applications",
    profileStrength: "Profile Strength",
  },
  
  // Quick Apply
  quickApply: {
    button: "1-Click Apply",
    processing: "AI Applying...",
    toastStarted: {
      title: "Application Started",
      message: (company: string, role: string) => 
        `AI is now applying to ${role} at ${company}`,
      action: "View Progress",
    },
    toastComplete: {
      title: "Application Ready",
      message: "Your tailored application is ready to review",
      action: "Review Now",
    },
  },
  
  // Trust Signals
  trust: {
    timeSaved: "Average user saves 3.5 hours per application",
    usersCount: "Join 12,847 professionals using CareerSwarm",
    responseRate: "45% average response rate (2x industry average)",
  },
  
  // Status Labels (replace all "Verification" instances)
  status: {
    processing: "Building Application...",
    complete: "Application Package Ready",
    error: "Generation Failed - Retry",
  },
} as const;

export type PsychCopy = typeof PSYCH_COPY;
