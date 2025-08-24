"use client";

import { useContext, useEffect, useState } from "react";
import { DepartmentContext } from "../layout";
import {
  fetchDepartmentNewsletters,
  addNewsletterYear,
  deleteNewsletterYear,
} from "@/utils/department_dashboard_function_2";

interface Newsletter {
  start: string;
  end: string;
  pdf: string;
}

interface NewslettersByYear {
  [year: string]: {
    [newsletterName: string]: Newsletter;
  };
}

const NewsletterPage = () => {
  const departmentContext = useContext(DepartmentContext);
  const departmentId = departmentContext?.departmentId;

  const [newsletters, setNewsletters] = useState<NewslettersByYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newYear, setNewYear] = useState("");

  const loadNewsletters = async () => {
    if (!departmentId) {
      setLoading(false);
      setError("Department ID not available.");
      return;
    }
    try {
      const data = await fetchDepartmentNewsletters(departmentId);
      setNewsletters(data as NewslettersByYear | null);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
      setError("Failed to load newsletters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewsletters();
  }, [departmentId]);

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !newYear) return;

    try {
      await addNewsletterYear(departmentId, newYear);
      setNewYear("");
      await loadNewsletters();
    } catch (err) {
      console.error("Error adding year:", err);
      setError("Failed to add year.");
    }
  };

  const handleDeleteYear = async (year: string) => {
    if (!departmentId) return;
    const confirmDelete = window.confirm(
      `Delete all newsletters from ${year}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteNewsletterYear(departmentId, year);
      await loadNewsletters();
    } catch (err) {
      console.error(`Error deleting year ${year}:`, err);
      setError("Failed to delete year.");
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading newsletters...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-900">
          Department Newsletters
        </h1>
        {/* Add Year Form */}
        <form
          onSubmit={handleAddYear}
          className="flex items-center space-x-3 bg-white shadow rounded-lg px-4 py-2"
        >
        <input
  type="text"
  value={newYear}
  onChange={(e) => setNewYear(e.target.value)}
  placeholder="e.g. 2023-24"
  className="rounded-md border border-gray-300 px-3 py-1 text-sm 
             text-gray-900 placeholder-gray-400 
             focus:ring-blue-500 focus:border-blue-500"
/>

          <button
            type="submit"
            className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
          >
            + Add Year
          </button>
        </form>
      </div>

      {(!newsletters || Object.keys(newsletters).length === 0) && (
        <p className="text-gray-600">No newsletters found for this department.</p>
      )}

      {newsletters &&
        Object.keys(newsletters)
          .sort((a, b) => b.localeCompare(a))
          .map((year) => (
            <div key={year} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-semibold text-blue-800">{year}</h2>
                <button
                  onClick={() => handleDeleteYear(year)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  Delete Year
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.keys(newsletters[year]).map((newsletterName) => (
                  <div
                    key={newsletterName}
                    className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {newsletterName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      <span className="font-medium">Period:</span>{" "}
                      {newsletters[year][newsletterName].start} –{" "}
                      {newsletters[year][newsletterName].end}
                    </p>
                    <a
                      href={newsletters[year][newsletterName].pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      View PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
};

export default NewsletterPage;
