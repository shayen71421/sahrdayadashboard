"use client";

import { useState, useEffect, useContext } from "react";
import { getLibrary, updateLibrary } from "@/utils/department_dashboard_function";
import { DepartmentContext } from "../../layout";

interface LibraryData {
  shortDesc: string;
  card1: string[];
  card2: string[];
  card3: string[];
}

export default function LibraryPage() {
  const [libraryData, setLibraryData] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);  
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  if (!departmentId) {
    return <div className="text-gray-700">Loading department data...</div>;
  }


  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const data = await getLibrary(departmentId);
        if (data) {
          const fetchedData = data as any;
          setLibraryData({
            shortDesc: fetchedData.shortDesc || "",
            card1:
              Array.isArray(fetchedData.card1) &&
              fetchedData.card1.every((item: any) => typeof item === "string")
                ? fetchedData.card1
                : ["", "", ""],
            card2:
              Array.isArray(fetchedData.card2) &&
              fetchedData.card2.every((item: any) => typeof item === "string")
                ? fetchedData.card2
                : ["", "", ""],
            card3:
              Array.isArray(fetchedData.card3) &&
              fetchedData.card3.every((item: any) => typeof item === "string")
                ? fetchedData.card3
                : ["", "", ""],
          });
        } else {
          setLibraryData({
            shortDesc: "",
            card1: ["", "", ""],
            card2: ["", "", ""],
            card3: ["", "", ""],
          });
        }
      } catch (err) {
        setError("Failed to load library data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, [departmentId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLibraryData((prevData) => {
      if (!prevData) return null;

      if (name === "shortDesc") {
        return { ...prevData, shortDesc: value };
      }

      if (name.startsWith("card")) {
        const [card, index] = name.split("-");
        const cardArray = [
          ...prevData[
            card as keyof Pick<LibraryData, "card1" | "card2" | "card3">
          ],
        ];
        cardArray[parseInt(index)] = value;
        return { ...prevData, [card]: cardArray };
      }
      return prevData;
    });
  };

  const handleUpdateLibrary = async () => {
    if (!libraryData) return;
    setLoading(true);
    try {
      await updateLibrary(departmentId, libraryData);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update library data.");
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

  if (!libraryData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No library data found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
        📚 Library Details
      </h1>

      {isEditing ? (
        <div className="space-y-6">
          {/* Short Description */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="shortDesc"
            >
              Short Description
            </label>
            <textarea
              id="shortDesc"
              name="shortDesc"
              value={libraryData.shortDesc}
              onChange={handleInputChange}
              className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              rows={4}
            />
          </div>

          {/* Cards */}
          {[1, 2, 3].map((cardNum) => (
            <div
              key={`card-${cardNum}`}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📖 Card {cardNum}
              </h2>
              {libraryData[
                `card${cardNum}` as keyof Pick<
                  LibraryData,
                  "card1" | "card2" | "card3"
                >
              ].map((item, index) => (
                <div key={`card-${cardNum}-item-${index}`} className="mb-3">
                  <label
                    className="block text-gray-600 text-sm font-medium mb-1"
                    htmlFor={`card${cardNum}-${index}`}
                  >
                    Item {index + 1}
                  </label>
                  <input
                    type="text"
                    id={`card${cardNum}-${index}`}
                    name={`card${cardNum}-${index}`}
                    value={item}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleUpdateLibrary}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "💾 Save Changes"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Short Description */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              📝 Short Description
            </h2>
            <p className="text-gray-600">{libraryData.shortDesc}</p>
          </div>

          {/* Cards */}
          {[1, 2, 3].map((cardNum) => (
            <div
              key={`card-${cardNum}`}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                📖 Card {cardNum}
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {libraryData[
                  `card${cardNum}` as keyof Pick<
                    LibraryData,
                    "card1" | "card2" | "card3"
                  >
                ].map((item, index) => (
                  <li key={`card-${cardNum}-item-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
          >
            ✏️ Edit Details
          </button>
        </div>
      )}
    </div>
  );
}
