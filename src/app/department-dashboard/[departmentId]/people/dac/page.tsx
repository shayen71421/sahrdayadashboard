"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchDacObjective,
  updateDacObjective,
  fetchDacYears,
  addDacYear,
  deleteDacYear,
  fetchConstitution,
  uploadConstitutionPdf,
  deleteConstitution,
  fetchMeetingMinutes,
  uploadMeetingMinutesPdf,
  deleteMeetingMinutes,
} from "@/utils/department_dashboard_function";

export default function DACPage() {
  const params = useParams();
  const departmentId = params.departmentId;

  const [objective, setObjective] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [isEditingObjective, setIsEditingObjective] = useState(false);

  const [years, setYears] = useState<string[]>([]);
  const [newYear, setNewYear] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Constitution PDF metadata for the selected year
  const [constitutionDoc, setConstitutionDoc] = useState<any>(null);
  const [uploadingConstitution, setUploadingConstitution] = useState(false);
  const [constitutionFile, setConstitutionFile] = useState<File | null>(null);

  // Meeting minutes docs for the selected year
  const [meetingMinutes, setMeetingMinutes] = useState<any[]>([]);
  const [uploadingMinutes, setUploadingMinutes] = useState(false);
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const [newMinutesDocId, setNewMinutesDocId] = useState("");

  // Fetch objective and years on load and when departmentId changes
  useEffect(() => {
    if (!departmentId) return;

    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [obj, yrs] = await Promise.all([
          fetchDacObjective(departmentId),
          fetchDacYears(departmentId),
        ]);
        setObjective(obj);
        setNewObjective(obj);
        setYears(yrs);
        if (yrs.length > 0) setSelectedYear(yrs[0]);
      } catch {
        setError("Failed to load initial data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitial();
  }, [departmentId]);

  // Fetch constitution and meeting minutes when selectedYear changes
  useEffect(() => {
    if (!departmentId || !selectedYear) {
      setConstitutionDoc(null);
      setMeetingMinutes([]);
      return;
    }

    const loadYearDocs = async () => {
      try {
        const [constitution, minutes] = await Promise.all([
          fetchConstitution(departmentId, selectedYear),
          fetchMeetingMinutes(departmentId, selectedYear),
        ]);
        setConstitutionDoc(constitution);
        setMeetingMinutes(minutes);
      } catch {
        setError("Failed to load documents for selected year.");
      }
    };
    loadYearDocs();
  }, [departmentId, selectedYear]);

  // Objective handlers
  const handleEditObjective = () => setIsEditingObjective(true);
  const handleCancelEditObjective = () => {
    setIsEditingObjective(false);
    setNewObjective(objective);
  };
  const handleSaveObjective = async () => {
    setIsLoading(true);
    try {
      await updateDacObjective(departmentId, newObjective);
      setObjective(newObjective);
      setIsEditingObjective(false);
    } catch {
      setError("Failed to save objective.");
    } finally {
      setIsLoading(false);
    }
  };

  // Years handlers
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.trim()) return;
    setIsLoading(true);
    try {
      await addDacYear(departmentId, newYear);
      setYears((prev) => [...prev, newYear]);
      setNewYear("");
      setSelectedYear(newYear);
    } catch {
      setError("Failed to add year.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteYear = async (yearToDelete: string) => {
    setIsLoading(true);
    try {
      await deleteDacYear(departmentId, yearToDelete);
      setYears((prev) => prev.filter((year) => year !== yearToDelete));
      if (selectedYear === yearToDelete) setSelectedYear(null);
    } catch {
      setError("Failed to delete year.");
    } finally {
      setIsLoading(false);
    }
  };

  // Constitution upload handler
  const handleUploadConstitution = async () => {
    if (!constitutionFile || !selectedYear) return;
    setUploadingConstitution(true);
    try {
      await uploadConstitutionPdf(departmentId, selectedYear, constitutionFile);
      const updatedConstitution = await fetchConstitution(departmentId, selectedYear);
      setConstitutionDoc(updatedConstitution);
      setConstitutionFile(null);
    } catch {
      setError("Failed to upload constitution PDF.");
    } finally {
      setUploadingConstitution(false);
    }
  };

  const handleDeleteConstitution = async () => {
    if (!selectedYear) return;
    try {
      await deleteConstitution(departmentId, selectedYear);
      setConstitutionDoc(null);
    } catch {
      setError("Failed to delete constitution PDF.");
    }
  };

  // Meeting minutes upload handler
  const handleUploadMeetingMinutes = async () => {
    if (!minutesFile || !selectedYear || !newMinutesDocId.trim()) {
      setError("Please select file and enter ID for meeting minutes.");
      return;
    }
    setUploadingMinutes(true);
    try {
      await uploadMeetingMinutesPdf(departmentId, selectedYear, newMinutesDocId, minutesFile);
      const updatedMinutes = await fetchMeetingMinutes(departmentId, selectedYear);
      setMeetingMinutes(updatedMinutes);
      setMinutesFile(null);
      setNewMinutesDocId("");
    } catch {
      setError("Failed to upload meeting minutes PDF.");
    } finally {
      setUploadingMinutes(false);
    }
  };

  const handleDeleteMeetingMinutes = async (docId: string) => {
    if (!selectedYear) return;
    try {
      await deleteMeetingMinutes(departmentId, selectedYear, docId);
      setMeetingMinutes((prev) => prev.filter((doc) => doc.id !== docId));
    } catch {
      setError("Failed to delete meeting minutes PDF.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>DAC Objective</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : isEditingObjective ? (
            <div className="space-y-4">
              <Input value={newObjective} onChange={(e) => setNewObjective(e.target.value)} />
              <div className="flex space-x-2">
                <Button onClick={handleSaveObjective}>Save</Button>
                <Button variant="outline" onClick={handleCancelEditObjective}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>{objective}</p>
              <Button onClick={handleEditObjective}>Edit Objective</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DAC Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddYear} className="flex space-x-2 mb-4">
            <Input
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="e.g., 2024-25"
            />
            <Button type="submit">Add Year</Button>
          </form>

          {years.length > 0 && (
            <ul className="space-y-2 mb-6">
              {years.map((year) => (
                <li key={year} className="flex items-center justify-between p-2 border rounded">
                  <button onClick={() => setSelectedYear(year)} className={`flex-grow text-left ${selectedYear === year ? "font-bold underline" : ""}`}>{year}</button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteYear(year)}>Delete</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {selectedYear && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Constitution Document for {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              {constitutionDoc ? (
                <div className="flex items-center justify-between">
                  <a href={constitutionDoc.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Constitution PDF</a>
                  <Button variant="destructive" size="sm" onClick={handleDeleteConstitution}>Delete</Button>
                </div>
              ) : (
                <p>No constitution document uploaded yet.</p>
              )}
              <input type="file" accept=".pdf" onChange={(e) => setConstitutionFile(e.target.files ? e.target.files[0] : null)} />
              <Button onClick={handleUploadConstitution} disabled={uploadingConstitution}>
                {uploadingConstitution ? "Uploading..." : "Upload Constitution PDF"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Minutes for {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              {meetingMinutes.length > 0 ? (
                <ul className="space-y-2 mb-4">
                  {meetingMinutes.map(({ id, pdfLink }) => (
                    <li key={id} className="flex items-center justify-between">
                      <a href={pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {id}
                      </a>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeetingMinutes(id)}>Delete</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No meeting minutes uploaded yet.</p>
              )}
              <Input
                value={newMinutesDocId}
                onChange={(e) => setNewMinutesDocId(e.target.value)}
                placeholder="Document ID (e.g., semester-1)"
                className="mb-2"
              />
              <input type="file" accept=".pdf" onChange={(e) => setMinutesFile(e.target.files ? e.target.files[0] : null)} />
              <Button onClick={handleUploadMeetingMinutes} disabled={uploadingMinutes}>
                {uploadingMinutes ? "Uploading..." : "Upload Meeting Minutes PDF"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}
