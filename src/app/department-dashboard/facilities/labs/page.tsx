"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLabs } from '@/utils/department_dashboard_function'; // Assuming this function exists

interface Lab {
  id: string;
  Name: string;
}

const LabsPage = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const departmentId = 'cse'; // Replace with dynamic department ID if needed

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const labsData = await getLabs(departmentId);
        setLabs(labsData.map((lab: any) => ({ id: lab.id, Name: lab.Name })));
      } catch (error) {
        console.error("Error fetching labs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, [departmentId]);

  const handleAddLabClick = () => {
    router.push(`/department-dashboard/facilities/labs/new`);
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
      <ul>
        {labs.map((lab) => (
          <li key={lab.id} className="mb-2">
            <Link href={`/department-dashboard/facilities/labs/${lab.id}`}>
              <span className="text-blue-600 hover:underline cursor-pointer">
                {lab.Name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabsPage;