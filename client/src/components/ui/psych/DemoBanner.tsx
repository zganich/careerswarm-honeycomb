// /src/components/ui/psych/DemoBanner.tsx

import { AlertTriangle, ExternalLink } from "lucide-react";

interface DemoBannerProps {
  onPasteRealJob?: () => void;
  className?: string;
}

export function DemoBanner({ onPasteRealJob, className = "" }: DemoBannerProps) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium">
            DEMO MODE: Using simulated data for testing
          </span>
        </div>
        
        {onPasteRealJob && (
          <button 
            onClick={onPasteRealJob}
            className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2"
          >
            <ExternalLink className="w-4 h-4" />
            Paste a Real Job Description
          </button>
        )}
      </div>
    </div>
  );
}
