"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchStudentAchievements,
  addStudentAchievement,
  deleteStudentAchievement,
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface StudentAchievement {
  id: string;
  achievementName: string;
  description: string;
  date: string;
  academicYear: string;
  pdfUrl: string;
}

export default function StudentAchievementsPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [achievementName, setAchievementName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [academicYearOptions, setAcademicYearOptions] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    fetchStudentAchievements(departmentId)
      .then(lst => setAchievements(lst))
      .catch(() => setError("Failed to load achievements."))
      .finally(() => setLoading(false));
  }, [departmentId]);

  // Update academic year options when date changes
  function updateAcademicYearOptions(selectedDate: string) {
    if (!selectedDate) {
      setAcademicYearOptions([]);
      setAcademicYear("");
      return;
    }
    const year = new Date(selectedDate).getFullYear();
    if (isNaN(year)) {
      setAcademicYearOptions([]);
      setAcademicYear("");
      return;
    }

    const prevYear = year - 1;
    const nextYear = year + 1;

    const options = [
      `${prevYear}-${year.toString().slice(-2)}`,
      `${year}-${nextYear.toString().slice(-2)}`
    ];

    setAcademicYearOptions(options);

    // Auto-select the current academic year if not already selected or invalid
    if (!options.includes(academicYear)) {
      setAcademicYear(options[1]);
    }
  }

  // Handler for date change (updates date & academic year options)
  function onDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setDate(val);
    updateAcademicYearOptions(val);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    if (
      !achievementName.trim() ||
      !description.trim() ||
      !date.trim() ||
      !academicYear.trim()
    ) {
      setError("All fields except PDF are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addStudentAchievement(departmentId, {
        achievementName,
        description,
        date,
        academicYear,
        pdfFile,
      });
      const lst = await fetchStudentAchievements(departmentId);
      setAchievements(lst);
      setAchievementName("");
      setDescription("");
      setDate("");
      setAcademicYear("");
      setAcademicYearOptions([]);
      setPdfFile(null);
    } catch {
      setError("Failed to add achievement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!departmentId) return;
    if (!confirm("Delete this achievement?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteStudentAchievement(departmentId, id);
      setAchievements(prev => prev.filter(a => a.id !== id));
    } catch {
      setError("Failed to delete achievement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Student Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4 max-w-lg">
            <Input
              placeholder="Achievement Name"
              value={achievementName}
              onChange={e => setAchievementName(e.target.value)}
              required
              disabled={saving}
            />
            <Input
              placeholder="Short Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              disabled={saving}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-semibold">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={onDateChange}
                  required
                  disabled={saving}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-semibold">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  required
                  disabled={saving || academicYearOptions.length === 0}
                  className="w-full border rounded px-3 py-2"
                >
                  {academicYearOptions.map((ay) => (
                    <option key={ay} value={ay}>
                      {ay}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="block">
              <span>Attach PDF (optional):</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={saving}
                className="mt-1"
              />
            </label>
            <Button type="submit" disabled={saving}>
              Add Achievement
            </Button>
            {error && <div className="text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <p className="text-gray-500">No achievements added yet.</p>
        ) : (
          achievements.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="font-bold text-lg mb-1">{a.achievementName}</div>
                <div className="text-gray-700 mb-1">{a.description}</div>
                <div className="text-sm mb-1">
                  <b>Date:</b> {a.date}
                </div>
                <div className="text-sm mb-2">
                  <b>Academic Year:</b> {a.academicYear}
                </div>
                {a.pdfUrl && (
                  <a
                    href={a.pdfUrl}
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
                  className="mt-3"
                  onClick={() => handleDelete(a.id)}
                  disabled={saving}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
