"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, CalendarDays, Search } from "lucide-react";
import { EventWithFinancials } from "@/lib/api";
import { formatCurrency, getInitials, getEventTypeColor, cn } from "@/lib/utils";

export default function EventsList({ initialEvents }: { initialEvents: EventWithFinancials[] }) {
  const [query, setQuery] = useState("");

  const filteredEvents = initialEvents.filter(e => 
    e.event_type.toLowerCase().includes(query.toLowerCase()) || 
    e.client_name.toLowerCase().includes(query.toLowerCase()) ||
    e.venue?.toLowerCase().includes(query.toLowerCase()) ||
    e.city?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 max-w-md relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by event type, client, venue, city..."
          className="block w-full rounded-lg border-0 bg-white shadow-sm ring-1 ring-inset ring-gray-300 py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white">
          <p className="text-sm text-gray-500">No events match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
            >
              <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200 sm:h-36">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-lg font-bold text-gray-400 backdrop-blur-sm sm:h-16 sm:w-16 sm:text-xl">
                    {getInitials(event.client_name)}
                  </div>
                </div>
                <div className="absolute left-3 top-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm sm:text-xs", getEventTypeColor(event.event_type))}>
                    {event.event_type}
                  </span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 sm:text-base">
                  {event.display_id}
                </h3>

                <div className="mt-1.5 space-y-1 sm:mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{event.venue}, {event.city}</span>
                  </div>
                  {event.date_string && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                      <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{event.date_string}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2 sm:p-2.5">
                  <div>
                    <p className="text-[9px] font-medium uppercase text-gray-400 sm:text-[10px]">Package</p>
                    <p className="text-[11px] font-semibold text-gray-900 sm:text-xs">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-medium uppercase text-gray-400 sm:text-[10px]">Collected</p>
                    <p className="text-[11px] font-semibold text-emerald-600 sm:text-xs">{formatCurrency(event.total_collected)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-medium uppercase text-gray-400 sm:text-[10px]">Due</p>
                    <p className="text-[11px] font-semibold text-amber-600 sm:text-xs">{formatCurrency(event.client_balance)}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
