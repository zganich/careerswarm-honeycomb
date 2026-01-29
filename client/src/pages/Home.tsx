import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Hexagon, ShieldCheck, Zap, Database, Check } from 'lucide-react';
import { useLocation } from 'wouter';

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900 overflow-x-hidden selection:bg-orange-500 selection:text-white">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hexagon className="w-8 h-8 text-orange-500 fill-orange-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900">CareerSwarm</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-orange-600 transition-colors">Technology</a>
            <a href="#proof" className="hover:text-orange-600 transition-colors">Evidence Engine</a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">Enterprise</a>
          </div>
          <button 
            onClick={() => setLocation('/onboarding/welcome')}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
          >
            Get Verified
          </button>
        </div>
      </nav>

      {/* --- HERO: ENTROPY TO ORDER --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Copy */}
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-xs font-semibold text-orange-700 tracking-wide uppercase">AI Verification Live</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-slate-900">
              Turn Career Chaos into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Structured Success.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
              Your career data is scattered—GitHub, Jira, Slack, Drive. Our "Swarm" AI migrates your fragmented history into a single, immutable evidence graph that recruiters trust.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setLocation('/onboarding/welcome')}
                className="group flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-orange-600/20 transform hover:-translate-y-1"
              >
                <span>Start Verification</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setLocation('/profile')}
                className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
              >
                <span>View Sample Profile</span>
              </button>
            </div>
          </div>

          {/* Right: The "Entropy to Order" Visual */}
          <div className="relative h-[500px] w-full bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden p-8 flex items-center justify-center">
            
            {/* Layer 1: Chaos (Left) */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 w-32 h-64 opacity-50">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-slate-400 rounded-full"
                  animate={{
                    x: [Math.random() * 20, Math.random() * -20, Math.random() * 20],
                    y: [Math.random() * 40, Math.random() * -40, Math.random() * 40],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
              <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-mono text-slate-400 uppercase tracking-widest">Entropy</p>
            </div>

            {/* Layer 2: Swarm/Flow (Center) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent absolute" />
              <motion.div 
                className="absolute inset-0 flex items-center justify-center space-x-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Hexagon className="w-12 h-12 text-orange-500 fill-orange-500/20 blur-sm absolute" />
                <Hexagon className="w-12 h-12 text-orange-600 fill-transparent relative z-10" />
              </motion.div>
              {/* Streaming particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`stream-${i}`}
                  className="absolute h-0.5 w-8 bg-orange-400 rounded-full"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 100, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear",
                  }}
                />
              ))}
               <p className="absolute -bottom-16 left-0 right-0 text-center text-xs font-mono text-orange-600 uppercase tracking-widest">Processing</p>
            </div>

            {/* Layer 3: Structure (Right) */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-40 h-64 flex flex-col items-center justify-center space-y-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`card-${i}`}
                  className="w-full h-12 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center px-3 space-x-3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2 + (i * 0.2), duration: 0.5 }}
                >
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div className="h-2 w-20 bg-slate-100 rounded"></div>
                </motion.div>
              ))}
               <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-mono text-slate-900 uppercase tracking-widest font-bold">Evidence</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURE CARDS: LAB AESTHETIC --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-slate-700 group-hover:text-orange-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Data Ingestion</h3>
              <p className="text-slate-600 leading-relaxed">
                Connect your GitHub, Jira, and Slack. We ingest raw metadata without touching sensitive IP, creating a secure baseline.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform relative z-10">
                <Zap className="w-6 h-6 text-slate-700 group-hover:text-orange-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Swarm Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI "swarms" your history, identifying patterns that prove expertise—like consistent high-impact commits or solved incidents.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-slate-700 group-hover:text-orange-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Immutable Proof</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate a verified evidence graph. No more "trust me" resumes. Hand recruiters a link that proves your worth instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- STATS / SOCIAL PROOF --- */}
      <section id="proof" className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">
            Trusted by Engineering Leaders At
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos */}
            <div className="text-xl font-bold text-slate-800">ACME Corp</div>
            <div className="text-xl font-bold text-slate-800">GlobalTech</div>
            <div className="text-xl font-bold text-slate-800">Nebula AI</div>
            <div className="text-xl font-bold text-slate-800">Vertex</div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
