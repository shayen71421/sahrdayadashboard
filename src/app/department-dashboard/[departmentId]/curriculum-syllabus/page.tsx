"use client";

import { useEffect, useState, useContext } from "react";
import {
  getCurriculumPrograms,
  deleteCurriculumProgram,
  updateCurriculumProgramId,
  addCurriculumProgram,
  getCurriculumSchemes,
  addCurriculumScheme,
  deleteCurriculumScheme,
  addCurriculumSemester,
 addCurriculumSubject,
 getCurriculumSubjects,
 deleteCurriculumSubject,
  getCurriculumSemesters,
  deleteCurriculumSemester,
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../layout";

const CurriculumSyllabusPage = () => {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [programs, setPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProgramId, setNewProgramId] = useState<string>("");
  const [addingProgram, setAddingProgram] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [addingScheme, setAddingScheme] = useState(false); 
  const [newSchemeData, setNewSchemeData] = useState({ name: "" });

  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [addingSemester, setAddingSemester] = useState(false);
  const [newSemesterData, setNewSemesterData] = useState({ id: "", name: "" });

  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectData, setNewSubjectData] = useState({ name: "", code: "", credit: "", elective: false });
  const [subjectFile, setSubjectFile] = useState<File | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        if (!departmentId) {
          setError("Department ID not available.");
          return;
        }
        setLoading(true);
        const programList = await getCurriculumPrograms(departmentId);
        setPrograms(programList);
      } catch (err) {
        setError("Failed to fetch curriculum programs: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (departmentId) fetchPrograms();
    else setLoading(false);
  }, [departmentId]);

  useEffect(() => {
    const fetchSchemes = async () => {
      if (!departmentId || !selectedProgramId) {
        setSchemes([]);
        return;
      }
      setLoadingSchemes(true);
      try {
        const schemeList = await getCurriculumSchemes(departmentId, selectedProgramId);
        setSchemes(schemeList);
      } catch (err) {
        setError("Failed to fetch schemes: " + (err as Error).message);
        setSchemes([]);
      } finally {
        setLoadingSchemes(false);
      }
    };

    fetchSchemes();
  }, [departmentId, selectedProgramId]);

  useEffect(() => {
    const fetchSemesters = async () => {
      if (!departmentId || !selectedProgramId || !selectedSchemeId) {
        setSemesters([]);
        return;
      }
      try {
        const semesterList = await getCurriculumSemesters(
          departmentId,
          selectedProgramId,
          selectedSchemeId
        );
        setSemesters(semesterList);
      } catch (err) {
        setError("Failed to fetch semesters: " + (err as Error).message);
        setSemesters([]);
      }
    };
    fetchSemesters();
  }, [departmentId, selectedProgramId, selectedSchemeId]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!departmentId || !selectedProgramId || !selectedSchemeId || !selectedSemesterId) {
        setSubjects([]);
        return;
      }
      setLoadingSubjects(true);
      try {
        const subjectList = await getCurriculumSubjects(
          departmentId,
          selectedProgramId,
          selectedSchemeId,
          selectedSemesterId
        );
        setSubjects(subjectList);
      } catch (err) {
        setError("Failed to fetch subjects: " + (err as Error).message);
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [departmentId, selectedProgramId, selectedSchemeId, selectedSemesterId]);

  const handleDeleteProgram = async (programId: string) => {
    if (!departmentId) {
      setError("Department ID not available for deletion.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${programId}"?`)) {
      try {
        await deleteCurriculumProgram(departmentId, programId);
        setPrograms((prev) => prev.filter((id) => id !== programId));
      } catch (err) {
        setError(`Failed to delete program ${programId}: ` + (err as Error).message);
      }
    }
  };

  const handleEditProgram = (programId: string) => setEditingId(programId);

  const handleSaveEdit = async (oldProgramId: string, newProgramId: string) => {
    if (!departmentId) {
      setError("Department ID not available for update.");
      return;
    }
    if (!newProgramId || newProgramId === oldProgramId) {
      setEditingId(null);
      return;
    }
    try {
      await updateCurriculumProgramId(departmentId, oldProgramId, newProgramId);
      const programList = await getCurriculumPrograms(departmentId);
      setPrograms(programList);
      setEditingId(null);
    } catch (err) {
      setError(`Failed to update program ID: ` + (err as Error).message);
      setEditingId(null);
    }
  };

  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !selectedProgramId) {
      setError("Department or Program ID not available for adding scheme.");
      return;
    }
    const schemeId = newSchemeData.name.trim().replace(/\s+/g, "-"); // Use cleaned name as ID
    if (!schemeId) {
      setError("Scheme name cannot be empty.");
      return;
    }

    // Check if a scheme with this ID already exists
    if (schemes.some((scheme) => scheme.id === schemeId)) {
      setError(`Scheme with ID "${schemeId}" already exists.`);
      return;
    }
    setAddingScheme(true);
    try {
      await addCurriculumScheme(departmentId, selectedProgramId, schemeId, newSchemeData);
      setNewSchemeData({ name: "" });
      const schemeList = await getCurriculumSchemes(departmentId, selectedProgramId);
      setSchemes(schemeList);
    } catch (err) {
      setError(`Failed to add scheme "${newSchemeData.name}": ` + (err as Error).message);
    } finally {
      setAddingScheme(false);
    }
  };

  const handleDeleteScheme = async (schemeId: string) => {
    if (!departmentId || !selectedProgramId) {
      setError("Department or Program ID not available for deletion.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete scheme "${schemeId}"?`)) {
      try {
        await deleteCurriculumScheme(departmentId, selectedProgramId, schemeId);
        const schemeList = await getCurriculumSchemes(departmentId, selectedProgramId);
        setSchemes(schemeList);
      } catch (err) {
        setError(`Failed to delete scheme ${schemeId}: ` + (err as Error).message);
      }
    }
  };

  const handleAddProgram = async () => {
    if (!departmentId) {
      setError("Department ID not available for adding.");
      return;
    }
    if (!newProgramId.trim()) {
      setError("Program ID cannot be empty.");
      return;
    }
    setAddingProgram(true);
    try {
      const initialData = {};
      await addCurriculumProgram(departmentId, newProgramId.trim(), initialData);
      setNewProgramId("");
      const programList = await getCurriculumPrograms(departmentId);
      setPrograms(programList);
    } catch (err) {
      setError(`Failed to add program "${newProgramId}": ` + (err as Error).message);
    } finally {
      setAddingProgram(false);
    }
  };

  const handleProgramClick = (programId: string) => {
    setSelectedProgramId(programId);
    setSchemes([]); 
  };

  const handleSchemeClick = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setSemesters([]);
 setSelectedSemesterId(null); // Reset selected semester when scheme changes
  };

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !selectedProgramId || !selectedSchemeId) {
      setError("Department, Program, or Scheme ID not available for adding semester.");
      return;
    }
    const semesterId = newSemesterData.id.trim().replace(/\s+/g, "-"); // Use cleaned ID
    if (!semesterId) {
      setError("Semester ID cannot be empty.");
      return;
    }

    // Check if a semester with this ID already exists
    if (semesters.some((semester) => semester.id === semesterId)) {
      setError(`Semester with ID "${semesterId}" already exists.`);
      return;
    }

    setAddingSemester(true);
    try {
      await addCurriculumSemester(
        departmentId,
        selectedProgramId,
        selectedSchemeId,
        semesterId,
        newSemesterData
      );
      setNewSemesterData({ id: "", name: "" });
      const semesterList = await getCurriculumSemesters(
        departmentId,
        selectedProgramId,
        selectedSchemeId
      );
      setSemesters(semesterList);
    } catch (err) {
      setError(`Failed to add semester "${newSemesterData.id}": ` + (err as Error).message);
    } finally {
      setAddingSemester(false);
    }
  };

  const handleSemesterClick = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setSubjects([]); // Reset subjects when semester changes
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !selectedProgramId || !selectedSchemeId || !selectedSemesterId) {
      setError("Department, Program, Scheme, or Semester ID not available for adding subject.");
      return;
    }
    if (!newSubjectData.name || !newSubjectData.code || !newSubjectData.credit || !subjectFile) {
      setError("Subject name, code, credit, and file are required.");
      return;
    }

    setAddingSubject(true);
    try {
      await addCurriculumSubject(
        departmentId,
        selectedProgramId,
        selectedSchemeId,
        selectedSemesterId,
        { ...newSubjectData, file: subjectFile }
      );
      setNewSubjectData({ name: "", code: "", credit: "", elective: false });
      setSubjectFile(null);
      const subjectList = await getCurriculumSubjects(
        departmentId,
        selectedProgramId,
        selectedSchemeId,
        selectedSemesterId
      );
      setSubjects(subjectList);
    } catch (err) {
      setError(`Failed to add subject "${newSubjectData.name}": ` + (err as Error).message);
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!departmentId || !selectedProgramId || !selectedSchemeId || !selectedSemesterId) {
      setError("Department, Program, Scheme, or Semester ID not available for deletion.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete this subject?`)) {
      try {
        await deleteCurriculumSubject(
          departmentId,
          selectedProgramId,
          selectedSchemeId,
          selectedSemesterId,
          subjectId
        );
        const subjectList = await getCurriculumSubjects(
          departmentId,
          selectedProgramId,
          selectedSchemeId,
          selectedSemesterId
        );
        setSubjects(subjectList);
      } catch (err) {
        setError("Failed to delete subject: " + (err as Error).message);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-blue-600 font-bold">Loading curriculum programs...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 font-bold">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow text-black">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">
        Curriculum & Syllabus – {departmentId ? departmentId.toUpperCase() : "N/A"}
      </h1>

      {/* Add Program Input */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New Program ID"
          value={newProgramId}
          onChange={(e) => setNewProgramId(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={addingProgram}
        />
        <button
          onClick={handleAddProgram}
          className={`px-4 py-2 font-semibold rounded-md transition text-white ${
            addingProgram ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={addingProgram}
        >
          {addingProgram ? "Adding..." : "Add Program"}
        </button>
      </div>

      {programs.length > 0 ? (
        <ul className="space-y-3">
          {programs.map((programId) => (
            <li
              key={programId}
              className="flex justify-between items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              {editingId === programId ? (
                <input
                  type="text"
                  defaultValue={programId}
                  onBlur={(e) => handleSaveEdit(programId, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(programId, (e.target as HTMLInputElement).value);
                    else if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="font-medium border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <button
                  onClick={() => handleProgramClick(programId)}
                  className={`font-medium ${
                    selectedProgramId === programId ? "text-blue-600 underline" : "text-black hover:underline"
                  }`}
                >
                  {programId}
                </button>
              )}

              <div className="flex space-x-2">
                {editingId !== programId && selectedProgramId !== programId && (
                  <>
                    <button
                      onClick={() => handleEditProgram(programId)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(programId)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No curriculum programs found.</p>
      )}

      {/* Schemes Section */}
      {selectedProgramId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Schemes for {selectedProgramId.toUpperCase()}
          </h2>
          {loadingSchemes ? (
            <div className="text-blue-600">Loading schemes...</div>
          ) : schemes.length > 0 ? (
            <ul className="space-y-2">
              {schemes.map((scheme, index) => (
                <li key={scheme.id} className="flex justify-between items-center p-2 border border-gray-300 rounded-md">
                  <span>{scheme.name}</span>
                  <button
                    onClick={() => handleSchemeClick(scheme.id)}
                    className={`px-3 py-1 text-sm font-semibold rounded text-white ${
                      selectedSchemeId === scheme.id ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
  {selectedSchemeId === scheme.id ? "Selected" : "Select"}
</button>
                  <button
                    onClick={() => handleDeleteScheme(scheme.id)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No schemes found for this program.</p>
          )}

          {/* Add Scheme Form */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Add New Scheme</h3>
            <form onSubmit={handleAddScheme} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Scheme Name (e.g., 2025 - KTU)"
                value={newSchemeData.name}
                onChange={(e) => setNewSchemeData({ ...newSchemeData, name: e.target.value })}
                className="flex-grow px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={addingScheme}
              />
              <button
                type="submit"
                className={`px-4 py-2 font-semibold rounded-md text-white transition ${
                  addingScheme ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={addingScheme}
              >
                {addingScheme ? "Adding..." : "Add Scheme"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Semesters Section */}
      {selectedProgramId && selectedSchemeId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Semesters for {selectedSchemeId.toUpperCase()}
          </h2>
          {semesters.length > 0 ? (
            <ul className="space-y-2">
              {semesters.map((semester) => (
                <li key={semester.id} className={`flex justify-between items-center p-2 border border-gray-300 rounded-md ${selectedSemesterId === semester.id ? 'bg-blue-50' : ''}`}>
                  <button
                    onClick={() => handleSemesterClick(semester.id)}
                    className={`font-medium text-left flex-grow ${selectedSemesterId === semester.id ? "text-blue-600 underline" : "text-black hover:underline"}`}
                  >
                  <span>{semester.name || semester.id}</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete semester "${semester.id}"?`)) {
                        try {
                          await deleteCurriculumSemester(
                            departmentId,
                            selectedProgramId,
                            selectedSchemeId,
                            semester.id
                          );
                          const semesterList = await getCurriculumSemesters(
                            departmentId,
                            selectedProgramId,
                            selectedSchemeId
                          );
                          setSemesters(semesterList);
                        } catch (err) {
                          setError(`Failed to delete semester ${semester.id}: ` + (err as Error).message);
                        }
                      }
                    }}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No semesters found for this scheme.</p>
          )}

          {/* Add Semester Form */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Add New Semester</h3>
 <form onSubmit={handleAddSemester} className="flex items-center gap-3">
 <input
 type="text"
 placeholder="Semester ID (e.g., semester-2)"
 value={newSemesterData.id}
 onChange={(e) => setNewSemesterData({ ...newSemesterData, id: e.target.value })}
 className="flex-grow px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
 disabled={addingSemester}
 />
 <button type="submit" className={`px-4 py-2 font-semibold rounded-md text-white transition ${
 addingSemester ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`} disabled={addingSemester}>
 {addingSemester ? "Adding..." : "Add Semester"}
 </button>
 </form>
          </div>
        </div>
 )}

      {/* Subjects Section */}
      {selectedProgramId && selectedSchemeId && selectedSemesterId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Subjects for {selectedSemesterId.toUpperCase()}
          </h2>
          {loadingSubjects ? (
            <div className="text-blue-600">Loading subjects...</div>
          ) : subjects.length > 0 ? (
            <ul className="space-y-2">
              {subjects.map((subject) => (
                <li key={subject.id} className="flex justify-between items-center p-2 border border-gray-300 rounded-md">
                  <div>
                    <span className="font-semibold">{subject.name} ({subject.code})</span> - {subject.credit} credits {subject.elective && "(Elective)"}
                    {subject.pdfUrl && (
                      <a href={subject.pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-sm">View Syllabus (PDF)</a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No subjects found for this semester.</p>
          )}

          {/* Add Subject Form */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Add New Subject</h3>
            <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubjectData.name}
                onChange={(e) => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
                className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={addingSubject}
              />
              <input
                type="text"
                placeholder="Subject Code"
                value={newSubjectData.code}
                onChange={(e) => setNewSubjectData({ ...newSubjectData, code: e.target.value })}
                className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={addingSubject}
              />
               <input
                type="number"
                placeholder="Credits"
                value={newSubjectData.credit}
                onChange={(e) => setNewSubjectData({ ...newSubjectData, credit: e.target.value })}
                className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={addingSubject}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="elective"
                  checked={newSubjectData.elective}
                  onChange={(e) => setNewSubjectData({ ...newSubjectData, elective: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={addingSubject}
                />
                <label htmlFor="elective" className="text-gray-700">Elective</label>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSubjectFile(e.target.files ? e.target.files[0] : null)}
                className="col-span-2 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={addingSubject}
              />
              <button
                type="submit"
                className={`col-span-2 px-4 py-2 font-semibold rounded-md text-white transition ${
                  addingSubject ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={addingSubject}
              >
                {addingSubject ? "Adding..." : "Add Subject"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CurriculumSyllabusPage;
