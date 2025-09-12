"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAssociationMain, saveAssociationMain } from "@/utils/department_dashboard_function";

interface Objective {
  title: string;
  subtext: string;
  exists: boolean; // can be used for future logic if needed
}

export default function DepartmentAssociationMainPage() {
  const params = useParams();
  const departmentId = params?.departmentId ?? "";

  const [associationName, setAssociationName] = useState("");
  const [associationSubtext, setAssociationSubtext] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");

  // Six fixed objectives, editable title and subtext at all times
  const [objectives, setObjectives] = useState<Objective[]>(
    Array(6).fill({ title: "", subtext: "", exists: false })
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!departmentId) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssociationMain(departmentId);
        if (data) {
          setAssociationName(data.associationName || "");
          setAssociationSubtext(data.associationSubtext || "");
          setVision(data.vision || "");
          setMission(data.mission || "");
          if (Array.isArray(data.objectives) && data.objectives.length === 6) {
            const objData = data.objectives.map((obj: any) => ({
              title: obj.title || "",
              subtext: obj.subtext || "",
              exists: true,
            }));
            setObjectives(objData);
          } else {
            // initialize empty objectives if data missing or malformed
            setObjectives(
              Array(6).fill(null).map(() => ({ title: "", subtext: "", exists: false }))
            );
          }
        } else {
          // No data found; empty initial state
          setObjectives(
            Array(6).fill(null).map(() => ({ title: "", subtext: "", exists: false }))
          );
        }
      } catch {
        setError("Failed to load association data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [departmentId]);

  // Event handlers for association fields

  const handleAssociationNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAssociationName(e.target.value);
  };

  const handleAssociationSubtextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAssociationSubtext(e.target.value);
  };

  const handleVisionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setVision(e.target.value);
  };

  const handleMissionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMission(e.target.value);
  };

  // Event handlers for objectives - title and subtext both editable any time

  const handleObjectiveTitleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    setObjectives((old) => {
      const copy = [...old];
      copy[index] = { ...copy[index], title: e.target.value, exists: true };
      return copy;
    });
  };

  const handleObjectiveSubtextChange = (index: number, e: ChangeEvent<HTMLTextAreaElement>) => {
    setObjectives((old) => {
      const copy = [...old];
      copy[index] = { ...copy[index], subtext: e.target.value, exists: true };
      return copy;
    });
  };

  // Save with validation: title must have at least one letter

  async function handleSave() {
    if (!departmentId) return;

    // Validate all titles non-empty (one or more letters)
    for (let i = 0; i < objectives.length; i++) {
      if (!objectives[i].title || !objectives[i].title.trim()) {
        setError(`Objective ${i + 1} title must contain at least one letter.`);
        return;
      }
    }

    const validObjectives = objectives.map(obj => ({
      title: obj.title.trim(),
      subtext: obj.subtext.trim(),
    }));

    setSaving(true);
    setError(null);
    try {
      await saveAssociationMain(departmentId, {
        associationName: associationName.trim(),
        associationSubtext: associationSubtext.trim(),
        vision: vision.trim(),
        mission: mission.trim(),
        objectives: validObjectives,
      });
      alert("Association info saved!");
    } catch {
      setError("Failed to save association info.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Department Association Main</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="space-y-4">

            <div>
              <label className="block font-semibold mb-1">Association Name</label>
              <Input
                value={associationName}
                onChange={handleAssociationNameChange}
                placeholder="Enter association name"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Association Subtext</label>
              <textarea
                value={associationSubtext}
                onChange={handleAssociationSubtextChange}
                placeholder="Enter association subtext"
                rows={3}
                className="w-full p-2 border rounded resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Vision</label>
              <textarea
                value={vision}
                onChange={handleVisionChange}
                placeholder="Enter vision statement"
                rows={3}
                className="w-full p-2 border rounded resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Mission</label>
              <textarea
                value={mission}
                onChange={handleMissionChange}
                placeholder="Enter mission statement"
                rows={3}
                className="w-full p-2 border rounded resize-none"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Association Objectives</h3>
              {objectives.map((obj, idx) => (
                <div key={idx} className="mb-4 border rounded p-4 bg-gray-50">
                  <label className="block font-semibold mb-1">
                    Objective {idx + 1} Title
                  </label>
                  <Input
                    value={obj.title}
                    onChange={e => handleObjectiveTitleChange(idx, e)}
                    placeholder="Enter objective title"
                  />
                  <label className="block font-semibold mb-1 mt-2">
                    Objective {idx + 1} Subtext
                  </label>
                  <textarea
                    value={obj.subtext}
                    onChange={e => handleObjectiveSubtextChange(idx, e)}
                    placeholder="Enter objective subtext"
                    rows={2}
                    className="w-full p-2 border rounded resize-none"
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Association Details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
