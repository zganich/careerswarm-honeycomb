import { motion } from "framer-motion";
import { DollarSign, LogOut, Download, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

/**
 * RiskReversal - Final conversion zone that removes all friction
 * 
 * Features:
 * - Three-column grid: 30-day guarantee, cancel anytime, data export
 * - Large CTA: "Start Building → Free Forever Tier Available"
 * - Social proof: "Join 14,327 candidates who optimized this week"
 * - Positioned above footer as last conversion opportunity
 */

interface RiskReversalProps {
  onStart: () => void;
}

export function RiskReversal({ onStart }: RiskReversalProps) {
  const guarantees = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "30-Day Money Back Guarantee",
      description: "Try Pro risk-free. Not satisfied? Get a full refund, no questions asked.",
    },
    {
      icon: <LogOut className="w-8 h-8" />,
      title: "Cancel Anytime, Keep Your Resumes",
      description: "Downgrade or cancel anytime. All your resumes and data stay yours forever.",
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Data Export in One Click",
      description: "Export all your profiles, resumes, and analyses in standard formats anytime.",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Prove It To Yourself - Zero Risk
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            We're confident you'll love Careerswarm. That's why we make it easy to try.
          </p>

          {/* Three-Column Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={guarantee.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-orange-300 hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
                  <div className="text-orange-500">{guarantee.icon}</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{guarantee.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{guarantee.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Large CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-8 text-xl font-bold rounded-2xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all group"
            >
              Start Building Your Master Profile
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>

          {/* Microcopy */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">
              Free Forever Tier Available - No Credit Card Required
            </p>
            <p className="text-sm text-slate-500">
              Join <span className="font-bold text-orange-500">14,327 candidates</span> who
              optimized their careers this week
            </p>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-center gap-8 flex-wrap opacity-60"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-slate-600 font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-slate-600 font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-slate-600 font-medium">SOC 2 Certified</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
