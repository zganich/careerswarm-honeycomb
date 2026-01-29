import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Hexagon, ShieldCheck, Zap, Database, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { TransformationHero } from '@/components/ui/psych';

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
            Build My Master Profile
          </button>
        </div>
      </nav>

      {/* --- HERO: TRANSFORMATION (Pillar 4) --- */}
      <TransformationHero />

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
