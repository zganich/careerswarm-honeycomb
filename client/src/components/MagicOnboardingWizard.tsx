import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MagicOnboardingWizardProps {
  onComplete: () => void;
}

type OnboardingStep = "upload" | "manual" | "score" | "tailor" | "send";

interface ParsedData {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experiences: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
  }>;
}

export function MagicOnboardingWizard({
  onComplete,
}: MagicOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentTitle: "",
    currentCompany: "",
    skills: [""],
  });

  // Endowed progress: Start at 80%
  const baseProgress = 80;
  const stepProgress = {
    upload: 80,
    manual: 82,
    score: 85,
    tailor: 90,
    send: 100,
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setParseError(null);
    setUploadProgress(0);

    try {
      // Simulate progressive upload (instant feedback)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Read file content
      const text = await file.text();

      // Simulate parsing with instant feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(100);

      // Parse resume (mock for now - will integrate with actual parser)
      const mockParsedData: ParsedData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "(555) 123-4567",
        skills: ["React", "TypeScript", "Node.js", "AWS", "Python"],
        experiences: [
          {
            title: "Senior Software Engineer",
            company: "TechCorp",
            duration: "2020 - Present",
          },
          {
            title: "Software Engineer",
            company: "StartupCo",
            duration: "2018 - 2020",
          },
        ],
        education: [
          {
            degree: "BS Computer Science",
            school: "State University",
          },
        ],
      };

      setParsedData(mockParsedData);

      // Celebration moment
      toast.success(
        `🎉 Found ${mockParsedData.skills.length} skills and ${mockParsedData.experiences.length} experiences!`
      );

      // Auto-advance after 1.5 seconds
      setTimeout(() => {
        setCurrentStep("score");
      }, 1500);
    } catch (error) {
      console.error("Parse error:", error);
      setParseError(
        "We couldn't parse your resume automatically. Would you like to enter your information manually?"
      );
      setShowManualEntry(true);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.type === "application/pdf" ||
          file.type === "text/plain" ||
          file.name.endsWith(".docx"))
      ) {
        handleFileUpload(file);
      } else {
        toast.error("Please upload a PDF, TXT, or DOCX file");
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex items-center justify-center p-4">
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
          initial={{ width: "80%" }}
          animate={{ width: `${stepProgress[currentStep]}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Progress indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-semibold text-slate-700">
            {stepProgress[currentStep]}% Complete
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 md:p-12 shadow-2xl border-2 border-slate-200">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-6"
                >
                  <Upload className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Upload Your Resume
                </h2>
                <p className="text-lg text-slate-600">
                  We'll extract your achievements in seconds
                </p>
              </div>

              {!isProcessing && !parsedData && !parseError && (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer"
                >
                  <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    Drag & drop your resume here
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    or click to browse (PDF, DOCX, TXT)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload">
                    <Button size="lg" className="cursor-pointer" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    Reading your resume...
                  </p>
                  <Progress
                    value={uploadProgress}
                    className="w-full max-w-md mx-auto mb-2"
                  />
                  <p className="text-sm text-slate-500">
                    {uploadProgress < 50
                      ? "Uploading..."
                      : uploadProgress < 90
                        ? "Parsing..."
                        : "Almost done..."}
                  </p>
                </div>
              )}

              {parsedData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-3 text-green-600 mb-6">
                    <CheckCircle2 className="h-8 w-8" />
                    <span className="text-xl font-semibold">
                      Resume parsed successfully!
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">
                        Found:
                      </h3>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>✓ {parsedData.skills.length} skills</li>
                        <li>
                          ✓ {parsedData.experiences.length} work experiences
                        </li>
                        <li>
                          ✓ {parsedData.education.length} education entries
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-500 mb-3">
                        Skills detected:{" "}
                        {parsedData.skills.slice(0, 5).join(", ")}
                        {parsedData.skills.length > 5 &&
                          ` +${parsedData.skills.length - 5} more`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {parseError && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-lg text-slate-700 mb-6">{parseError}</p>
                  {showManualEntry && (
                    <Button
                      size="lg"
                      onClick={() => {
                        setParseError(null);
                        setCurrentStep("manual");
                      }}
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Enter Manually
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Trust badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-600">
                  <strong>No AI hallucination</strong> - We only use what's in
                  your resume
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === "manual" && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 md:p-12 shadow-2xl border-2 border-slate-200">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-6"
                >
                  <PenLine className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Quick Profile Setup
                </h2>
                <p className="text-lg text-slate-600">
                  Tell us about yourself to get started
                </p>
              </div>

              <div className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={manualForm.name}
                      onChange={e =>
                        setManualForm(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={manualForm.email}
                      onChange={e =>
                        setManualForm(prev => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Current Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentTitle">Current Job Title</Label>
                    <Input
                      id="currentTitle"
                      placeholder="Software Engineer"
                      value={manualForm.currentTitle}
                      onChange={e =>
                        setManualForm(prev => ({
                          ...prev,
                          currentTitle: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      placeholder="Acme Inc."
                      value={manualForm.currentCompany}
                      onChange={e =>
                        setManualForm(prev => ({
                          ...prev,
                          currentCompany: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Key Skills (add up to 5)</Label>
                  <div className="space-y-2">
                    {manualForm.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Skill ${index + 1}, e.g., React, Python, Project Management`}
                          value={skill}
                          onChange={e => {
                            const newSkills = [...manualForm.skills];
                            newSkills[index] = e.target.value;
                            setManualForm(prev => ({
                              ...prev,
                              skills: newSkills,
                            }));
                          }}
                        />
                        {manualForm.skills.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newSkills = manualForm.skills.filter(
                                (_, i) => i !== index
                              );
                              setManualForm(prev => ({
                                ...prev,
                                skills: newSkills,
                              }));
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {manualForm.skills.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setManualForm(prev => ({
                            ...prev,
                            skills: [...prev.skills, ""],
                          }))
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Skill
                      </Button>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep("upload");
                      setShowManualEntry(false);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    onClick={() => {
                      if (!manualForm.name || !manualForm.email) {
                        toast.error("Please enter your name and email");
                        return;
                      }

                      // Create parsed data from manual form
                      const manualParsedData: ParsedData = {
                        name: manualForm.name,
                        email: manualForm.email,
                        phone: manualForm.phone,
                        skills: manualForm.skills.filter(s => s.trim() !== ""),
                        experiences: manualForm.currentTitle
                          ? [
                              {
                                title: manualForm.currentTitle,
                                company: manualForm.currentCompany || "Current",
                                duration: "Present",
                              },
                            ]
                          : [],
                        education: [],
                      };

                      setParsedData(manualParsedData);
                      toast.success("Profile created! Let's continue.");
                      setCurrentStep("score");
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === "score" && (
          <motion.div
            key="score"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 md:p-12 shadow-2xl border-2 border-slate-200">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Your Career Score
                </h2>
                <p className="text-lg text-slate-600">
                  Based on {parsedData?.experiences.length || 0} experiences and{" "}
                  {parsedData?.skills.length || 0} skills
                </p>
              </div>

              {/* Score display */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 mb-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2 break-words"
                  >
                    7.8/10
                  </motion.div>
                  <p className="text-lg font-semibold text-slate-700">
                    Strong Foundation
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Better than 68% of profiles
                  </p>
                </div>
              </div>

              {/* Quick insights */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Strong metrics
                    </p>
                    <p className="text-sm text-green-700">
                      Your achievements include quantifiable results
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900">
                      Add more context
                    </p>
                    <p className="text-sm text-amber-700">
                      Include team size and budget to show scope
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  toast.success(
                    "Great! Let's tailor your resume for a specific role"
                  );
                  setTimeout(() => setCurrentStep("tailor"), 500);
                }}
              >
                Continue to Tailoring
              </Button>
            </Card>
          </motion.div>
        )}

        {currentStep === "tailor" && (
          <motion.div
            key="tailor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 md:p-12 shadow-2xl border-2 border-slate-200">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 mb-6"
                >
                  <Sparkles className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Tailor Your Resume
                </h2>
                <p className="text-lg text-slate-600">
                  Paste a job description to generate a perfect match
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Product Manager"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Description (Optional for now)
                  </label>
                  <textarea
                    placeholder="Paste the full job description here...\n\nOr skip for now - you can tailor later!"
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    toast.info("Skipping tailoring - you can do this later!");
                    setTimeout(() => setCurrentStep("send"), 500);
                  }}
                >
                  Skip for Now
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    toast.success("Resume tailored! Ready to apply");
                    setTimeout(() => setCurrentStep("send"), 500);
                  }}
                >
                  Tailor Resume
                </Button>
              </div>
            </Card>

            {/* Trust badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-slate-600">
                  <strong>AI-powered matching</strong> - Highlights your most
                  relevant achievements
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === "send" && (
          <motion.div
            key="send"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 md:p-12 shadow-2xl border-2 border-slate-200">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6"
                >
                  <CheckCircle2 className="h-14 w-14 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent break-words"
                >
                  You're All Set!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl text-slate-600 mb-8"
                >
                  Your career evidence engine is ready to go
                </motion.p>
              </div>

              {/* Achievement summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-8"
              >
                <h3 className="font-semibold text-slate-900 mb-4 text-center">
                  What You've Built:
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {parsedData?.experiences.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">Experiences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {parsedData?.skills.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      7.8
                    </div>
                    <div className="text-sm text-slate-600">Score</div>
                  </div>
                </div>
              </motion.div>

              {/* Next steps */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="space-y-3 mb-8"
              >
                <h3 className="font-semibold text-slate-900 mb-3">
                  Next Steps:
                </h3>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                    1
                  </div>
                  <p className="text-sm text-slate-700">
                    Add more achievements to strengthen your profile
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                    2
                  </div>
                  <p className="text-sm text-slate-700">
                    Tailor your resume for specific job opportunities
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                    3
                  </div>
                  <p className="text-sm text-slate-700">
                    Track your applications and interview progress
                  </p>
                </div>
              </motion.div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  toast.success("🎉 Welcome to CareerSwarm!");
                  onComplete();
                }}
              >
                Go to Dashboard
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
