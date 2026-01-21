import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Award, Briefcase, Plus, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { Link, Redirect } from "wouter";
import { toast } from "sonner";

export default function PastJobs() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    startDate: "",
    endDate: "",
    jobDescriptionText: "",
  });

  const { data: pastJobs, refetch } = trpc.pastEmployerJobs.list.useQuery();
  const createMutation = trpc.pastEmployerJobs.create.useMutation({
    onSuccess: () => {
      toast.success("Past job added successfully!");
      refetch();
      setIsDialogOpen(false);
      setFormData({
        jobTitle: "",
        companyName: "",
        startDate: "",
        endDate: "",
        jobDescriptionText: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add job: ${error.message}`);
    },
  });

  const deleteMutation = trpc.pastEmployerJobs.delete.useMutation({
    onSuccess: () => {
      toast.success("Job deleted");
      refetch();
    },
  });

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
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
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/skills-gap">
              <Button variant="ghost">Skills Gap</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Past Employer Jobs</h1>
            <p className="text-muted-foreground">
              Add your historical job descriptions to identify skills gaps
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Past Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Past Job</DialogTitle>
                <DialogDescription>
                  Paste the job description from a role you've held. We'll extract skills to help identify gaps.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Google"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="month"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="month"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="jobDescriptionText">Job Description *</Label>
                  <Textarea
                    id="jobDescriptionText"
                    value={formData.jobDescriptionText}
                    onChange={(e) => setFormData({ ...formData, jobDescriptionText: e.target.value })}
                    placeholder="Paste the full job description here..."
                    rows={10}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include responsibilities, requirements, and qualifications
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Job"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!pastJobs || pastJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Past Jobs Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your previous job descriptions to see which skills need achievement evidence
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pastJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {job.jobTitle}
                      </CardTitle>
                      {job.companyName && (
                        <CardDescription className="mt-1">{job.companyName}</CardDescription>
                      )}
                      {(job.startDate || job.endDate) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Calendar className="h-4 w-4" />
                          {job.startDate && new Date(job.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                          {job.startDate && job.endDate && " - "}
                          {job.endDate && new Date(job.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: job.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {job.extractedSkills && job.extractedSkills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Extracted Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.extractedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {job.extractedResponsibilities && job.extractedResponsibilities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Responsibilities</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {job.extractedResponsibilities.slice(0, 5).map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
