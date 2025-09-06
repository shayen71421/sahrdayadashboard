"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchAlumni,
  addAlumni,
  deleteAlumni
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface Alumni {
  id: string;
  name: string;
  batch: string;
  position: string;
  company: string;
  photoUrl: string;
}

export default function AlumniNetworkPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchAlumni(departmentId)
      .then(lst => setAlumni(lst))
      .catch(() => setError("Failed to load alumni."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!name.trim() || !batch.trim() || !position.trim() || !company.trim() || !photoFile) {
      setError("All fields, including photo, are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addAlumni(departmentId, { name, batch, position, company, photoFile });
      const lst = await fetchAlumni(departmentId);
      setAlumni(lst);
      setName("");
      setBatch("");
      setPosition("");
      setCompany("");
      setPhotoFile(null);
    } catch {
      setError("Failed to add alumni.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this alumni entry?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteAlumni(departmentId, id);
      setAlumni(prev => prev.filter(a => a.id !== id));
    } catch {
      setError("Failed to delete alumni.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      {/* Add Alumni */}
      <Card>
        <CardHeader>
          <CardTitle>Add Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3 mb-8 max-w-md">
            <Input
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Batch Year (e.g., 2022)"
              value={batch}
              onChange={e => setBatch(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Position"
              value={position}
              onChange={e => setPosition(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Current Company"
              value={company}
              onChange={e => setCompany(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Photo (1:1 preferred)</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhotoFile(e.target.files?.[0] ?? null)}
                required
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>Add Alumni</Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      {/* Alumni Cards */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading alumni...</p>
        ) : alumni.length === 0 ? (
          <p className="text-gray-500">No alumni added yet.</p>
        ) : (
          alumni.map(a => (
            <Card key={a.id} className="flex flex-row items-center p-4 gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {a.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photoUrl} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">[Alumni<br />Photo]</span>
                )}
              </div>
              <div className="flex-grow">
                <div className="font-semibold">
                  {a.name}
                </div>
                <div className="text-sm text-gray-700">
                  Batch: {a.batch}
                </div>
                <div className="text-blue-700 text-sm">
                  {a.position}
                </div>
                <div className="text-gray-700 text-sm">
                  {a.company}
                </div>
              </div>
              <div className="ml-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(a.id)}
                  disabled={saving}
                >Delete</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
