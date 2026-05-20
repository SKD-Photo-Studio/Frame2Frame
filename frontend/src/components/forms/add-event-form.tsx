"use client";

import { useState, useEffect, useRef } from "react";
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

import EventIntakeForm from "./event-intake-form";

export default function AddEventButton({ initialClientId }: { initialClientId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        suppressHydrationWarning={true}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        New Event
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create New Event" size="3xl">
        <EventIntakeForm onSuccess={() => setOpen(false)} initialClientId={initialClientId} />
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared compact date selector – used in both Add and Edit event forms
// ─────────────────────────────────────────────────────────────────────────────
export function DateSelector({ dates, onChange }: { dates: Date[]; onChange: (d: Date[]) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const remove = (d: Date) => onChange(dates.filter((x) => x.toDateString() !== d.toDateString()));

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-[#222222] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          {dates.length === 0 ? "Select event dates..." : `${dates.length} date${dates.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
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
            <span key={d.toISOString()} className="inline-flex items-center gap-1 rounded-full bg-brand-50 dark:bg-brand-900/30 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/50">
              {format(d, "d MMM yyyy")}
              <button type="button" onClick={() => remove(d)} className="ml-0.5 text-brand-400 dark:text-brand-500 hover:text-brand-600 dark:hover:text-brand-300">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
