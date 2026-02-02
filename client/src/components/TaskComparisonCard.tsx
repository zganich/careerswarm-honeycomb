import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";

interface Task {
  name: string;
  manual: string;
  careerswarm: string;
  agent: string;
}

const tasks: Task[] = [
  {
    name: "Finding relevant jobs that match your profile",
    manual: "30-45 min",
    careerswarm: "Automatic",
    agent: "Scout Agent"
  },
  {
    name: "Sifting through resume for relevant bullets",
    manual: "30-45 min",
    careerswarm: "Automatic",
    agent: "Tailor Agent"
  },
  {
    name: "Editing & formatting for ATS compliance",
    manual: "45-60 min",
    careerswarm: "Automatic",
    agent: "Tailor Agent"
  },
  {
    name: "Finding hiring managers & decision makers",
    manual: "30-45 min",
    careerswarm: "Automatic",
    agent: "Hunter Agent"
  },
  {
    name: "Writing cover letter & outreach cadence",
    manual: "60-90 min",
    careerswarm: "Automatic",
    agent: "Scribe Agent"
  }
];

interface TaskComparisonCardProps {
  onGetStarted?: () => void;
  showCTA?: boolean;
}

export function TaskComparisonCard({ onGetStarted, showCTA = true }: TaskComparisonCardProps) {
  return (
    <Card className="max-w-4xl mx-auto border-2 border-orange-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Time Per Application: Manual vs CareerSwarm
        </h2>
        <p className="text-slate-600">
          See exactly how much time you save on every job application
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 items-center pb-2 border-b-2 border-slate-200">
          <div className="col-span-6">
            <p className="font-semibold text-slate-700">Task</p>
          </div>
          <div className="col-span-3 text-center">
            <p className="font-semibold text-red-600">Manual Process</p>
          </div>
          <div className="col-span-3 text-center">
            <p className="font-semibold text-green-600">With CareerSwarm</p>
          </div>
        </div>

        {/* Task Rows */}
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div 
              key={i} 
              className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-6">
                <p className="text-sm font-medium text-slate-800">{task.name}</p>
              </div>
              <div className="col-span-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <X className="w-4 h-4 text-red-500" />
                  <p className="font-semibold text-red-600">{task.manual}</p>
                </div>
              </div>
              <div className="col-span-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <p className="font-semibold text-green-600">{task.careerswarm}</p>
                  <p className="text-xs text-slate-500">{task.agent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Comparison */}
        <div className="border-t-2 border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between px-4">
            <span className="text-lg font-bold text-slate-900">Total per application:</span>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-red-600 line-through">3-4 hours</span>
              <ArrowRight className="w-6 h-6 text-orange-500" />
              <span className="text-2xl font-bold text-green-600">5-10 minutes</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-green-50 p-6 rounded-xl text-center border-2 border-orange-200">
            <p className="text-2xl font-bold text-orange-600 mb-2">
              You save ~3.5 hours per application
            </p>
            <p className="text-slate-600 text-lg">
              For 100 applications: <strong className="text-orange-600">350 hours saved</strong> (8.75 work weeks!)
            </p>
          </div>
        </div>

        {/* CTA */}
        {showCTA && (
          <div className="pt-4">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 shadow-lg"
              size="lg"
              onClick={onGetStarted}
            >
              Create Free Account to Start Saving Time
            </Button>
            <p className="text-center text-sm text-slate-500 mt-3">
              🔒 Secure OAuth login • Takes 30 seconds • No credit card required
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
