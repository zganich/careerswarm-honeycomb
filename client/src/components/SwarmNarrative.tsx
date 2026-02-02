import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "IDLE" | "INTELLIGENCE" | "TARGETING" | "PRODUCTION" | "COMPLETE";

interface CompletedStage {
  id: string;
  title: string;
  agents: Array<{ icon: string; name: string; description: string }>;
}

export function SwarmNarrative() {
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [completedStages, setCompletedStages] = useState<CompletedStage[]>([]);

  useEffect(() => {
    const sequence = async () => {
      // Start sequence
      await delay(500);
      
      // Phase 1: Intelligence
      setPhase("INTELLIGENCE");
      await delay(1200);
      setCompletedStages(prev => [...prev, {
        id: "intelligence",
        title: "1. DEEP RESEARCH",
        agents: [
          { icon: "🔍", name: "Scout", description: "Finds Roles" },
          { icon: "🧠", name: "Profiler", description: "Analyzes Strategy" },
          { icon: "✅", name: "Qualifier", description: "Verifies Fit" },
        ]
      }]);
      
      // Phase 2: Targeting
      setPhase("TARGETING");
      await delay(1200);
      setCompletedStages(prev => [...prev, {
        id: "targeting",
        title: "2. TARGETING",
        agents: [
          { icon: "🎯", name: "Hunter", description: "Finds Hiring Mgr" },
        ]
      }]);
      
      // Phase 3: Production
      setPhase("PRODUCTION");
      await delay(1200);
      setCompletedStages(prev => [...prev, {
        id: "production",
        title: "3. PRODUCTION",
        agents: [
          { icon: "⚡", name: "Tailor", description: "Rewrites Resume" },
          { icon: "✍️", name: "Scribe", description: "Drafts Outreach" },
          { icon: "📦", name: "Assembler", description: "Builds Package" },
        ]
      }]);
      
      // Phase 4: Complete
      setPhase("COMPLETE");
      await delay(5000);
      
      // Loop: Reset
      setCompletedStages([]);
      setPhase("IDLE");
      await delay(500);
      sequence(); // Restart
    };

    sequence();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center min-h-[320px]">
        
        {/* LEFT COLUMN: History Stack */}
        <div className="w-full lg:w-64 space-y-4">
          <AnimatePresence>
            {completedStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, scale: 1, x: 200 }}
                animate={{ opacity: 0.6, scale: 0.85, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-md"
              >
                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  {stage.title}
                </div>
                <div className="space-y-2">
                  {stage.agents.map((agent) => (
                    <div key={agent.name} className="flex items-center gap-2">
                      <span className="text-sm">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600 truncate">{agent.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CENTER/RIGHT: Active Stage */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* INTELLIGENCE STAGE */}
            {phase === "INTELLIGENCE" && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -200 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-md border-2 border-orange-200 rounded-2xl p-6 shadow-2xl w-full max-w-sm"
              >
                <div className="text-sm uppercase tracking-wider text-orange-500 font-bold mb-6 text-center">
                  1. DEEP RESEARCH
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: "🔍", name: "Scout", description: "Finds Roles", delay: 0 },
                    { icon: "🧠", name: "Profiler", description: "Analyzes Strategy", delay: 0.3 },
                    { icon: "✅", name: "Qualifier", description: "Verifies Fit", delay: 0.6 },
                  ].map((agent) => (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: agent.delay, duration: 0.4 }}
                      className="bg-white rounded-full px-5 py-3 shadow-md flex items-center gap-3"
                    >
                      <motion.span
                        className="text-2xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: agent.delay }}
                      >
                        {agent.icon}
                      </motion.span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TARGETING STAGE */}
            {phase === "TARGETING" && (
              <motion.div
                key="targeting"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -200 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-md border-2 border-purple-200 rounded-2xl p-6 shadow-2xl w-full max-w-sm"
              >
                <div className="text-sm uppercase tracking-wider text-purple-500 font-bold mb-6 text-center">
                  2. TARGETING
                </div>
                
                <div className="relative flex items-center justify-center h-40">
                  {/* Radar Rings */}
                  {[0, 0.5, 1].map((delay) => (
                    <motion.div
                      key={delay}
                      className="absolute w-32 h-32 rounded-full border-2 border-purple-300"
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, delay }}
                    />
                  ))}
                  
                  {/* Hunter Agent */}
                  <div className="relative bg-white rounded-full px-6 py-4 shadow-lg flex items-center gap-3 z-10">
                    <span className="text-3xl">🎯</span>
                    <div>
                      <p className="text-base font-bold text-slate-800">Hunter</p>
                      <p className="text-sm text-slate-500">Finds Hiring Mgr</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRODUCTION STAGE */}
            {phase === "PRODUCTION" && (
              <motion.div
                key="production"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -200 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-md border-2 border-green-200 rounded-2xl p-6 shadow-2xl w-full max-w-sm"
              >
                <div className="text-sm uppercase tracking-wider text-green-600 font-bold mb-6 text-center">
                  3. PRODUCTION
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: "⚡", name: "Tailor", description: "Rewrites Resume", delay: 0 },
                    { icon: "✍️", name: "Scribe", description: "Drafts Outreach", delay: 0.3 },
                    { icon: "📦", name: "Assembler", description: "Builds Package", delay: 0.6 },
                  ].map((agent) => (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: agent.delay, duration: 0.4 }}
                      className="bg-white rounded-full px-5 py-3 shadow-md flex items-center gap-3"
                    >
                      <span className="text-2xl">{agent.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                        <motion.p
                          className="text-xs text-slate-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: agent.delay + 0.2 }}
                        >
                          {agent.description}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* COMPLETE STAGE - Mission Package Reveal */}
            {phase === "COMPLETE" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.05 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-2xl border-4 border-green-300 w-full max-w-sm"
              >
                {/* Glowing Badge */}
                <motion.div
                  className="absolute -top-5 left-1/2 -translate-x-1/2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="bg-green-500 text-white px-6 py-2 rounded-full text-base font-bold shadow-xl flex items-center gap-2">
                    <span>⏱️</span>
                    <span>Saved ~3.5 Hours</span>
                  </div>
                </motion.div>

                <div className="mt-6 flex items-center gap-5">
                  {/* File Icon */}
                  <motion.div
                    className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </motion.div>

                  <div className="flex-1">
                    <p className="text-2xl font-bold text-slate-900">Application Package</p>
                    <p className="text-base text-slate-600">Ready to Send</p>
                  </div>
                </div>

                {/* Package Contents */}
                <div className="mt-6 space-y-3">
                  {[
                    "Tailored Resume (ATS-Optimized)",
                    "Cover Letter",
                    "LinkedIn DM",
                    "Email Template",
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3 text-slate-700"
                    >
                      <span className="text-green-600 font-bold text-lg">✓</span>
                      <span className="text-sm font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
