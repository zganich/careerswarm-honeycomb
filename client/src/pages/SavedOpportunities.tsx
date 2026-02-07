import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Trash2,
  Loader2,
  BookmarkCheck,
  TrendingUp,
} from "lucide-react";
import { OpportunityDetailModal } from "@/components/OpportunityDetailModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useUpgradeModal } from "@/components/UpgradeModal";

export default function SavedOpportunities() {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<
    number | null
  >(null);
  const [companyStageFilter, setCompanyStageFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_saved");

  // Upgrade modal for application limits
  const { handleApplicationError, UpgradeModalComponent } = useUpgradeModal();

  const {
    data: savedOpportunities,
    isLoading,
    refetch,
  } = trpc.opportunities.getSaved.useQuery();

  const unsaveMutation = trpc.opportunities.unsave.useMutation({
    onSuccess: () => {
      toast.success("Opportunity removed from saved");
      refetch();
    },
    onError: error => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });

  const quickApply = trpc.applications.quickApply.useMutation({
    onSuccess: () => {
      toast.success(
        "Application created! Check Applications page for details."
      );
      refetch();
    },
    onError: error => {
      // Check if this is an application limit error
      if (!handleApplicationError(error)) {
        toast.error(`Failed to apply: ${error.message}`);
      }
    },
  });

  // Filter and sort opportunities
  const filteredOpportunities = savedOpportunities
    ?.filter(opp => {
      if (
        companyStageFilter !== "all" &&
        opp.companyStage !== companyStageFilter
      ) {
        return false;
      }
      if (locationFilter !== "all") {
        const location = opp.locationCity || opp.locationType || "";
        if (
          locationFilter === "remote" &&
          !location.toLowerCase().includes("remote")
        ) {
          return false;
        }
        if (
          locationFilter !== "remote" &&
          !location.toLowerCase().includes(locationFilter.toLowerCase())
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match_score") {
        return (b.strategicFitScore || 0) - (a.strategicFitScore || 0);
      }
      if (sortBy === "company_name") {
        return (a.companyName || "").localeCompare(b.companyName || "");
      }
      // Default: date_saved (newest first)
      return (
        new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime()
      );
    });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookmarkCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Saved Opportunities</h1>
        </div>
        <p className="text-muted-foreground">
          Jobs you've bookmarked for later review
        </p>
      </div>

      {/* Filters and Sort */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Company Stage
              </label>
              <Select
                value={companyStageFilter}
                onValueChange={setCompanyStageFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series_a">Series A</SelectItem>
                  <SelectItem value="series_b">Series B</SelectItem>
                  <SelectItem value="series_c">Series C</SelectItem>
                  <SelectItem value="series_d_plus">Series D+</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="san francisco">San Francisco</SelectItem>
                  <SelectItem value="new york">New York</SelectItem>
                  <SelectItem value="austin">Austin</SelectItem>
                  <SelectItem value="boston">Boston</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_saved">
                    Date Saved (Newest)
                  </SelectItem>
                  <SelectItem value="match_score">
                    Match Score (Highest)
                  </SelectItem>
                  <SelectItem value="company_name">
                    Company Name (A-Z)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredOpportunities?.length || 0} saved{" "}
        {filteredOpportunities?.length === 1 ? "opportunity" : "opportunities"}
      </div>

      {/* Saved Opportunities Grid */}
      {!filteredOpportunities || filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookmarkCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              No saved opportunities yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Bookmark jobs from the Jobs page to save them for later
            </p>
            <Button asChild>
              <a href="/jobs">Browse Jobs</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOpportunities.map(opp => {
            return (
              <Card key={opp.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {opp.companyName}
                        </CardTitle>
                        {opp.strategicFitScore && (
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {opp.strategicFitScore}% Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg font-medium text-muted-foreground mb-3">
                        {opp.roleTitle}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {(opp.locationCity || opp.locationType) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opp.locationCity || opp.locationType}
                          </div>
                        )}
                        {opp.oteMin && opp.oteMax && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />$
                            {(opp.oteMin / 1000).toFixed(0)}-$
                            {(opp.oteMax / 1000).toFixed(0)}K OTE
                          </div>
                        )}
                        {opp.companyStage && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {opp.companyStage
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Saved{" "}
                        {opp.savedAt
                          ? formatDistanceToNow(new Date(opp.savedAt), {
                              addSuffix: true,
                            })
                          : "recently"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          opp.id && quickApply.mutate({ opportunityId: opp.id })
                        }
                        disabled={quickApply.isPending}
                      >
                        {quickApply.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          "1-Click Apply"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          opp.id && setSelectedOpportunityId(opp.id)
                        }
                      >
                        View Details
                      </Button>
                      {opp.jobUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={opp.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Job Page
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          opp.id &&
                          unsaveMutation.mutate({ opportunityId: opp.id })
                        }
                        disabled={unsaveMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {opp.jobDescription && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {opp.jobDescription}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {selectedOpportunityId && (
        <OpportunityDetailModal
          opportunityId={selectedOpportunityId}
          open={true}
          onClose={() => setSelectedOpportunityId(null)}
        />
      )}

      {/* Upgrade Modal for application limits */}
      {UpgradeModalComponent}
    </div>
  );
}
