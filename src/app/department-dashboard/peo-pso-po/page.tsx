"use client";

import { useEffect, useState } from "react";
import {
  getPoPsoPeo,
  removePoPsoPeoItem,
  updatePoPsoPeoItem, // 🔑 add this
} from "../../../utils/department_dashboard_function";
import { DocumentData } from "firebase/firestore";

interface PoPsoPeoData {
  po: string[];
  pso: string[];
  peo: string[];
}

interface EditingItem {
  section: string;
  index: number;
  value: string;
}

export default function PeoPsoPeoPage() {
  const [data, setData] = useState<PoPsoPeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const departmentData = await getPoPsoPeo("cse");
        setData((departmentData[0] as PoPsoPeoData) || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 🔹 Save edited item
  const handleSaveClick = async (
    section: string,
    index: number,
    newValue: string
  ) => {
    if (!data) return;

    try {
      const oldItem = data[section as keyof PoPsoPeoData][index];

      // Assuming deptId="cse", programId="btech"
      await updatePoPsoPeoItem("cse", "btech", section, oldItem, newValue);

      const updatedData = { ...data };
      (updatedData as any)[section][index] = newValue;
      setData(updatedData);
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  // 🔹 Delete item
  const handleDeleteClick = async (
    section: string,
    index: number,
    itemToDelete: string
  ) => {
    if (!data) return;

    try {
      await removePoPsoPeoItem("cse", "btech", section, itemToDelete);

      const updatedData = { ...data };
      (updatedData as any)[section] = (updatedData as any)[section].filter(
        (_: string, i: number) => i !== index
      );
      setData(updatedData);
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  if (loading) return <div style={{ color: "black" }}>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error.message}</div>;

  return (
    <div
      style={{
        backgroundColor: "white",
        color: "black",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <h1 style={{ color: "darkblue", fontSize: "2rem", marginBottom: "1rem" }}>
        PEO, PSO, PO
      </h1>

      {data &&
        (["peo", "pso", "po"] as const).map((section) => (
          <div key={section} style={{ marginBottom: "1rem" }}>
            <h2
              style={{
                color: "darkblue",
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {section.toUpperCase()}
            </h2>
            <ul>
              {data[section].map((item, index) => (
                <li key={index}>
                  {editingItem?.section === section &&
                  editingItem.index === index ? (
                    <>
                      <input
                        type="text"
                        value={editingItem.value}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            value: e.target.value,
                          })
                        }
                        style={{ marginRight: "0.5rem" }}
                      />
                      <button
                        onClick={() =>
                          handleSaveClick(section, index, editingItem.value)
                        }
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={() =>
                          setEditingItem({ section, index, value: item })
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {index + 1}. {item}
                      </span>
                      <button
                        onClick={() =>
                          handleDeleteClick(section, index, item)
                        }
                        style={{ marginLeft: "0.5rem", color: "red" }}
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
