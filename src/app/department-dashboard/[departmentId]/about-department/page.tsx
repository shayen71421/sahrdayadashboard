'use client';

import { useState, useEffect, useContext } from 'react';
import { DepartmentContext } from '../layout';
import {
  getAboutDepartment,
  updateAboutDepartment,
} from '@/utils/department_dashboard_function';

interface GeneralBriefData {
  shortDescription: string;
  card: string[];
  deptName: string;
  statsHead: string[];
  statstext: string[];
}

interface VisionMissionData {
  mission: string[];
  vision: string[];
}

interface AboutDepartmentData {
  generalBrief?: GeneralBriefData;
  visionMission?: VisionMissionData;
}

export default function AboutDepartmentPage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [aboutData, setAboutData] = useState<AboutDepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneralBriefEditing, setIsGeneralBriefEditing] = useState(false);
  const [isVisionMissionEditing, setIsVisionMissionEditing] = useState(false);

  useEffect(() => {
    if (!departmentId) return;

    const fetchData = async () => {
      try {
        const data = await getAboutDepartment(departmentId);
        setAboutData({
          generalBrief: data?.generalBrief
            ? {
                shortDescription: data.generalBrief.shortDescription || '',
                card: data.generalBrief.card || [],
                deptName: data.generalBrief.deptName || '',
                statsHead: data.generalBrief.statsHead || [],
                statstext: data.generalBrief.statstext || [],
              }
            : undefined,
          visionMission: data?.visionMission
            ? {
                mission: data.visionMission.mission || [],
                vision: data.visionMission.vision || [],
              }
            : { mission: [], vision: [] },
        });
      } catch (err) {
        setError('Failed to load About Department data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId]);

  const handleGeneralBriefChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    field?: 'card' | 'statsHead' | 'statstext'
  ) => {
    const { name, value } = e.target;
    setAboutData((prevData) => {
      if (!prevData) return null;
      const updatedGeneralBrief = { ...prevData.generalBrief! };

      if (name === 'shortDescription' || name === 'deptName') {
        updatedGeneralBrief[name] = value;
      } else if (field && index !== undefined) {
        const arr = [...(updatedGeneralBrief[field] || [])];
        arr[index] = value;
        updatedGeneralBrief[field] = arr;
      }

      return { ...prevData, generalBrief: updatedGeneralBrief };
    });
  };

  const handleVisionMissionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: 'mission' | 'vision'
  ) => {
    const { value } = e.target;
    setAboutData((prevData) => {
      if (!prevData) return null;
      const updatedVisionMission = { ...prevData.visionMission! };
      const arr = [...(updatedVisionMission[field] || [])];
      arr[index] = value;
      updatedVisionMission[field] = arr;
      return { ...prevData, visionMission: updatedVisionMission };
    });
  };

  const handleSaveGeneralBrief = async () => {
    if (!departmentId || !aboutData) return;
    setLoading(true);
    try {
      await updateAboutDepartment(departmentId, aboutData);
      setIsGeneralBriefEditing(false);
    } catch (err) {
      setError('Failed to update General Brief data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisionMission = async () => {
    if (!departmentId || !aboutData) return;
    setLoading(true);
    try {
      await updateAboutDepartment(departmentId, aboutData);
      setIsVisionMissionEditing(false);
    } catch (err) {
      setError('Failed to update Vision & Mission data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 font-semibold">Error: {error}</p>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No About Department data found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">About Department</h1>

      {/* General Brief Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">General Brief</h2>
          <button
            onClick={() => setIsGeneralBriefEditing(!isGeneralBriefEditing)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            {isGeneralBriefEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isGeneralBriefEditing ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Department Name</h3>
              <input
                type="text"
                name="deptName"
                value={aboutData.generalBrief?.deptName || ''}
                onChange={handleGeneralBriefChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Short Description</h3>
              <textarea
                name="shortDescription"
                value={aboutData.generalBrief?.shortDescription || ''}
                onChange={handleGeneralBriefChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                rows={4}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Cards</h3>
              {(aboutData.generalBrief?.card || []).map((card, index) => (
                <input
                  key={`card-${index}`}
                  type="text"
                  value={card}
                  onChange={(e) => handleGeneralBriefChange(e, index, 'card')}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-2"
                />
              ))}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Statistics</h3>
              {(aboutData.generalBrief?.statsHead || []).map((head, index) => (
                <div key={`stats-${index}`} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Heading ${index + 1}`}
                    value={head}
                    onChange={(e) => handleGeneralBriefChange(e, index, 'statsHead')}
                    className="shadow border rounded w-1/2 py-2 px-3 text-gray-700"
                  />
                  <input
                    type="text"
                    placeholder={`Text ${index + 1}`}
                    value={(aboutData.generalBrief?.statstext || [])[index] || ''}
                    onChange={(e) => handleGeneralBriefChange(e, index, 'statstext')}
                    className="shadow border rounded w-1/2 py-2 px-3 text-gray-700"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveGeneralBrief}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save General Brief'}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 italic">Click Edit to view and update General Brief.</p>
        )}
      </div>

      {/* Vision & Mission Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Vision & Mission</h2>
          <button
            onClick={() => setIsVisionMissionEditing(!isVisionMissionEditing)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            {isVisionMissionEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isVisionMissionEditing ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Vision</h3>
              {aboutData.visionMission?.vision.map((vision, index) => (
                <textarea
                  key={`vision-${index}`}
                  value={vision}
                  onChange={(e) => handleVisionMissionChange(e, index, 'vision')}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-2"
                  rows={2}
                />
              ))}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Mission</h3>
              {aboutData.visionMission?.mission.map((mission, index) => (
                <textarea
                  key={`mission-${index}`}
                  value={mission}
                  onChange={(e) => handleVisionMissionChange(e, index, 'mission')}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-2"
                  rows={2}
                />
              ))}
            </div>

            <button
              onClick={handleSaveVisionMission}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Vision & Mission'}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 italic">Click Edit to view and update Vision & Mission.</p>
        )}
      </div>
    </div>
  );
}
