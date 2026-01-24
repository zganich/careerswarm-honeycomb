import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Link as LinkIcon, Loader2, Trash2, Sparkles, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function SourceMaterialList() {
  const utils = trpc.useUtils();
  const { data: materials, isLoading } = trpc.sourceMaterials.list.useQuery();
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const deleteMutation = trpc.sourceMaterials.delete.useMutation({
    onSuccess: () => {
      utils.sourceMaterials.list.invalidate();
      toast.success("Source material deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
  
  const synthesizeMutation = trpc.sourceMaterials.synthesize.useMutation({
    onMutate: ({ id }) => {
      setProcessingId(id);
    },
    onSuccess: (data) => {
      utils.sourceMaterials.list.invalidate();
      utils.achievements.list.invalidate();
      setProcessingId(null);
      toast.success(data.message || `Extracted ${data.count} achievements!`);
    },
    onError: (error, variables) => {
      setProcessingId(null);
      toast.error(`Extraction failed: ${error.message}`);
    },
  });
  
  const handleDelete = (id: number, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };
  
  const handleExtract = (id: number) => {
    synthesizeMutation.mutate({ id });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!materials || materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No source materials uploaded yet.</p>
        <p className="text-sm mt-2">Upload a resume or add a portfolio link to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {materials.map((material) => {
        const isProcessing = processingId === material.id;
        const metadata = material.metadata as any;
        const wordCount = metadata?.wordCount || 0;
        
        return (
          <Card key={material.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1">
                  {material.type === "FILE" ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <LinkIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{material.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{wordCount.toLocaleString()} words</span>
                        <span>•</span>
                        <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {material.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                      {material.status === "PROCESSED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          Processed
                        </span>
                      )}
                      {material.status === "FAILED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {material.status === "FAILED" && material.errorMessage && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {material.errorMessage}
                    </p>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {material.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleExtract(material.id)}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Extract Achievements
                          </>
                        )}
                      </Button>
                    )}
                    
                    {material.status === "FAILED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtract(material.id)}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Retry Extraction
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(material.id, material.title)}
                      disabled={deleteMutation.isPending}
                      className="gap-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
