import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Job title taxonomy for auto-suggest
const JOB_TAXONOMY = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Executive',
  'Business Analyst',
  'Project Manager',
  'DevOps Engineer',
  'Content Writer',
  'Financial Analyst',
  'HR Manager',
  'Operations Manager',
  'Customer Success Manager',
  'Account Executive',
];

interface OnboardingSentenceProps {
  onComplete: (data: { jobTitle: string; skill: string }) => void;
}

export function OnboardingSentence({ onComplete }: OnboardingSentenceProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [skill, setSkill] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isConstructing, setIsConstructing] = useState(false);

  // Auto-suggest job titles as user types
  useEffect(() => {
    if (jobTitle.length > 1) {
      const matches = JOB_TAXONOMY.filter(job =>
        job.toLowerCase().includes(jobTitle.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [jobTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitle.trim() && skill.trim()) {
      setIsConstructing(true);
      // Show "Constructing Career Graph..." animation for 2 seconds
      setTimeout(() => {
        onComplete({ jobTitle: jobTitle.trim(), skill: skill.trim() });
      }, 2000);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setJobTitle(suggestion);
    setShowSuggestions(false);
  };

  if (isConstructing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-900 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block mb-6"
          >
            <Loader2 className="h-16 w-16 text-cyan-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-cyan-400"
            style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
          >
            Constructing Career Graph...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 mt-4"
          >
            Analyzing your professional identity
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* The Mad Libs Sentence */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight"
            style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
          >
            I am a{' '}
            <div className="inline-block relative">
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job Title"
                className="inline-block bg-slate-800/50 border-b-4 border-cyan-400 text-cyan-400 px-4 py-2 outline-none focus:border-amber-400 transition-colors min-w-[200px] md:min-w-[300px]"
                style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
                autoFocus
              />
              
              {/* Auto-suggest dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-cyan-400/30 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors border-b border-slate-700 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>{' '}
            looking to prove my{' '}
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Skill/Value"
              className="inline-block bg-slate-800/50 border-b-4 border-amber-400 text-amber-400 px-4 py-2 outline-none focus:border-cyan-400 transition-colors min-w-[200px] md:min-w-[300px]"
              style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
            />
            .
          </h1>

          {/* Submit hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-slate-400 text-lg mb-4">
              Press <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-400">Enter</kbd> to continue
            </p>
            <button
              type="submit"
              disabled={!jobTitle.trim() || !skill.trim()}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-amber-500 text-slate-900 font-bold rounded-lg hover:from-cyan-400 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
            >
              Build My Career Graph
            </button>
          </motion.div>
        </form>

        {/* Decorative elements */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute bottom-20 left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
