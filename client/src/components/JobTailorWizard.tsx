import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Target, Building2 } from "lucide-react";
import { toast } from "sonner";

interface JobTailorWizardProps {
  onSuccess: (result: any) => void;
}

export function JobTailorWizard({ onSuccess }: JobTailorWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const tailorMutation = trpc.resumes.tailor.useMutation({
    onSuccess: (data) => {
      toast.success(`Resume generated! Match score: ${data.matchScore}%`);
      onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    // Validation
    if (!jobDescription.trim() || jobDescription.length < 50) {
      toast.error("Please enter a job description (at least 50 characters)");
      return;
    }
    if (!jobTitle.trim() || jobTitle.length < 2) {
      toast.error("Please enter a job title");
      return;
    }
    if (!company.trim() || company.length < 2) {
      toast.error("Please enter a company name");
      return;
    }

    // Show loading messages
    setStep(2);
    const messages = [
      "Analyzing ATS keywords...",
      "Matching achievements to requirements...",
      "Calculating profile fit score...",
      "Identifying skill gaps...",
      "Generating professional summary...",
      "Selecting best evidence...",
    ];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2000);

    tailorMutation.mutate(
      {
        jobDescription,
        jobTitle,
        company,
      },
      {
        onSettled: () => {
          clearInterval(interval);
        },
      }
    );
  };

  if (step === 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            Generating Tailored Resume
          </CardTitle>
          <CardDescription>
            AI is analyzing your profile and the job requirements...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 text-amber-500 animate-spin mb-6" />
            <p className="text-lg font-medium text-center animate-pulse">
              {loadingMessage}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take 10-20 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-500" />
          Create Tailored Resume
        </CardTitle>
        <CardDescription>
          Paste a job description and we'll select your best matching achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Job Title *
          </Label>
          <Input
            id="jobTitle"
            placeholder="e.g., Senior Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company *
          </Label>
          <Input
            id="company"
            placeholder="e.g., Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <Label htmlFor="jobDescription">
            Job Description *
            <span className="text-xs text-muted-foreground ml-2">
              ({jobDescription.length} characters, min 50)
            </span>
          </Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the full job description here...

Include:
- Required skills and qualifications
- Responsibilities
- Nice-to-have skills
- Company culture/values

The more detail you provide, the better the AI can match your achievements!"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            className="font-mono text-sm resize-none"
            maxLength={10000}
          />
          <p className="text-xs text-muted-foreground">
            Tip: Copy the entire job posting for best results
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={
            tailorMutation.isPending ||
            !jobDescription.trim() ||
            !jobTitle.trim() ||
            !company.trim()
          }
          className="w-full"
          size="lg"
        >
          {tailorMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Tailored Resume
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
