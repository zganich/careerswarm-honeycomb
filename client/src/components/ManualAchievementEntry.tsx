import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Achievement {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface ManualAchievementEntryProps {
  onComplete: (achievements: Achievement[]) => void;
  onCancel: () => void;
}

export function ManualAchievementEntry({
  onComplete,
  onCancel,
}: ManualAchievementEntryProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { situation: "", task: "", action: "", result: "" },
  ]);

  const addAchievement = () => {
    if (achievements.length < 3) {
      setAchievements([
        ...achievements,
        { situation: "", task: "", action: "", result: "" },
      ]);
    }
  };

  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== index));
    }
  };

  const updateAchievement = (
    index: number,
    field: keyof Achievement,
    value: string
  ) => {
    const updated = [...achievements];
    updated[index][field] = value;
    setAchievements(updated);
  };

  const isValid = achievements.every(
    a => a.situation && a.task && a.action && a.result
  );

  const handleSubmit = () => {
    if (isValid) {
      onComplete(achievements);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Add Your Achievements
            </h2>
            <p className="text-slate-400">
              Tell us about 1-3 career accomplishments using the STAR method
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Achievement Forms */}
        <div className="space-y-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative"
            >
              {/* Remove Button */}
              {achievements.length > 1 && (
                <button
                  onClick={() => removeAchievement(index)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <h3 className="text-xl font-semibold text-white mb-4">
                Achievement {index + 1}
              </h3>

              <div className="space-y-4">
                {/* Situation */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Situation{" "}
                    <span className="text-slate-500">
                      (What was the context?)
                    </span>
                  </label>
                  <Input
                    value={achievement.situation}
                    onChange={e =>
                      updateAchievement(index, "situation", e.target.value)
                    }
                    placeholder="e.g., Led product launch for new mobile app"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Task */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Task{" "}
                    <span className="text-slate-500">
                      (What was your goal?)
                    </span>
                  </label>
                  <Input
                    value={achievement.task}
                    onChange={e =>
                      updateAchievement(index, "task", e.target.value)
                    }
                    placeholder="e.g., Increase user engagement by 30%"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Action */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Action{" "}
                    <span className="text-slate-500">(What did you do?)</span>
                  </label>
                  <Textarea
                    value={achievement.action}
                    onChange={e =>
                      updateAchievement(index, "action", e.target.value)
                    }
                    placeholder="e.g., Designed and implemented gamification features, conducted A/B testing, collaborated with engineering team"
                    rows={3}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Result */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Result{" "}
                    <span className="text-slate-500">
                      (What was the outcome?)
                    </span>
                  </label>
                  <Textarea
                    value={achievement.result}
                    onChange={e =>
                      updateAchievement(index, "result", e.target.value)
                    }
                    placeholder="e.g., Achieved 42% increase in daily active users, reduced churn by 18%, featured in TechCrunch"
                    rows={3}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Achievement Button */}
        {achievements.length < 3 && (
          <Button
            onClick={addAchievement}
            variant="outline"
            className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Achievement
          </Button>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Achievements
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-sm text-slate-500 text-center mt-4">
          {achievements.length}/3 achievements added
        </p>
      </motion.div>
    </motion.div>
  );
}
