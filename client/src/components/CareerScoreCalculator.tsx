import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";

/**
 * CareerScoreCalculator - Interactive tool that creates value perception and drives conversion
 * 
 * Features:
 * - Dropdowns for Current Role and Target Role
 * - Calculates personalized career score (72/100)
 * - Shows specific gaps: Keyword Match, Impact Quantification, STAR Format
 * - CTA: "Fix These Gaps →" leads to signup
 * - Identifies pain points to drive conversion
 */

interface ScoreResult {
  overall: number;
  rating: string;
  keywordMatch: { current: number; potential: number };
  impactQuant: { current: number; potential: number };
  starFormat: { current: number; potential: number };
}

const roles = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Marketing Manager",
  "Sales Representative",
  "UX Designer",
  "Business Analyst",
  "Project Manager",
];

export function CareerScoreCalculator({ onSignup }: { onSignup: () => void }) {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const qualifyMutation = trpc.public.estimateQualification.useMutation();

  const calculateScore = async () => {
    if (!currentRole || !targetRole) return;

    try {
      const data = await qualifyMutation.mutateAsync({ currentRole, targetRole });
      
      // Transform AI response into ScoreResult format
      const score: ScoreResult = {
        overall: data.score,
        rating: data.reasoning,
        keywordMatch: {
          current: Math.max(30, data.score - 25),
          potential: 95,
        },
        impactQuant: {
          current: Math.max(3, Math.floor(data.score / 15)),
          potential: 9,
        },
        starFormat: {
          current: Math.max(3, Math.floor(data.score / 12)),
          potential: 10,
        },
      };

      setResult(score);
    } catch (error) {
      console.error("Failed to calculate score:", error);
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50 py-16">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">Free Analysis</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              See your untapped potential in 30 seconds
            </h2>
            <p className="text-lg text-slate-600">
              Most candidates underrepresent their experience by 40-60%
            </p>
          </div>

          {/* Input Form */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Role
              </label>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all hover:border-orange-400 hover:shadow-sm"
              >
                <option value="">Select your role...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all hover:border-orange-400 hover:shadow-sm"
              >
                <option value="">Select target role...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={calculateScore}
            disabled={!currentRole || !targetRole || qualifyMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {qualifyMutation.isPending ? "Analyzing with AI..." : "Calculate My Score"}
          </Button>

          {/* Result Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-8 border-t border-slate-200"
              >
                {/* Overall Score */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-4 border-orange-500 mb-4"
                  >
                    <div>
                      <div className="text-4xl font-bold text-orange-600">{result.overall}</div>
                      <div className="text-sm text-slate-600">/100</div>
                    </div>
                  </motion.div>
                  <p className="text-lg font-semibold text-slate-700">{result.rating}</p>
                </div>

                {/* Gap Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Your Optimization Opportunities
                    </h3>
                  </div>

                  {/* Keyword Match */}
                  <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Keyword Match</span>
                      <span className="text-sm font-bold text-orange-600">
                        {result.keywordMatch.current}% → could be {result.keywordMatch.potential}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-slate-400 rounded-full"
                        style={{ width: `${result.keywordMatch.current}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full opacity-30"
                        style={{ width: `${result.keywordMatch.potential}%` }}
                      />
                    </div>
                  </div>

                  {/* Impact Quantification */}
                  <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Impact Quantification
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        {result.impactQuant.current}/10 → could be {result.impactQuant.potential}/10
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-slate-400 rounded-full"
                        style={{ width: `${result.impactQuant.current * 10}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full opacity-30"
                        style={{ width: `${result.impactQuant.potential * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* STAR Format */}
                  <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">STAR Format</span>
                      <span className="text-sm font-bold text-orange-600">
                        {result.starFormat.current}/10 → could be {result.starFormat.potential}/10
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-slate-400 rounded-full"
                        style={{ width: `${result.starFormat.current * 10}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full opacity-30"
                        style={{ width: `${result.starFormat.potential * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={onSignup}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  Fix These Gaps Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
