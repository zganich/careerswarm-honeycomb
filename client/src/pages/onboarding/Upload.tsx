import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Upload as UploadIcon, X, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = trpc.onboarding.uploadResume.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file =>
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "text/plain"
    );

    if (droppedFiles.length === 0) {
      toast.error("Please upload PDF, DOCX, or TXT files only");
      return;
    }

    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file =>
          file.type === "application/pdf" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "text/plain"
      );
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one resume");
      return;
    }

    setIsUploading(true);

    try {
      // Upload each file
      for (const file of files) {
        const reader = new FileReader();
        const fileData = await new Promise<string>(resolve => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        await uploadMutation.mutateAsync({
          filename: file.name,
          fileData: fileData.split(",")[1], // Remove data:mime;base64, prefix
          mimeType: file.type,
        });
      }

      toast.success(`${files.length} resume(s) uploaded successfully`);
      setLocation("/onboarding/extraction");
    } catch (error) {
      toast.error("Failed to upload resumes. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="text-sm text-muted-foreground">Step 2 of 5</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: "40%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-3xl py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Upload Your Resumes
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload one or more resumes. We'll extract all your career data
            automatically.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Drag and drop your resumes here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: PDF, DOCX, TXT • Max 10MB per file
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">
                Uploaded Files ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/onboarding")}
            disabled={isUploading}
          >
            ← Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading
              ? "Uploading..."
              : `Continue with ${files.length} File(s) →`}
          </Button>
        </div>
      </div>
    </div>
  );
}
