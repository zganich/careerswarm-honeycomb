import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Landing & Public Pages
import Home from "./pages/Home";
import ResumeRoast from "./pages/ResumeRoast";
import Recruiters from "./pages/Recruiters";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DevLogin from "./pages/DevLogin";
import Outplacement from "./pages/Outplacement";
import AdminDashboard from "./pages/AdminDashboard";

// Onboarding is temporarily offline (lead magnet being reworked). Redirect to home.
function OnboardingOffline() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  return null;
}

// Master Profile Dashboard
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileSections from "./pages/ProfileSections";

// Jobs & Applications
import Jobs from "./pages/Jobs";
import OpportunityDetail from "./pages/OpportunityDetail";
import SavedOpportunities from "./pages/SavedOpportunities";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";

// Analytics
import Analytics from "./pages/Analytics";
import Metrics from "./pages/Metrics";

// Activity Feed
import Activity from "./pages/Activity";

// Achievements
import Achievements from "./pages/Achievements";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/login" component={DevLogin} />
      <Route path="/roast" component={ResumeRoast} />
      <Route path="/recruiters" component={Recruiters} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/outplacement" component={Outplacement} />
      <Route path="/enterprise" component={Outplacement} />
      <Route path="/workforce-admin" component={AdminDashboard} />

      {/* Activity Feed */}
      <Route path="/activity" component={Activity} />

      {/* Achievements */}
      <Route path="/achievements" component={Achievements} />

      {/* Onboarding offline — redirect to home until new lead magnet is ready */}
      <Route path="/onboarding/welcome" component={OnboardingOffline} />
      <Route path="/onboarding/upload" component={OnboardingOffline} />
      <Route path="/onboarding/extraction" component={OnboardingOffline} />
      <Route path="/onboarding/review" component={OnboardingOffline} />
      <Route path="/onboarding/preferences" component={OnboardingOffline} />
      <Route path="/onboarding" component={OnboardingOffline} />

      {/* Dashboard */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Master Profile */}
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={ProfileEdit} />
      <Route path="/profile/sections" component={ProfileSections} />
      {/* Jobs & Opportunities */}
      <Route path="/jobs" component={Jobs} />
      <Route path="/saved" component={SavedOpportunities} />
      <Route path="/opportunities/:id" component={OpportunityDetail} />
      <Route path="/applications" component={Applications} />
      <Route path="/applications/:id" component={ApplicationDetail} />

      {/* Analytics */}
      <Route path="/analytics" component={Analytics} />
      <Route path="/metrics" component={Metrics} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {/* Organic Intelligence Texture Overlay */}
          <div className="texture-overlay" aria-hidden="true" />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
