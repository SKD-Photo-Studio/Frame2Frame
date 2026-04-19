"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";
import { Combobox } from "@/components/ui/combobox";
import { parse } from "date-fns";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ui/confirm-modal";
import { DateSelector } from "./add-event-form";

const DEFAULT_EVENT_TYPES = ["Wedding", "Pre-Wedding", "Engagement", "Birthday", "Anniversary", "Maternity"];

interface Props {
  event: {
    id: string;
    event_type: string;
    venue: string;
    city: string;
    package_value: number;
    // existing dates come as "YYYY-MM-DD" strings from the API
    dates?: string[];
  };
}

export default function EditEventButton({ event }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
      >
        Edit Event
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Event">
        <EditEventForm event={event} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function EditEventForm({ event, onSuccess }: Props & { onSuccess: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse existing dates back to Date objects for the DateSelector
  const [dates, setDates] = useState<Date[]>(() =>
    (event.dates ?? []).map((s) => parse(s, "yyyy-MM-dd", new Date()))
  );
  
  const [meta, setMeta] = useState<{ cities: string[]; venues: string[]; event_types: string[] }>({
    cities: [], venues: [], event_types: []
  });
  const [eventType, setEventType] = useState(event.event_type);
  const [venue, setVenue] = useState(event.venue);
  const [city, setCity] = useState(event.city);

  useEffect(() => {
    api.events.meta().then(setMeta).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      event_type: eventType,
      venue: venue,
      city: city,
      package_value: Number(fd.get("package_value")) || 0,
      event_dates: dates.map((d) => d.toISOString().split("T")[0]),
    };

    try {
      await api.events.update(event.id, data);
      router.refresh();
      onSuccess();
    } catch {
      setError("Failed to update event.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await api.events.delete(event.id);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onSuccess(); // Close modal
      router.push("/events");
      router.refresh();
    } catch {
      setError("Failed to delete event.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Event Type *</label>
        <Combobox
          value={eventType}
          onChange={setEventType}
          options={DEFAULT_EVENT_TYPES.concat(meta.event_types).filter((v, i, a) => a.indexOf(v) === i).map(t => ({ label: t, value: t }))}
          placeholder="Select or type new event type..."
          freeText={true}
          onAddNew={() => {
            const newType = window.prompt("Enter new Event Type:");
            if (newType && newType.trim()) {
              setEventType(newType.trim());
            }
          }}
          addNewLabel="New Event Type"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Event Dates</label>
        <DateSelector dates={dates} onChange={setDates} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Venue</label>
          <Combobox
            value={venue}
            onChange={setVenue}
            options={meta.venues.map(v => ({ label: v, value: v }))}
            placeholder="e.g. The Leela Palace"
            freeText={true}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">City</label>
          <Combobox
            value={city}
            onChange={setCity}
            options={meta.cities.map(c => ({ label: c, value: c }))}
            placeholder="e.g. Bangalore"
            freeText={true}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Package Value (₹)</label>
        <input
          name="package_value"
          type="number"
          min="0"
          defaultValue={event.package_value}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete Event
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSuccess}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Event?"
        message="Are you sure you want to delete this event permanently? All related expenses and client payments will also be deleted permanently."
      />
    </form>
  );
}
