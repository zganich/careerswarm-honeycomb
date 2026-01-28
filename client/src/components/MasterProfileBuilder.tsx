import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, CheckCircle2, Loader2, Shield, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface MasterProfileBuilderProps {
  onComplete: () => void;
}

type BuilderStep = "upload" | "merging" | "reveal" | "apply";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "complete" | "error";
  progress: number;
  findings?: {
    roles: number;
    skills: number;
    duplicates: number;
  };
}

export function MasterProfileBuilder({ onComplete }: MasterProfileBuilderProps) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const stepProgress = {
    upload: 25,
    merging: 50,
    reveal: 75,
    apply: 100,
  };

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
    setIsProcessing(true);

    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
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

      // Mark as complete
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
                  duplicates: Math.floor(Math.random() * 3),
                },
              }
            : f
        )
      );
    }

    setIsProcessing(false);
  };

  const handleContinueToMerging = () => {
    setCurrentStep("merging");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-slate-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-orange-500"
          initial={{ width: "0%" }}
          animate={{ width: `${stepProgress[currentStep]}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200 z-40">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">
            Step {currentStep === "upload" ? "1" : currentStep === "merging" ? "2" : currentStep === "reveal" ? "3" : "4"} of 4 • {stepProgress[currentStep]}% Complete
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 pt-32 pb-16">
        <AnimatePresence mode="wait">
          {currentStep === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  🗂️ Upload Every Resume Version You've Ever Created
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  We'll merge 15+ resume versions into one powerful Master Profile that tells your complete career story.
                </p>
              </div>

              {/* Upload Zone */}
              <Card
                className={`relative border-2 transition-all duration-150 ${
                  isDragging
                    ? "border-blue-600 bg-blue-50 border-solid scale-[1.01]"
                    : "border-slate-300 bg-slate-50 border-dashed hover:border-blue-600 hover:bg-blue-50/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-12 text-center">
                  <div className="mb-6">
                    <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                      📤 DRAG & DROP YOUR RESUME FILES
                    </h3>
                    <div className="flex items-center justify-center gap-4 my-6">
                      <div className="h-px bg-slate-300 flex-1 max-w-32" />
                      <span className="text-slate-500 text-sm">or</span>
                      <div className="h-px bg-slate-300 flex-1 max-w-32" />
                    </div>
                  </div>

                  {/* File Icons Grid */}
                  <div className="grid grid-cols-8 gap-2 max-w-md mx-auto mb-6 opacity-40">
                    {[...Array(16)].map((_, i) => (
                      <FileText key={i} className="h-8 w-8 text-slate-400" />
                    ))}
                  </div>

                  <p className="text-slate-600 mb-6 italic">
                    Your career fragments become one complete story
                  </p>

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

                  <p className="text-sm text-slate-500 mt-4">
                    Supports: PDF, DOCX, TXT • Max 20 files
                  </p>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Your files are processed securely</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>Never stored in original form</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {file.status === "complete" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                          )}
                          <span className="font-medium text-slate-900">{file.name}</span>
                        </div>
                        <span className="text-sm text-slate-500">{file.progress}%</span>
                      </div>
                      {file.status === "complete" && file.findings && (
                        <div className="text-sm text-slate-600 ml-8">
                          • Found {file.findings.roles} roles • {file.findings.skills} skills identified
                          {file.findings.duplicates > 0 && ` • Merged ${file.findings.duplicates} duplicates`}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {!isProcessing && uploadedFiles.every(f => f.status === "complete") && (
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
        </AnimatePresence>
      </div>
    </div>
  );
}
