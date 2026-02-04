import { useState } from "react";
import { useLocation } from "wouter";
import { Flame, ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getUserFriendlyMessage } from "@/lib/error-formatting";
import { Button } from "@/components/ui/button";

const MIN_LENGTH = 50;

export default function ResumeRoast() {
  const [, setLocation] = useLocation();
  const [resumeText, setResumeText] = useState("");

  const roast = trpc.public.roast.useMutation();
  const result = roast.data;
  const canSubmit = resumeText.trim().length >= MIN_LENGTH && !roast.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    roast.mutate({ resumeText: resumeText.trim() });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLocation("/onboarding/welcome")}
            className="text-slate-600"
            data-testid="roast-build-master-profile"
          >
            Build my Master Profile
          </Button>
        </header>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resume Roast</h1>
            <p className="text-sm text-slate-600">
              Brutally honest feedback. No signup. Paste your resume (min {MIN_LENGTH} characters).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full min-h-[200px] px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y"
            disabled={roast.isPending}
            aria-label="Resume text"
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              {resumeText.trim().length} chars
              {resumeText.trim().length > 0 && resumeText.trim().length < MIN_LENGTH && (
                <span className="text-amber-600"> — need at least {MIN_LENGTH}</span>
              )}
            </span>
            <Button type="submit" disabled={!canSubmit} className="bg-orange-500 hover:bg-orange-600">
              {roast.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Roasting...
                </>
              ) : (
                "Get Roasted"
              )}
            </Button>
          </div>
        </form>

        {roast.isError && (
          <div
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800"
            data-testid="roast-error"
          >
            {getUserFriendlyMessage(roast.error)}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6" data-testid="roast-result">
            <div className="flex items-center gap-4">
              <div
                className={`text-3xl font-bold ${
                  result.score >= 70 ? "text-emerald-600" : result.score >= 40 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {result.score}/100
              </div>
              <p className="text-slate-700 font-medium">{result.verdict}</p>
            </div>

            <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl">
              <p className="text-sm font-semibold text-slate-700 mb-2">The brutal truth</p>
              <p className="text-sm text-slate-700 leading-relaxed">{result.brutalTruth}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">3 Million-Dollar Mistakes</p>
              <ul className="space-y-4">
                {result.mistakes.map((m, i) => (
                  <li key={i} className="p-4 bg-white border border-slate-200 rounded-xl">
                    <p className="font-medium text-slate-900">{m.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{m.explanation}</p>
                    <p className="text-sm text-emerald-700 mt-2">
                      <span className="font-medium">Fix:</span> {m.fix}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              {result.wordCount} words · {result.characterCount} characters
            </p>

            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Turn these fixes into a resume that gets interviews
              </h2>
              <p className="text-sm text-slate-300 mb-4">
                Build one Master Profile. We'll help you fix these mistakes and tailor every application.
              </p>
              <Button
                type="button"
                onClick={() => setLocation("/onboarding/welcome")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl"
              >
                Build my Master Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
