import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";

/**
 * StickyCtaBar - Floating CTA that appears after scrolling 400px
 * 
 * Features:
 * - Shows after user scrolls past hero section
 * - Slide-in-up animation
 * - Glassmorphism effect
 * - Drives conversion without being intrusive
 */

export function StickyCtaBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4"
        >
          <div className="flex items-center gap-4 px-6 py-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 hover:shadow-3xl transition-all">
            <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="font-semibold text-slate-800 whitespace-nowrap text-sm md:text-base">
              Ready to activate your 7 AI agents?
            </p>
            <a
              href={getLoginUrl()}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap text-sm"
            >
              Start Free Analysis
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
