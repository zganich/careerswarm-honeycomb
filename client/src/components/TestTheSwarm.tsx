import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

/**
 * TestTheSwarm - Interactive mini-tool that proves value in 3 seconds
 * 
 * Features:
 * - Sleek input field for resume bullet points
 * - Instant "Roast" or "Improved Version" with typewriter effect
 * - Proves AI value immediately without signup
 */
export function TestTheSwarm() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses: Record<string, string> = {
    default: "Led 8-person engineering team to deliver 3 major features 2 weeks ahead of schedule, increasing user engagement by 34% (12K → 16K DAU)",
    "managed team": "Led 8-person engineering team to deliver 3 major features 2 weeks ahead of schedule, increasing user engagement by 34% (12K → 16K DAU)",
    "improved performance": "Optimized database queries and caching layer, reducing API response time by 47% (2.1s → 1.1s) and saving $12K/month in infrastructure costs",
    "worked on": "Resolved 156 customer support tickets with 98% satisfaction rating (4.9/5), reducing average response time from 4 hours to 45 minutes",
    "led initiative": "Designed and implemented automation system that eliminated 12 hours/week of manual work, saving team $48K annually in operational costs",
  };

  const getResponse = (text: string): string => {
    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(mockResponses)) {
      if (lowerText.includes(key)) {
        return value;
      }
    }
    return mockResponses.default;
  };

  const typeWriter = (text: string) => {
    setIsTyping(true);
    setOutput("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setOutput((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const response = getResponse(input);
    typeWriter(response);
  };

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Label */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Test the Swarm
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a resume bullet point here..."
              className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all"
          >
            {isTyping ? "Processing..." : "Transform It"}
          </Button>
        </form>

        {/* Output */}
        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 bg-emerald-50/50 border border-emerald-200/50 rounded-xl"
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Transformed
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {output}
              {isTyping && <span className="inline-block w-1 h-4 bg-orange-500 ml-1 animate-pulse" />}
            </p>
          </motion.div>
        )}

        {/* Hint */}
        {!output && (
          <motion.p
            className="mt-3 text-xs text-slate-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Try: "Managed team projects" or "Improved system performance"
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
