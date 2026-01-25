import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface ChaosHeroProps {
  onStart: () => void;
}

/**
 * ChaosHero - Linear-style engineering aesthetic with dot grid background
 * 
 * Features:
 * - Dot grid background with radial gradient mask
 * - Tight, cohesive typography with reduced line-height
 * - Orange accent on "Structured Success"
 * - Reduced vertical padding (30-40% less whitespace)
 * - CTA button with subtle orange shadow for lift
 */
export function ChaosHero({ onStart }: ChaosHeroProps) {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Dot grid background with radial mask */}
      <div className="absolute inset-0 dot-grid-bg" />

      {/* Hero content */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-6"
          animate={{
            boxShadow: [
              "0 10px 30px rgba(0,0,0,0.1)",
              "0 15px 40px rgba(249,115,22,0.2)",
              "0 10px 30px rgba(0,0,0,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-8 h-8 text-orange-500" />
        </motion.div>

        {/* Headline - Tight spacing, orange accent, no background box */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-[1.1]">
          Turn Career{" "}
          <span className="text-gray-400">Chaos</span>
          <br />
          into{" "}
          <span className="text-orange-500">Structured Success</span>
        </h1>

        {/* Subheadline - Improved readability */}
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
          The job market is messy. Your resume shouldn't be.{" "}
          <span className="font-semibold text-gray-900">Let the Swarm</span>{" "}
          assemble your fragmented experience into a perfect fit.
        </p>

        {/* CTA Button with orange shadow */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
          >
            Start Application
          </Button>
        </motion.div>

        {/* Subtle hint text */}
        <motion.p
          className="mt-6 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          3 quick questions • 2 minutes
        </motion.p>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
