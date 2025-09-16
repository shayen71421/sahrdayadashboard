"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchMous,
  addMou,
  deleteMou,
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface MouEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  focus: string;
  scope: string;
  benefits: string;
  pdfUrl: string;
}

export default function MouPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [mous, setMous] = useState<MouEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const [scope, setScope] = useState("");
  const [benefits, setBenefits] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchMous(departmentId)
      .then(lst => setMous(lst))
      .catch(() => setError("Failed to load MoUs."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!title.trim() || !description.trim() || !date.trim() || !focus.trim() || !scope.trim() || !benefits.trim()) {
      setError("All fields except PDF are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addMou(departmentId, { title, description, date, focus, scope, benefits, pdfFile });
      const lst = await fetchMous(departmentId);
      setMous(lst);
      setTitle("");
      setDescription("");
      setDate("");
      setFocus("");
      setScope("");
      setBenefits("");
      setPdfFile(null);
    } catch {
      setError("Failed to add MoU.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this MoU?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteMou(departmentId, id);
      setMous(prev => prev.filter(m => m.id !== id));
    } catch {
      setError("Failed to delete MoU.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add MoU</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3 mb-8 max-w-md">
            <Input
              placeholder="Title (e.g., MoU with Keltron)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Sub-description (e.g., Keltron partnership for hardware training)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Date of MoU:</span>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                disabled={saving}
              />
            </label>
            <Input
              placeholder="Focus (e.g., Hardware Training & Development)"
              value={focus}
              onChange={e => setFocus(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Scope (e.g., Student Skill Enhancement)"
              value={scope}
              onChange={e => setScope(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Benefits (e.g., Industry Exposure & Practical Training)"
              value={benefits}
              onChange={e => setBenefits(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Attach MoU PDF (optional):</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>Add MoU</Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading MoUs...</p>
        ) : mous.length === 0 ? (
          <p className="text-gray-500">No MoUs added yet.</p>
        ) : (
          mous.map(mou => (
            <Card key={mou.id}>
              <CardContent className="py-5 px-6">
                <div className="font-bold text-lg mb-1">{mou.title}</div>
                <div className="text-gray-700 mb-2">{mou.description}</div>
                <div className="mb-2"><b>Date:</b> {mou.date}</div>
                <div className="mb-1"><b>Focus:</b> {mou.focus}</div>
                <div className="mb-1"><b>Scope:</b> {mou.scope}</div>
                <div className="mb-2"><b>Benefits:</b> {mou.benefits}</div>
                <div className="flex items-center gap-5">
                  {mou.pdfUrl && (
                    <a href={mou.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      View PDF
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(mou.id)}
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
