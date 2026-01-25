import { motion } from "framer-motion";
import { Lock, Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { ValueDemonstrator } from "./ValueDemonstrator";

interface ChaosHeroProps {
  onStart: () => void;
}

/**
 * ChaosHero - Conversion-focused hero section
 * 
 * Features:
 * - Outcome-driven headline: "Increase Your Interview Rate by 87%"
 * - Clear value proposition and benefits
 * - Primary CTA: "Build Your Master Profile - Free Forever"
 * - Trust signals: No credit card, 2-minute setup, secure data
 * - Social proof embedded in hero (FAANG logos + metrics)
 * - ValueDemonstrator showing real transformations
 */
export function ChaosHero({ onStart }: ChaosHeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid-bg" />

      {/* Subtle gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 items-center">
          {/* Left Column: Conversion Zone */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Headline - Outcome-focused */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.05]">
              Increase Your Interview Rate by{" "}
              <span className="text-orange-500">87%</span>
            </h1>

            {/* Subheadline - Clear value prop */}
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              AI analyzes your experience against job descriptions in real-time, showing{" "}
              <span className="font-semibold text-slate-900">exactly what to change</span> to get
              noticed.
            </p>

            {/* Primary CTA */}
            <div className="space-y-4 mb-8">
              <Button
                onClick={onStart}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all group"
              >
                Build Your Master Profile - Free Forever
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Microcopy */}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  2-minute setup
                </span>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center gap-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-600">
                  Your data never leaves our secure servers
                </span>
              </div>
            </div>

            {/* Social Proof Bar - Embedded in hero */}
            <motion.div
              className="mt-12 pt-8 border-t border-slate-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">
                Trusted by candidates at
              </p>
              <div className="flex items-center gap-8 flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="text-xl font-bold text-slate-700">Google</div>
                <div className="text-xl font-bold text-slate-700">Meta</div>
                <div className="text-xl font-bold text-slate-700">Stripe</div>
                <div className="text-xl font-bold text-slate-700">OpenAI</div>
                <div className="text-xl font-bold text-slate-700">Amazon</div>
              </div>
              <p className="text-sm text-slate-600 mt-3 font-medium">
                <span className="text-orange-500">2,341 candidates</span> landed roles this month
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column: Value Demonstrator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <ValueDemonstrator />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
