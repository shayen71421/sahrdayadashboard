"use client";

import { useEffect, useState, useCallback, useContext } from "react";
import {
  getLabs,
  deleteLab,
  addLab,
  updateLabData,
} from "@/utils/department_dashboard_function";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import { DepartmentContext } from "../../layout";

interface Lab {
  id: string;
  data: string[];
}

const LabsPage = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const showMessage = (type: "success" | "error", text: string) => {
    if (!departmentId) return;
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateLabData = useCallback(
    async (labId: string, updatedData: string[]) => {
      try {
        await updateLabData(departmentId, labId, updatedData);
        showMessage("success", `Lab "${labId}" updated successfully`);
      } catch (error) {
        showMessage("error", `Error updating lab "${labId}"`);
        console.error(error);
      }
    },
    [departmentId]
  );

  const fetchLabs = useCallback(async () => {
    try {
      const labsData = await getLabs(departmentId);
      setLabs(Array.isArray(labsData) ? (labsData as Lab[]) : []);
    } catch (error) {
      showMessage("error", "Error fetching labs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    if (!departmentId) {
      setLoading(false);
      return;
    }
    fetchLabs();
  }, [fetchLabs]);

  const handleAddLabClick = async () => {
    const labName = window.prompt("Enter the name for the new lab:");
    if (labName?.trim()) {
      try {
        await addLab(departmentId, labName);
        await fetchLabs();
        showMessage("success", `Lab "${labName}" added successfully`);
      } catch (error) {
        showMessage("error", "Error adding lab");
        console.error(error);
      }
    }
  };

  const handleDeleteLab = async (labId: string) => {
    if (window.confirm("Are you sure you want to delete this lab?")) {
      try {
        await deleteLab(departmentId, labId);
        setLabs((prev) => prev.filter((lab) => lab.id !== labId));
        showMessage("success", `Lab "${labId}" deleted`);
      } catch (error) {
        showMessage("error", `Error deleting lab "${labId}"`);
        console.error(error);
      }
    }
  };

  const handleInputChange = useCallback(
    (labId: string, index: number, value: string) => {
      setLabs((prevLabs) =>
        prevLabs.map((lab) =>
          lab.id === labId
            ? { ...lab, data: lab.data.map((d, i) => (i === index ? value : d)) }
            : lab
        )
      );
    },
    []
  );

  if (!departmentId) {
    return <div className="flex justify-center items-center mt-20 text-gray-700">Loading department data...</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20 text-gray-700">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading labs...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Labs</h1>
        <button
          onClick={handleAddLabClick}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Lab
        </button>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Labs list */}
      {labs.length === 0 ? (
        <p className="text-gray-600 text-base">No labs found. Add a new lab to get started.</p>
      ) : (
        <div className="space-y-8">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="border border-gray-300 rounded-xl p-6 shadow-md hover:shadow-lg transition bg-white"
            >
              {/* Lab Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-5">{lab.id}</h3>

              {/* Lab Data Fields */}
              <div className="space-y-5">
                {lab.data?.length > 0 ? (
                  lab.data.map((item, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        {index === 0 ? "Lab Description" : `Feature ${index}`}
                      </label>
                      <input
                        type="text"
                        value={item || ""}
                        onChange={(e) =>
                          handleInputChange(lab.id, index, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-400 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-100"
                        placeholder="Enter text..."
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No data available for this lab.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleUpdateLabData(lab.id, lab.data)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={() => handleDeleteLab(lab.id)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabsPage;
