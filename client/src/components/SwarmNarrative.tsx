import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "IDLE" | "INTELLIGENCE" | "TARGETING" | "PRODUCTION" | "COMPLETE";

export function SwarmNarrative() {
  const [phase, setPhase] = useState<Phase>("IDLE");

  useEffect(() => {
    const sequence = async () => {
      // Start sequence
      await delay(500);
      
      // Phase 1: Intelligence (simplified - just show concept)
      setPhase("INTELLIGENCE");
      await delay(1200);
      
      // Phase 2: Targeting
      setPhase("TARGETING");
      await delay(1200);
      
      // Phase 3: Production
      setPhase("PRODUCTION");
      await delay(1200);
      
      // Phase 4: Complete - Show transformation
      setPhase("COMPLETE");
      await delay(3000);
      
      // Loop: Reset
      setPhase("IDLE");
      await delay(500);
      sequence(); // Restart
    };

    sequence();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-center min-h-[400px]">
        
        <AnimatePresence mode="wait">
          
          {/* INTELLIGENCE STAGE - Simplified */}
          {phase === "INTELLIGENCE" && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-full border border-orange-200">
                <motion.span 
                  className="text-3xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  🔍
                </motion.span>
                <span className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
                  Deep Research
                </span>
              </div>
              <p className="text-slate-600 text-lg max-w-md mx-auto">
                Analyzing company culture, role requirements, and hiring patterns...
              </p>
            </motion.div>
          )}

          {/* TARGETING STAGE - Radar Effect */}
          {phase === "TARGETING" && (
            <motion.div
              key="targeting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="relative inline-flex items-center justify-center">
                {/* Radar Rings */}
                {[0, 0.3, 0.6].map((delay) => (
                  <motion.div
                    key={delay}
                    className="absolute w-24 h-24 rounded-full border-2 border-purple-300"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay }}
                  />
                ))}
                
                <div className="relative bg-purple-50 px-6 py-3 rounded-full border border-purple-200 z-10">
                  <span className="text-3xl">🎯</span>
                  <span className="ml-3 text-sm font-semibold text-purple-700 uppercase tracking-wide">
                    Targeting
                  </span>
                </div>
              </div>
              <p className="text-slate-600 text-lg max-w-md mx-auto">
                Finding hiring managers and key decision makers...
              </p>
            </motion.div>
          )}

          {/* PRODUCTION STAGE - Typing Effect */}
          {phase === "PRODUCTION" && (
            <motion.div
              key="production"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full border border-green-200">
                <motion.span 
                  className="text-3xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ✍️
                </motion.span>
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Production
                </span>
              </div>
              <p className="text-slate-600 text-lg max-w-md mx-auto">
                Crafting tailored resume, cover letter, and outreach...
              </p>
            </motion.div>
          )}

          {/* COMPLETE STAGE - Transformation Reveal */}
          {phase === "COMPLETE" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-center space-y-6"
            >
              {/* Before/After Split */}
              <div className="flex items-center justify-center gap-8">
                
                {/* BEFORE: Scattered Resume */}
                <motion.div
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: -20, opacity: 0.3 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-32 h-40 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center">
                    <div className="space-y-2 p-4">
                      <div className="h-2 bg-slate-300 rounded w-20"></div>
                      <div className="h-2 bg-slate-300 rounded w-16"></div>
                      <div className="h-2 bg-slate-300 rounded w-24"></div>
                      <div className="h-2 bg-slate-300 rounded w-14"></div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl">📄</div>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-4xl"
                >
                  →
                </motion.div>

                {/* AFTER: Polished Package */}
                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: 20, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                  className="relative"
                >
                  <div className="w-32 h-40 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 flex items-center justify-center shadow-lg">
                    <div className="space-y-2 p-4">
                      <div className="h-2 bg-green-400 rounded w-20"></div>
                      <div className="h-2 bg-green-400 rounded w-16"></div>
                      <div className="h-2 bg-green-400 rounded w-24"></div>
                      <div className="h-2 bg-green-400 rounded w-14"></div>
                    </div>
                  </div>
                  <motion.div 
                    className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✓
                  </motion.div>
                </motion.div>
              </div>

              {/* Time Saved Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg"
              >
                <span>⏱️</span>
                <span>~3.5 Hours Saved</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-slate-600 text-base max-w-md mx-auto"
              >
                Application package ready to send
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
