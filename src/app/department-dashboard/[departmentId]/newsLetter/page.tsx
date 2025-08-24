"use client";

import { useContext, useEffect, useState } from "react";
import { DepartmentContext } from "../layout";

import {
  fetchDepartmentNewsletters,
  addNewsletterYear,
  deleteNewsletterYear,
  addNewsletterEvent,
} from "@/utils/department_dashboard_function_2";
import { format } from "date-fns";

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
  const [newEventName, setNewEventName] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");
  const [newEventPdfFile, setNewEventPdfFile] = useState<File | null>(null);

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

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !departmentId ||
      !newYear ||
      !newEventName ||
      !newEventStart ||
      !newEventEnd ||
      !newEventPdfFile
    )
      return;

    // Basic date format validation (MM/DD/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(newEventStart) || !dateRegex.test(newEventEnd)) {
      setError("Please use MM/DD/YYYY format for dates.");
      return;
    }

    try {
      await addNewsletterEvent(
        departmentId,
        newYear,
        newEventName,
        newEventStart,
        newEventEnd,
        newEventPdfFile // Pass the file object
      );
      setNewEventName("");
      setNewEventPdfFile(null);
      await loadNewsletters();
    } catch (err) {
      console.error("Error adding event:", err);
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
      </div>

      {/* Add Newsletter Event Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Add New Newsletter Event</h2>
        <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventYear" className="block text-sm font-medium text-gray-700">Year</label>
            <select
              id="eventYear"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Year</option>
              {newsletters && Object.keys(newsletters).sort((a, b) => b.localeCompare(a)).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Newsletter Name</label>
            <input type="text" id="eventName" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
         
<div>
  <label htmlFor="eventStart" className="block text-sm font-medium text-gray-700">Start Date</label>
  <input
    type="date"
    id="eventStart" // Change type to date
    value={newEventStart} // Keep value in YYYY-MM-DD for date picker
    onChange={(e) => {
      const selectedDate = e.target.value;
      if (selectedDate) {
        setNewEventStart(format(new Date(selectedDate), 'MM/dd/yyyy')); // Format to MM/DD/YYYY for state
      }
    }}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  />
</div>
<div>
  <label htmlFor="eventEnd" className="block text-sm font-medium text-gray-700">End Date</label>
  <input
    type="date"
    id="eventEnd" // Change type to date
    value={newEventEnd} // Keep value in YYYY-MM-DD for date picker
    onChange={(e) => {
      const selectedDate = e.target.value;
      if (selectedDate) {
        setNewEventEnd(format(new Date(selectedDate), 'MM/dd/yyyy')); // Format to MM/DD/YYYY for state
      }
    }}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  />
</div>

          <div className="col-span-1 md:col-span-2">
            <label htmlFor="eventPdf" className="block text-sm font-medium text-gray-700">PDF Link</label>
            <input
              type="file" // Change type to file
              id="eventPdf"
              accept=".pdf" // Accept only PDF files
              onChange={(e) => setNewEventPdfFile(e.target.files ? e.target.files[0] : null)} // Capture file
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Add Newsletter Event</button>
          </div>
        </form>
      </div>

        {/* Add Year Form */}
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
