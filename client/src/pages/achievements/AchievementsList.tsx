import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Award, Plus, Search, Trash2, Edit, TrendingUp, Loader2 } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
function AchievementsListContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: achievements, isLoading } = trpc.achievements.list.useQuery();
  const deleteMutation = trpc.achievements.delete.useMutation();
  const utils = trpc.useUtils();

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      utils.achievements.list.invalidate();
      toast.success("Achievement deleted");
    } catch (error) {
      toast.error("Failed to delete achievement");
    }
  };

  const filteredAchievements = achievements?.filter(a => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.situation?.toLowerCase().includes(query) ||
      a.task?.toLowerCase().includes(query) ||
      a.action?.toLowerCase().includes(query) ||
      a.result?.toLowerCase().includes(query) ||
      a.company?.toLowerCase().includes(query) ||
      a.roleTitle?.toLowerCase().includes(query)
    );
  });

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-muted";
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <Award className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Careerswarm</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Achievements</h1>
            <p className="text-muted-foreground">Your career evidence library</p>
          </div>
          <Link href="/achievements/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Achievements Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAchievements && filteredAchievements.length > 0 ? (
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {achievement.company && (
                          <Badge variant="outline">{achievement.company}</Badge>
                        )}
                        {achievement.roleTitle && (
                          <Badge variant="secondary">{achievement.roleTitle}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-1">
                        {achievement.result || achievement.action || "Untitled Achievement"}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {achievement.situation || achievement.task}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor(achievement.impactMeterScore)}`} />
                          <span className="text-sm font-medium">{achievement.impactMeterScore || 0}</span>
                        </div>
                      </div>
                      <Link href={`/achievements/${achievement.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(achievement.id!)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {achievement.xyzAccomplishment && (
                  <CardContent>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-1">XYZ Format:</p>
                      <p className="text-sm">{achievement.xyzAccomplishment}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your career evidence library
              </p>
              <Link href="/achievements/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Achievement
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function AchievementsList() {
  return (
    <DashboardLayout>
      <AchievementsListContent />
    </DashboardLayout>
  );
}
