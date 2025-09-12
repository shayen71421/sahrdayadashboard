"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  fetchEventYears,
  addEventYear,
  deleteEventYear,
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  uploadEventPdf,
} from "@/utils/department_dashboard_function";

interface EventItem {
  id: string;
  name: string;
  type: string;
  date: string; // ISO string
  pdfUrl: string;
}

export default function AssociationEventsPage() {
  const params = useParams();
  const departmentId = params?.departmentId ?? "";

  const [years, setYears] = useState<string[]>([]);
  const [newYear, setNewYear] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [loadingYears, setLoadingYears] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editedEventId, setEditedEventId] = useState<string | null>(null);

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventPdfFile, setEventPdfFile] = useState<File | null>(null);
  const [uploadingEvent, setUploadingEvent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Load years
  useEffect(() => {
    if (!departmentId) return;

    setLoadingYears(true);
    fetchEventYears(departmentId)
      .then((yrs) => {
        if (!mounted.current) return;
        setYears(yrs);
        setSelectedYear(yrs.length > 0 ? yrs[0] : null);
      })
      .catch(() => {
        if (mounted.current) setError("Failed to load event years.");
      })
      .finally(() => {
        if (mounted.current) setLoadingYears(false);
      });
  }, [departmentId]);

  // Load events
  useEffect(() => {
    if (!departmentId || !selectedYear) {
      setEvents([]);
      return;
    }

    setLoadingEvents(true);
    fetchEvents(departmentId, selectedYear)
      .then((evts) => {
        if (!mounted.current) return;
        const mappedEvents = evts.map((ev: any) => ({
          id: ev.id,
          name: ev.name || "",
          type: ev.type || "",
          date: ev.date || "",
          pdfUrl: ev.pdfUrl || "",
        }));
        setEvents(mappedEvents);
      })
      .catch(() => {
        if (mounted.current) setError("Failed to load events.");
      })
      .finally(() => {
        if (mounted.current) setLoadingEvents(false);
      });
  }, [departmentId, selectedYear]);

  async function handleAddYear(e: FormEvent) {
    e.preventDefault();
    if (!newYear.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addEventYear(departmentId, newYear.trim());
      const updatedYears = await fetchEventYears(departmentId);
      if (!mounted.current) return;
      setYears(updatedYears);
      setNewYear("");
      setSelectedYear(newYear.trim());
    } catch {
      if (mounted.current) setError("Failed to add year.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  async function handleDeleteYear(year: string) {
    if (!confirm(`Delete year ${year} and all its events?`)) return;
    setLoading(true);
    setError(null);
    try {
      await deleteEventYear(departmentId, year);
      const updatedYears = await fetchEventYears(departmentId);
      if (!mounted.current) return;
      setYears(updatedYears);
      if (selectedYear === year) setSelectedYear(null);
    } catch {
      if (mounted.current) setError("Failed to delete year.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  function resetEventForm() {
    setEventName("");
    setEventType("");
    setEventDate("");
    setEventPdfFile(null);
    setIsEditingEvent(false);
    setEditedEventId(null);
    setError(null);
  }

  async function handleAddOrUpdateEvent(e: FormEvent) {
    e.preventDefault();
    if (!eventName.trim() || !eventType.trim() || !eventDate.trim()) {
      setError("Name, type and date are required.");
      return;
    }
    if (!eventPdfFile && !isEditingEvent) {
      setError("Please select a PDF file.");
      return;
    }

    setUploadingEvent(true);
    setError(null);
    try {
      let pdfUrl = "";
      if (eventPdfFile) {
        pdfUrl = await uploadEventPdf(departmentId, selectedYear!, eventName.trim(), eventPdfFile);
      }
      if (isEditingEvent && editedEventId) {
        await updateEvent(departmentId, selectedYear!, editedEventId, {
          name: eventName.trim(),
          type: eventType.trim(),
          date: eventDate,
          ...(pdfUrl ? { pdfUrl } : {}),
        });
      } else {
        await addEvent(departmentId, selectedYear!, {
          name: eventName.trim(),
          type: eventType.trim(),
          date: eventDate,
          pdfUrl,
        });
      }
      const refreshedEvents = await fetchEvents(departmentId, selectedYear!);
      if (!mounted.current) return;
      const mappedEvents = refreshedEvents.map((ev: any) => ({
        id: ev.id,
        name: ev.name || "",
        type: ev.type || "",
        date: ev.date || "",
        pdfUrl: ev.pdfUrl || "",
      }));
      setEvents(mappedEvents);
      resetEventForm();
    } catch {
      if (mounted.current) setError("Failed to save event.");
    } finally {
      if (mounted.current) setUploadingEvent(false);
    }
  }

  function handleEditEvent(evt: EventItem) {
    setEventName(evt.name);
    setEventType(evt.type);
    setEventDate(evt.date.slice(0, 10));
    setEditedEventId(evt.id);
    setIsEditingEvent(true);
    setError(null);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteEvent(departmentId, selectedYear!, id);
      const refreshedEvents = await fetchEvents(departmentId, selectedYear!);
      if (!mounted.current) return;
      const mappedEvents = refreshedEvents.map((ev: any) => ({
        id: ev.id,
        name: ev.name || "",
        type: ev.type || "",
        date: ev.date || "",
        pdfUrl: ev.pdfUrl || "",
      }));
      setEvents(mappedEvents);
    } catch {
      if (mounted.current) setError("Failed to delete event.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Manage Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddYear} className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Add year, e.g. 2024-25"
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !newYear.trim()}>
              Add Year
            </Button>
          </form>
          {loadingYears ? (
            <p>Loading years...</p>
          ) : (
            <ul className="space-y-1">
              {years.map(year => (
                <li key={year} className="flex justify-between items-center">
                  <button
                    className={`text-left px-2 py-1 ${selectedYear === year ? "font-bold underline" : ""}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteYear(year)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {selectedYear && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditingEvent ? "Edit Event" : "Add New Event"} ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleAddOrUpdateEvent} className="space-y-4 max-w-lg">
              <Input
                placeholder="Event Name"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                disabled={uploadingEvent}
                required
              />
              <Input
                placeholder="Event Type"
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                disabled={uploadingEvent}
                required
              />
              <Input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                disabled={uploadingEvent}
                required
              />
              <label className="block">
                <span>Event PDF {isEditingEvent ? "(select to replace)" : ""}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setEventPdfFile(e.target.files ? e.target.files[0] : null)}
                  disabled={uploadingEvent}
                  {...(!isEditingEvent ? { required: true } : {})}
                />
              </label>
              <div className="flex space-x-2">
                <Button type="submit" disabled={uploadingEvent}>
                  {uploadingEvent ? "Saving..." : isEditingEvent ? "Save Changes" : "Add Event"}
                </Button>
                {isEditingEvent && (
                  <Button type="button" variant="outline" disabled={uploadingEvent} onClick={resetEventForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedYear && (
        <Card>
          <CardHeader>
            <CardTitle>Events for {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p>No events found for this year.</p>
            ) : (
              <ul className="space-y-4">
                {events.map(ev => (
                  <li key={ev.id} className="border p-4 rounded flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{ev.name}</h3>
                      <p className="italic">{ev.type} — {ev.date.slice(0, 10)}</p>
                      {ev.pdfUrl && (
                        <a href={ev.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">
                          View PDF
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => handleEditEvent(ev)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(ev.id)}>Delete</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
