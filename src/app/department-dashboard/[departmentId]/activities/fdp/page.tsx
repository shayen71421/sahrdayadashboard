"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchFDPs,
  addFDP,
  deleteFDP
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

// FDP Type
interface FDP {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string;
  pdfUrl: string;
}

export default function FDPPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [fdps, setFdps] = useState<FDP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [participants, setParticipants] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchFDPs(departmentId)
      .then((lst) => setFdps(lst))
      .catch(() => setError("Failed to load FDPs."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!title.trim() || !date.trim() || !duration.trim() || !participants.trim()) {
      setError("All fields except PDF are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addFDP(departmentId, {
        title,
        date,
        duration,
        participants,
        pdfFile,
      });
      const lst = await fetchFDPs(departmentId);
      setFdps(lst);
      setTitle("");
      setDate("");
      setDuration("");
      setParticipants("");
      setPdfFile(null);
    } catch (err) {
      setError("Failed to add FDP.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this FDP entry?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteFDP(departmentId, id);
      setFdps(f => f.filter(fd => fd.id !== id));
    } catch {
      setError("Failed to delete FDP.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Faculty Development Programme</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3 mb-8 max-w-lg">
            <Input
              placeholder="FDP Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Date (e.g., 2025-10-12)"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Duration (e.g., 5 Days)"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Participants Count"
              type="number"
              value={participants}
              onChange={e => setParticipants(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Attach PDF Report (optional):</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>Add FDP</Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading FDPs...</p>
        ) : fdps.length === 0 ? (
          <p className="text-gray-500">No FDPs added yet.</p>
        ) : (
          fdps.map(fdp => (
            <Card key={fdp.id}>
              <CardContent className="flex flex-row items-center gap-5 py-3">
                <div className="flex items-center justify-center text-3xl text-blue-500">
                  <span role="img" aria-label="FDP">
                    🎓
                  </span>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <div className="font-bold mb-1">{fdp.title}</div>
                    <div className="text-gray-700 text-sm mb-1">Date: <span className="font-medium">{fdp.date}</span></div>
                    <div className="text-gray-700 text-sm mb-1">Duration: <span className="font-medium">{fdp.duration}</span></div>
                    <div className="text-gray-700 text-sm">Participants: <span className="font-medium">{fdp.participants}</span></div>
                  </div>
                  <div className="flex flex-col gap-2 justify-end text-right">
                    {fdp.pdfUrl && (
                      <a href={fdp.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        View PDF
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(fdp.id)}
                      disabled={saving}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
