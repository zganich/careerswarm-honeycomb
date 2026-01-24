import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Flame, Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Roast() {
  const [resumeText, setResumeText] = useState("");
  const [roastResult, setRoastResult] = useState<any>(null);

  const roastMutation = trpc.public.roast.useMutation({
    onSuccess: (data) => {
      setRoastResult(data);
      toast.success("Resume roasted!");
    },
    onError: (error) => {
      toast.error("Roasting failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      toast.error("Please paste your resume");
      return;
    }

    if (resumeText.length < 50) {
      toast.error("Resume must be at least 50 characters");
      return;
    }

    setRoastResult(null);
    roastMutation.mutate({ resumeText: resumeText.trim() });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .txt file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
      toast.success("Resume loaded");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const loadingMessages = [
    "Checking my watch...",
    "Rolling my eyes at your 'synergy'...",
    "Calculating how fast I'd reject this...",
    "Counting the buzzwords...",
    "Looking for actual numbers...",
    "Wondering if you read the job description...",
  ];

  const currentLoadingMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto py-16 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Flame className="h-12 w-12 text-orange-500" />
            <h1 className="text-5xl font-bold text-white">Get Roasted</h1>
            <Flame className="h-12 w-12 text-orange-500" />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            By a cynical VC recruiter who's seen 10,000 resumes this week alone.
          </p>
          <p className="text-sm text-slate-400">
            Brutally honest feedback. No sugarcoating. No participation trophies.
          </p>
        </div>

        {/* Input Section */}
        {!roastResult && (
          <Card className="max-w-4xl mx-auto p-8 bg-slate-800/50 border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-white">
                    Paste Your Resume
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload .txt
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here... (minimum 50 characters)"
                  className="min-h-[400px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-sm"
                  disabled={roastMutation.isPending}
                />
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{resumeText.length} characters</span>
                  <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              {roastMutation.isPending && (
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-3 text-orange-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium text-lg">{currentLoadingMessage}</span>
                  </div>
                  <p className="text-sm text-orange-300/70">
                    The VC recruiter is reading your resume... This won't be pretty.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={roastMutation.isPending || resumeText.length < 50}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6"
              >
                {roastMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Roasting...
                  </>
                ) : (
                  <>
                    <Flame className="mr-2 h-5 w-5" />
                    Roast My Resume
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* Result Section */}
        {roastResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score Badge */}
            <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-center">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Your Score
                </div>
                <div
                  className={`text-8xl font-bold ${
                    roastResult.score >= 70
                      ? "text-green-400"
                      : roastResult.score >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                  style={{
                    textShadow: `0 0 40px ${
                      roastResult.score >= 70
                        ? "rgba(74, 222, 128, 0.5)"
                        : roastResult.score >= 50
                        ? "rgba(250, 204, 21, 0.5)"
                        : "rgba(248, 113, 113, 0.5)"
                    }`,
                  }}
                >
                  {roastResult.score}
                  <span className="text-4xl text-slate-500">/100</span>
                </div>
                <p className="text-xl text-slate-300 italic max-w-2xl mx-auto">
                  "{roastResult.verdict}"
                </p>
              </div>
            </Card>

            {/* Mistakes */}
            <Card className="p-8 bg-slate-800/50 border-slate-700 space-y-6">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-white">
                  The 3 Million-Dollar Mistakes
                </h2>
              </div>
              <p className="text-slate-400">
                These are the errors costing you interviews, offers, and salary:
              </p>

              <div className="space-y-6">
                {roastResult.mistakes.map((mistake: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold text-red-400">
                      Mistake #{index + 1}: {mistake.title}
                    </h3>
                    <p className="text-slate-300">{mistake.explanation}</p>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="text-sm font-semibold text-green-400 mb-2">
                        The Fix:
                      </div>
                      <p className="text-slate-300">{mistake.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Brutal Truth */}
            <Card className="p-8 bg-slate-800/50 border-slate-700 space-y-4">
              <h2 className="text-2xl font-bold text-white">The Brutal Truth</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                {roastResult.brutalTruth}
              </p>
            </Card>

            {/* CTA */}
            <Card className="p-8 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Tired of Being Roasted?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Let CareerSwarm turn this chaos into a Master Profile that actually gets you hired.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6"
              >
                <a href="/dashboard">
                  <FileText className="mr-2 h-5 w-5" />
                  Build Your Master Profile
                </a>
              </Button>
            </Card>

            {/* Try Again */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setRoastResult(null);
                  setResumeText("");
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Roast Another Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
