import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type ApplicationStatus = "scouted" | "saved" | "draft" | "submitted" | "viewed" | "screening" | "interview_scheduled" | "interviewed" | "offer" | "rejected" | "withdrawn";

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: "scouted", label: "Scouted", color: "bg-purple-100" },
  { id: "saved", label: "Saved", color: "bg-slate-100" },
  { id: "submitted", label: "Applied", color: "bg-blue-100" },
  { id: "interview_scheduled", label: "Interviewing", color: "bg-amber-100" },
  { id: "offer", label: "Offer", color: "bg-green-100" },
  { id: "rejected", label: "Rejected", color: "bg-red-100" },
];

interface ApplicationBoardProps {
  onCardClick: (applicationId: number) => void;
}

export function ApplicationBoard({ onCardClick }: ApplicationBoardProps) {
  const utils = trpc.useUtils();
  
  const { data: applications, isLoading } = trpc.applications.list.useQuery();
  const updateStatusMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      utils.applications.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const applicationId = Number(active.id);
    const newStatus = over.id as ApplicationStatus;
    
    updateStatusMutation.mutate({
      applicationId,
      status: newStatus,
    });
  };

  const getMatchScoreColor = (score?: number | null) => {
    if (!score) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications?.filter(app => app.status === status) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(column => {
          const columnApplications = getApplicationsByStatus(column.id);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className={`${column.color} rounded-t-lg p-3`}>
                <h3 className="font-semibold text-sm flex items-center justify-between">
                  {column.label}
                  <Badge variant="secondary" className="ml-2">
                    {columnApplications.length}
                  </Badge>
                </h3>
              </div>
              
              <div className="bg-slate-50 rounded-b-lg p-3 min-h-[400px] space-y-3">
                {columnApplications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No applications
                  </p>
                ) : (
                  columnApplications.map(app => (
                    <Card
                      key={app.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white"
                      onClick={() => onCardClick(app.id)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("application/json", JSON.stringify({ id: app.id }));
                      }}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {/* @ts-ignore - job relation might not be loaded */}
                          {app.job?.title || "Untitled Position"}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {/* @ts-ignore */}
                          {app.job?.companyName || "Unknown Company"}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* @ts-ignore */}
                            {app.job?.qualificationScore != null && (
                              <>
                                <Badge 
                                  className={`${getMatchScoreColor(app.job.qualificationScore)} text-white text-xs`}
                                >
                                  {/* @ts-ignore */}
                                  {app.job.qualificationScore}% Match
                                </Badge>
                                {/* @ts-ignore - Hot Match indicator for >80% scores */}
                                {app.job.qualificationScore > 80 && (
                                  <span className="text-lg" title="Hot Match!">
                                    🔥
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          
                          <span className="text-xs text-muted-foreground">
                            {new Date(app.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
