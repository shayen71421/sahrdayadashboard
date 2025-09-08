"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchCertifications,
  addCertification,
  deleteCertification,
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface Certification {
  id: string;
  name: string;
  provider: string;
  duration: string;
  level: string;
  pdfUrl: string;
}

// Helper for badge color by level
function levelColor(level: string) {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-700";
    case "Intermediate":
      return "bg-blue-100 text-blue-600";
    case "Advanced":
      return "bg-purple-100 text-purple-600";
    case "Professional":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

export default function CertificationsPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchCertifications(departmentId)
      .then(lst => setCerts(lst))
      .catch(() => setError("Failed to load certifications."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!name.trim() || !provider.trim() || !duration.trim() || !level.trim()) {
      setError("All fields except PDF are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addCertification(departmentId, { name, provider, duration, level, pdfFile });
      const lst = await fetchCertifications(departmentId);
      setCerts(lst);
      setName("");
      setProvider("");
      setDuration("");
      setLevel("Beginner");
      setPdfFile(null);
    } catch {
      setError("Failed to add certification.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this certification?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCertification(departmentId, id);
      setCerts(prev => prev.filter(e => e.id !== id));
    } catch {
      setError("Failed to delete certification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      <div className="rounded-xl bg-blue-900 text-white p-6 mb-7">
        <h1 className="text-3xl font-bold mb-2">Certification Programmes</h1>
        <p className="text-md">
          Industry-recognized certification programs for skill enhancement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Certification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3 mb-8 max-w-lg">
            <Input
              placeholder="Certification Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Provider"
              value={provider}
              onChange={e => setProvider(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Duration (e.g., 4 Weeks)"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
              disabled={saving}
            />
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              required
              className="border rounded p-2 w-full"
              disabled={saving}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Professional</option>
            </select>
            <label className="block">
              <span>Attach PDF (optional):</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>Add Certification</Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading certifications...</p>
        ) : certs.length === 0 ? (
          <p className="text-gray-500">No certifications added yet.</p>
        ) : (
          certs.map(c => (
            <Card key={c.id}>
              <CardContent className="flex flex-col md:flex-row md:items-center gap-4 py-4">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-500">
                  {/* Certificate SVG or Emoji */}
                  <span style={{ fontSize: 24 }}>🔖</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold mb-1">{c.name}</div>
                  <div className="flex flex-col md:flex-row md:gap-6 text-sm text-gray-700">
                    <span><b>Provider:</b> {c.provider}</span>
                    <span><b>Duration:</b> {c.duration}</span>
                    <span>
                      <b>Level:</b>{" "}
                      <span className={`inline-block rounded px-2 text-xs font-semibold ${levelColor(c.level)}`}>
                        {c.level}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {c.pdfUrl && (
                    <a
                      href={c.pdfUrl}
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
                    onClick={() => handleDelete(c.id)}
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
