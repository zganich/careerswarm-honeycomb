import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * HeroProcessor - 3D-tilted glass interface showing the "Swarm" at work
 *
 * Features:
 * - 3D perspective with rotated glass panel
 * - Messy inputs transforming into green badges with checkmarks
 * - Vertical scanner beam animation (orange gradient, loops top-to-bottom)
 * - High-end SaaS aesthetic with depth and motion
 */
export function HeroProcessor() {
  const messyInputs = [
    "Managed team projects",
    "Improved system performance",
    "Worked on customer issues",
    "Led initiative to enhance workflow",
  ];

  const transformedOutputs = [
    "Led 8-person team to deliver 3 projects 2 weeks ahead of schedule",
    "Optimized database queries, reducing load time by 47% (2.1s → 1.1s)",
    "Resolved 156 customer tickets with 98% satisfaction (4.9/5 rating)",
    "Designed automation system that saved team 12 hours/week",
  ];

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      {/* 3D Glass Panel */}
      <motion.div
        className="relative w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-12deg) rotateX(5deg)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Scanner Beam Animation */}
        <motion.div
          className="absolute left-0 right-0 h-1 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(249, 115, 22, 0.6), transparent)",
            filter: "blur(4px)",
          }}
          animate={{
            top: ["0%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Processing Input
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs text-slate-500">Swarm Active</span>
          </div>
        </div>

        {/* Transformation List */}
        <div className="space-y-3">
          {transformedOutputs.map((output, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{output}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Footer */}
        <motion.div
          className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">4/4</div>
            <div className="text-xs text-slate-500">Transformed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">2.3s</div>
            <div className="text-xs text-slate-500">Processing Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-500">98%</div>
            <div className="text-xs text-slate-500">ATS Score</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
