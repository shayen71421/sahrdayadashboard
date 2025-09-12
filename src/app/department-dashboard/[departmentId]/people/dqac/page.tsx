"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  fetchDqacObjective, updateDqacObjective,
  fetchDqacYears, addDqacYear, deleteDqacYear,
  fetchDqacConstitution, uploadDqacConstitutionPdf, deleteDqacConstitution,
  fetchDqacMeetingMinutes, uploadDqacMeetingMinutesPdf, deleteDqacMeetingMinutes
} from "@/utils/department_dashboard_function";

export default function DQACPage() {
  const params = useParams();
  const departmentId = params?.departmentId ?? "";

  const [objective, setObjective] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [isEditingObjective, setIsEditingObjective] = useState(false);

  const [years, setYears] = useState<string[]>([]);
  const [newYear, setNewYear] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [constitutionDoc, setConstitutionDoc] = useState<any>(null);
  const [uploadingConstitution, setUploadingConstitution] = useState(false);
  const [constitutionFile, setConstitutionFile] = useState<File | null>(null);

  const [meetingMinutes, setMeetingMinutes] = useState<any[]>([]);
  const [uploadingMinutes, setUploadingMinutes] = useState(false);
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const [newMinutesDocId, setNewMinutesDocId] = useState("");

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!departmentId) return;

    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [obj, yrs] = await Promise.all([
          fetchDqacObjective(departmentId),
          fetchDqacYears(departmentId),
        ]);
        if (!mounted.current) return;
        setObjective(obj);
        setNewObjective(obj);
        setYears(yrs);
        if (yrs.length > 0) setSelectedYear(yrs[0]);
      } catch {
        if (!mounted.current) return;
        setError("Failed to load initial data.");
      } finally {
        if (!mounted.current) return;
        setIsLoading(false);
      }
    };
    loadInitial();
  }, [departmentId]);

  useEffect(() => {
    if (!departmentId || !selectedYear) {
      setConstitutionDoc(null);
      setMeetingMinutes([]);
      return;
    }

    const loadYearDocs = async () => {
      try {
        const [constitution, minutes] = await Promise.all([
          fetchDqacConstitution(departmentId, selectedYear),
          fetchDqacMeetingMinutes(departmentId, selectedYear),
        ]);
        if (!mounted.current) return;
        setConstitutionDoc(constitution);
        setMeetingMinutes(minutes);
      } catch {
        if (!mounted.current) return;
        setError("Failed to load documents for selected year.");
      }
    };
    loadYearDocs();
  }, [departmentId, selectedYear]);

  const handleEditObjective = () => setIsEditingObjective(true);
  const handleCancelEditObjective = () => {
    setIsEditingObjective(false);
    setNewObjective(objective);
  };
  const handleSaveObjective = async () => {
    setIsLoading(true);
    try {
      await updateDqacObjective(departmentId, newObjective);
      if (!mounted.current) return;
      setObjective(newObjective);
      setIsEditingObjective(false);
    } catch {
      if (!mounted.current) return;
      setError("Failed to save objective.");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.trim()) return;
    setIsLoading(true);
    try {
      await addDqacYear(departmentId, newYear);
      if (!mounted.current) return;
      setYears(prev => [...prev, newYear]);
      setSelectedYear(newYear);
      setNewYear("");
    } catch {
      if (!mounted.current) return;
      setError("Failed to add year.");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  };

  const handleDeleteYear = async (yearToDelete: string) => {
    setIsLoading(true);
    try {
      await deleteDqacYear(departmentId, yearToDelete);
      if (!mounted.current) return;
      setYears(prev => prev.filter(y => y !== yearToDelete));
      if (selectedYear === yearToDelete) setSelectedYear(null);
    } catch {
      if (!mounted.current) return;
      setError("Failed to delete year.");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  };

  const handleUploadConstitution = async () => {
    if (!constitutionFile || !selectedYear) return;
    setUploadingConstitution(true);
    try {
      await uploadDqacConstitutionPdf(departmentId, selectedYear, constitutionFile);
      if (!mounted.current) return;
      const updatedDoc = await fetchDqacConstitution(departmentId, selectedYear);
      setConstitutionDoc(updatedDoc);
      setConstitutionFile(null);
    } catch {
      if (!mounted.current) return;
      setError("Failed to upload constitution PDF.");
    } finally {
      if (mounted.current) setUploadingConstitution(false);
    }
  };

  const handleDeleteConstitution = async () => {
    if (!selectedYear) return;
    try {
      await deleteDqacConstitution(departmentId, selectedYear);
      if (!mounted.current) return;
      setConstitutionDoc(null);
    } catch {
      if (!mounted.current) return;
      setError("Failed to delete constitution PDF.");
    }
  };

  const handleUploadMinutes = async () => {
    if (!minutesFile || !selectedYear || !newMinutesDocId.trim()) {
      setError("Please select file and enter document ID.");
      return;
    }
    setUploadingMinutes(true);
    try {
      await uploadDqacMeetingMinutesPdf(departmentId, selectedYear, newMinutesDocId, minutesFile);
      if (!mounted.current) return;
      const updatedMinutes = await fetchDqacMeetingMinutes(departmentId, selectedYear);
      setMeetingMinutes(updatedMinutes);
      setMinutesFile(null);
      setNewMinutesDocId("");
    } catch {
      if (!mounted.current) return;
      setError("Failed to upload meeting minutes PDF.");
    } finally {
      if (mounted.current) setUploadingMinutes(false);
    }
  };

  const handleDeleteMinutes = async (docId:String) => {
    if (!selectedYear) return;
    try {
      await deleteDqacMeetingMinutes(departmentId, selectedYear, docId);
      if (!mounted.current) return;
      setMeetingMinutes(prev => prev.filter(doc => doc.id !== docId));
    } catch {
      if (!mounted.current) return;
      setError("Failed to delete meeting minutes PDF.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>DQAC Objective</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : isEditingObjective ? (
            <>
              <Input value={newObjective} onChange={e => setNewObjective(e.target.value)} />
              <div className="flex space-x-2 mt-2">
                <Button onClick={handleSaveObjective}>Save</Button>
                <Button variant="outline" onClick={handleCancelEditObjective}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <p>{objective}</p>
              <Button onClick={handleEditObjective}>Edit</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DQAC Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddYear} className="flex space-x-2 mb-4">
            <Input value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="e.g., 2024-25" />
            <Button type="submit">Add Year</Button>
          </form>
          {years.length > 0 && years.map(year => (
            <div key={year} className="flex items-center justify-between p-2 border rounded mb-1">
              <button onClick={() => setSelectedYear(year)} className={`flex-grow text-left ${selectedYear === year ? "font-bold underline" : ""}`}>
                {year}
              </button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteYear(year)}>Delete</Button>
            </div>
          ))}
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
                <div className="flex justify-between items-center">
                  <a href={constitutionDoc.pdfLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View Constitution PDF
                  </a>
                  <Button variant="destructive" size="sm" onClick={handleDeleteConstitution}>
                    Delete
                  </Button>
                </div>
              ) : (
                <p>No constitution document uploaded.</p>
              )}
              <input type="file" accept="application/pdf" onChange={e => setConstitutionFile(e.target.files?.[0] ?? null)} />
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
                <ul className="mb-4">
                  {meetingMinutes.map(({ id, pdfLink }) => (
                    <li key={id} className="flex justify-between items-center p-2 border rounded mb-1">
                      <a href={pdfLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">{id}</a>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMinutes(id)}>Delete</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No meeting minutes uploaded.</p>
              )}

              <Input value={newMinutesDocId} onChange={e => setNewMinutesDocId(e.target.value)} placeholder="Document ID (e.g., semester-1)" className="mb-2" />
              <input type="file" accept="application/pdf" onChange={e => setMinutesFile(e.target.files?.[0] ?? null)} />
              <Button onClick={handleUploadMinutes} disabled={uploadingMinutes}>
                {uploadingMinutes ? "Uploading..." : "Upload Meeting Minutes"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
