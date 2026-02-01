// /src/components/ui/psych/TransformationHero.tsx

import { motion } from "framer-motion";
import { 
  FileText, 
  FileSpreadsheet, 
  Linkedin, 
  Github, 
  Briefcase,
  Mail,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  FolderOpen
} from "lucide-react";
import { PSYCH_COPY } from "./CopyConstants";

export function TransformationHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 pt-20 md:pt-24 pb-8 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Headline */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-slate-900 mb-3 mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {PSYCH_COPY.hero.headline}
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-slate-600 mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {PSYCH_COPY.hero.subheadline}
        </motion.p>

        {/* Split-Screen Transformation Visual */}
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          
          {/* LEFT: Chaos (Before) */}
          <div className="relative w-64 h-72 bg-slate-100 rounded-2xl p-5 border-2 border-dashed border-slate-300">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
              Your Scattered Career Data
            </h3>
            
            {/* Messy File Stack */}
            <div className="relative h-48">
              <motion.div 
                className="absolute top-0 left-4 w-40 bg-white rounded-lg shadow-md p-3 border border-slate-200"
                style={{ rotate: -5 }}
                animate={{ rotate: [-5, -3, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileText className="w-5 h-5 text-red-500 inline mr-2" />
                <span className="text-xs text-slate-600">resume_2022.pdf</span>
              </motion.div>
              
              <motion.div 
                className="absolute top-12 left-8 w-44 bg-white rounded-lg shadow-md p-3 border border-slate-200"
                style={{ rotate: 3 }}
                animate={{ rotate: [3, 5, 3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <FileSpreadsheet className="w-5 h-5 text-blue-500 inline mr-2" />
                <span className="text-xs text-slate-600">cover_letter_v3.docx</span>
              </motion.div>
              
              <motion.div 
                className="absolute top-24 left-2 w-36 bg-white rounded-lg shadow-md p-3 border border-slate-200"
                style={{ rotate: -2 }}
                animate={{ rotate: [-2, 1, -2] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <FileText className="w-5 h-5 text-gray-500 inline mr-2" />
                <span className="text-xs text-slate-600">achievements.txt</span>
              </motion.div>
            </div>
            
            {/* Scattered Platform Icons */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 opacity-60 rotate-[-3deg]">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 opacity-60 rotate-[2deg]">
                <Github className="w-5 h-5 text-gray-800" />
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 opacity-60 rotate-[-1deg]">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 opacity-60 rotate-[4deg]">
                <FolderOpen className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Transformation Arrow */}
          <motion.div 
            className="flex flex-col items-center"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-12 h-12 text-orange-500" />
            <span className="text-xs text-orange-500 font-semibold mt-1">60 seconds</span>
          </motion.div>

          {/* RIGHT: Order (After) */}
          <div className="relative w-64 h-72 bg-green-50 rounded-2xl p-5 border-2 border-green-200">
            <h3 className="text-sm font-semibold text-green-700 mb-4 uppercase tracking-wide">
              AI-Generated Application Package
            </h3>
            
            {/* Pristine Document Stack */}
            <div className="space-y-3">
              <motion.div 
                className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-green-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">Tailored_Resume.pdf</p>
                  <p className="text-xs text-green-600">Optimized for ATS</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-green-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">Cover_Letter.pdf</p>
                  <p className="text-xs text-green-600">Personalized hook</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-green-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">LinkedIn_Message.txt</p>
                  <p className="text-xs text-green-600">Ready to send</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            </div>
            
            {/* Time Saved Badge */}
            <motion.div 
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Saves 4+ hours
            </motion.div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button className="group relative px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            <span className="relative z-10">{PSYCH_COPY.hero.ctaPrimary}</span>
            {/* Heartbeat Animation */}
            <span className="absolute inset-0 rounded-xl bg-orange-400 animate-ping opacity-20" />
          </button>
          
          <button className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 text-lg font-medium rounded-xl border-2 border-slate-200 transition-all duration-300">
            {PSYCH_COPY.hero.ctaSecondary}
          </button>
        </motion.div>

        {/* Trust Signal */}
        <motion.p 
          className="mt-4 text-slate-600 text-lg font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          ⏱️ {PSYCH_COPY.trust.timeSaved}
        </motion.p>
      </div>
    </section>
  );
}
