import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Validation schemas
const textInputSchema = z.string().min(2, "Please enter at least 2 characters").max(50, "Maximum 50 characters");
const choiceSchema = z.string().min(1, "Please select an option");

interface QuestionOption {
  id: string;
  label: string;
  color: string;
}

interface QuestionCardProps {
  question: string;
  type: "choice" | "text";
  options?: QuestionOption[];
  placeholder?: string;
  onAnswer: (answer: string, color?: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

/**
 * QuestionCard - Validated input component with animations and error handling
 * 
 * Features:
 * - Zero-trust validation with Zod schemas
 * - Shake animation on validation errors
 * - Inline error messages
 * - Flying hexagon animation on selection
 * - Anti-bombing layouts (maxLength, truncate)
 * - Accessible keyboard navigation
 */
export function QuestionCard({
  question,
  type,
  options = [],
  placeholder = "Type your answer...",
  onAnswer,
  onBack,
  showBack = false,
}: QuestionCardProps) {
  const [textValue, setTextValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Validate and submit text input
  const handleTextSubmit = () => {
    const result = textInputSchema.safeParse(textValue);
    
    if (!result.success) {
      setError(result.error.issues[0].message);
      triggerShake();
      return;
    }

    setError(null);
    onAnswer(textValue);
  };

  // Validate and submit choice
  const handleChoiceSelect = (option: QuestionOption) => {
    const result = choiceSchema.safeParse(option.id);
    
    if (!result.success) {
      setError("Please select an option");
      triggerShake();
      return;
    }

    setError(null);
    onAnswer(option.label, option.color);
  };

  // Trigger shake animation
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.5 },
          x: { duration: 0.5 },
        }}
      >
        {/* Card container with neumorphic styling */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          {/* Question text */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            {question}
          </h2>

          {/* Text input */}
          {type === "text" && (
            <div className="space-y-4">
              <Input
                type="text"
                value={textValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // Anti-bombing: enforce maxLength
                  if (value.length <= 50) {
                    setTextValue(value);
                    setError(null);
                  }
                }}
                placeholder={placeholder}
                maxLength={50}
                className="text-lg p-6 rounded-xl border-2 border-gray-200 focus:border-amber-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTextSubmit();
                  }
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "input-error" : undefined}
              />

              {/* Character counter */}
              <p className="text-sm text-gray-500 text-right">
                {textValue.length} / 50 characters
              </p>

              {/* Submit button */}
              <Button
                onClick={handleTextSubmit}
                disabled={textValue.length === 0}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Choice options */}
          {type === "choice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleChoiceSelect(option)}
                  className="group relative p-6 rounded-xl border-2 border-gray-200 hover:border-amber-500 transition-all duration-300 text-left overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: "white",
                  }}
                >
                  {/* Hexagon icon */}
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 100 100">
                      <polygon
                        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                        fill={option.color}
                        stroke={option.color}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  {/* Option label with truncate */}
                  <span className="text-xl font-semibold text-gray-900 block truncate pr-12">
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                id="input-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button */}
          {showBack && onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="mt-6 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
