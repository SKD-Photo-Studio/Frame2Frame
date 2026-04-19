"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, CalendarDays, X as XIcon } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, ClientListItem } from "@/lib/api";
import { Calendar } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Combobox } from "@/components/ui/combobox";
import { AddClientForm } from "./add-client-form";

const DEFAULT_EVENT_TYPES = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Maternity",
];

export default function AddEventButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        New Event
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create New Event">
        <AddEventForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function AddEventForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [meta, setMeta] = useState<{ cities: string[]; venues: string[]; event_types: string[] }>({
    cities: [], venues: [], event_types: []
  });
  
  const [dates, setDates] = useState<Date[]>([]);
  const [clientId, setClientId] = useState("");
  const [eventType, setEventType] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);

  useEffect(() => {
    api.clients.list().then(setClients).catch(() => {});
    api.events.meta().then(setMeta).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      client_id: clientId,
      event_type: eventType,
      venue: venue,
      city: city,
      package_value: Number(fd.get("package_value")) || 0,
      event_dates: dates.map(d => format(d, "yyyy-MM-dd")),
    };

    if (!data.client_id || !data.event_type || dates.length === 0) {
      setError("Client, event type, and at least one date are required.");
      setLoading(false);
      return;
    }

    try {
      await api.events.create(data);
      router.refresh();
      onSuccess();
    } catch {
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (showAddClient) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-4 text-sm text-gray-500">Creating a new client record first...</div>
        <AddClientForm 
          onSuccess={(newClient) => {
            if (newClient) {
              setClients(prev => [...prev, newClient]);
              setClientId(newClient.id);
            }
            setShowAddClient(false);
          }} 
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Client *</label>
          <button
            type="button"
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-3 w-3" />
            New Client
          </button>
        </div>
        <Combobox
          value={clientId}
          onChange={setClientId}
          options={clients.map((c) => ({ label: c.client_name, value: c.id }))}
          placeholder="Select or search a client..."
          onAddNew={() => setShowAddClient(true)}
          addNewLabel="New Client"
        />
      </div>

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
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Event Dates *</label>
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
          placeholder="e.g. 250000"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
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
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared compact date selector – used in both Add and Edit event forms
// ─────────────────────────────────────────────────────────────────────────────
export function DateSelector({ dates, onChange }: { dates: Date[]; onChange: (d: Date[]) => void }) {
  const [open, setOpen] = useState(false);

  const remove = (d: Date) => onChange(dates.filter((x) => x.toDateString() !== d.toDateString()));

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          {dates.length === 0 ? "Select event dates..." : `${dates.length} date${dates.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl">
          <Calendar
            mode="multiple"
            selected={dates}
            onSelect={(days) => onChange((days as Date[]) ?? [])}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2035}
          />
        </div>
      )}

      {/* Selected date chips */}
      {dates.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[...dates].sort((a, b) => a.getTime() - b.getTime()).map((d) => (
            <span key={d.toISOString()} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {format(d, "d MMM yyyy")}
              <button type="button" onClick={() => remove(d)} className="ml-0.5 text-brand-400 hover:text-brand-600">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
