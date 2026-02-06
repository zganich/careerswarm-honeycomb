import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PreferencesEditModalProps {
  open: boolean;
  onClose: () => void;
  preferences: {
    roleTitles?: string[];
    industries?: string[];
    companyStages?: string[];
    locationType?: "remote" | "hybrid" | "onsite" | "flexible";
    allowedCities?: string[];
    minimumBaseSalary?: number | null;
    dealBreakers?: string[];
  } | null;
}

export function PreferencesEditModal({
  open,
  onClose,
  preferences,
}: PreferencesEditModalProps) {
  const utils = trpc.useUtils();

  const [roleTitles, setRoleTitles] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [companyStages, setCompanyStages] = useState<string[]>([]);
  const [locationType, setLocationType] = useState<
    "remote" | "hybrid" | "onsite" | "flexible"
  >("remote");
  const [allowedCities, setAllowedCities] = useState<string[]>([]);
  const [minimumBaseSalary, setMinimumBaseSalary] = useState<string>("");
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);

  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newCompanyStage, setNewCompanyStage] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newDealBreaker, setNewDealBreaker] = useState("");

  useEffect(() => {
    if (preferences) {
      setRoleTitles(preferences.roleTitles || []);
      setIndustries(preferences.industries || []);
      setCompanyStages(preferences.companyStages || []);
      setLocationType(preferences.locationType || "remote");
      setAllowedCities(preferences.allowedCities || []);
      setMinimumBaseSalary(preferences.minimumBaseSalary?.toString() || "");
      setDealBreakers(preferences.dealBreakers || []);
    }
  }, [preferences]);

  const updateMutation = trpc.profile.updatePreferences.useMutation({
    onSuccess: () => {
      alert("Preferences updated successfully!");
      utils.profile.get.invalidate();
      onClose();
    },
    onError: error => {
      alert(`Failed to update preferences: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      roleTitles,
      industries,
      companyStages,
      locationType,
      allowedCities,
      minimumBaseSalary: minimumBaseSalary ? parseInt(minimumBaseSalary) : null,
      dealBreakers,
    });
  };

  const addItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Target Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Titles */}
          <div>
            <Label>Target Role Titles</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., VP Partnerships"
                value={newRoleTitle}
                onChange={e => setNewRoleTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newRoleTitle, setRoleTitles, setNewRoleTitle);
                  }
                }}
              />
              <Button
                onClick={() =>
                  addItem(newRoleTitle, setRoleTitles, setNewRoleTitle)
                }
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {roleTitles.map((title, index) => (
                <Badge key={index} variant="secondary">
                  {title}
                  <button
                    onClick={() => removeItem(index, setRoleTitles)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div>
            <Label>Target Industries</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., SaaS, Fintech"
                value={newIndustry}
                onChange={e => setNewIndustry(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newIndustry, setIndustries, setNewIndustry);
                  }
                }}
              />
              <Button
                onClick={() =>
                  addItem(newIndustry, setIndustries, setNewIndustry)
                }
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {industries.map((industry, index) => (
                <Badge key={index} variant="secondary">
                  {industry}
                  <button
                    onClick={() => removeItem(index, setIndustries)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Company Stages */}
          <div>
            <Label>Company Stages</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., Series B, Growth"
                value={newCompanyStage}
                onChange={e => setNewCompanyStage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(
                      newCompanyStage,
                      setCompanyStages,
                      setNewCompanyStage
                    );
                  }
                }}
              />
              <Button
                onClick={() =>
                  addItem(newCompanyStage, setCompanyStages, setNewCompanyStage)
                }
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {companyStages.map((stage, index) => (
                <Badge key={index} variant="secondary">
                  {stage}
                  <button
                    onClick={() => removeItem(index, setCompanyStages)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Location Type */}
          <div>
            <Label>Location Preference</Label>
            <Select
              value={locationType}
              onValueChange={(value: any) => setLocationType(value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allowed Cities */}
          <div>
            <Label>Preferred Cities (if not fully remote)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., San Francisco, New York"
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newCity, setAllowedCities, setNewCity);
                  }
                }}
              />
              <Button
                onClick={() => addItem(newCity, setAllowedCities, setNewCity)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {allowedCities.map((city, index) => (
                <Badge key={index} variant="secondary">
                  {city}
                  <button
                    onClick={() => removeItem(index, setAllowedCities)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Minimum Salary */}
          <div>
            <Label>Minimum Base Salary (USD)</Label>
            <Input
              type="number"
              placeholder="e.g., 150000"
              value={minimumBaseSalary}
              onChange={e => setMinimumBaseSalary(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Deal Breakers */}
          <div>
            <Label>Deal Breakers</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., No equity, Required relocation"
                value={newDealBreaker}
                onChange={e => setNewDealBreaker(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(newDealBreaker, setDealBreakers, setNewDealBreaker);
                  }
                }}
              />
              <Button
                onClick={() =>
                  addItem(newDealBreaker, setDealBreakers, setNewDealBreaker)
                }
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {dealBreakers.map((breaker, index) => (
                <Badge key={index} variant="destructive">
                  {breaker}
                  <button
                    onClick={() => removeItem(index, setDealBreakers)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
