import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

/** Wraps a page component with DashboardLayout so all dashboard routes share sidebar + logout. */
function withDashboardLayout<P extends object>(
  Component: React.ComponentType<P>
) {
  return function Wrapped(props: P) {
    return (
      <DashboardLayout>
        <Component {...props} />
      </DashboardLayout>
    );
  };
}

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

// Onboarding (re-enabled for production live testing)
import OnboardingWelcome from "./pages/onboarding/Welcome";
import OnboardingUpload from "./pages/onboarding/Upload";
import OnboardingExtraction from "./pages/onboarding/Extraction";
import OnboardingReview from "./pages/onboarding/Review";
import OnboardingPreferences from "./pages/onboarding/Preferences";

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
      <Route path="/activity" component={withDashboardLayout(Activity)} />

      {/* Achievements */}
      <Route
        path="/achievements"
        component={withDashboardLayout(Achievements)}
      />

      {/* Onboarding */}
      <Route path="/onboarding/welcome" component={OnboardingWelcome} />
      <Route path="/onboarding/upload" component={OnboardingUpload} />
      <Route path="/onboarding/extraction" component={OnboardingExtraction} />
      <Route path="/onboarding/review" component={OnboardingReview} />
      <Route path="/onboarding/preferences" component={OnboardingPreferences} />
      <Route path="/onboarding" component={OnboardingWelcome} />

      {/* Dashboard */}
      <Route path="/dashboard" component={withDashboardLayout(Dashboard)} />

      {/* Master Profile */}
      <Route path="/profile" component={withDashboardLayout(Profile)} />
      <Route
        path="/profile/edit"
        component={withDashboardLayout(ProfileEdit)}
      />
      <Route
        path="/profile/sections"
        component={withDashboardLayout(ProfileSections)}
      />
      {/* Jobs & Opportunities */}
      <Route path="/jobs" component={withDashboardLayout(Jobs)} />
      <Route
        path="/saved"
        component={withDashboardLayout(SavedOpportunities)}
      />
      <Route
        path="/opportunities/:id"
        component={withDashboardLayout(OpportunityDetail)}
      />
      <Route
        path="/applications"
        component={withDashboardLayout(Applications)}
      />
      <Route
        path="/applications/:id"
        component={withDashboardLayout(ApplicationDetail)}
      />

      {/* Analytics */}
      <Route path="/analytics" component={withDashboardLayout(Analytics)} />
      <Route path="/metrics" component={withDashboardLayout(Metrics)} />

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
