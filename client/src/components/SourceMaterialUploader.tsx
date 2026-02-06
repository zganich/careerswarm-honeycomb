import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadResult {
  success: boolean;
  fileName: string;
  id?: number;
  error?: string;
}

interface LinkIngestResult {
  success: boolean;
  title?: string;
  id?: number;
  error?: string;
  suggestion?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  results: UploadResult[];
}

export function SourceMaterialUploader({
  onUploadComplete,
}: {
  onUploadComplete?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link ingestion state
  const [linkUrl, setLinkUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [linkResult, setLinkResult] = useState<LinkIngestResult | null>(null);

  // ============================================================================
  // File Upload Handlers
  // ============================================================================

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Validate file types
    const validFiles = files.filter(file => {
      const isPDF = file.type === "application/pdf";
      const isDOCX =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      return isPDF || isDOCX;
    });

    if (validFiles.length === 0) {
      toast.error("Please upload PDF or DOCX files only");
      return;
    }

    if (validFiles.length !== files.length) {
      toast.warning(
        `${files.length - validFiles.length} file(s) skipped (only PDF/DOCX allowed)`
      );
    }

    // Upload files
    setIsUploading(true);
    setUploadResults([]);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch("/api/ingest/file", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data: UploadResponse = await response.json();
      setUploadResults(data.results);

      // Show success/failure toasts
      const successCount = data.results.filter(r => r.success).length;
      const failureCount = data.results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`);
      }

      if (failureCount > 0) {
        toast.error(`Failed to upload ${failureCount} file(s)`);
      }

      // Call callback if provided
      if (onUploadComplete && successCount > 0) {
        onUploadComplete();
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("[Upload] Error:", error);
      toast.error(error.message || "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================================================
  // Link Ingestion Handlers
  // ============================================================================

  const handleLinkIngest = async () => {
    if (!linkUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsIngesting(true);
    setLinkResult(null);

    try {
      const response = await fetch("/api/ingest/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: linkUrl }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to ingest link");
      }

      const data: LinkIngestResult = await response.json();
      setLinkResult(data);

      if (data.success) {
        toast.success(`Successfully ingested: ${data.title}`);
        setLinkUrl("");

        // Call callback if provided
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        toast.error(data.error || "Failed to ingest link");
      }
    } catch (error: any) {
      console.error("[Link Ingest] Error:", error);
      toast.error(error.message || "Failed to ingest link");
      setLinkResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <Tabs defaultValue="files" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="files">Upload Files</TabsTrigger>
        <TabsTrigger value="link">Add Link</TabsTrigger>
      </TabsList>

      {/* Tab 1: File Upload */}
      <TabsContent value="files" className="space-y-4">
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-border hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {isUploading ? "Parsing files..." : "Upload Resume Files"}
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              {isUploading
                ? "Extracting text from your files..."
                : "Drag and drop PDF or DOCX files here, or click to browse"}
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={e => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Select Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />

            <p className="text-xs text-muted-foreground mt-4">
              Maximum file size: 10MB per file
            </p>
          </div>
        </Card>

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Upload Results</h4>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    result.success
                      ? "bg-green-50 dark:bg-green-950/20"
                      : "bg-red-50 dark:bg-red-950/20"
                  )}
                >
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.fileName}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {result.error}
                      </p>
                    )}
                    {result.success && result.id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ingested successfully (ID: {result.id})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </TabsContent>

      {/* Tab 2: Link Ingestion */}
      <TabsContent value="link" className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Import from URL</h3>
              <p className="text-sm text-muted-foreground">
                Enter the URL of your personal website, portfolio, or online
                resume
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/my-portfolio"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                disabled={isIngesting}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleLinkIngest();
                  }
                }}
              />
              <Button
                onClick={handleLinkIngest}
                disabled={isIngesting || !linkUrl.trim()}
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: Some websites (like LinkedIn) may block automated scraping.
              In those cases, use "Save as PDF" and upload the file instead.
            </p>
          </div>
        </Card>

        {/* Link Ingest Result */}
        {linkResult && (
          <Card
            className={cn(
              "p-4",
              linkResult.success ? "border-green-500" : "border-red-500"
            )}
          >
            <div className="flex items-start gap-3">
              {linkResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                {linkResult.success ? (
                  <>
                    <h4 className="font-semibold text-green-600 dark:text-green-400">
                      Successfully Imported
                    </h4>
                    <p className="text-sm mt-1">{linkResult.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {linkResult.id}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-red-600 dark:text-red-400">
                      Import Failed
                    </h4>
                    <p className="text-sm mt-1">{linkResult.error}</p>
                    {linkResult.suggestion && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        💡 {linkResult.suggestion}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
