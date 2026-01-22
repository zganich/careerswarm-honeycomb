import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Bookmark, BookmarkCheck, MapPin, Building2, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Jobs() {
  // Using sonner toast
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "score">("recent");

  const utils = trpc.useUtils();
  const savedJobsQuery = trpc.jobs.list.useQuery();
  const searchMutation = trpc.jobs.search.useMutation();
  const qualifyMutation = trpc.jobs.qualify.useMutation();

  const handleSearch = async () => {
    if (!keywords.trim()) {
      toast.error("Please enter job keywords to search");
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchMutation.mutateAsync({
        keywords: keywords.trim(),
        location: location.trim() || undefined,
        platforms: ["linkedin", "indeed", "glassdoor"],
      });

      toast.success(`Found ${result.count} jobs across all platforms`);

      // Fetch the newly saved jobs
      const jobs = await utils.jobs.list.fetch();
      setSearchResults(jobs.slice(0, result.count));
    } catch (error: any) {
      toast.error(error.message || "Failed to search jobs");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveAndQualify = async (job: any) => {
    try {
      // Job is already saved from search, just qualify it
      await qualifyMutation.mutateAsync({ jobId: job.id });
      
      toast.success("AI analysis complete - check your fit score!");

      // Refresh the job list to show updated qualification data
      utils.jobs.list.invalidate();
      
      // Update search results
      const updatedJobs = await utils.jobs.list.fetch();
      setSearchResults(updatedJobs.filter(j => 
        searchResults.some(sr => sr.id === j.id)
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze job fit");
    }
  };

  const displayJobs = sortBy === "score"
    ? [...searchResults].sort((a, b) => (b.qualificationScore || 0) - (a.qualificationScore || 0))
    : searchResults;

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return "Not analyzed";
    if (score >= 80) return "Excellent fit";
    if (score >= 60) return "Good fit";
    return "Needs work";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Job Search</h1>
        <p className="text-muted-foreground">
          Search across LinkedIn, Indeed, and Glassdoor. Save jobs to get AI-powered fit analysis.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Jobs</CardTitle>
          <CardDescription>
            Enter keywords and location to find relevant opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <Input
                placeholder="Job title, skills, or keywords..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
              <Input
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full md:w-auto">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {searchResults.length} results
          </p>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("score")}
            >
              Best Match
            </Button>
          </div>
        </div>
      )}

      {/* Job Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayJobs.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3" />
                    {job.company}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSaveAndQualify(job)}
                  disabled={qualifyMutation.isPending}
                >
                  {job.qualificationScore ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              {/* Location & Salary */}
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {job.salary}
                  </div>
                )}
              </div>

              {/* Description Preview */}
              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
              )}

              {/* Qualification Score */}
              {job.qualificationScore !== null && (
                <div className="mt-auto pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Match Score</span>
                    <Badge className={`${getScoreColor(job.qualificationScore)} text-white`}>
                      {job.qualificationScore}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getScoreLabel(job.qualificationScore)}
                  </p>

                  {/* Skills Gap */}
                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Skills to develop:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.missingSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.missingSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {job.matchedSkills && job.matchedSkills.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Your strengths:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.matchedSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.matchedSkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.matchedSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analyze Button */}
              {job.qualificationScore === null && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveAndQualify(job)}
                  disabled={qualifyMutation.isPending}
                  className="mt-auto"
                >
                  {qualifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analyze Fit
                    </>
                  )}
                </Button>
              )}

              {/* Source Badge */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Source: {job.source}</span>
                {job.postedDate && (
                  <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
            <p className="text-muted-foreground mb-4">
              Enter keywords above to start searching across multiple job boards
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
