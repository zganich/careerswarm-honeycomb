import { CheckCircle, Circle } from "lucide-react";

interface StatusPipelineProps {
  currentStatus: string;
}

export default function StatusPipeline({ currentStatus }: StatusPipelineProps) {
  const stages = [
    { key: "draft", label: "Draft" },
    { key: "applied", label: "Applied" },
    { key: "response_received", label: "Response" },
    { key: "phone_screen", label: "Phone Screen" },
    { key: "interview", label: "Interview" },
    { key: "final_interview", label: "Final" },
    { key: "offer", label: "Offer" },
  ];

  const getCurrentStageIndex = () => {
    const index = stages.findIndex((stage) => stage.key === currentStatus);
    return index !== -1 ? index : 0;
  };

  const currentIndex = getCurrentStageIndex();

  // Special statuses that don't fit in the pipeline
  const isSpecialStatus = ["accepted", "rejected", "withdrawn", "ghosted"].includes(currentStatus);

  if (isSpecialStatus) {
    return (
      <div className="p-4 rounded-lg border bg-muted/50">
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Application Status</div>
          <div className="text-lg font-semibold capitalize">
            {currentStatus.replace("_", " ")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="text-sm font-medium mb-4 text-center">Application Progress</div>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Circle indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index <= currentIndex
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {index < currentIndex ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              {/* Label */}
              <div
                className={`text-xs mt-2 text-center ${
                  index <= currentIndex ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </div>
            </div>

            {/* Connector line */}
            {index < stages.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  index < currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
