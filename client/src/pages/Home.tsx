import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Hexagon, ShieldCheck, Zap, Database, Check, Upload, Sparkles, Shield } from 'lucide-react';
import { useLocation } from 'wouter';
import { SwarmNarrative } from '@/components/SwarmNarrative';
import { TrustStrip } from '@/components/TrustStrip';

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
            <button onClick={() => setLocation('/pricing')} className="hover:text-orange-600 transition-colors">Pricing</button>
            <button onClick={() => setLocation('/recruiters')} className="hover:text-orange-600 transition-colors">For Recruiters</button>
            <button onClick={() => setLocation('/roast')} className="hover:text-orange-600 transition-colors">Resume Roast</button>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = `${import.meta.env.VITE_OAUTH_PORTAL_URL}?app_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${window.location.origin}/api/oauth/callback`}
              className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => setLocation('/onboarding/welcome')}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              Build My Master Profile
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO: 7-AGENT ASSEMBLY LINE --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-6 pt-12 md:pt-16 pb-6 md:pb-8 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>

        {/* Gradient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-orange-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-4 max-w-7xl mx-auto w-full">
          
          {/* Headline Group */}
          <div className="space-y-2 max-w-4xl px-2 md:px-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              <span className="whitespace-nowrap">Stop Applying.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 whitespace-nowrap">Start Infiltrating.</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
              The average job seeker applies to <strong className="text-slate-900">100 black holes</strong>. The Swarm scouts the role, profiles the company, and hunts the hiring manager so you can <strong className="text-orange-600">skip the line</strong>.
            </p>
          </div>

          {/* Action Group - MOVED ABOVE ANIMATION */}
          <div className="space-y-2">
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-4 sm:px-0">
              <button 
                onClick={() => setLocation('/onboarding/welcome')}
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span className="relative z-10">Start Free Trial</span>
              </button>
              
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-slate-50 text-slate-700 text-base sm:text-lg font-medium rounded-xl border-2 border-slate-200 transition-all duration-300">
                Import from LinkedIn
              </button>
            </div>

            {/* Safety Latch - De-Risking */}
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-400 mt-2 px-2">
              <span className="text-base">🔒</span>
              <span>Read-Only Access • No Credit Card • We never post to LinkedIn</span>
            </div>
          </div>

          {/* Swarm Narrative Animation - MOVED BELOW CTAs */}
          <SwarmNarrative />

        </div>
      </section>

      {/* --- TRUST STRIP: SOCIAL PROOF --- */}
      <TrustStrip />

      {/* --- FEATURE CARDS: LAB AESTHETIC --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            How CareerSwarm Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Upload Once, Apply Forever</h3>
              <p className="text-slate-600 leading-relaxed">
                Connect your LinkedIn, resume, and work history. We extract and structure your achievements into a Master Profile that powers unlimited applications.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Finds Your Hidden Strengths</h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI analyzes your entire career history, identifying patterns and quantified achievements you may have overlooked—like that project that saved $500K.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Applications Recruiters Trust</h3>
              <p className="text-slate-600 leading-relaxed">
                Every application includes tailored resumes, personalized cover letters, and LinkedIn messages—all optimized for ATS and human reviewers.
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
