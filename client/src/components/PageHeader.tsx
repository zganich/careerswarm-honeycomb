import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: {
    label: string;
    path: string;
  };
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backTo,
  actions,
}: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b mb-6 -mx-4 px-4">
      <div className="py-4">
        {backTo && (
          <Link href={backTo.path}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 -ml-2 h-10 touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{backTo.label}</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
