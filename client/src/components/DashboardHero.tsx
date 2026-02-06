import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Upload, CheckCircle, Plus } from "lucide-react";
import { ManualAchievementEntry } from "./ManualAchievementEntry";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DashboardHeroProps {
  swarmScore: number; // 0-100
  profileStatus: "empty" | "imported" | "verified";
  onAction: () => void;
  onManualEntry?: (
    achievements: Array<{
      situation: string;
      task: string;
      action: string;
      result: string;
    }>
  ) => void;
}

const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword", // .doc (legacy Word); must match accept attribute
  "text/plain",
];

export function DashboardHero({
  swarmScore,
  profileStatus,
  onAction,
  onManualEntry,
}: DashboardHeroProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressEventSourceRef = useRef<EventSource | null>(null);
  const uploadMutation = trpc.onboarding.uploadResume.useMutation();
  const processResumesMutation = trpc.onboarding.processResumes.useMutation();
  const parseResumesMutation = trpc.onboarding.parseResumes.useMutation();

  // Animate score counting up
  useEffect(() => {
    let start = 0;
    const end = swarmScore;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [swarmScore]);

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 71) return "text-emerald-400";
    if (score >= 31) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreStroke = (score: number) => {
    if (score >= 71) return "#34d399"; // emerald-400
    if (score >= 31) return "#fbbf24"; // amber-400
    return "#f87171"; // red-400
  };

  // Dynamic button configuration
  const getButtonConfig = () => {
    switch (profileStatus) {
      case "empty":
        return {
          text: "Import LinkedIn PDF",
          icon: Upload,
          gradient: "from-cyan-500 to-blue-600",
        };
      case "imported":
        return {
          text: "Verify Employment",
          icon: CheckCircle,
          gradient: "from-amber-500 to-orange-600",
        };
      case "verified":
        return {
          text: "Add Project Evidence",
          icon: Plus,
          gradient: "from-emerald-500 to-green-600",
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 16MB",
      });
      return;
    }

    // Validate file type (PDF, DOCX, TXT - same as onboarding upload)
    if (!RESUME_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
      });
      return;
    }

    setIsProcessing(true);
    setProgressMessage(null);
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      await uploadMutation.mutateAsync({
        filename: file.name,
        fileData,
        mimeType: file.type,
      });

      const progressUrl = `${window.location.origin}/api/resume-progress`;
      const es = new EventSource(progressUrl);
      progressEventSourceRef.current = es;
      es.onmessage = ev => {
        try {
          const data = JSON.parse(ev.data) as {
            phase?: string;
            message?: string;
            current?: number;
            total?: number;
          };
          if (data.message) setProgressMessage(data.message);
          else if (
            data.phase === "processing" &&
            data.total != null &&
            data.current != null
          )
            setProgressMessage(`Processing ${data.current}/${data.total}...`);
          else if (data.phase === "parsing")
            setProgressMessage("Building your profile...");
          else if (data.phase === "done" || data.phase === "error") es.close();
        } catch (_) {}
      };
      es.onerror = () => es.close();

      await processResumesMutation.mutateAsync();
      await parseResumesMutation.mutateAsync();

      onAction();
      toast.success("Resume imported successfully!");
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "Import failed";
      toast.error("Unable to parse file", {
        description: message.includes("No processed resumes")
          ? "Upload succeeded but extraction failed. Try again or add achievements manually."
          : "Let's add your achievements manually instead",
      });
      setShowManualEntry(true);
    } finally {
      progressEventSourceRef.current?.close();
      progressEventSourceRef.current = null;
      setProgressMessage(null);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Import LinkedIn PDF with fallback
  const handleAction = async () => {
    if (profileStatus === "empty") {
      // Trigger file input
      fileInputRef.current?.click();
    } else {
      onAction();
    }
  };

  const handleManualComplete = (
    achievements: Array<{
      situation: string;
      task: string;
      action: string;
      result: string;
    }>
  ) => {
    setShowManualEntry(false);
    if (onManualEntry) {
      onManualEntry(achievements);
    }
    toast.success(
      `Added ${achievements.length} achievement${achievements.length > 1 ? "s" : ""}!`
    );
  };

  // SVG circle parameters
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative py-16 px-6">
      {/* Swarm Score Gauge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-12"
      >
        <h2 className="text-slate-400 text-lg mb-6 tracking-wide uppercase">
          Swarm Score
        </h2>

        {/* Circular Gauge */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="#1e293b"
              strokeWidth="20"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="128"
              cy="128"
              r={radius}
              stroke={getScoreStroke(swarmScore)}
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{
                filter: "drop-shadow(0 0 10px currentColor)",
              }}
            />
          </svg>

          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className={`text-7xl font-black ${getScoreColor(swarmScore)}`}
              style={{ fontFamily: "Cabinet Grotesk, sans-serif" }}
            >
              {displayScore}
            </motion.div>
            <div className="text-slate-500 text-sm mt-2">out of 100</div>
          </div>
        </div>

        {/* Score description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-slate-400 mt-6 text-center max-w-md"
        >
          {swarmScore >= 71 &&
            "Excellent! Your career evidence is strong and comprehensive."}
          {swarmScore >= 31 &&
            swarmScore < 71 &&
            "Good progress. Keep adding evidence to strengthen your profile."}
          {swarmScore < 31 &&
            "Let's build your career evidence library. Start by importing your resume."}
        </motion.p>
      </motion.div>

      {/* The One Big Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleAction}
          disabled={isProcessing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative px-12 py-6 rounded-2xl
            bg-gradient-to-r ${buttonConfig.gradient}
            text-white font-bold text-2xl
            shadow-2xl
            flex items-center gap-4
            overflow-hidden
            group
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{ fontFamily: "Cabinet Grotesk, sans-serif" }}
        >
          {/* Animated background glow */}
          <motion.div
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-white/20 blur-xl"
          />

          {/* Button content */}
          <ButtonIcon className="h-8 w-8 relative z-10" />
          <span className="relative z-10">
            {isProcessing
              ? progressMessage || "Processing..."
              : buttonConfig.text}
          </span>

          {/* Hover effect */}
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        </motion.button>
      </motion.div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Hidden file input for mobile-optimized upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload resume file"
      />

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualAchievementEntry
          onComplete={handleManualComplete}
          onCancel={() => setShowManualEntry(false)}
        />
      )}
    </div>
  );
}
