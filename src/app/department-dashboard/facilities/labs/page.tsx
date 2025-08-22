"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getLabs, deleteLab, addLab } from '@/utils/department_dashboard_function';

interface Lab {
  id: string;
  data: any[]; 
}

const LabsPage = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const departmentId = 'cse'; // Replace with dynamic department ID if needed

  // ✅ Reusable fetch function
  const fetchLabs = useCallback(async () => {
    try {
      const labsData = await getLabs(departmentId);
      console.log("Fetched labs data:", labsData);

      if (Array.isArray(labsData)) {
        setLabs(labsData as Lab[]);
      } else {
        setLabs([]);
      }
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
    if (labName && labName.trim() !== '') {
      try {
        await addLab(departmentId, labName);
        await fetchLabs(); // ✅ refresh labs after adding
      } catch (error) {
        console.error("Error adding lab:", error);
      }
    }
  };

  const handleDeleteLab = async (labId: string) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        await deleteLab(departmentId, labId);
        setLabs(labs.filter(lab => lab.id !== labId)); // ✅ update state
        console.log(`Lab with ID ${labId} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting lab with ID ${labId}:`, error);
      }
    }
  };

  if (loading) {
    return <div>Loading labs...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Labs</h1>

      <button
        onClick={handleAddLabClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add Lab
      </button>

      <div>
        {labs.length === 0 ? (
          <p>No labs found. Add a new lab to get started.</p>
        ) : (
          labs.map((lab) => (
            <div key={lab.id} className="border p-4 mb-4 rounded shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{lab.id}</h3>
              {lab.data && Array.isArray(lab.data) && lab.data.length > 0 ? (
                lab.data.map((item, index) => <p key={index}>{item}</p>)
              ) : (
                <p className="text-gray-500">No data available for this lab.</p>
              )}
              <button
                onClick={() => handleDeleteLab(lab.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mt-2"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LabsPage;
