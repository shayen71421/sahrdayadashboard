"use client";

import { useEffect, useState, useContext } from "react";
import {
  getPoPsoPeo,
  removePoPsoPeoItem,
  updatePoPsoPeoItem,
 addPoPsoPeoItem,
} from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../layout";

interface PoPsoPeoData {
  po: string[];
  pso: string[];
  peo: string[];
}

interface EditingItem {
  section: keyof PoPsoPeoData;
  index: number;
  value: string;
}

export default function PeoPsoPeoPage() {
  const [data, setData] = useState<PoPsoPeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
 const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const departmentContext = useContext(DepartmentContext);

  const departmentId = departmentContext?.departmentId;
  if (!departmentId) {
 return <div className="text-gray-700">Loading department data...</div>;
  }

  // ✅ Fetch once
 useEffect(() => {
    async function fetchData() {
      try {
 const departmentData = await getPoPsoPeo(departmentId);
        setData((departmentData[0] as PoPsoPeoData) || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
 fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  // ✅ Save edits or new item
  const handleSaveClick = async (
    section: keyof PoPsoPeoData,
    index: number,
    newValue: string
  ) => {
    if (!data) return;

    try {
      if (index === data[section].length - 1 && data[section][index] === "") {
        // Adding new item
 await addPoPsoPeoItem(departmentId, "btech", section, newValue);
      } else {
        const oldItem = data[section][index];
        if (oldItem !== newValue) {
          await updatePoPsoPeoItem("cse", "btech", section, oldItem, newValue);
        }
      }

      // ✅ Update state immutably
      setData((prev) =>
        prev
          ? {
              ...prev,
              [section]: prev[section].map((val, i) =>
                i === index ? newValue : val
              ),
            }
          : prev
      );

      setEditingItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  // ✅ Delete functionality
  const handleDeleteClick = async (
    section: keyof PoPsoPeoData,
    index: number,
    itemToDelete: string
  ) => {
    if (!data) return;

    try {
      await removePoPsoPeoItem(departmentId, "btech", section, itemToDelete);

      setData((prev) =>
        prev
          ? {
              ...prev,
              [section]: prev[section].filter((_, i) => i !== index),
            }
          : prev
      );
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // ✅ Add new item placeholder
  const handleAddItem = (section: keyof PoPsoPeoData) => {
    if (!data) return;

    setData((prev) =>
      prev
        ? {
            ...prev,
            [section]: [...prev[section], ""], // add empty string
          }
        : prev
    );

    setEditingItem({
      section,
      index: data[section].length,
      value: "",
    });
  };

  if (loading)
    return <div className="text-gray-700 text-lg">Loading...</div>;
  if (error)
    return <div className="text-red-600 text-lg">Error: {error.message}</div>;

  return (
    <div className="bg-white text-gray-800 min-h-screen p-6 rounded-md shadow">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">PEO, PSO, PO</h1>

      {data &&
        (["peo", "pso", "po"] as const).map((section) => (
          <div key={section} className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">
              {section.toUpperCase()}
              <button
                onClick={() => handleAddItem(section)}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add New
              </button>
            </h2>

            <ul className="space-y-3">
              {data[section].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition"
                >
                  {editingItem?.section === section &&
                  editingItem.index === index ? (
                    <div className="flex items-center w-full space-x-2">
                      <input
                        type="text"
                        value={editingItem.value}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            value: e.target.value,
                          })
                        }
                        className="flex-1 border rounded-md px-2 py-1"
                      />
                      <button
                        onClick={() =>
                          handleSaveClick(section, index, editingItem.value)
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        onClick={() =>
                          setEditingItem({ section, index, value: item })
                        }
                        className="flex-1 cursor-pointer"
                      >
                        {index + 1}. {item || <em>(Empty)</em>}
                      </span>
                      <button
                        onClick={() =>
                          handleDeleteClick(section, index, item)
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
