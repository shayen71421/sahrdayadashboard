"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  fetchTlms,
  addTlm,
  updateTlm,
  deleteTlm,
  uploadTlmPdf,
} from "@/utils/department_dashboard_function";

interface TlmItem {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
}

export default function TlmPage() {
  const params = useParams();
  const departmentId = params?.departmentId ?? "";

  const [tlms, setTlms] = useState<TlmItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTlmId, setEditedTlmId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; }
  }, []);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchTlms(departmentId)
      .then(data => {
        if (!mounted.current) return;
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title || "Untitled",
          description: item.description || "",
          pdfUrl: item.pdfUrl || "",
        }));
        setTlms(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load TLM data:", err);
        if (mounted.current) {
          setError("Failed to load TLM data.");
          setLoading(false);
        }
      });
  }, [departmentId]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPdfFile(null);
    setEditedTlmId(null);
    setIsEditing(false);
    setError(null);
  }

  async function handleAddOrSave(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required.");
      return;
    }
    if (!pdfFile && !isEditing) {
      setError("Please select a PDF file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      let pdfUrl = "";
      if (pdfFile) {
        pdfUrl = await uploadTlmPdf(departmentId, pdfFile , title);
      }
      if (isEditing && editedTlmId) {
        await updateTlm(departmentId, editedTlmId, {
          title,
          description,
          ...(pdfUrl ? { pdfUrl } : {})
        });
      } else {
        await addTlm(departmentId, { title, description, pdfUrl });
      }
      const refreshed = await fetchTlms(departmentId);
      if (!mounted.current) return;
      const mapped = refreshed.map((item: any) => ({
        id: item.id,
        title: item.title || "Untitled",
        description: item.description || "",
        pdfUrl: item.pdfUrl || "",
      }));
      setTlms(mapped);
      resetForm();
    } catch (error: any) {
      console.error("Failed to save TLM:", error);
      if (mounted.current) setError("Failed to save TLM: " + (error.message || "Unknown error"));
    } finally {
      if (mounted.current) setUploading(false);
    }
  }

  function editTlm(tlm: TlmItem) {
    setTitle(tlm.title);
    setDescription(tlm.description);
    setEditedTlmId(tlm.id);
    setIsEditing(true);
    setError(null);
  }

  async function removeTlm(id: string) {
    if (!confirm("Are you sure you want to delete this TLM?")) return;
    setLoading(true);
    try {
      await deleteTlm(departmentId, id);
      const refreshed = await fetchTlms(departmentId);
      if (!mounted.current) return;
      const mapped = refreshed.map((item: any) => ({
        id: item.id,
        title: item.title || "Untitled",
        description: item.description || "",
        pdfUrl: item.pdfUrl || "",
      }));
      setTlms(mapped);
    } catch (error: any) {
      console.error("Failed to delete TLM:", error);
      if (mounted.current) setError("Failed to delete TLM: " + (error.message || "Unknown error"));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-3xl">
      <form onSubmit={handleAddOrSave} className="space-y-4">
        <h2 className="text-xl font-semibold">{isEditing ? "Edit TLM" : "Add New TLM"}</h2>
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} disabled={uploading} required />
        <label className="block">
          <textarea 
            placeholder="Description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            disabled={uploading}
            className="w-full p-2 border rounded resize-none h-24"
            required
          />
        </label>
        <label className="block">
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)} 
            disabled={uploading} 
            {...(!isEditing ? { required: true } : {})}
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={uploading}>
            {uploading ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save Changes" : "Add TLM"}
          </Button>
          {isEditing && <Button type="button" onClick={resetForm} disabled={uploading}>Cancel</Button>}
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Existing TLMs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading TLMs...</p>}
          {!loading && tlms.length === 0 && <p>No TLMs found.</p>}
          {!loading && tlms.length > 0 && (
            <ul className="space-y-4">
              {tlms.map(tlm => (
                <li key={tlm.id} className="border p-4 rounded flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{tlm.title}</h3>
                    <p className="mt-1 text-gray-700">{tlm.description}</p>
                    {tlm.pdfUrl && (
                      <a href={tlm.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">
                        View PDF
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => editTlm(tlm)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeTlm(tlm.id)}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
