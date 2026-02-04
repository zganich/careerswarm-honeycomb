import { useState } from "react";
import { useLocation } from "wouter";
import { Flame, ArrowLeft, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { trackEvent, EVENTS } from "@/lib/posthog";

const MIN_LENGTH = 50;

export default function ResumeRoast() {
  const [, setLocation] = useLocation();
  const [resumeText, setResumeText] = useState("");
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  const roastMutation = trpc.public.roast.useMutation({
    onSuccess: (data) => {
      trackEvent(EVENTS.RESUME_ROASTED, { score: data?.score });
    },
    onError: (err) => {
      console.error("[Resume Roast]", err);
    },
  });

  const result = roastMutation.data;
  const canSubmit = resumeText.trim().length >= MIN_LENGTH && !roastMutation.isPending;

  const handleFeedback = (helpful: boolean) => {
    if (feedback !== null) return;
    setFeedback(helpful ? "helpful" : "not-helpful");
    trackEvent(EVENTS.RESUME_ROAST_FEEDBACK, {
      helpful,
      score: result?.score,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    roastMutation.mutate({ resumeText: resumeText.trim() });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
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
          >
            Build my Master Profile
          </Button>
        </div>

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
            disabled={roastMutation.isPending}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              {resumeText.trim().length} chars
              {resumeText.trim().length > 0 && resumeText.trim().length < MIN_LENGTH && (
                <span className="text-amber-600"> — need at least {MIN_LENGTH}</span>
              )}
            </span>
            <Button type="submit" disabled={!canSubmit} className="bg-orange-500 hover:bg-orange-600">
              {roastMutation.isPending ? (
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

        {roastMutation.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            {roastMutation.error.message.includes("fetch failed") ||
            roastMutation.error.message.includes("NetworkError") ||
            roastMutation.error.message.includes("timed out")
              ? "Resume roast request failed or timed out. Roasts can take up to a minute—please try again."
              : roastMutation.error.message}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
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
                {result.mistakes.map((m: { title?: string; explanation?: string; fix?: string }, i: number) => (
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

            {/* Feedback: humor quality */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-700">Was this helpful?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFeedback(true)}
                  disabled={feedback !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    feedback === "helpful"
                      ? "bg-emerald-100 text-emerald-800"
                      : feedback === null
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-400 cursor-default"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(false)}
                  disabled={feedback !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    feedback === "not-helpful"
                      ? "bg-amber-100 text-amber-800"
                      : feedback === null
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-400 cursor-default"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not really
                </button>
              </div>
              {feedback !== null && (
                <span className="text-xs text-slate-500">Thanks for the feedback</span>
              )}
            </div>

            {/* Lead magnet → onboarding conversion */}
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Turn these fixes into a resume that gets interviews
              </h2>
              <p className="text-sm text-slate-300 mb-4">
                Build one Master Profile. We’ll help you fix these mistakes and tailor every application.
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
