import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfileEdit() {
  const [, navigate] = useLocation();
  const { data: profile, refetch } = trpc.profile.get.useQuery();

  // Mutations
  const updateWorkExperience = trpc.profile.updateWorkExperience.useMutation({
    onSuccess: () => {
      toast.success("Work experience updated");
      refetch();
    },
  });

  const addWorkExperience = trpc.profile.addWorkExperience.useMutation({
    onSuccess: () => {
      toast.success("Work experience added");
      refetch();
      setShowAddWorkModal(false);
    },
  });

  const deleteWorkExperience = trpc.profile.deleteWorkExperience.useMutation({
    onSuccess: () => {
      toast.success("Work experience deleted");
      refetch();
    },
  });

  const updateAchievement = trpc.profile.updateAchievement.useMutation({
    onSuccess: () => {
      toast.success("Achievement updated");
      refetch();
    },
  });

  const addAchievement = trpc.profile.addAchievement.useMutation({
    onSuccess: () => {
      toast.success("Achievement added");
      refetch();
      setShowAddAchievementModal(false);
    },
  });

  const deleteAchievement = trpc.profile.deleteAchievement.useMutation({
    onSuccess: () => {
      toast.success("Achievement deleted");
      refetch();
    },
  });

  const addSkill = trpc.profile.addSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill added");
      refetch();
      setShowAddSkillModal(false);
    },
  });

  const deleteSkill = trpc.profile.deleteSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill deleted");
      refetch();
    },
  });

  // Modal states
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [editingWork, setEditingWork] = useState<any>(null);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);

  // Form states
  const [workForm, setWorkForm] = useState({
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    location: "",
    isCurrent: false,
    roleOverview: "",
  });

  const [achievementForm, setAchievementForm] = useState({
    workExperienceId: 0,
    description: "",
    context: "",
    metricType: "",
    metricValue: "",
    metricUnit: "",
  });

  const [skillForm, setSkillForm] = useState({
    skillName: "",
    skillCategory: "technical",
    proficiencyLevel: "intermediate",
    yearsExperience: "",
  });

  if (!profile) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Update your work history, achievements, and skills
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/profile")}>
              <Save className="h-4 w-4 mr-2" />
              Done Editing
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Work Experience Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Work Experience</h2>
            <Dialog open={showAddWorkModal} onOpenChange={setShowAddWorkModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Work Experience</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={workForm.companyName}
                      onChange={e =>
                        setWorkForm({
                          ...workForm,
                          companyName: e.target.value,
                        })
                      }
                      placeholder="e.g., Builder.ai"
                    />
                  </div>
                  <div>
                    <Label>Job Title *</Label>
                    <Input
                      value={workForm.jobTitle}
                      onChange={e =>
                        setWorkForm({ ...workForm, jobTitle: e.target.value })
                      }
                      placeholder="e.g., Partnerships Manager"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={workForm.startDate}
                        onChange={e =>
                          setWorkForm({
                            ...workForm,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={workForm.endDate}
                        onChange={e =>
                          setWorkForm({ ...workForm, endDate: e.target.value })
                        }
                        disabled={workForm.isCurrent}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={workForm.isCurrent}
                          onChange={e =>
                            setWorkForm({
                              ...workForm,
                              isCurrent: e.target.checked,
                            })
                          }
                        />
                        <Label className="text-sm">I currently work here</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={workForm.location}
                      onChange={e =>
                        setWorkForm({ ...workForm, location: e.target.value })
                      }
                      placeholder="e.g., Remote, San Francisco, CA"
                    />
                  </div>
                  <div>
                    <Label>Role Overview</Label>
                    <Textarea
                      value={workForm.roleOverview}
                      onChange={e =>
                        setWorkForm({
                          ...workForm,
                          roleOverview: e.target.value,
                        })
                      }
                      placeholder="Brief description of your role and responsibilities..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddWorkModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (
                          !workForm.companyName ||
                          !workForm.jobTitle ||
                          !workForm.startDate
                        ) {
                          toast.error("Please fill in required fields");
                          return;
                        }
                        addWorkExperience.mutate({
                          companyName: workForm.companyName,
                          jobTitle: workForm.jobTitle,
                          startDate: workForm.startDate,
                          endDate: workForm.isCurrent
                            ? null
                            : workForm.endDate || null,
                          location: workForm.location || null,
                          isCurrent: workForm.isCurrent,
                          roleOverview: workForm.roleOverview || null,
                        });
                      }}
                    >
                      Add Work Experience
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {profile.workExperiences?.map((work: any) => (
              <Card key={work.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{work.jobTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {work.companyName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(work.startDate).toLocaleDateString()} -{" "}
                      {work.isCurrent
                        ? "Present"
                        : work.endDate
                          ? new Date(work.endDate).toLocaleDateString()
                          : ""}
                    </p>
                    {work.location && (
                      <p className="text-sm text-muted-foreground">
                        {work.location}
                      </p>
                    )}
                    {work.roleOverview && (
                      <p className="text-sm mt-2">{work.roleOverview}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this work experience?")) {
                          deleteWorkExperience.mutate({ id: work.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Achievements Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Achievements</h2>
            <Dialog
              open={showAddAchievementModal}
              onOpenChange={setShowAddAchievementModal}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Achievement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Work Experience *</Label>
                    <Select
                      value={achievementForm.workExperienceId.toString()}
                      onValueChange={value =>
                        setAchievementForm({
                          ...achievementForm,
                          workExperienceId: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {profile.workExperiences?.map((work: any) => (
                          <SelectItem key={work.id} value={work.id.toString()}>
                            {work.jobTitle} at {work.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Achievement Description *</Label>
                    <Textarea
                      value={achievementForm.description}
                      onChange={e =>
                        setAchievementForm({
                          ...achievementForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="e.g., Built first formal partner program from scratch, driving 425% pipeline growth in 7 months"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Context (Optional)</Label>
                    <Textarea
                      value={achievementForm.context}
                      onChange={e =>
                        setAchievementForm({
                          ...achievementForm,
                          context: e.target.value,
                        })
                      }
                      placeholder="Additional context about this achievement..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Metric Type</Label>
                      <Select
                        value={achievementForm.metricType}
                        onValueChange={value =>
                          setAchievementForm({
                            ...achievementForm,
                            metricType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="pipeline">Pipeline</SelectItem>
                          <SelectItem value="efficiency">Efficiency</SelectItem>
                          <SelectItem value="scale">Scale</SelectItem>
                          <SelectItem value="innovation">Innovation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Metric Value</Label>
                      <Input
                        value={achievementForm.metricValue}
                        onChange={e =>
                          setAchievementForm({
                            ...achievementForm,
                            metricValue: e.target.value,
                          })
                        }
                        placeholder="e.g., 425"
                      />
                    </div>
                    <div>
                      <Label>Metric Unit</Label>
                      <Select
                        value={achievementForm.metricUnit}
                        onValueChange={value =>
                          setAchievementForm({
                            ...achievementForm,
                            metricUnit: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percent (%)</SelectItem>
                          <SelectItem value="dollars">Dollars ($)</SelectItem>
                          <SelectItem value="count">Count (#)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddAchievementModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (
                          !achievementForm.workExperienceId ||
                          !achievementForm.description
                        ) {
                          toast.error("Please fill in required fields");
                          return;
                        }
                        addAchievement.mutate({
                          workExperienceId: achievementForm.workExperienceId,
                          description: achievementForm.description,
                          context: achievementForm.context || null,
                          metricType: achievementForm.metricType || null,
                          metricValue: achievementForm.metricValue
                            ? parseFloat(achievementForm.metricValue)
                            : null,
                          metricUnit: achievementForm.metricUnit || null,
                        });
                      }}
                    >
                      Add Achievement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {profile.achievements?.map((achievement: any) => (
              <Card key={achievement.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{achievement.description}</p>
                    {achievement.context && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.context}
                      </p>
                    )}
                    {achievement.metricValue && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {achievement.metricType}: {achievement.metricValue}
                          {achievement.metricUnit === "percent" && "%"}
                          {achievement.metricUnit === "dollars" && " USD"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this achievement?")) {
                          deleteAchievement.mutate({ id: achievement.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Skills Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Skills</h2>
            <Dialog
              open={showAddSkillModal}
              onOpenChange={setShowAddSkillModal}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Skill Name *</Label>
                    <Input
                      value={skillForm.skillName}
                      onChange={e =>
                        setSkillForm({
                          ...skillForm,
                          skillName: e.target.value,
                        })
                      }
                      placeholder="e.g., Partnership Development"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={skillForm.skillCategory}
                      onValueChange={value =>
                        setSkillForm({ ...skillForm, skillCategory: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="soft">Soft Skills</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Proficiency Level</Label>
                    <Select
                      value={skillForm.proficiencyLevel}
                      onValueChange={value =>
                        setSkillForm({ ...skillForm, proficiencyLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      value={skillForm.yearsExperience}
                      onChange={e =>
                        setSkillForm({
                          ...skillForm,
                          yearsExperience: e.target.value,
                        })
                      }
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddSkillModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!skillForm.skillName) {
                          toast.error("Please enter a skill name");
                          return;
                        }
                        addSkill.mutate({
                          skillName: skillForm.skillName,
                          skillCategory: skillForm.skillCategory,
                          proficiencyLevel: skillForm.proficiencyLevel,
                          yearsExperience: skillForm.yearsExperience
                            ? parseFloat(skillForm.yearsExperience)
                            : null,
                        });
                      }}
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.skills?.map((skill: any) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg"
              >
                <span className="text-sm font-medium">{skill.skillName}</span>
                <span className="text-xs text-muted-foreground">
                  {skill.proficiencyLevel}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => {
                    if (confirm("Delete this skill?")) {
                      deleteSkill.mutate({ id: skill.id });
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
