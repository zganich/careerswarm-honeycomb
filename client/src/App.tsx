import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Landing & Public Pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Onboarding Flow (5 steps)
import OnboardingWelcome from "./pages/onboarding/Welcome";
import OnboardingUpload from "./pages/onboarding/Upload";
import OnboardingExtraction from "./pages/onboarding/Extraction";
import OnboardingReview from "./pages/onboarding/Review";
import OnboardingPreferences from "./pages/onboarding/Preferences";

// Master Profile Dashboard
import MasterProfile from "./pages/MasterProfile";
import WorkHistory from "./pages/WorkHistory";
import Achievements from "./pages/Achievements";

// Jobs & Applications
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";

// Analytics
import Analytics from "./pages/Analytics";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />

      {/* Onboarding Flow */}
      <Route path="/onboarding" component={OnboardingWelcome} />
      <Route path="/onboarding/upload" component={OnboardingUpload} />
      <Route path="/onboarding/extraction" component={OnboardingExtraction} />
      <Route path="/onboarding/review" component={OnboardingReview} />
      <Route path="/onboarding/preferences" component={OnboardingPreferences} />

      {/* Master Profile */}
      <Route path="/profile" component={MasterProfile} />
      <Route path="/profile/work-history" component={WorkHistory} />
      <Route path="/profile/achievements" component={Achievements} />

      {/* Jobs & Applications */}
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/opportunities/:id" component={OpportunityDetail} />
      <Route path="/applications" component={Applications} />
      <Route path="/applications/:id" component={ApplicationDetail} />

      {/* Analytics */}
      <Route path="/analytics" component={Analytics} />

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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
