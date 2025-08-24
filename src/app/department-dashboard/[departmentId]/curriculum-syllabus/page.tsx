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
    // Use the scheme name as the scheme ID for now, you can change this logic
    // if you want a different ID based on user input
    const schemeId = newSchemeData.name.trim();
    if (!schemeId) {
      setError("Scheme ID (based on name) cannot be empty.");
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

  if (loading) {
    return <div className="p-6 text-center text-blue-400 font-bold">Loading curriculum programs...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-400 font-bold">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-6">
        Curriculum & Syllabus – {departmentId ? departmentId.toUpperCase() : "N/A"}
      </h1>

      {/* Add Program Input */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New Program ID"
          value={newProgramId}
          onChange={(e) => setNewProgramId(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={addingProgram}
        />
        <button
          onClick={handleAddProgram}
          className={`px-4 py-2 font-semibold rounded-md transition ${
            addingProgram ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
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
              className="flex justify-between items-center p-3 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
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
                  className="font-medium border border-blue-500 bg-gray-900 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <button
                  onClick={() => handleProgramClick(programId)}
                  className={`font-medium ${
                    selectedProgramId === programId ? "text-blue-400 underline" : "text-white hover:underline"
                  }`}
                >
                  {programId}
                </button>
              )}

              <div className="flex space-x-2">
                {editingId !== programId && (
                  <>
                    <button
                      onClick={() => handleEditProgram(programId)}
                      className="px-3 py-1 bg-blue-600 text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(programId)}
                      className="px-3 py-1 bg-red-600 text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleProgramClick(programId)}
                      className={`px-3 py-1 text-sm font-semibold rounded ${
                        selectedProgramId === programId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    >
                      {selectedProgramId === programId ? "Selected" : "Select"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No curriculum programs found.</p>
      )}

      {/* Schemes Section */}
      {selectedProgramId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Schemes for {selectedProgramId.toUpperCase()}
          </h2>
          {loadingSchemes ? (
            <div className="text-blue-400">Loading schemes...</div>
          ) : schemes.length > 0 ? (
            <ul className="space-y-2">
              {schemes.map((scheme, index) => (
                <li key={index} className="p-2 border border-gray-700 bg-gray-800 rounded-md">
                  {JSON.stringify(scheme)}
                  <button
                    onClick={() => handleDeleteScheme(scheme.id)} // Assuming scheme object has an 'id' property
                    className="ml-4 px-3 py-1 bg-red-600 text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </li>

              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No schemes found for this program.</p>
          )}

          {/* Add Scheme Form */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Add New Scheme</h3>
            <form onSubmit={handleAddScheme} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Scheme ID (e.g., KTU)"
                // You might want a separate state for a descriptive name if the ID is short
                value={newSchemeData.name}
                onChange={(e) => setNewSchemeData({ ...newSchemeData, name: e.target.value })}
                className="flex-grow px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={addingScheme}
              />
              <button
                type="submit"
                className={`px-4 py-2 font-semibold rounded-md transition ${
                  addingScheme ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"
                }`}
                disabled={addingScheme}
              >
                {addingScheme ? "Adding..." : "Add Scheme"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumSyllabusPage;
