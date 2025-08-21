"use client";

import { useEffect, useState } from "react";
import {
  addProgram,
  getProgrammesOffered,
  addProgramCard,
  getProgramDetails,
  updateProgramMainText,
  deleteProgram,
  deleteProgramCard,
  updateProgramCard,
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
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingMainText, setEditingMainText] = useState("");
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [editingCardTitle, setEditingCardTitle] = useState("");
  const [editingCardText, setEditingCardText] = useState("");
  const [showAddCardInputForProgramId, setShowAddCardInputForProgramId] =
    useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardText, setNewCardText] = useState("");

  useEffect(() => {
    async function fetchProgrammes() {
      try {
        const programmesData = await getProgrammesOffered("cse");
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
      await addProgram("cse", newProgramId);
      setNewProgramId("");
      setShowAddProgramInput(false);
      const programmesData = await getProgrammesOffered("cse");
      setProgrammes(programmesData);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleSaveMainText = async () => {
    if (!editingProgramId) return;
    try {
      await updateProgramMainText("cse", editingProgramId, editingMainText);
      setEditingProgramId(null);
      setEditingMainText("");
      const programmesData = await getProgrammesOffered("cse");
      setProgrammes(programmesData);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleSaveCard = async () => {
    if (!editingProgramId || editingCardIndex === null) return;
    try {
      await updateProgramCard(
        "cse",
        editingProgramId,
        editingCardIndex,
        editingCardTitle,
        editingCardText
      );
      setEditingProgramId(null);
      setEditingCardIndex(null);
      setEditingCardTitle("");
      setEditingCardText("");
      const programmesData = await getProgrammesOffered("cse");
      setProgrammes(programmesData);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleAddCard = async (programId: string) => {
    if (!newCardTitle.trim() || !newCardText.trim()) return;
    try {
      await addProgramCard("cse", programId, newCardTitle, newCardText);
      const programDetails = await getProgramDetails("cse", programId);
      setSelectedProgram(programDetails);
      const programmesData = await getProgrammesOffered("cse");
      setProgrammes(programmesData);

      // reset form
      setShowAddCardInputForProgramId(null);
      setNewCardTitle("");
      setNewCardText("");
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (window.confirm(`Are you sure you want to delete program ${programId}?`)) {
      await deleteProgram("cse", programId);
      const programmesData = await getProgrammesOffered("cse");
      setProgrammes(programmesData);
      setSelectedProgram(null);
    }
  };

  const handleDeleteCard = async (programId: string, cardIndex: number) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      await deleteProgramCard("cse", programId, cardIndex);
      await handleProgramSelect(programId);
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
              className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              <span
                onClick={() => handleProgramSelect(program.id)}
                className="cursor-pointer flex-grow"
              >
                {program.id}
              </span>
              <button
                onClick={() => handleDeleteProgram(program.id)}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
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
            {editingProgramId === selectedProgram.id &&
            editingCardIndex === null ? (
              <div className="flex flex-col space-y-2">
                <textarea
                  value={editingMainText}
                  onChange={(e) => setEditingMainText(e.target.value)}
                  className="border rounded px-3 py-2 h-32"
                />
                <button
                  onClick={handleSaveMainText}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 self-start"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <p className="flex-grow">
                  {selectedProgram.mainText || "No main text available"}
                </p>
                <button
                  onClick={() => {
                    setEditingProgramId(selectedProgram.id);
                    setEditingMainText(selectedProgram.mainText || "");
                  }}
                  className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
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
                  {editingProgramId === selectedProgram.id &&
                  editingCardIndex === index ? (
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        value={editingCardTitle}
                        onChange={(e) => setEditingCardTitle(e.target.value)}
                        className="border rounded px-3 py-1 font-semibold"
                      />
                      <textarea
                        value={editingCardText}
                        onChange={(e) => setEditingCardText(e.target.value)}
                        className="border rounded px-3 py-2 h-20"
                      />
                      <button
                        onClick={handleSaveCard}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 self-start"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{title}</h4>
                        <p>{selectedProgram.cardText?.[index]}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProgramId(selectedProgram.id);
                          setEditingCardIndex(index);
                          setEditingCardTitle(title);
                          setEditingCardText(
                            selectedProgram.cardText?.[index] || ""
                          );
                        }}
                        className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteCard(selectedProgram.id, index)
                        }
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No cards available</p>
            )}
          </div>

          {/* Add new card button */}
          <button
            onClick={() =>
              setShowAddCardInputForProgramId(
                showAddCardInputForProgramId === selectedProgram.id
                  ? null
                  : selectedProgram.id
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAddCardInputForProgramId === selectedProgram.id
              ? "Cancel"
              : "Add Card"}
          </button>

          {/* Add new card form */}
          {showAddCardInputForProgramId === selectedProgram.id && (
            <div className="mt-3 flex flex-col space-y-2">
              <input
                type="text"
                placeholder="New Card Title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="border rounded px-3 py-1"
              />
              <textarea
                placeholder="New Card Text"
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                className="border rounded px-3 py-2 h-20"
              />
              <button
                onClick={() => handleAddCard(selectedProgram.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 self-start"
              >
                Create Card
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
