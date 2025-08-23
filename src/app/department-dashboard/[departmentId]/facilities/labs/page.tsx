"use client";

import { useEffect, useState, useCallback } from "react";
import { getLabs, deleteLab, addLab, updateLabData } from "@/utils/department_dashboard_function";

interface Lab {
  id: string;
  data: string[];
}

const LabsPage = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const departmentId = "cse"; // Replace dynamically if needed

  const handleUpdateLabData = useCallback(async (labId: string, updatedData: string[]) => {
    try {
      await updateLabData(departmentId, labId, updatedData);
      console.log(`Lab data for ${labId} updated successfully.`);
    } catch (error) {
      console.error(`Error updating lab data for ${labId}:`, error);
    }
  }, [departmentId]);

  const fetchLabs = useCallback(async () => {
    try {
      const labsData = await getLabs(departmentId);
      setLabs(Array.isArray(labsData) ? labsData as Lab[] : []);
    } catch (error) {
      console.error("Error fetching labs:", error);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const handleAddLabClick = async () => {
    const labName = window.prompt("Enter the name for the new lab:");
    if (labName?.trim()) {
      try {
        await addLab(departmentId, labName);
        await fetchLabs();
      } catch (error) {
        console.error("Error adding lab:", error);
      }
    }
  };

  const handleDeleteLab = async (labId: string) => {
    if (window.confirm("Are you sure you want to delete this lab?")) {
      try {
        await deleteLab(departmentId, labId);
        setLabs(labs.filter((lab) => lab.id !== labId));
      } catch (error) {
        console.error(`Error deleting lab ${labId}:`, error);
      }
    }
  };

  const handleInputChange = useCallback((labId: string, index: number, value: string) => {
    setLabs((prevLabs) =>
      prevLabs.map((lab) =>
        lab.id === labId
          ? { ...lab, data: lab.data.map((d, i) => (i === index ? value : d)) }
          : lab
      )
    );
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600 mt-10">Loading labs...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Labs</h1>
        <button
          onClick={handleAddLabClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Lab
        </button>
      </div>

      {labs.length === 0 ? (
        <p className="text-gray-500">No labs found. Add a new lab to get started.</p>
      ) : (
        <div className="space-y-6">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">{lab.id}</h3>

              <div className="space-y-3">
                {lab.data?.length > 0 ? (
                  lab.data.map((item, index) => (
                    <div key={index}>
                      <label className="block text-sm text-gray-600 mb-1">
                        {index === 0 ? "Subtext" : `Feature ${index}`}
                      </label>
                      <input
                        type="text"
                        value={item || ""}
                        onChange={(e) => handleInputChange(lab.id, index, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No data available for this lab.</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleUpdateLabData(lab.id, lab.data)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDeleteLab(lab.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                >
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
