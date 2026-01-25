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

export function PageHeader({ title, description, backTo, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b mb-6">
      <div className="py-4">
        {backTo && (
          <Link href={backTo.path}>
            <Button variant="ghost" size="sm" className="mb-3 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backTo.label}
            </Button>
          </Link>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
