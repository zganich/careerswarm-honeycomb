import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, Lock, Shield, Clock, TrendingUp, Target, Sparkles, Award, AlertCircle, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CareerArchaeologyOnboardingProps {
  onComplete: () => void;
}

type OnboardingStep = 1 | 2 | 3 | 4;

interface UploadedFile {
  id: string;
  name: string;
  status: "uploading" | "processing" | "complete";
  progress: number;
  findings?: {
    roles: number;
    skills: number;
    duplicates?: number;
  };
}

interface ProfileStats {
  careerYears: string;
  uniqueRoles: number;
  verifiedSkills: number;
  achievements: number;
  careerThemes: number;
  confidenceScore: number;
}

export function CareerArchaeologyOnboarding({ onComplete }: CareerArchaeologyOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeSaved, setTimeSaved] = useState(0);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    careerYears: "2015-2024 (9 years)",
    uniqueRoles: 12,
    verifiedSkills: 28,
    achievements: 65,
    careerThemes: 3,
    confidenceScore: 96,
  });
  const [jobDescription, setJobDescription] = useState("");
  const [matchPercentage, setMatchPercentage] = useState(0);

  const stepProgress = {
    1: 25,
    2: 50,
    3: 75,
    4: 100,
  };

  // Simulate time saved counter
  useEffect(() => {
    if (currentStep === 2 && isProcessing) {
      const interval = setInterval(() => {
        setTimeSaved(prev => Math.min(prev + 0.1, 2));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentStep, isProcessing]);

  // Simulate match percentage count-up
  useEffect(() => {
    if (currentStep === 4 && jobDescription.length > 50) {
      let current = 0;
      const target = 94;
      const interval = setInterval(() => {
        current += 2;
        if (current >= target) {
          setMatchPercentage(target);
          clearInterval(interval);
        } else {
          setMatchPercentage(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentStep, jobDescription]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === "application/pdf" || 
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "text/plain"
    );

    if (validFiles.length > 0) {
      handleFilesUpload(validFiles);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFilesUpload(files);
    }
  }, []);

  const handleFilesUpload = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      status: "uploading" as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    for (const uploadedFile of newFiles) {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id ? { ...f, progress } : f
          )
        );
      }

      // Mark as complete with findings
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "complete",
                progress: 100,
                findings: {
                  roles: Math.floor(Math.random() * 5) + 3,
                  skills: Math.floor(Math.random() * 10) + 5,
                  duplicates: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : undefined,
                },
              }
            : f
        )
      );
    }
  };

  const handleContinueToMerging = () => {
    setCurrentStep(2);
    setIsProcessing(true);
    
    // Simulate merging process
    setTimeout(() => {
      setIsProcessing(false);
    }, 5000);
  };

  const handleContinueToReveal = () => {
    setCurrentStep(3);
  };

  const handleContinueToApplication = () => {
    setCurrentStep(4);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-orange-500"
          initial={{ width: "0%" }}
          animate={{ width: `${stepProgress[currentStep]}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
          }}
        />
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200 z-40">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of 4 • {stepProgress[currentStep]}% Complete
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 pt-32 pb-16">
        <AnimatePresence mode="wait">
          {/* STEP 1: BULK UPLOAD INTERFACE */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  🗂️ Upload Every Resume Version You've Ever Created
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We'll merge 15+ resume versions into one powerful Master Profile that tells your complete career story.
                </p>
              </div>

              {/* Upload Zone */}
              <Card
                className={`relative border-2 transition-all duration-150 ${
                  isDragging
                    ? "border-blue-600 bg-blue-100 border-solid scale-[1.01]"
                    : uploadedFiles.length > 0
                    ? "border-gray-300 bg-gray-50 border-dashed"
                    : "border-gray-300 bg-gray-50 border-dashed hover:border-blue-600 hover:bg-blue-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  animation: isDragging ? "var(--animate-gentle-pulse)" : undefined,
                }}
              >
                <div className="p-12 text-center">
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                      📤 DRAG & DROP YOUR RESUME FILES
                    </h3>
                    
                    {/* File Icons Grid (8x2 = 16 files) */}
                    <div className="grid grid-cols-8 gap-3 max-w-md mx-auto mb-6 opacity-30">
                      {[...Array(16)].map((_, i) => (
                        <FileText key={i} className="h-8 w-8 text-gray-400 mx-auto" />
                      ))}
                    </div>

                    <p className="text-gray-600 mb-6 italic text-lg">
                      Your career fragments<br />
                      become one complete story
                    </p>

                    <div className="flex items-center justify-center gap-4 my-6">
                      <div className="h-px bg-gray-300 flex-1 max-w-32" />
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="h-px bg-gray-300 flex-1 max-w-32" />
                    </div>
                  </div>

                  <label htmlFor="file-upload">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      asChild
                    >
                      <span>Browse Files on Your Computer</span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <p className="text-sm text-gray-500 mt-4">
                    Supports: PDF, DOCX, TXT • Max 20 files
                  </p>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>🔒 Your files are processed securely and never stored in their original form</span>
                    </div>
                    
                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-700 font-medium">
                      <Users className="h-4 w-4" />
                      <span>Join 12,847 professionals who've unified their career evidence</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Uploaded Files ({uploadedFiles.length})
                    </h3>
                    {uploadedFiles.every(f => f.status === "complete") && (
                      <span className="text-green-600 font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        All files uploaded successfully
                      </span>
                    )}
                  </div>
                  
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {file.status === "complete" ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </motion.div>
                          ) : (
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                          )}
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{file.progress}%</span>
                      </div>
                      {file.status === "complete" && file.findings && (
                        <div className="text-sm text-gray-600 ml-8">
                          • Found {file.findings.roles} roles • {file.findings.skills} skills identified
                          {file.findings.duplicates && file.findings.duplicates > 0 && ` • Merged ${file.findings.duplicates} duplicates`}
                        </div>
                      )}
                      {file.status !== "complete" && (
                        <div className="ml-8 mt-2">
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-blue-600"
                              initial={{ width: "0%" }}
                              animate={{ width: `${file.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {uploadedFiles.every(f => f.status === "complete") && (
                    <Button
                      size="lg"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6"
                      onClick={handleContinueToMerging}
                    >
                      Continue to Merging →
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: LIVE MERGING PROGRESS */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headline */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  🔍 Building Your Complete Career Timeline
                </h1>
              </div>

              {/* Progress Display Card */}
              <Card className="border-2 border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">REAL-TIME MERGING PROGRESS</h2>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-orange-500"
                        initial={{ width: "0%" }}
                        animate={{ width: isProcessing ? "65%" : "100%" }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        style={{
                          boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Time Saved Counter */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-900">
                      <Clock className="h-6 w-6" />
                      <span>⏱️ Time Saved: Already saved you {timeSaved.toFixed(1)} hours</span>
                    </div>
                  </div>

                  {/* File Processing Cards */}
                  <div className="space-y-4">
                    {uploadedFiles.slice(0, 3).map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.5 }}
                        className="border-2 border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{file.name}</h3>
                            {file.findings && (
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>• Found {file.findings.roles} roles</div>
                                <div>• {file.findings.skills} skills identified</div>
                                {file.findings.duplicates && file.findings.duplicates > 0 && (
                                  <div>• Merged {file.findings.duplicates} duplicate{file.findings.duplicates > 1 ? 's' : ''}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isProcessing && uploadedFiles.length > 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50"
                      >
                        <div className="flex items-start gap-3">
                          <Loader2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 animate-spin" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{uploadedFiles[3]?.name || "Processing..."}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>• Processing leadership data</div>
                              <div>• 65% complete</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* What We're Finding */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      🎯 What We're Finding:
                    </h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>• Career progression patterns</div>
                      <div>• Skill evolution over time</div>
                      <div>• Recurring achievement themes</div>
                    </div>
                  </div>

                  {/* Progress Footer */}
                  <div className="text-center text-sm text-gray-600 pt-4">
                    {isProcessing ? (
                      <span>Progress: 65% • 2 minutes remaining</span>
                    ) : (
                      <span className="text-green-600 font-semibold">✓ Merging complete!</span>
                    )}
                  </div>

                  {!isProcessing && (
                    <Button
                      size="lg"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handleContinueToReveal}
                    >
                      See Your Complete Career Timeline →
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: MASTER PROFILE REVEAL */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headline */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  🎯 Your Complete Career Evidence: Ready for Action
                </h1>
              </div>

              {/* Profile Summary Card */}
              <Card className="border-2 border-gray-200 p-8 mb-8">
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">MASTER PROFILE SUMMARY</h2>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3 text-gray-800"
                    >
                      <span className="text-2xl">📅</span>
                      <div>
                        <div className="text-sm text-gray-600">Career Timeline</div>
                        <div className="font-semibold">{profileStats.careerYears}</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 text-gray-800"
                    >
                      <span className="text-2xl">👔</span>
                      <div>
                        <div className="text-sm text-gray-600">Unique Roles</div>
                        <div className="font-semibold">{profileStats.uniqueRoles} Roles</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 text-gray-800"
                    >
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <div className="text-sm text-gray-600">Verified Skills</div>
                        <div className="font-semibold">{profileStats.verifiedSkills} Skills</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 text-gray-800"
                    >
                      <span className="text-2xl">🏆</span>
                      <div>
                        <div className="text-sm text-gray-600">Proven Achievements</div>
                        <div className="font-semibold">{profileStats.achievements} Achievements</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3 text-gray-800"
                    >
                      <span className="text-2xl">📈</span>
                      <div>
                        <div className="text-sm text-gray-600">Major Career Themes</div>
                        <div className="font-semibold">{profileStats.careerThemes} Themes</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Confidence Score */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center"
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div className="text-4xl font-bold text-green-900">
                        🔍 Confidence Score: {profileStats.confidenceScore}%
                      </div>
                    </div>
                    <div className="text-sm text-green-800">
                      (Based on cross-referenced evidence)
                    </div>
                  </motion.div>

                  {/* Competitive Advantage */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                  >
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      🎖️ Competitive Advantage:
                    </h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <div>• More evidence than 92% of candidates</div>
                      <div>• Clear career progression</div>
                      <div>• Quantifiable impact across roles</div>
                    </div>
                  </motion.div>
                </div>
              </Card>

              {/* Gap Analysis */}
              <Card className="border-2 border-orange-200 bg-orange-50 p-6 mb-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-3">
                      ⚠️ QUICK IMPROVEMENTS (+0.7 points):
                    </h3>
                    <div className="text-sm text-orange-800 space-y-2 mb-4">
                      <div>• Add team sizes to 3 leadership roles</div>
                      <div>• Include budget responsibility for 2 projects</div>
                      <div>• Specify metrics for 5 achievements</div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-100">
                        Auto-Fill These Gaps
                      </Button>
                      <Button variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-100">
                        Review Profile Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleContinueToApplication}
              >
                Discover Your Competitive Edge →
              </Button>
            </motion.div>
          )}

          {/* STEP 4: TARGETED APPLICATION READY */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headline */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  🚀 Your Career Evidence is Ready for Any Opportunity
                </h1>
              </div>

              {/* Job Targeting Interface */}
              <Card className="border-2 border-gray-200 p-8 mb-8">
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">FIND YOUR PERFECT MATCH</h2>
                  </div>

                  <div className="text-center text-gray-700 mb-4">
                    Paste a job description below, or:
                  </div>

                  <div className="flex gap-3 justify-center mb-6">
                    <Button variant="outline" className="border-blue-600 text-blue-700">
                      Search Jobs on LinkedIn
                    </Button>
                    <Button variant="outline" className="border-blue-600 text-blue-700">
                      Browse Our Job Matches
                    </Button>
                  </div>

                  {/* Job Description Input */}
                  <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                    <Textarea
                      placeholder="Paste job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[200px] mb-4 bg-white"
                    />
                    
                    {jobDescription.length > 50 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Example:</strong> Senior Director of Engineering @ TechScale Startup
                        </div>
                        <div className="text-sm text-gray-700 space-y-1 mb-4">
                          <div><strong>Requirements:</strong></div>
                          <div>• 10+ years tech leadership</div>
                          <div>• Team scaling experience</div>
                          <div>• Revenue growth track record</div>
                        </div>

                        {/* Match Percentage */}
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 text-center"
                        >
                          <div className="text-3xl font-bold text-green-900 mb-2">
                            ⚡ YOUR MASTER PROFILE MATCH: {matchPercentage}%
                          </div>
                        </motion.div>

                        {/* Perfect Matches */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            ✅ Perfect Matches:
                          </h3>
                          <div className="text-sm text-green-800 space-y-2">
                            <div>• 12 years leadership experience</div>
                            <div>• Scaled teams from 8 to 25</div>
                            <div>• Drove 40% revenue growth</div>
                          </div>
                        </div>

                        {/* AI Tailoring Strategy */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            🎯 AI Tailoring Strategy:
                          </h3>
                          <div className="text-sm text-blue-800">
                            We'll emphasize your scaling experience and revenue impact
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 border-blue-600 text-blue-700">
                            See Tailored Resume
                          </Button>
                          <Button variant="outline" className="flex-1 border-blue-600 text-blue-700">
                            Generate Cover Letter
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Action Section */}
              {jobDescription.length > 50 && matchPercentage >= 94 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-2 border-orange-200 bg-orange-50 p-6 mb-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-orange-900 mb-4 text-lg">
                        ⏱️ Ready in 45 seconds:
                      </h3>
                      <div className="text-sm text-orange-800 space-y-2 mb-6">
                        <div>1. Review AI-tailored resume</div>
                        <div>2. Generate personalized cover letter</div>
                        <div>3. Email hiring manager directly</div>
                      </div>
                    </div>
                  </Card>

                  <Button
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-6"
                    onClick={() => {
                      // Trigger confetti burst
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#2563EB', '#F97316', '#10B981'],
                      });
                      onComplete();
                    }}
                    style={{
                      animation: "var(--animate-gentle-pulse)",
                    }}
                  >
                    SEND APPLICATION NOW
                  </Button>

                  <div className="text-center mt-6 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>End-to-end encrypted processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <span>Your data never sold or shared</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
