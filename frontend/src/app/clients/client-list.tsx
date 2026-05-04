"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MessageSquare, Search } from "lucide-react";
import { ClientListItem } from "@/lib/api";
import { getInitials } from "@/lib/utils";

export default function ClientsList({ initialClients }: { initialClients: ClientListItem[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "events-desc" | "events-asc">("name-asc");

  const filteredClients = initialClients
    .filter(c => 
      c.client_name.toLowerCase().includes(query.toLowerCase()) || 
      (c.phone_number || "").includes(query)
    )
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.client_name.localeCompare(b.client_name);
      if (sortBy === "name-desc") return b.client_name.localeCompare(a.client_name);
      if (sortBy === "events-desc") return (b.event_count || 0) - (a.event_count || 0);
      if (sortBy === "events-asc") return (a.event_count || 0) - (b.event_count || 0);
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
            placeholder="Search clients by name or phone..."
            className="block w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm focus:ring-0 sm:text-sm sm:leading-6"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sortClients" className="text-xs font-medium opacity-60">Sort By:</label>
          <select
            id="sortClients"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="block rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            style={{ color: 'var(--foreground)' }}
          >
            <option value="name-asc">Name (A - Z)</option>
            <option value="name-desc">Name (Z - A)</option>
            <option value="events-desc">Events Booked (High - Low)</option>
            <option value="events-asc">Events Booked (Low - High)</option>
          </select>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)', borderColor: 'var(--border)' }}>
          <p className="text-sm opacity-60">No clients match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.display_id || client.id}`}
              className="stat-card group transition-all hover:border-brand-400 hover:shadow-md"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white sm:h-14 sm:w-14 sm:text-lg">
                  {getInitials(client.client_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold group-hover:text-brand-600 sm:text-base">
                    {client.client_name}
                  </h3>
                  <p className="mt-0.5 text-xs opacity-60 sm:text-sm">
                    {client.event_count} event{client.event_count !== 1 ? "s" : ""} booked
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                <div className="flex items-center gap-2 text-xs opacity-70 sm:text-sm">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                  <span>{client.phone_number}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-xs opacity-70 sm:text-sm">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="card-inner inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium opacity-80 hover:opacity-100">
                  <Phone className="h-3 w-3" /> Call
                </span>
                <span className="card-inner inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium opacity-80 hover:opacity-100">
                  <MessageSquare className="h-3 w-3" /> SMS
                </span>
                <span className="card-inner inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium opacity-80 hover:opacity-100">
                  <Mail className="h-3 w-3" /> Email
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
