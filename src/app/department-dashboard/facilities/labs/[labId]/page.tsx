'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLabDetails, updateLab, deleteLab } from '@/utils/department_dashboard_function';

interface LabDetails {
  Name: string;
  subText: string;
  features: string[];
}

const LabDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const labId = params.labId as string;
  const departmentId = 'cse'; // Assuming departmentId is static for this example

  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLab = async () => {
      if (!labId) return;
      try {
        const details = await getLabDetails(departmentId, labId);
 if (details) {
 const labData = details as any; // Temporarily cast to any to access properties
 setLabDetails({
 Name: labData.Name || '',
 subText: labData.subText || '',
 features: Array.isArray(labData.features) ? labData.features as string[] : ['', '', ''],
 });
 } else {
 setLabDetails(null);
 }

      } catch (err) {
        setError('Failed to load lab details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLab();
  }, [labId, departmentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLabDetails((prevDetails) => {
      if (!prevDetails) return null;
      return { ...prevDetails, [name]: value };
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    setLabDetails((prevDetails) => {
      if (!prevDetails) return null;
      const newFeatures = [...prevDetails.features];
      newFeatures[index] = value;
      return { ...prevDetails, features: newFeatures };
    });
  };

  const handleUpdateLab = async () => {
    if (!labDetails) return;
    try {
      await updateLab(departmentId, labId, labDetails);
      alert('Lab updated successfully!');
      router.push('/department-dashboard/facilities/labs'); // Navigate back to labs list
    } catch (err) {
      alert('Failed to update lab.');
      console.error(err);
    }
  };

  const handleDeleteLab = async () => {
    if (confirm('Are you sure you want to delete this lab?')) {
      try {
        await deleteLab(departmentId, labId);
        alert('Lab deleted successfully!');
        router.push('/department-dashboard/facilities/labs'); // Navigate back to labs list
      } catch (err) {
        alert('Failed to delete lab.');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading lab details...</div>;
  if (error) return <div>{error}</div>;
  if (!labDetails) return <div>Lab not found.</div>;

  return (
    <div>
      <h1>Edit Lab Details</h1>
      <div>
        <label>
          Name:
          <input type="text" name="Name" value={labDetails.Name} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <label>
          Sub Text:
          <input type="text" name="subText" value={labDetails.subText} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <h3>Features:</h3>
        {labDetails.features.map((feature, index) => (
          <div key={index}>
            <label>
              Feature {index + 1}:
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleUpdateLab}>Update Lab</button>
      <button onClick={handleDeleteLab}>Delete Lab</button>
    </div>
  );
};

export default LabDetailsPage;