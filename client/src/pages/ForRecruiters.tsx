import { useState } from "react";
import { useLocation } from "wouter";
import { FileText, ArrowLeft, Loader2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ForRecruiters() {
  const [, setLocation] = useLocation();
  const [roleTitle, setRoleTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [mustHaves, setMustHaves] = useState("");
  const [niceToHaves, setNiceToHaves] = useState("");
  const [level, setLevel] = useState("");
  const [locationType, setLocationType] = useState("");
  const [compensationRange, setCompensationRange] = useState("");
  const [copied, setCopied] = useState(false);

  const generateMutation = trpc.jdBuilder.generate.useMutation();
  const listQuery = trpc.jdBuilder.list.useQuery({ limit: 20 }, { enabled: !!generateMutation.data?.draftId });

  const result = generateMutation.data;
  const canSubmit = roleTitle.trim().length > 0 && companyName.trim().length > 0 && !generateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    generateMutation.mutate({
      roleTitle: roleTitle.trim(),
      companyName: companyName.trim(),
      department: department.trim() || undefined,
      mustHaves: mustHaves.trim() ? mustHaves.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined,
      niceToHaves: niceToHaves.trim() ? niceToHaves.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined,
      level: level.trim() || undefined,
      location: locationType.trim() || undefined,
      compensationRange: compensationRange.trim() || undefined,
    });
  };

  const handleCopy = () => {
    if (!result?.fullText) return;
    navigator.clipboard.writeText(result.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Description Builder</h1>
            <p className="text-sm text-slate-600">
              For recruiters and HR. Generate ATS-friendly job descriptions in minutes. 1 free JD per month.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="roleTitle">Role title *</Label>
            <Input
              id="roleTitle"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Product Manager"
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company name *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Inc"
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">Department (optional)</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Product, Engineering"
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level">Level (optional)</Label>
            <Input
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. Senior, Mid, Junior"
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              placeholder="e.g. Remote, NYC, Hybrid"
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mustHaves">Must-haves (comma or semicolon separated)</Label>
            <Textarea
              id="mustHaves"
              value={mustHaves}
              onChange={(e) => setMustHaves(e.target.value)}
              placeholder="e.g. 5+ years PM, B2B SaaS, SQL"
              rows={2}
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="niceToHaves">Nice-to-haves (optional)</Label>
            <Textarea
              id="niceToHaves"
              value={niceToHaves}
              onChange={(e) => setNiceToHaves(e.target.value)}
              placeholder="e.g. MBA, startup experience"
              rows={2}
              disabled={generateMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="compensation">Compensation (optional)</Label>
            <Input
              id="compensation"
              value={compensationRange}
              onChange={(e) => setCompensationRange(e.target.value)}
              placeholder="e.g. $150k–$180k, Competitive"
              disabled={generateMutation.isPending}
            />
          </div>
          <Button type="submit" disabled={!canSubmit} className="bg-orange-500 hover:bg-orange-600">
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate JD"
            )}
          </Button>
        </form>

        {generateMutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            {generateMutation.error.message}
          </p>
        )}

        {result && (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Description</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-[60vh] overflow-y-auto">
                {result.fullText}
              </pre>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-xs text-slate-500">
          Pro users get unlimited JDs. <button type="button" onClick={() => setLocation("/pricing")} className="text-orange-600 hover:underline">View pricing</button>.
        </p>
      </div>
    </div>
  );
}
