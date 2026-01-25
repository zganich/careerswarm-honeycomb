import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { ApplicationBoard } from "@/components/ApplicationBoard";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, Target } from "lucide-react";
import { ScoutMissionModal } from "@/components/ScoutMissionModal";

function ApplicationsContent() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [scoutModalOpen, setScoutModalOpen] = useState(false);
  const { data: applications, isLoading } = trpc.applications.list.useQuery();

  const stats = {
    total: applications?.length || 0,
    draft: applications?.filter(app => app.status === "draft").length || 0,
    submitted: applications?.filter(app => app.status === "submitted").length || 0,
    interviewing: applications?.filter(app => app.status === "interview_scheduled" || app.status === "interviewed").length || 0,
    offer: applications?.filter(app => app.status === "offer").length || 0,
    rejected: applications?.filter(app => app.status === "rejected").length || 0,
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50/30 min-h-full">
      <div className="py-8 space-y-6 max-w-[1800px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">The Swarm Board</h1>
            <p className="text-muted-foreground mt-1">
              Track your job applications from saved to offer
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setScoutModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Target className="mr-2 h-4 w-4" />
              Launch Scout Mission
            </Button>
            <Button variant="outline" asChild>
              <a href="/jobs">
                <Plus className="mr-2 h-4 w-4" />
                Add Manually
              </a>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-slate-500">{stats.draft}</div>
            <div className="text-sm text-muted-foreground">Saved</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.submitted}</div>
            <div className="text-sm text-muted-foreground">Applied</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-amber-500">{stats.interviewing}</div>
            <div className="text-sm text-muted-foreground">Interviewing</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.offer}</div>
            <div className="text-sm text-muted-foreground">Offers</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </Card>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <Card className="p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </Card>
        ) : applications && applications.length > 0 ? (
          <Card className="p-6">
            <ApplicationBoard onCardClick={setSelectedApplicationId} />
          </Card>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                No applications yet. Start by finding a job and creating a tailored resume.
              </div>
              <Button asChild>
                <a href="/jobs">
                  <Plus className="mr-2 h-4 w-4" />
                  Find Jobs
                </a>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <ApplicationDetailModal
        applicationId={selectedApplicationId}
        open={selectedApplicationId !== null}
        onClose={() => setSelectedApplicationId(null)}
      />

      {/* Scout Mission Modal */}
      <ScoutMissionModal
        open={scoutModalOpen}
        onOpenChange={setScoutModalOpen}
      />
    </div>
  );
}


export default function Applications() {
  return (
    <DashboardLayout>
      <ApplicationsContent />
    </DashboardLayout>
  );
}
