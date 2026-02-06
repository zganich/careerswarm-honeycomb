import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSections() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // ================================================================
  // LANGUAGES
  // ================================================================
  const { data: languages = [] } =
    trpc.profileSections.languages.list.useQuery();
  const createLanguage = trpc.profileSections.languages.create.useMutation({
    onSuccess: () => {
      utils.profileSections.languages.list.invalidate();
      toast.success("Language added successfully");
      setNewLanguage({ language: "", proficiency: "", isNative: false });
    },
  });
  const deleteLanguage = trpc.profileSections.languages.delete.useMutation({
    onSuccess: () => {
      utils.profileSections.languages.list.invalidate();
      toast.success("Language deleted successfully");
    },
  });

  const [newLanguage, setNewLanguage] = useState({
    language: "",
    proficiency: "",
    isNative: false,
  });

  // ================================================================
  // VOLUNTEER EXPERIENCES
  // ================================================================
  const { data: volunteerExperiences = [] } =
    trpc.profileSections.volunteerExperiences.list.useQuery();
  const createVolunteerExp =
    trpc.profileSections.volunteerExperiences.create.useMutation({
      onSuccess: () => {
        utils.profileSections.volunteerExperiences.list.invalidate();
        toast.success("Volunteer experience added successfully");
        setNewVolunteerExp({
          organization: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        });
      },
    });
  const deleteVolunteerExp =
    trpc.profileSections.volunteerExperiences.delete.useMutation({
      onSuccess: () => {
        utils.profileSections.volunteerExperiences.list.invalidate();
        toast.success("Volunteer experience deleted successfully");
      },
    });

  const [newVolunteerExp, setNewVolunteerExp] = useState({
    organization: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // ================================================================
  // PROJECTS
  // ================================================================
  const { data: projects = [] } = trpc.profileSections.projects.list.useQuery();
  const createProject = trpc.profileSections.projects.create.useMutation({
    onSuccess: () => {
      utils.profileSections.projects.list.invalidate();
      toast.success("Project added successfully");
      setNewProject({
        name: "",
        description: "",
        url: "",
        role: "",
        startDate: "",
        endDate: "",
      });
    },
  });
  const deleteProject = trpc.profileSections.projects.delete.useMutation({
    onSuccess: () => {
      utils.profileSections.projects.list.invalidate();
      toast.success("Project deleted successfully");
    },
  });

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    url: "",
    role: "",
    startDate: "",
    endDate: "",
  });

  // ================================================================
  // PUBLICATIONS
  // ================================================================
  const { data: publications = [] } =
    trpc.profileSections.publications.list.useQuery();
  const createPublication =
    trpc.profileSections.publications.create.useMutation({
      onSuccess: () => {
        utils.profileSections.publications.list.invalidate();
        toast.success("Publication added successfully");
        setNewPublication({
          title: "",
          publisherOrVenue: "",
          year: undefined,
          url: "",
          context: "",
        });
      },
    });
  const deletePublication =
    trpc.profileSections.publications.delete.useMutation({
      onSuccess: () => {
        utils.profileSections.publications.list.invalidate();
        toast.success("Publication deleted successfully");
      },
    });

  const [newPublication, setNewPublication] = useState<{
    title: string;
    publisherOrVenue: string;
    year: number | undefined;
    url: string;
    context: string;
  }>({
    title: "",
    publisherOrVenue: "",
    year: undefined,
    url: "",
    context: "",
  });

  // ================================================================
  // SECURITY CLEARANCES
  // ================================================================
  const { data: securityClearances = [] } =
    trpc.profileSections.securityClearances.list.useQuery();
  const createClearance =
    trpc.profileSections.securityClearances.create.useMutation({
      onSuccess: () => {
        utils.profileSections.securityClearances.list.invalidate();
        toast.success("Security clearance added successfully");
        setNewClearance({ clearanceType: "", level: "", expiryDate: "" });
      },
    });
  const deleteClearance =
    trpc.profileSections.securityClearances.delete.useMutation({
      onSuccess: () => {
        utils.profileSections.securityClearances.list.invalidate();
        toast.success("Security clearance deleted successfully");
      },
    });

  const [newClearance, setNewClearance] = useState({
    clearanceType: "",
    level: "",
    expiryDate: "",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                Additional Profile Sections
              </h1>
              <p className="text-sm text-muted-foreground">
                Add languages, volunteer work, projects, publications, and
                security clearances
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* LANGUAGES */}
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>
              Add languages you speak and your proficiency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {languages.map(lang => (
              <div
                key={lang.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{lang.language}</p>
                  {lang.proficiency && (
                    <p className="text-sm text-muted-foreground">
                      {lang.proficiency}
                    </p>
                  )}
                  {lang.isNative && (
                    <p className="text-sm text-muted-foreground">
                      Native speaker
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this language?")) {
                      deleteLanguage.mutate({ id: lang.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Input
                  id="language"
                  value={newLanguage.language}
                  onChange={e =>
                    setNewLanguage({ ...newLanguage, language: e.target.value })
                  }
                  placeholder="e.g., Spanish, Mandarin, French"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proficiency">Proficiency</Label>
                <Input
                  id="proficiency"
                  value={newLanguage.proficiency}
                  onChange={e =>
                    setNewLanguage({
                      ...newLanguage,
                      proficiency: e.target.value,
                    })
                  }
                  placeholder="e.g., Native, Fluent, Conversational, Basic"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNative"
                  checked={newLanguage.isNative}
                  onCheckedChange={checked =>
                    setNewLanguage({
                      ...newLanguage,
                      isNative: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="isNative" className="cursor-pointer">
                  Native speaker
                </Label>
              </div>
              <Button
                onClick={() => {
                  if (!newLanguage.language) {
                    toast.error("Please enter a language");
                    return;
                  }
                  createLanguage.mutate(newLanguage);
                }}
                disabled={createLanguage.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* VOLUNTEER EXPERIENCES */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Experience</CardTitle>
            <CardDescription>
              Add volunteer work and community involvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {volunteerExperiences.map(exp => (
              <div
                key={exp.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{exp.organization}</p>
                  {exp.role && (
                    <p className="text-sm text-muted-foreground">{exp.role}</p>
                  )}
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-sm text-muted-foreground">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this volunteer experience?")) {
                      deleteVolunteerExp.mutate({ id: exp.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={newVolunteerExp.organization}
                  onChange={e =>
                    setNewVolunteerExp({
                      ...newVolunteerExp,
                      organization: e.target.value,
                    })
                  }
                  placeholder="e.g., Red Cross, Local Food Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={newVolunteerExp.role}
                  onChange={e =>
                    setNewVolunteerExp({
                      ...newVolunteerExp,
                      role: e.target.value,
                    })
                  }
                  placeholder="e.g., Volunteer Coordinator, Tutor"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    value={newVolunteerExp.startDate}
                    onChange={e =>
                      setNewVolunteerExp({
                        ...newVolunteerExp,
                        startDate: e.target.value,
                      })
                    }
                    placeholder="e.g., Jan 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    value={newVolunteerExp.endDate}
                    onChange={e =>
                      setNewVolunteerExp({
                        ...newVolunteerExp,
                        endDate: e.target.value,
                      })
                    }
                    placeholder="e.g., Dec 2022 or Present"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVolunteerExp.description}
                  onChange={e =>
                    setNewVolunteerExp({
                      ...newVolunteerExp,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your volunteer work and impact..."
                  rows={3}
                />
              </div>
              <Button
                onClick={() => {
                  if (!newVolunteerExp.organization) {
                    toast.error("Please enter an organization");
                    return;
                  }
                  createVolunteerExp.mutate(newVolunteerExp);
                }}
                disabled={createVolunteerExp.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Volunteer Experience
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PROJECTS */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Add personal or professional projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{project.name}</p>
                  {project.role && (
                    <p className="text-sm text-muted-foreground">
                      {project.role}
                    </p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-sm text-muted-foreground">
                      {project.startDate} - {project.endDate || "Ongoing"}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-sm mt-2">{project.description}</p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this project?")) {
                      deleteProject.mutate({ id: project.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={newProject.name}
                  onChange={e =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="e.g., Open Source Contribution, Side Business"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectRole">Your Role</Label>
                <Input
                  id="projectRole"
                  value={newProject.role}
                  onChange={e =>
                    setNewProject({ ...newProject, role: e.target.value })
                  }
                  placeholder="e.g., Lead Developer, Co-Founder"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectUrl">Project URL</Label>
                <Input
                  id="projectUrl"
                  value={newProject.url}
                  onChange={e =>
                    setNewProject({ ...newProject, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectStartDate">Start Date</Label>
                  <Input
                    id="projectStartDate"
                    value={newProject.startDate}
                    onChange={e =>
                      setNewProject({
                        ...newProject,
                        startDate: e.target.value,
                      })
                    }
                    placeholder="e.g., Jan 2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectEndDate">End Date</Label>
                  <Input
                    id="projectEndDate"
                    value={newProject.endDate}
                    onChange={e =>
                      setNewProject({ ...newProject, endDate: e.target.value })
                    }
                    placeholder="e.g., Dec 2023 or Ongoing"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  value={newProject.description}
                  onChange={e =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the project and your contributions..."
                  rows={3}
                />
              </div>
              <Button
                onClick={() => {
                  if (!newProject.name) {
                    toast.error("Please enter a project name");
                    return;
                  }
                  createProject.mutate(newProject);
                }}
                disabled={createProject.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PUBLICATIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Publications</CardTitle>
            <CardDescription>
              Add academic or professional publications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {publications.map(pub => (
              <div
                key={pub.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{pub.title}</p>
                  {pub.publisherOrVenue && (
                    <p className="text-sm text-muted-foreground">
                      {pub.publisherOrVenue}
                    </p>
                  )}
                  {pub.year && (
                    <p className="text-sm text-muted-foreground">{pub.year}</p>
                  )}
                  {pub.context && <p className="text-sm mt-2">{pub.context}</p>}
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Publication →
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this publication?")) {
                      deletePublication.mutate({ id: pub.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="pubTitle">Title *</Label>
                <Input
                  id="pubTitle"
                  value={newPublication.title}
                  onChange={e =>
                    setNewPublication({
                      ...newPublication,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Research Paper Title, Article Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher/Venue</Label>
                <Input
                  id="publisher"
                  value={newPublication.publisherOrVenue}
                  onChange={e =>
                    setNewPublication({
                      ...newPublication,
                      publisherOrVenue: e.target.value,
                    })
                  }
                  placeholder="e.g., IEEE, Medium, Conference Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pubYear">Year</Label>
                <Input
                  id="pubYear"
                  type="number"
                  value={newPublication.year || ""}
                  onChange={e =>
                    setNewPublication({
                      ...newPublication,
                      year: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="e.g., 2023"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pubUrl">URL</Label>
                <Input
                  id="pubUrl"
                  value={newPublication.url}
                  onChange={e =>
                    setNewPublication({
                      ...newPublication,
                      url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pubContext">Context</Label>
                <Textarea
                  id="pubContext"
                  value={newPublication.context}
                  onChange={e =>
                    setNewPublication({
                      ...newPublication,
                      context: e.target.value,
                    })
                  }
                  placeholder="Brief description or abstract..."
                  rows={3}
                />
              </div>
              <Button
                onClick={() => {
                  if (!newPublication.title) {
                    toast.error("Please enter a publication title");
                    return;
                  }
                  createPublication.mutate(newPublication);
                }}
                disabled={createPublication.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Publication
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY CLEARANCES */}
        <Card>
          <CardHeader>
            <CardTitle>Security Clearances</CardTitle>
            <CardDescription>
              Add government security clearances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityClearances.map(clearance => (
              <div
                key={clearance.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{clearance.clearanceType}</p>
                  {clearance.level && (
                    <p className="text-sm text-muted-foreground">
                      {clearance.level}
                    </p>
                  )}
                  {clearance.expiryDate && (
                    <p className="text-sm text-muted-foreground">
                      Expires: {clearance.expiryDate}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this security clearance?")) {
                      deleteClearance.mutate({ id: clearance.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="clearanceType">Clearance Type *</Label>
                <Input
                  id="clearanceType"
                  value={newClearance.clearanceType}
                  onChange={e =>
                    setNewClearance({
                      ...newClearance,
                      clearanceType: e.target.value,
                    })
                  }
                  placeholder="e.g., Top Secret, Secret, Confidential"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clearanceLevel">Level</Label>
                <Input
                  id="clearanceLevel"
                  value={newClearance.level}
                  onChange={e =>
                    setNewClearance({ ...newClearance, level: e.target.value })
                  }
                  placeholder="e.g., TS/SCI, Q Clearance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={newClearance.expiryDate}
                  onChange={e =>
                    setNewClearance({
                      ...newClearance,
                      expiryDate: e.target.value,
                    })
                  }
                  placeholder="e.g., Dec 2025"
                />
              </div>
              <Button
                onClick={() => {
                  if (!newClearance.clearanceType) {
                    toast.error("Please enter a clearance type");
                    return;
                  }
                  createClearance.mutate(newClearance);
                }}
                disabled={createClearance.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Security Clearance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
