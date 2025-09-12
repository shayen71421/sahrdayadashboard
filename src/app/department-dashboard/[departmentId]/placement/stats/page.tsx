"use client";

import { useState, useEffect, useContext, FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  fetchPlacementOverview,
  updatePlacementOverview,
  fetchPlacementYears,
  addPlacementYear,
  deletePlacementYear,
  uploadStatsPdf
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface YearStat {
  id: string;
  academicYear: string;
  studentsPlaced: string;
  placementPercent: string;
  topRecruiters: string;
  pdfUrl?: string;
}

export default function PlacementStatsPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [averageRate, setAverageRate] = useState("");
  const [highestPackage, setHighestPackage] = useState("");
  const [companiesVisited, setCompaniesVisited] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [years, setYears] = useState<YearStat[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);

  const [newYear, setNewYear] = useState("");
  const [studentsPlaced, setStudentsPlaced] = useState("");
  const [placementPercent, setPlacementPercent] = useState("");
  const [topRecruiters, setTopRecruiters] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setOverviewLoading(true);
    fetchPlacementOverview(departmentId)
      .then((data) => {
        setAverageRate(data.averageRate ?? "");
        setHighestPackage(data.highestPackage ?? "");
        setCompaniesVisited(data.companiesVisited ?? "");
      })
      .catch(() => setError("Failed to load overview"))
      .finally(() => setOverviewLoading(false));
  }, [departmentId]);

  useEffect(() => {
    if (!departmentId) return;
    loadYears();
  }, [departmentId]);

  async function loadYears() {
    if (!departmentId) return;
    setLoadingYears(true);
    try {
      const fetched = await fetchPlacementYears(departmentId);
      const mapped = fetched.map((item: any) => ({
        id: item.id,
        academicYear: item.academicYear ?? "",
        studentsPlaced: item.studentsPlaced ?? "",
        placementPercent: item.placementPercent ?? "",
        topRecruiters: item.topRecruiters ?? "",
        pdfUrl: item.pdfUrl ?? "",
      }));
      setYears(mapped);
    } catch {
      setError("Failed to load years");
    } finally {
      setLoadingYears(false);
    }
  }

  async function handleUpdateOverview(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    setSaving(true);
    setError(null);
    try {
      await updatePlacementOverview(departmentId, {
        averageRate,
        highestPackage,
        companiesVisited,
      });
      alert("Overview updated!");
    } catch (err: any) {
      console.error("Update error:", err);
      setError("Failed to update overview: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddYear(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (!newYear.trim()) {
      setError("Academic year is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let pdfUrl = "";
      if (pdfFile) {
        pdfUrl = await uploadStatsPdf(departmentId, newYear.trim(), pdfFile);
      }
      await addPlacementYear(departmentId, {
        academicYear: newYear.trim(),
        studentsPlaced: studentsPlaced.trim(),
        placementPercent: placementPercent.trim(),
        topRecruiters: topRecruiters.trim(),
        pdfUrl,
      });
      await loadYears();
      setNewYear("");
      setStudentsPlaced("");
      setPlacementPercent("");
      setTopRecruiters("");
      setPdfFile(null);
    } catch (err: any) {
      console.error("Add year error:", err);
      setError("Failed to add year: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteYear(id: string) {
    console.log("Delete clicked for ID:", id);  // ADD THIS
    if (!confirm("Delete this year's data?")) return;
  
    if (!departmentId) {
      console.warn("No departmentId available");
      return;
    }
  
    setSaving(true);
    setError(null);
  
    try {
      await deletePlacementYear(departmentId, id);
      console.log("Deleted year ID:", id);
      await loadYears();
    } catch (err) {
      console.error("Error deleting year:", err);
      setError("Failed to delete year: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }
  

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Placement Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {overviewLoading ? (
            <p>Loading overview...</p>
          ) : (
            <form onSubmit={handleUpdateOverview} className="space-y-4 max-w-xl">
              <label className="block font-semibold mb-1">Average Placement Rate</label>
              <Input
                placeholder="e.g. 92%"
                value={averageRate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAverageRate(e.target.value)}
              />
              <label className="block font-semibold mb-1">Highest Package</label>
              <Input
                placeholder="e.g. ₹16 LPA"
                value={highestPackage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setHighestPackage(e.target.value)}
              />
              <label className="block font-semibold mb-1">Companies Visited</label>
              <Input
                placeholder="e.g. 48"
                value={companiesVisited}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompaniesVisited(e.target.value)}
              />
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Update Overview"}
              </Button>
              {error && <p className="text-red-600">{error}</p>}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Year-wise Section */}
      <Card>
        <CardHeader>
          <CardTitle>Year-wise Placement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddYear} className="space-y-2 mb-6 max-w-xl">
            <Input
              placeholder="Academic Year"
              value={newYear}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewYear(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Students Placed"
              value={studentsPlaced}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setStudentsPlaced(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Placement %"
              value={placementPercent}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPlacementPercent(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Top Recruiters"
              value={topRecruiters}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTopRecruiters(e.target.value)}
              required
              disabled={saving}
            />
            <label className="block">
              <span>Year PDF (optional)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={saving}
              />
            </label>
            <Button type="submit" disabled={saving}>
              Add Year
            </Button>
            {error && <p className="text-red-600">{error}</p>}
          </form>

          {loadingYears ? (
            <p>Loading year-wise stats...</p>
          ) : (
            <table className="min-w-full border text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th>Academic Year</th>
                  <th>Students Placed</th>
                  <th>Placement %</th>
                  <th>Top Recruiters</th>
                  <th>PDF</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year) => (
                  <tr key={year.id}>
                    <td>{year.academicYear}</td>
                    <td>{year.studentsPlaced}</td>
                    <td>{year.placementPercent}</td>
                    <td>{year.topRecruiters}</td>
                    <td>
                      {year.pdfUrl && (
                        <a href={year.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          View PDF
                        </a>
                      )}
                    </td>
                    <td>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteYear(year.id)} disabled={saving}>
  Delete
</Button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
