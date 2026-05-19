"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, CalendarDays, Search, Users } from "lucide-react";
import { EventWithFinancials } from "@/lib/api";
import { formatCurrency, getInitials, getEventTheme, cn } from "@/lib/utils";

export default function EventsList({ initialEvents }: { initialEvents: EventWithFinancials[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "package-desc" | "savings-desc">("date-desc");

  const parseDate = (dStr: string) => {
    if (!dStr) return 0;
    const first = dStr.split(",")[0].trim();
    const parsed = Date.parse(first);
    return isNaN(parsed) ? 0 : parsed;
  };

  const filteredEvents = initialEvents
    .filter(e => 
      e.event_type.toLowerCase().includes(query.toLowerCase()) || 
      e.client_name.toLowerCase().includes(query.toLowerCase()) ||
      (e.venue || "").toLowerCase().includes(query.toLowerCase()) ||
      (e.city || "").toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date-desc") return parseDate(b.date_string) - parseDate(a.date_string);
      if (sortBy === "date-asc") return parseDate(a.date_string) - parseDate(b.date_string);
      if (sortBy === "package-desc") return (b.package_value || 0) - (a.package_value || 0);
      if (sortBy === "savings-desc") return (b.savings || 0) - (a.savings || 0);
      return 0;
    });

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="search-card max-w-md w-full relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 opacity-40" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            suppressHydrationWarning={true}
            placeholder="Search by event type, client, venue, city..."
            className="block w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm focus:ring-0 sm:text-sm sm:leading-6"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        <div className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-gray-200/60 dark:border-slate-800/80 shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
          <label htmlFor="sortEvents" className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Sort By:</label>
          <select
            id="sortEvents"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            suppressHydrationWarning={true}
            className="block bg-transparent border-0 p-0 pr-8 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none cursor-pointer"
            style={{ color: 'var(--foreground)' }}
          >
            <option value="date-desc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Latest to Oldest</option>
            <option value="date-asc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Oldest to Latest</option>
            <option value="package-desc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Package Value (High - Low)</option>
            <option value="savings-desc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Savings (High - Low)</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)', borderColor: 'var(--border)' }}>
          <p className="text-sm opacity-60">No events match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.display_id || event.id}`}
              className="stat-card group overflow-hidden !p-0 transition-all hover:border-brand-400 hover:shadow-md"
            >
              <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900/60 dark:to-slate-800/40 border-b border-gray-100 dark:border-slate-800/80 sm:h-36">
                {(() => {
                  const theme = getEventTheme(event.event_type);
                  return (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold backdrop-blur-sm sm:h-16 sm:w-16 sm:text-xl border shadow-sm transition-all duration-300 group-hover:scale-105",
                          theme.avatar
                        )}>
                          {getInitials(event.client_name)}
                        </div>
                      </div>
                      <div className="absolute left-3 top-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs", theme.badge)}>
                          {event.event_type}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold group-hover:text-brand-600 sm:text-base flex-1 min-w-0">
                    {event.client_name} | {event.event_type}
                  </h3>
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 text-slate-500 dark:text-slate-400">Client:</span>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        event.payment_status === "Paid" && "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400",
                        event.payment_status === "Overpaid" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
                        event.payment_status === "Partial" && "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400",
                        event.payment_status === "Unpaid" && "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                      )}>
                        {event.payment_status || "Unpaid"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 text-slate-500 dark:text-slate-400">Team:</span>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        event.team_payment_status === "Paid" && "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400",
                        event.team_payment_status === "Partial" && "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400",
                        event.team_payment_status === "Unpaid" && "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                      )}>
                        {event.team_payment_status || "Paid"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-1.5 sm:mt-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{event.venue}, {event.city}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {event.date_string && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 sm:text-sm min-w-0 flex-1">
                        <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                        <span className="truncate" title={event.date_string}>{event.date_string}</span>
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex-shrink-0 whitespace-nowrap bg-gray-100/80 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-slate-700/50">
                      Team: {event.team_size || 0}
                    </span>
                  </div>
                </div>

                <div className="card-inner mt-4 grid grid-cols-3 gap-2 p-2 sm:p-2.5">
                  <div>
                    <p className="text-[9px] font-medium uppercase opacity-50 sm:text-[10px]">Package</p>
                    <p className="text-[11px] font-semibold sm:text-xs">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-medium uppercase opacity-50 sm:text-[10px]">Expenses</p>
                    <p className="text-[11px] font-semibold text-rose-600 sm:text-xs">{formatCurrency(event.total_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-medium uppercase opacity-50 sm:text-[10px]">Savings</p>
                    <p className={cn(
                      "text-[11px] font-semibold sm:text-xs",
                      event.savings >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatCurrency(event.savings)}
                    </p>
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
