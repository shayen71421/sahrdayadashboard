"use client";

import { useState, useEffect, useContext, FormEvent, ChangeEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchWorkshopsSeminars,
  addWorkshopSeminar,
  deleteWorkshopSeminar,
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface WorkshopSeminar {
  id: string;
  title: string;
  type: string;
  date: string;
  speaker: string;
  topic: string;
  pdfUrl: string;
}

export default function WorkshopsSeminarsPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [entries, setEntries] = useState<WorkshopSeminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Workshop");
  const [date, setDate] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [topic, setTopic] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchWorkshopsSeminars(departmentId)
      .then(lst => setEntries(lst))
      .catch(() => setError("Failed to load workshops & seminars."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!title.trim() || !date.trim() || !speaker.trim() || !topic.trim()) {
      setError("All fields except PDF are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addWorkshopSeminar(departmentId, { title, type, date, speaker, topic, pdfFile });
      const lst = await fetchWorkshopsSeminars(departmentId);
      setEntries(lst);
      setTitle("");
      setType("Workshop");
      setDate("");
      setSpeaker("");
      setTopic("");
      setPdfFile(null);
    } catch {
      setError("Failed to add entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this entry?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteWorkshopSeminar(departmentId, id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      setError("Failed to delete entry.");
    } finally {
      setSaving(false);
    }
  }

  function badgeColor(type: string) {
    return type === "Seminar"
      ? "bg-purple-100 text-purple-700"
      : "bg-green-100 text-green-700";
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <div className="rounded-xl bg-blue-900 text-white p-6 mb-7">
        <h1 className="text-3xl font-bold mb-2">Workshops & Seminars</h1>
        <p className="text-md">
          Knowledge sharing sessions and skill development workshops
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Workshop/Seminar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3 mb-8 max-w-lg">
            <Input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={saving}
            />
            <div className="flex gap-4">
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                required
                className="border rounded p-2"
                disabled={saving}
              >
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
              </select>
              <Input
                placeholder="Date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <Input
              placeholder="Speaker Name"
              value={speaker}
              onChange={e => setSpeaker(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Attach PDF (optional):</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>Add</Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-500">No workshops or seminars added yet.</p>
        ) : (
          entries.map(e => (
            <Card key={e.id}>
              <CardContent className="flex flex-col gap-2 md:flex-row md:items-center py-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{e.title}</span>
                    <span className={`text-xs px-2 rounded-lg font-semibold ${badgeColor(e.type)}`}>{e.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-8 text-gray-700 text-sm">
                    <span>
                      <b>Date:</b> {e.date}
                    </span>
                    <span>
                      <b>Speaker:</b> {e.speaker}
                    </span>
                    <span>
                      <b>Topic:</b> {e.topic}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-3 text-right">
                  {e.pdfUrl && (
                    <a
                      href={e.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View PDF
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(e.id)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
