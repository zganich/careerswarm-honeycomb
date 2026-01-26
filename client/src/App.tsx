import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewAchievement from "./pages/achievements/NewAchievement";
import EditAchievement from "./pages/achievements/EditAchievement";
import AchievementsList from "./pages/achievements/AchievementsList";
import JobsList from "./pages/jobs/JobsList";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import ResumesList from "./pages/resumes/ResumesList";
import ResumeTemplates from "./pages/ResumeTemplates";
import InterviewPrep from "./pages/InterviewPrep";
import SkillsGap from "./pages/SkillsGap";
import PastJobs from "./pages/PastJobs";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Roast from "./pages/Roast";
import CyberDashboard from "./pages/CyberDashboard";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/roast" component={Roast} />

      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cyber" component={CyberDashboard} />
      <Route path="/achievements" component={AchievementsList} />
      <Route path="/achievements/new" component={NewAchievement} />
      <Route path="/achievements/:id/edit" component={EditAchievement} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/saved" component={JobsList} />
      <Route path="/jobs/new" component={JobsList} />
      <Route path="/applications" component={Applications} />
      <Route path="/resumes" component={ResumesList} />
      <Route path="/resumes/templates" component={ResumeTemplates} />
      <Route path="/interview-prep" component={InterviewPrep} />
      <Route path="/skills-gap" component={SkillsGap} />
      <Route path="/past-jobs" component={PastJobs} />
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
