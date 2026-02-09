import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, ArrowLeft, Loader2, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getUserFriendlyMessage } from "@/lib/error-formatting";
import { Button } from "@/components/ui/button";

const MIN_LENGTH = 2;

export default function QualificationEstimate() {
  const [, setLocation] = useLocation();
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const estimate = trpc.public.estimateQualification.useMutation();
  const result = estimate.data;
  const canSubmit =
    currentRole.trim().length >= MIN_LENGTH &&
    targetRole.trim().length >= MIN_LENGTH &&
    !estimate.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    estimate.mutate({
      currentRole: currentRole.trim(),
      targetRole: targetRole.trim(),
    });
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
        </header>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Role fit estimate
            </h1>
            <p className="text-sm text-slate-600">
              See how well your current role qualifies for a target role. No
              signup.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="current-role"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Your current role
            </label>
            <input
              id="current-role"
              type="text"
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={estimate.isPending}
              aria-label="Current role"
            />
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-slate-400" aria-hidden />
          </div>
          <div>
            <label
              htmlFor="target-role"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Target role
            </label>
            <input
              id="target-role"
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Product Manager"
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={estimate.isPending}
              aria-label="Target role"
            />
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600"
          >
            {estimate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Estimating...
              </>
            ) : (
              "Estimate fit"
            )}
          </Button>
        </form>

        {estimate.isError && (
          <div
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800"
            data-testid="estimate-error"
          >
            {getUserFriendlyMessage(estimate.error)}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6" data-testid="estimate-result">
            <div className="flex items-center gap-4">
              <div
                className={`text-3xl font-bold ${
                  result.score >= 70
                    ? "text-emerald-600"
                    : result.score >= 40
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {result.score}/100
              </div>
              <p className="text-slate-700 font-medium">Fit score</p>
            </div>

            <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Summary
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {result.reasoning}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Gaps to address
              </p>
              <ul className="space-y-3">
                {result.gaps.map((gap, i) => (
                  <li
                    key={i}
                    className="p-4 bg-white border border-slate-200 rounded-xl"
                  >
                    <p className="font-medium text-slate-900">{gap.skill}</p>
                    <span
                      className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded ${
                        gap.importance === "critical"
                          ? "bg-red-100 text-red-800"
                          : gap.importance === "important"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {gap.importance}
                    </span>
                    <p className="text-sm text-slate-600 mt-2">
                      {gap.suggestion}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button
                asChild
                variant="outline"
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <a href="/login?returnTo=/onboarding/welcome">
                  Build a profile tailored to this role
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
