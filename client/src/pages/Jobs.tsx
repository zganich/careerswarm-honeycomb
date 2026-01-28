import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Award,
  Search,
  MapPin,
  DollarSign,
  Building2,
  ExternalLink,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { OpportunityDetailModal } from "@/components/OpportunityDetailModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Jobs() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"matchScore" | "postedDate" | "company">("matchScore");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");

  const { data: opportunities, isLoading, refetch } = trpc.opportunities.list.useQuery({});
  
  // Filter and sort opportunities
  const filteredAndSortedOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    let filtered = [...opportunities];
    
    // Apply filters
    if (filterStage !== "all") {
      filtered = filtered.filter(opp => opp.companyStage === filterStage);
    }
    if (filterLocation !== "all") {
      filtered = filtered.filter(opp => {
        const location = (opp as any).location?.toLowerCase() || "";
        if (filterLocation === "remote") return location.includes("remote");
        if (filterLocation === "hybrid") return location.includes("hybrid");
        if (filterLocation === "onsite") return !location.includes("remote") && !location.includes("hybrid");
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "matchScore") {
        return ((b as any).matchScore || 0) - ((a as any).matchScore || 0);
      } else if (sortBy === "postedDate") {
        return new Date(b.postedDate || b.createdAt).getTime() - new Date(a.postedDate || a.createdAt).getTime();
      } else if (sortBy === "company") {
        return (a.companyName || "").localeCompare(b.companyName || "");
      }
      return 0;
    });
    
    return filtered;
  }, [opportunities, filterStage, filterLocation, sortBy]);
  
  const runScout = trpc.agents.runScout.useMutation({
    onSuccess: (data) => {
      toast.success(`Found ${data.count} new opportunities!`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Scout failed: ${error.message}`);
    },
  });

  const quickApply = trpc.applications.quickApply.useMutation({
    onSuccess: (data) => {
      toast.success(`Application created! Match score: ${data.matchScore}%`);
      setLocation("/applications");
    },
    onError: (error) => {
      toast.error(`Quick Apply failed: ${error.message}`);
    },
  });

  const handleRunScout = () => {
    runScout.mutate({
      searchQuery,
      limit: 15,
    });
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
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={() => setLocation("/applications")}>
              Applications
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">
            AI-powered job discovery matching your Master Profile
          </p>
        </div>

        {/* Scout Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Scout Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Optional: Add specific search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleRunScout}
                disabled={runScout.isPending}
              >
                {runScout.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Run Scout
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Scout will search LinkedIn, job boards, and recently-funded companies matching your preferences
            </p>
          </CardContent>
        </Card>

        {/* Filter and Sort Controls */}
        {opportunities && opportunities.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matchScore">Match Score (High to Low)</SelectItem>
                  <SelectItem value="postedDate">Posted Date (Newest)</SelectItem>
                  <SelectItem value="company">Company Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Company Stage</label>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series_a">Series A</SelectItem>
                  <SelectItem value="series_b">Series B</SelectItem>
                  <SelectItem value="series_c">Series C+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Opportunities List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {filteredAndSortedOpportunities.length} Opportunities Found
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Sorted by {sortBy === "matchScore" ? "match score" : sortBy === "postedDate" ? "posted date" : "company name"}
              </div>
            </div>

            {filteredAndSortedOpportunities.map((opp: any) => (
              <Card key={opp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{opp.roleTitle}</h3>
                          <p className="text-muted-foreground">{opp.companyName}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {opp.locationCity || opp.location}
                        </div>
                        {opp.baseSalaryMin && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${(opp.baseSalaryMin / 1000).toFixed(0)}k - ${(opp.baseSalaryMax / 1000).toFixed(0)}k
                          </div>
                        )}
                        {opp.companyStage && (
                          <Badge variant="secondary">{opp.companyStage}</Badge>
                        )}
                      </div>

                      {opp.jobDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {opp.jobDescription}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {opp.jobUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={opp.jobUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Job
                            </a>
                          </Button>
                        )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOpportunityId(opp.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => quickApply.mutate({ opportunityId: opp.id })}
                    disabled={quickApply.isPending}
                  >
                    {quickApply.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "🚀 Quick Apply"
                    )}
                  </Button>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="ml-4 text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {opp.matchScore || opp.fitScore || 75}
                          </div>
                          <div className="text-xs text-muted-foreground">match</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No opportunities yet</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Run Scout" to discover jobs matching your profile
                </p>
                <Button onClick={handleRunScout} disabled={runScout.isPending}>
                  {runScout.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Run Scout Agent
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunityId={selectedOpportunityId}
        open={selectedOpportunityId !== null}
        onClose={() => setSelectedOpportunityId(null)}
      />
    </div>
  );
}
