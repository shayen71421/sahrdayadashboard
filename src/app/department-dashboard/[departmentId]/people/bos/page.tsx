"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchBosObjective,
  updateBosObjective,
  fetchBosYears,
  addBosYear,
  deleteBosYear,
  fetchBosConstitution,
  uploadBosConstitutionPdf,
  deleteBosConstitution,
  fetchBosMeetingMinutes,
  uploadBosMeetingPdf,
  deleteBosMeetingMinutes
} from "@/utils/department_dashboard_function";

export default function BOSPage() {
  const params = useParams();
  const departmentId = params?.departmentId ?? "";

  const [objective, setObjective] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [isEditingObjective, setIsEditingObjective] = useState(false);

  const [years, setYears] = useState<string[]>([]);
  const [newYear, setNewYear] = useState("");

  const [isLoading, setIsLoading] = useState(false);
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
          fetchBosObjective(departmentId),
          fetchBosYears(departmentId),
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
          fetchBosConstitution(departmentId, selectedYear),
          fetchBosMeetingMinutes(departmentId, selectedYear),
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
  const handleCancelObjective = () => {
    setIsEditingObjective(false);
    setNewObjective(objective);
  };
  const handleSaveObjective = async () => {
    setIsLoading(true);
    try {
      await updateBosObjective(departmentId, newObjective);
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
      await addBosYear(departmentId, newYear);
      if (!mounted.current) return;
      setYears(yrs => [...yrs, newYear]);
      setSelectedYear(newYear);
      setNewYear("");
    } catch {
      if (!mounted.current) return;
      setError("Failed to add year.");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  };

  const handleDeleteYear = async (year: string) => {
    setIsLoading(true);
    try {
      await deleteBosYear(departmentId, year);
      if (!mounted.current) return;
      setYears(yrs => yrs.filter(y => y !== year));
      if (selectedYear === year) setSelectedYear(null);
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
      await uploadBosConstitutionPdf(departmentId, selectedYear, constitutionFile);
      if (!mounted.current) return;
      const updatedDoc = await fetchBosConstitution(departmentId, selectedYear);
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
      await deleteBosConstitution(departmentId, selectedYear);
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
      await uploadBosMeetingPdf(departmentId, selectedYear, newMinutesDocId, minutesFile);
      if (!mounted.current) return;
      const updatedMinutes = await fetchBosMeetingMinutes(departmentId, selectedYear);
      setMeetingMinutes(updatedMinutes);
      setMinutesFile(null);
      setNewMinutesDocId("");
    } catch {
      if (!mounted.current) return;
      setError("Failed to upload meeting minutes.");
    } finally {
      if (mounted.current) setUploadingMinutes(false);
    }
  };

  const handleDeleteMinutes = async (docId: string) => {
    if (!selectedYear) return;
    try {
      await deleteBosMeetingMinutes(departmentId, selectedYear, docId);
      if (!mounted.current) return;
      setMeetingMinutes(mins => mins.filter(m => m.id !== docId));
    } catch {
      if (!mounted.current) return;
      setError("Failed to delete meeting minutes.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Board Of Study Objective</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : isEditingObjective ? (
            <>
              <Input value={newObjective} onChange={e => setNewObjective(e.target.value)} />
              <div className="mt-2 flex space-x-2">
                <Button onClick={handleSaveObjective}>Save</Button>
                <Button variant="outline" onClick={handleCancelObjective}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <p>{objective}</p>
              <Button onClick={() => setIsEditingObjective(true)}>Edit</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Board Of Study Academic Years</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddYear} className="mb-4 flex space-x-2">
            <Input placeholder="e.g., 2024-25" value={newYear} onChange={e => setNewYear(e.target.value)} />
            <Button type="submit">Add Year</Button>
          </form>
          {years.map(year => (
            <div key={year} className="mb-1 flex items-center justify-between rounded border p-2">
              <button
                className={`flex-grow text-left ${selectedYear === year ? "font-bold underline" : ""}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteYear(year)}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedYear && (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Constitution Document for {selectedYear}</h3>
            </CardHeader>
            <CardContent>
              {constitutionDoc ? (
                <div className="flex items-center justify-between">
                  <a href={constitutionDoc.pdf} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View Constitution PDF
                  </a>
                  <Button size="sm" variant="destructive" onClick={handleDeleteConstitution}>Delete</Button>
                </div>
              ) : (
                <p>No constitution document uploaded.</p>
              )}
              <input type="file" accept="application/pdf" onChange={e => setConstitutionFile(e.target.files?.[0] ?? null)} />
              <Button onClick={handleUploadConstitution} disabled={uploadingConstitution} className="mt-2">
                {uploadingConstitution ? "Uploading..." : "Upload Constitution PDF"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Meeting Minutes for {selectedYear}</h3>
            </CardHeader>
            <CardContent>
              {meetingMinutes.length > 0 ? (
                <ul className="mb-4">
                  {meetingMinutes.map(({ id, pdf }) => (
                    <li key={id} className="mb-1 flex justify-between rounded border p-2">
                      <a href={pdf} target="_blank" rel="noreferrer" className="text-blue-600 underline">{id}</a>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteMinutes(id)}>Delete</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No meeting minutes uploaded.</p>
              )}
              <Input placeholder="Document ID (e.g., semester-1)" value={newMinutesDocId} onChange={e => setNewMinutesDocId(e.target.value)} className="mb-2" />
              <input type="file" accept="application/pdf" onChange={e => setMinutesFile(e.target.files?.[0] ?? null)} />
              <Button onClick={handleUploadMinutes} disabled={uploadingMinutes} className="mt-2">
                {uploadingMinutes ? "Uploading..." : "Upload Meeting Minutes"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
}
