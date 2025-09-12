"use client";

import { useContext, useEffect, useState } from "react";
import { DepartmentContext } from "../../layout";
import {
  fetchStudentYears,
  addStudentYear,
  editStudentYear,
  deleteStudentYear,
  addClassWithPDF,
  fetchClassesForYear,
  deleteClass, // Import your deleteClass function for deleting a class
} from "@/utils/department_dashboard_function";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentYear {
  year: string;
}

interface ClassItem {
  id: string;
  name: string;
  pdfLink: string;
}

const StudentsPage = () => {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [studentYears, setStudentYears] = useState<StudentYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newYear, setNewYear] = useState("");
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [editedYearValue, setEditedYearValue] = useState("");

  const [newClassName, setNewClassName] = useState("");
  const [newClassPDF, setNewClassPDF] = useState<File | null>(null);
  const [selectedYearForClass, setSelectedYearForClass] = useState<string>("");

  const [classesByYear, setClassesByYear] = useState<Record<string, ClassItem[]>>({});

  useEffect(() => {
    const loadStudentYearsAndClasses = async () => {
      if (!departmentId) {
        setLoading(false);
        return;
      }

      try {
        const years = await fetchStudentYears(departmentId);
        setStudentYears(years.map((year) => ({ year })));

        const classesMap: Record<string, ClassItem[]> = {};
        await Promise.all(
          years.map(async (year) => {
            // Fix: ensure fetch returns ClassItem[], else process mapping here
            const yearClassesRaw = await fetchClassesForYear(departmentId, year);

            // Defensive check: map to ClassItem[] in case data shape is incomplete
            classesMap[year] = yearClassesRaw.map((item: any) => ({
              id: item.id,
              name: item.name || "Unnamed Class",
              pdfLink: item.pdfLink || "#",
            }));
          })
        );
        setClassesByYear(classesMap);
      } catch {
        setError("Failed to fetch student years or classes.");
      } finally {
        setLoading(false);
      }
    };

    loadStudentYearsAndClasses();
  }, [departmentId]);

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !newYear) return;

    try {
      await addStudentYear(departmentId, newYear);
      setStudentYears([...studentYears, { year: newYear }]);
      setNewYear("");
    } catch {
      setError("Failed to add year.");
    }
  };

  const handleEditYear = async (year: string) => {
    if (!departmentId || !editedYearValue) return;

    try {
      await editStudentYear(departmentId, year, editedYearValue);
      setStudentYears(
        studentYears.map((y) =>
          y.year === year ? { year: editedYearValue } : y
        )
      );
      setEditingYear(null);
      setEditedYearValue("");
    } catch {
      setError("Failed to edit year.");
    }
  };

  const handleDeleteYear = async (year: string) => {
    if (!departmentId) return;

    try {
      await deleteStudentYear(departmentId, year);
      setStudentYears(studentYears.filter((y) => y.year !== year));
      const updatedClasses = { ...classesByYear };
      delete updatedClasses[year];
      setClassesByYear(updatedClasses);
    } catch {
      setError("Failed to delete year.");
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !newClassName || !newClassPDF || !selectedYearForClass) {
      setError("Please provide a year, class name, and a PDF file.");
      return;
    }

    try {
      await addClassWithPDF(departmentId, selectedYearForClass, newClassName, newClassPDF);

      const updatedClasses = await fetchClassesForYear(departmentId, selectedYearForClass);
      // Map again to ClassItem[]
      const mappedClasses = updatedClasses.map((item: any) => ({
        id: item.id,
        name: item.name || "Unnamed Class",
        pdfLink: item.pdfLink || "#",
      }));
      setClassesByYear((prev) => ({
        ...prev,
        [selectedYearForClass]: mappedClasses,
      }));

      setNewClassName("");
      setNewClassPDF(null);
      setSelectedYearForClass("");
      setError(null);
    } catch {
      setError("Failed to add class.");
    }
  };

  // --- New: Delete one class in year
  const handleDeleteClass = async (year: string, classId: string) => {
    if (!departmentId) return;
    try {
      await deleteClass(departmentId, year, classId);

      const updatedClassesRaw = await fetchClassesForYear(departmentId, year);
      const updatedClasses = updatedClassesRaw.map((item: any) => ({
        id: item.id,
        name: item.name || "Unnamed Class",
        pdfLink: item.pdfLink || "#",
      }));

      setClassesByYear((prev) => ({
        ...prev,
        [year]: updatedClasses,
      }));
    } catch {
      setError("Failed to delete class.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Student Years</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Add Year */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Student Year</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddYear} className="flex items-center gap-4">
              <Label htmlFor="new-year" className="sr-only">
                New Year
              </Label>
              <Input
                id="new-year"
                type="text"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="E.g., 2024-2025"
                className="w-full"
              />
              <Button type="submit">Add Year</Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Class */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Class</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="select-year">Select Year</Label>
                <select
                  id="select-year"
                  value={selectedYearForClass}
                  onChange={(e) => setSelectedYearForClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select a Year
                  </option>
                  {studentYears.map(({ year }) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="E.g., Semester 1 or CS-D"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-pdf">Class PDF</Label>
                <Input
                  id="class-pdf"
                  type="file"
                  onChange={(e) =>
                    setNewClassPDF(e.target.files ? e.target.files[0] : null)
                  }
                  accept=".pdf"
                />
              </div>
              <Button type="submit">Add Class</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List by year */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentYears.map(({ year }) => (
          <Card key={year}>
            <CardHeader>
              <CardTitle>{year}</CardTitle>
            </CardHeader>
            <CardContent>
              {editingYear === year ? (
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    value={editedYearValue}
                    onChange={(e) => setEditedYearValue(e.target.value)}
                    className="w-full"
                  />
                  <Button onClick={() => handleEditYear(year)}>Save</Button>
                </div>
              ) : (
                <>
                  <p>Student data for the year {year}.</p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Classes:</h4>
                    {classesByYear[year] && classesByYear[year].length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {classesByYear[year].map(({ id, name, pdfLink }) => (
                          <li key={id} className="flex justify-between items-center">
                            <span>
                              {name} -{" "}
                              <a
                                href={pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                View PDF
                              </a>
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClass(year, id)}
                            >
                              Delete
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No classes found for this year.</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentsPage;
