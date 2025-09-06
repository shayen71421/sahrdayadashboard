"use client";

import { useState, useEffect, useContext, FormEvent, ChangeEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchIndustryPartners,
  addIndustryPartner,
  deleteIndustryPartner
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout"; // Adjust path if needed

interface IndustryPartner {
  id: string;
  name: string;
  sector: string;
  role: string;
  logoUrl: string;
}

export default function IndustryPartnersPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [partners, setPartners] = useState<IndustryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add partner form
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [role, setRole] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchIndustryPartners(departmentId)
      .then(lst => setPartners(lst))
      .catch(() => setError("Failed to load industry partners."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!name.trim() || !sector.trim() || !role.trim() || !logoFile) {
      setError("All fields, including logo, are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addIndustryPartner(departmentId, { name, sector, role, logoFile });
      const lst = await fetchIndustryPartners(departmentId);
      setPartners(lst);
      setName("");
      setSector("");
      setRole("");
      setLogoFile(null);
    } catch {
      setError("Failed to add partner.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this partner?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteIndustryPartner(departmentId, id);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch {
      setError("Failed to delete partner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Add Partner Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Industry Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3 mb-8 max-w-md">
            <Input
              placeholder="Company Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Sector (e.g., IT Services, Core Engg.)"
              value={sector}
              onChange={e => setSector(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Role (e.g., Placement & Training)"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Logo (1:1 recommended)</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => setLogoFile(e.target.files?.[0] ?? null)}
                required
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>Add Partner</Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      {/* Partner Cards */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        {loading ? (
          <p className="text-gray-500">Loading partners...</p>
        ) : (
          partners.length === 0 ? (
            <p className="text-gray-500">No industry partners added yet.</p>
          ) : (
            partners.map((p) => (
              <Card key={p.id} className="flex flex-col items-center py-8">
                <div className="w-20 h-20 mb-2 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt={p.name} className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-gray-400 text-xs">[Logo]</span>
                  )}
                </div>
                <div className="font-semibold text-lg mb-1">{p.name}</div>
                <div className="text-sm text-gray-500 mb-1">{p.sector}</div>
                <div className="text-sm text-blue-700">{p.role}</div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-4"
                  onClick={() => handleDelete(p.id)}
                  disabled={saving}
                >
                  Delete
                </Button>
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
}
