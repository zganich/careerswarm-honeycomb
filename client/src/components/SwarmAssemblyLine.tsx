import { useState } from "react";

export function SwarmAssemblyLine() {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Assembly Line Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
        
        {/* STAGE 1: Deep Research */}
        <div
          className="relative bg-white/50 backdrop-blur-md border border-orange-100 rounded-2xl p-6 shadow-xl w-full lg:w-80 transition-transform duration-300 hover:scale-105"
          onMouseEnter={() => setHoveredStage(1)}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">
            1. DEEP RESEARCH
          </div>
          
          <div className="space-y-3">
            {/* Scout */}
            <div className="bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">🔍</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Scout</p>
                <p className="text-xs text-slate-500">Finds Roles</p>
              </div>
            </div>
            
            {/* Profiler */}
            <div className="bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">🧠</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Profiler</p>
                <p className="text-xs text-slate-500">Analyzes Strategy</p>
              </div>
            </div>
            
            {/* Qualifier */}
            <div className="bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">✅</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Qualifier</p>
                <p className="text-xs text-slate-500">Verifies Fit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow 1 (Desktop) */}
        <div className="hidden lg:block">
          <svg className="w-12 h-8 flow-arrow" viewBox="0 0 50 30" fill="none">
            <path d="M0 15 L40 15" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" className="animate-flow" />
            <path d="M35 10 L45 15 L35 20" fill="#f97316" />
          </svg>
        </div>

        {/* Arrow 1 (Mobile) */}
        <div className="lg:hidden">
          <svg className="w-8 h-12 flow-arrow" viewBox="0 0 30 50" fill="none">
            <path d="M15 0 L15 40" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" className="animate-flow" />
            <path d="M10 35 L15 45 L20 35" fill="#f97316" />
          </svg>
        </div>

        {/* STAGE 2: Targeting */}
        <div
          className="relative bg-white/50 backdrop-blur-md border border-orange-100 rounded-2xl p-6 shadow-xl w-full lg:w-80 transition-transform duration-300 hover:scale-105"
          onMouseEnter={() => setHoveredStage(2)}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">
            2. TARGETING
          </div>
          
          <div className="relative">
            {/* Radar Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full border-2 border-purple-300 animate-ping opacity-30"></div>
            </div>
            
            {/* Hunter */}
            <div className="relative bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">🎯</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Hunter</p>
                <p className="text-xs text-slate-500">Finds Hiring Mgr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow 2 (Desktop) */}
        <div className="hidden lg:block">
          <svg className="w-12 h-8 flow-arrow" viewBox="0 0 50 30" fill="none">
            <path d="M0 15 L40 15" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" className="animate-flow" />
            <path d="M35 10 L45 15 L35 20" fill="#f97316" />
          </svg>
        </div>

        {/* Arrow 2 (Mobile) */}
        <div className="lg:hidden">
          <svg className="w-8 h-12 flow-arrow" viewBox="0 0 30 50" fill="none">
            <path d="M15 0 L15 40" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" className="animate-flow" />
            <path d="M10 35 L15 45 L20 35" fill="#f97316" />
          </svg>
        </div>

        {/* STAGE 3: Production */}
        <div
          className="relative bg-white/50 backdrop-blur-md border border-orange-100 rounded-2xl p-6 shadow-xl w-full lg:w-80 transition-transform duration-300 hover:scale-105"
          onMouseEnter={() => setHoveredStage(3)}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">
            3. PRODUCTION
          </div>
          
          <div className="space-y-3">
            {/* Tailor */}
            <div className="bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">⚡</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Tailor</p>
                <p className="text-xs text-slate-500">Rewrites Resume</p>
              </div>
            </div>
            
            {/* Scribe */}
            <div className="bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">✍️</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Scribe</p>
                <p className="text-xs text-slate-500">Drafts Outreach</p>
              </div>
            </div>
            
            {/* Assembler */}
            <div className="bg-white rounded-full px-4 py-2.5 shadow-sm flex items-center gap-3">
              <span className="text-orange-500 text-lg">📦</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-700">Assembler</p>
                <p className="text-xs text-slate-500">Builds Package</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OUTPUT: Mission Package */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {/* Arrow Down */}
        <div>
          <svg className="w-8 h-12 flow-arrow" viewBox="0 0 30 50" fill="none">
            <path d="M15 0 L15 40" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className="animate-flow" />
            <path d="M10 35 L15 45 L20 35" fill="#10b981" />
          </svg>
        </div>

        {/* Output Card */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl border-2 border-green-200 max-w-md w-full">
          {/* Glowing Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse">
              <span>⏱️</span>
              <span>Saved ~3.5 Hours</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            {/* File Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>

            <div className="text-left flex-1">
              <p className="text-lg font-bold text-slate-900">Application Package</p>
              <p className="text-sm text-slate-600">Ready to Send</p>
            </div>
          </div>

          {/* Package Contents */}
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Tailored Resume (ATS-Optimized)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Cover Letter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>LinkedIn DM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Email Template</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flow {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 8;
          }
        }

        .animate-flow {
          animation: flow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
