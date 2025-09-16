'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { getHodMessage, updateHodMessage, deleteHodMessage, uploadHodPhoto } from '@/utils/department_dashboard_function';
import { Loader2 } from 'lucide-react';
import { DepartmentContext } from "../layout";

interface HodData {
  name: string;
  quote: string;
  exp: string[];
  mssg: string;
  mediaPath?: string; 
  selectedFile?: File | null;
}

export default function HodMessagePage() {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [hodData, setHodData] = useState<HodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHodData, setEditedHodData] = useState<HodData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setHodData(null);
    setEditedHodData(null);
    setLoading(true);
    setError(null);

    const fetchHodData = async () => {
      if (!departmentId) return;
      try {
        const data = await getHodMessage(departmentId);
    
        if (data && "name" in data) {
          const hod: HodData = {
            name: (data as any).name ?? "",
            quote: (data as any).quote ?? "",
            exp: (data as any).exp ?? [],
            mssg: (data as any).mssg ?? "",
            mediaPath: (data as any).mediaPath ?? undefined,
          };
          setHodData(hod);
        } else {
          setError("No HOD message data found for this department.");
        }
      } catch (err) {
        setError("Failed to load HOD message data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    

    fetchHodData();
  }, [departmentId]);

  const handleEditClick = () => {
    setEditedHodData(hodData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedHodData(null);
    setError(null);
  };

  const handleSaveClick = async () => {
    if (!departmentId || !editedHodData) return;
    setSubmitting(true);
    setError(null);
    try {
      let updatedData: Partial<HodData> = { ...editedHodData };

      if (editedHodData.selectedFile) {
        const photoUrl = await uploadHodPhoto(departmentId, editedHodData.selectedFile);
        updatedData.mediaPath = photoUrl;
        delete updatedData.selectedFile; // Remove the file object before saving to Firestore
      } else {
        delete updatedData.selectedFile; // Also remove if no new file is selected
      }

      await updateHodMessage(departmentId, updatedData);
      setHodData((prevData) => ({ ...(prevData as HodData), ...updatedData }));
      setIsEditing(false);
      setEditedHodData(null);
    } catch (err) {
      setError("Failed to save HOD message data.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!departmentId) return;
    if (window.confirm("Are you sure you want to delete the HOD message?")) {
      setSubmitting(true);
      setError(null);
      try {
        await deleteHodMessage(departmentId);
        setHodData(null);
        setEditedHodData(null);
        setIsEditing(false);
      } catch (err) {
        setError("Failed to delete HOD message data.");
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 1024 * 1024; // 1MB

      // Validate file type (optional, but good practice)
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        e.target.value = ''; // Clear the input
        setEditedHodData((prevData: HodData | null) => ({ ...(prevData as HodData), selectedFile: null }));
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert('File size must be less than 1MB.');
        e.target.value = ''; // Clear the input
        setEditedHodData((prevData: HodData | null) => ({ ...(prevData as HodData), selectedFile: null }));
        return;
      }

      // Validate aspect ratio
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          alert('Image must have a 1:1 aspect ratio.');
          e.target.value = ''; // Clear the input
          setEditedHodData((prevData: HodData | null) => ({ ...(prevData as HodData), selectedFile: null }));
        } else {
          setEditedHodData((prevData: HodData | null) => ({ ...(prevData as HodData), selectedFile: file }));
        }
      };
      img.onerror = () => {
        alert('Failed to read image dimensions.');
        e.target.value = ''; // Clear the input
        setEditedHodData((prevData: HodData | null) => ({ ...(prevData as HodData), selectedFile: null }));
      };
      img.src = URL.createObjectURL(file);
    } else {
      setEditedHodData((prevData: HodData | null) => ({
        ...(prevData as HodData),
        selectedFile: null,
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedHodData((prevData: HodData | null) => ({
      ...(prevData as HodData),
      [name]: value,
    }));
  };

  const handleExperienceChange = (index: number, value: string) => {
    setEditedHodData((prevData: HodData | null) => {
      if (!prevData) return null;
      const newExp = [...prevData.exp];
      newExp[index] = value;
      return {
        ...prevData,
        exp: newExp,
      };
    });
  };

  const addExperienceItem = () => {
    setEditedHodData((prevData: HodData | null) => {
      if (!prevData) return null;
      return {
        ...prevData,
        exp: [...prevData.exp, ""],
      };
    });
  };

  const removeExperienceItem = useCallback(
    (index: number) => {
      setEditedHodData((prevData: HodData | null) => {
        if (!prevData) return null;
        const newExp = prevData.exp.filter((_: string, i: number) => i !== index);
        return {
          ...prevData,
          exp: newExp,
        };
      });
    },
    []
  );

  if (!departmentId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading department context...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin mr-2" size={20} />
        <p className="text-gray-600 text-lg">Loading HOD message...</p>
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

  if (!hodData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No HOD message data found.</p>
      </div>
    );
  }

  const displayData = isEditing && editedHodData ? editedHodData : hodData;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
        🧑‍🏫 Head of Department Message
      </h1>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        {!isEditing ? (
          <>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
            >
              Edit
            </button>
          
          </>
        ) : (
          <>
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition"
              disabled={submitting}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {displayData.mediaPath && (
          <div className="flex justify-center mb-4">
            <img
              src={displayData.mediaPath}
              alt={`Photo of ${displayData.name}`}
              className="rounded-full w-32 h-32 object-cover"
            />
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                HOD Photo:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {editedHodData?.selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {editedHodData.selectedFile.name}
                </p>
              )}
              {displayData.mediaPath && (
                <p className="mt-2 text-sm text-gray-600">
                  Current photo:{" "}
                  <a
                    href={displayData.mediaPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Photo
                  </a>
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={editedHodData?.name || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quote:
              </label>
              <textarea
                name="quote"
                value={editedHodData?.quote || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={2}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Experience:
              </h3>
              {editedHodData?.exp.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleExperienceChange(index, e.target.value)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  <button
                    onClick={() => removeExperienceItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addExperienceItem}
                className="mt-2 px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Add Experience Item
              </button>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Message:
              </label>
              <textarea
                name="mssg"
                value={editedHodData?.mssg || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={6}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {displayData.name}
            </h2>
            <p className="text-gray-600 italic mb-4">"{displayData.quote}"</p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Experience:
              </h3>
              <ul className="list-disc list-inside text-gray-600">
                {displayData.exp?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Message:
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {displayData.mssg}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
