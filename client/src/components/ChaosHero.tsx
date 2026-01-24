import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface ChaosHeroProps {
  onStart: () => void;
}

/**
 * ChaosHero - Initial "chaos" state with floating hexagon cloud
 * 
 * Features:
 * - Floating hexagon particles with random positions
 * - Gentle drift animation
 * - Premium white aesthetic with subtle shadows
 * - Call-to-action button to start onboarding
 */
export function ChaosHero({ onStart }: ChaosHeroProps) {
  // Generate random positions for 30 floating hexagons
  const hexagons = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // 0-100% viewport width
    y: Math.random() * 100, // 0-100% viewport height
    size: 20 + Math.random() * 30, // 20-50px
    delay: Math.random() * 2, // 0-2s animation delay
    duration: 8 + Math.random() * 4, // 8-12s animation duration
  }));

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Floating hexagon cloud */}
      <div className="absolute inset-0 pointer-events-none">
        {hexagons.map((hex) => (
          <motion.div
            key={hex.id}
            className="absolute"
            style={{
              left: `${hex.x}%`,
              top: `${hex.y}%`,
              width: hex.size,
              height: hex.size,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1],
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: hex.duration,
              delay: hex.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              <polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Hero content */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-8"
          animate={{
            boxShadow: [
              "0 10px 30px rgba(0,0,0,0.1)",
              "0 15px 40px rgba(251,146,60,0.2)",
              "0 10px 30px rgba(0,0,0,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-10 h-10 text-amber-500" />
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Turn Career{" "}
          <span className="text-gray-400">Chaos</span>
          <br />
          into{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-amber-500">Structured Success</span>
            <motion.span
              className="absolute inset-0 bg-amber-100 -z-10 rounded-lg"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              style={{ transformOrigin: "left" }}
            />
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          The job market is messy. Your resume shouldn't be.{" "}
          <span className="font-semibold text-gray-900">Let the Swarm</span>{" "}
          assemble your fragmented experience into a perfect fit.
        </p>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="bg-amber-500 hover:bg-amber-600 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: "0 10px 30px rgba(251,146,60,0.3)",
            }}
          >
            Start Application
          </Button>
        </motion.div>

        {/* Subtle hint text */}
        <motion.p
          className="mt-8 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          3 quick questions • 2 minutes
        </motion.p>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
