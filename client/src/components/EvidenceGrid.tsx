import { motion } from 'framer-motion';
import { FileText, Award, Users, Briefcase, Star, TrendingUp } from 'lucide-react';

interface EvidenceCard {
  id: string;
  type: 'resume' | 'reference' | 'award' | 'project' | 'skill' | 'achievement';
  title: string;
  subtitle: string;
  score?: number;
  date?: string;
}

interface EvidenceGridProps {
  cards: EvidenceCard[];
  onCardClick?: (card: EvidenceCard) => void;
}

const iconMap = {
  resume: FileText,
  reference: Users,
  award: Award,
  project: Briefcase,
  skill: Star,
  achievement: TrendingUp,
};

const colorMap = {
  resume: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  reference: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  award: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  project: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  skill: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  achievement: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
};

const iconColorMap = {
  resume: 'text-cyan-400',
  reference: 'text-purple-400',
  award: 'text-amber-400',
  project: 'text-emerald-400',
  skill: 'text-yellow-400',
  achievement: 'text-indigo-400',
};

export function EvidenceGrid({ cards, onCardClick }: EvidenceGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-slate-400"
        >
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No evidence yet. Start building your career trophy case!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-slate-200 mb-8"
        style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
      >
        Your Career Evidence
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = iconMap[card.type];
          const colorClass = colorMap[card.type];
          const iconColor = iconColorMap[card.type];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onCardClick?.(card)}
              className={`
                relative p-6 rounded-2xl
                bg-gradient-to-br ${colorClass}
                backdrop-blur-xl
                border
                cursor-pointer
                group
                overflow-hidden
              `}
            >
              {/* Glassmorphism effect overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

              {/* Card content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4">
                  <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                  {card.title}
                </h3>

                {/* Subtitle */}
                <p className="text-slate-400 text-sm mb-4">
                  {card.subtitle}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {card.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${iconColor}`}>
                        {card.score}
                      </div>
                      <div className="text-slate-500 text-xs">/ 100</div>
                    </div>
                  )}
                  {card.date && (
                    <div className="text-slate-500 text-xs">
                      {card.date}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover glow effect */}
              <motion.div
                className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${iconColor.replace('text-', 'bg-')}`}
                style={{ filter: 'blur(40px)' }}
              />

              {/* Animated border glow */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, transparent 0%, ${iconColor.replace('text-', 'rgba(').replace('-400', ', 0.2)')} 50%, transparent 100%)`,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
