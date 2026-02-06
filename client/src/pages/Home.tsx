import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Hexagon,
  ShieldCheck,
  Zap,
  Database,
  Check,
  Upload,
  Sparkles,
  Shield,
} from "lucide-react";
import { useLocation } from "wouter";
import { TransformationHero } from "@/components/ui/psych/TransformationHero";
import { SwarmNarrative } from "@/components/SwarmNarrative";
import { TrustStrip } from "@/components/TrustStrip";

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
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CareerSwarm
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setLocation("/pricing")}
              className="hover:text-orange-600 transition-colors"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => setLocation("/recruiters")}
              className="hover:text-orange-600 transition-colors"
            >
              For Recruiters
            </button>
            <button
              type="button"
              onClick={() => setLocation("/roast")}
              className="hover:text-orange-600 transition-colors"
            >
              Resume Roast
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setLocation("/roast")}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              Get Roasted
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO: TRANSFORMATION (Pillar 4) --- */}
      <TransformationHero
        onCtaPrimary={() => setLocation("/roast")}
        onCtaSecondary={() => setLocation("/login")}
      />

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
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Upload Once, Apply Forever
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Connect your LinkedIn, resume, and work history. We extract and
                structure your achievements into a Master Profile that powers
                unlimited applications.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                AI Finds Your Hidden Strengths
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI analyzes your entire career history, identifying patterns
                and quantified achievements you may have overlooked—like that
                project that saved $500K.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Applications Recruiters Trust
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Every application includes tailored resumes, personalized cover
                letters, and LinkedIn messages—all optimized for ATS and human
                reviewers.
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
