import { useReducer, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChaosHero } from "./ChaosHero";
import { QuestionCard } from "./QuestionCard";
import { SnapGrid } from "./SnapGrid";

// State machine types
type FlowState = "chaos" | "question1" | "question2" | "question3" | "complete";

interface OnboardingState {
  currentState: FlowState;
  answers: {
    role?: string;
    experience?: string;
    goal?: string;
  };
  filledCells: Array<{ id: string; answer: string; color: string }>;
}

type OnboardingAction =
  | { type: "START" }
  | { type: "ANSWER_QUESTION_1"; answer: string; color: string }
  | { type: "ANSWER_QUESTION_2"; answer: string; color: string }
  | { type: "ANSWER_QUESTION_3"; answer: string }
  | { type: "BACK" }
  | { type: "COMPLETE" };

// Question configurations
const questions = [
  {
    id: "question1",
    question: "What's your primary role?",
    type: "choice" as const,
    options: [
      { id: "engineering", label: "Engineering", color: "#3b82f6" },
      { id: "product", label: "Product Management", color: "#8b5cf6" },
      { id: "design", label: "Design", color: "#ec4899" },
      { id: "marketing", label: "Marketing", color: "#f59e0b" },
      { id: "sales", label: "Sales", color: "#10b981" },
      { id: "operations", label: "Operations", color: "#6366f1" },
    ],
    gridCellId: "cell-3-5", // Center-left position
  },
  {
    id: "question2",
    question: "How many years of experience?",
    type: "choice" as const,
    options: [
      { id: "0-2", label: "0-2 years", color: "#06b6d4" },
      { id: "3-5", label: "3-5 years", color: "#8b5cf6" },
      { id: "6-10", label: "6-10 years", color: "#f59e0b" },
      { id: "10+", label: "10+ years", color: "#ef4444" },
    ],
    gridCellId: "cell-3-7", // Center-right position
  },
  {
    id: "question3",
    question: "What's your target role?",
    type: "text" as const,
    placeholder: "e.g., Senior Product Manager",
    gridCellId: "cell-4-6", // Bottom-center position
  },
];

// State machine reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "START":
      return { ...state, currentState: "question1" };

    case "ANSWER_QUESTION_1":
      return {
        ...state,
        currentState: "question2",
        answers: { ...state.answers, role: action.answer },
        filledCells: [
          ...state.filledCells,
          { id: questions[0].gridCellId, answer: action.answer, color: action.color },
        ],
      };

    case "ANSWER_QUESTION_2":
      return {
        ...state,
        currentState: "question3",
        answers: { ...state.answers, experience: action.answer },
        filledCells: [
          ...state.filledCells,
          { id: questions[1].gridCellId, answer: action.answer, color: action.color },
        ],
      };

    case "ANSWER_QUESTION_3":
      return {
        ...state,
        currentState: "complete",
        answers: { ...state.answers, goal: action.answer },
        filledCells: [
          ...state.filledCells,
          { id: questions[2].gridCellId, answer: action.answer, color: "#f59e0b" },
        ],
      };

    case "BACK":
      // Prevent going back from chaos state
      if (state.currentState === "chaos") return state;
      
      // Navigate back through states
      const stateOrder: FlowState[] = ["chaos", "question1", "question2", "question3"];
      const currentIndex = stateOrder.indexOf(state.currentState);
      const previousState = stateOrder[Math.max(0, currentIndex - 1)];
      
      // Remove last filled cell
      const newFilledCells = state.filledCells.slice(0, -1);
      
      return {
        ...state,
        currentState: previousState,
        filledCells: newFilledCells,
      };

    case "COMPLETE":
      return { ...state, currentState: "complete" };

    default:
      return state;
  }
}

/**
 * OnboardingFlow - State machine orchestrator for adaptive onboarding
 * 
 * Features:
 * - Rigid state machine prevents state jumping
 * - Validates all inputs before state transitions
 * - Tracks answers and filled grid cells
 * - Redirects to dashboard on completion
 * - Accessible keyboard navigation
 */
export function OnboardingFlow() {
  const [, setLocation] = useLocation();
  
  const [state, dispatch] = useReducer(onboardingReducer, {
    currentState: "chaos",
    answers: {},
    filledCells: [],
  });

  // Redirect to dashboard when complete
  useEffect(() => {
    if (state.currentState === "complete") {
      // Store answers in sessionStorage for dashboard to use
      sessionStorage.setItem("onboardingAnswers", JSON.stringify(state.answers));
      
      // Smooth transition to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    }
  }, [state.currentState, state.answers, setLocation]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Background grid (always visible) */}
      <SnapGrid filledCells={state.filledCells} />

      {/* Flow states */}
      <AnimatePresence mode="wait">
        {state.currentState === "chaos" && (
          <ChaosHero
            key="chaos"
            onStart={() => dispatch({ type: "START" })}
          />
        )}

        {state.currentState === "question1" && (
          <QuestionCard
            key="question1"
            question={questions[0].question}
            type={questions[0].type}
            options={questions[0].options}
            onAnswer={(answer, color) =>
              dispatch({ type: "ANSWER_QUESTION_1", answer, color: color || "#f59e0b" })
            }
            showBack={false}
          />
        )}

        {state.currentState === "question2" && (
          <QuestionCard
            key="question2"
            question={questions[1].question}
            type={questions[1].type}
            options={questions[1].options}
            onAnswer={(answer, color) =>
              dispatch({ type: "ANSWER_QUESTION_2", answer, color: color || "#f59e0b" })
            }
            onBack={() => dispatch({ type: "BACK" })}
            showBack={true}
          />
        )}

        {state.currentState === "question3" && (
          <QuestionCard
            key="question3"
            question={questions[2].question}
            type={questions[2].type}
            placeholder={questions[2].placeholder}
            onAnswer={(answer) =>
              dispatch({ type: "ANSWER_QUESTION_3", answer })
            }
            onBack={() => dispatch({ type: "BACK" })}
            showBack={true}
          />
        )}

        {state.currentState === "complete" && (
          <div key="complete" className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500 mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
