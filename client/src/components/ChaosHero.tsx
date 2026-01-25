import { motion } from "framer-motion";
import { TestTheSwarm } from "./TestTheSwarm";
import { HeroProcessor } from "./HeroProcessor";

interface ChaosHeroProps {
  onStart: () => void;
}

/**
 * ChaosHero - High-end SaaS aesthetic with depth, motion, and interactivity
 * 
 * Features:
 * - Gradient orb background for atmospheric depth
 * - Massive, tight typography (text-7xl, tracking-tight)
 * - Two-column layout: left (interactive hook), right (3D processor)
 * - Interactive "Test the Swarm" proves value in 3 seconds
 * - 3D glass processor shows transformation visually
 */
export function ChaosHero({ onStart }: ChaosHeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid-bg" />

      {/* Gradient Orb - Atmospheric depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Hero content - Two-column layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Interactive Hook */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Headline - Massive and tight */}
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.05]">
              Turn Career{" "}
              <span className="text-slate-400">Chaos</span>
              <br />
              into{" "}
              <span className="text-orange-500">Structured Success</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              The job market is messy. Your resume shouldn't be.{" "}
              <span className="font-semibold text-slate-900">Let the Swarm</span>{" "}
              assemble your fragmented experience into a perfect fit.
            </p>

            {/* Interactive "Test the Swarm" */}
            <TestTheSwarm />

            {/* CTA Button */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <button
                onClick={onStart}
                className="text-sm text-slate-600 hover:text-orange-500 font-medium transition-colors underline decoration-slate-300 hover:decoration-orange-500"
              >
                Or start the full application →
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Glass Processor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <HeroProcessor />
          </motion.div>
        </div>

        {/* Social Proof Strip */}
        <motion.div
          className="mt-20 pt-12 border-t border-slate-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider text-center mb-6">
            Trusted by candidates at
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-50 grayscale">
            <div className="text-2xl font-bold text-slate-700">Google</div>
            <div className="text-2xl font-bold text-slate-700">Meta</div>
            <div className="text-2xl font-bold text-slate-700">Amazon</div>
            <div className="text-2xl font-bold text-slate-700">Microsoft</div>
            <div className="text-2xl font-bold text-slate-700">Apple</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
