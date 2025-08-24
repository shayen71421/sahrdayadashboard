"use client";

import { useEffect, useState, useContext } from "react";
import {
  getCurriculumPrograms,
  deleteCurriculumProgram,
  updateCurriculumProgramId,
  addCurriculumProgram,
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
        setError(
          "Failed to fetch curriculum programs: " + (err as Error).message
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (departmentId) {
      fetchPrograms();
    } else {
      setLoading(false);
    }
  }, [departmentId]);

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
        setError(
          `Failed to delete program ${programId}: ` + (err as Error).message
        );
        console.error(err);
      }
    }
  };

  const handleEditProgram = (programId: string) => {
    setEditingId(programId);
  };

  const handleSaveEdit = async (oldProgramId: string, newProgramId: string) => {
    if (!departmentId) {
      setError("Department ID not available for update.");
      return;
    }
    if (!newProgramId || newProgramId === oldProgramId) {
      setEditingId(null); // Cancel edit if new ID is empty or same as old
      return;
    }
    try {
      await updateCurriculumProgramId(departmentId, oldProgramId, newProgramId);
      // Refresh the program list after successful update
      const programList = await getCurriculumPrograms(departmentId);
      setPrograms(programList);
      setEditingId(null); // Exit editing mode
    } catch (err) {
      setError(
        `Failed to update program ID from "${oldProgramId}" to "${newProgramId}": ` + (err as Error).message
      );
      console.error(err);
      setEditingId(null); // Exit editing mode on error
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
      // You might want to add a form to get initial data if needed
      const initialData = {}; // Empty initial data for now
      await addCurriculumProgram(departmentId, newProgramId.trim(), initialData);
      setNewProgramId(""); // Clear input
      // Refresh the program list after successful addition
      const programList = await getCurriculumPrograms(departmentId);
      setPrograms(programList);
    } catch (err) {
      setError(`Failed to add program "${newProgramId}": ` + (err as Error).message);
      console.error(err);
    } finally {
      setAddingProgram(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-blue-600 font-semibold">
        Loading curriculum programs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Error: {error}
      </div>
    );
  }

 return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Curriculum & Syllabus –{" "}
        {departmentId ? departmentId.toUpperCase() : "N/A"}
      </h1>

      {programs.length > 0 ? (
 <>
 <div className="mb-6">
 <div className="flex gap-2">
 <input
 type="text"
 placeholder="New Program ID"
 value={newProgramId}
 onChange={(e) => setNewProgramId(e.target.value)}
 className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 disabled={addingProgram}
 />
 <button
 onClick={handleAddProgram}
 className={`px-4 py-2 text-white font-semibold rounded-md transition ${
 addingProgram ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
 }`}
 disabled={addingProgram}
 >
 {addingProgram ? "Adding..." : "Add Program"}
 </button>
 </div>
 {error && !addingProgram && <p className="mt-2 text-sm text-red-500">{error}</p>}
 </div>
 <ul className="space-y-3">
 {programs.map((programId) => (
 <li
 key={programId}
 className="flex justify-between items-center p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
 >
 {editingId === programId ? (
 <input
 type="text"
 defaultValue={programId}
 onBlur={(e) => handleSaveEdit(programId, e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 handleSaveEdit(programId, (e.target as HTMLInputElement).value);
 } else if (e.key === 'Escape') {
 setEditingId(null);
 }
 }}
 autoFocus
 className="font-medium text-gray-700 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
 />
 ) : (
 <span className="font-medium text-gray-700">{programId}</span>
 )}
 <div className="flex space-x-2">
 {editingId !== programId && (
 <button
 onClick={() => handleEditProgram(programId)}
 className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition"
 >Edit</button>
 )}
 {editingId !== programId && (
 <button
 onClick={() => handleDeleteProgram(programId)}
 className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition"
 >
 Delete
 </button>
 )}
 </div>
 </li>
 ))}
 </ul>
 </>
 ) : (
 <>
 <div className="mb-6">
 {/* Add Program Form/Input here as well */}
 {/* This section could be duplicated or a separate component used */}
 {/* from the non-empty state */}
 <div className="flex gap-2">
 <input
 type="text"
 placeholder="New Program ID"
 value={newProgramId}
 onChange={(e) => setNewProgramId(e.target.value)}
 className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 disabled={addingProgram}
 />
 <button
 onClick={handleAddProgram}
 className={`px-4 py-2 text-white font-semibold rounded-md transition ${
 addingProgram ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
 }`}
 disabled={addingProgram}
 >
 {addingProgram ? "Adding..." : "Add Program"}
 </button>
 </div>
 {error && !addingProgram && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
 <p className="text-gray-600">No curriculum programs found.</p>
 </>
      )}
    </div>
  );
};

export default CurriculumSyllabusPage;
