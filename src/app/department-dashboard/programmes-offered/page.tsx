"use client";

import { useEffect, useState } from "react";
import {
  addProgram,
  getProgrammesOffered,
  getProgramDetails,
} from "../../../utils/department_dashboard_function";

interface Programme {
  id: string;
  mainText?: string;
  cardTitle?: string[];
  cardText?: string[];
}

export default function ProgrammesOfferedPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newProgramId, setNewProgramId] = useState("");
  const [showAddProgramInput, setShowAddProgramInput] = useState(false);

  useEffect(() => {
    async function fetchProgrammes() {
      try {
        const programmesData = await getProgrammesOffered("cse"); // departmentId hardcoded for now
        setProgrammes(programmesData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchProgrammes();
  }, []);

  const handleProgramSelect = async (programId: string) => {
    try {
      setLoading(true);
      const programDetails = await getProgramDetails("cse", programId);
      setSelectedProgram(programDetails);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async () => {
    if (!newProgramId.trim()) return;
    try {
      await addProgram("cse", newProgramId); // 🔑 Pass deptId + programId
      setNewProgramId("");
      setShowAddProgramInput(false);
      const programmesData = await getProgrammesOffered("cse");
      setProgrammes(programmesData);
    } catch (err) {
      setError(err as Error);
    }
  };

  if (loading) return <div className="text-gray-700">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="bg-white text-gray-800 min-h-screen p-6 rounded-md shadow">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Programmes Offered
      </h1>

      {/* Programmes List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">
          Select a Programme:
        </h2>
        <ul className="space-y-2">
          {programmes.map((program) => (
            <li
              key={program.id}
              onClick={() => handleProgramSelect(program.id)}
              className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              {program.id}
            </li>
          ))}
        </ul>

        {/* Add new program toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowAddProgramInput(!showAddProgramInput)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAddProgramInput ? "Cancel" : "Add New Programme"}
          </button>
        </div>

        {/* Add new program form */}
        {showAddProgramInput && (
          <div className="mt-3 flex space-x-2">
            <input
              type="text"
              placeholder="Enter new program ID"
              value={newProgramId}
              onChange={(e) => setNewProgramId(e.target.value)}
              className="border rounded px-3 py-1 flex-1"
            />
            <button
              onClick={handleAddProgram}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create
            </button>
          </div>
        )}
      </div>

      {/* Selected Programme Details */}
      {selectedProgram && (
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Details for {selectedProgram.id}
          </h2>

          {/* Main Text */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-blue-700 mb-2">
              Main Text:
            </h3>
            <p className="bg-gray-50 p-3 rounded">
              {selectedProgram.mainText || "No main text available"}
            </p>
          </div>

          {/* Cards */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-blue-700 mb-2">Cards:</h3>
            {selectedProgram.cardTitle?.length ? (
              selectedProgram.cardTitle.map((title, index) => (
                <div
                  key={index}
                  className="border p-3 rounded mb-2 bg-gray-50"
                >
                  <h4 className="font-semibold">{title}</h4>
                  <p>{selectedProgram.cardText?.[index]}</p>
                </div>
              ))
            ) : (
              <p>No cards available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
