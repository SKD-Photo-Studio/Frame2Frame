"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MessageSquare, Search } from "lucide-react";
import { ClientListItem } from "@/lib/api";
import { getInitials } from "@/lib/utils";

export default function ClientsList({ initialClients }: { initialClients: ClientListItem[] }) {
  const [query, setQuery] = useState("");

  const filteredClients = initialClients.filter(c => 
    c.client_name.toLowerCase().includes(query.toLowerCase()) || 
    c.phone_number.includes(query)
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
          placeholder="Search clients by name or phone..."
          className="block w-full rounded-lg border-0 bg-white shadow-sm ring-1 ring-inset ring-gray-300 py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white">
          <p className="text-sm text-gray-500">No clients match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-brand-200 hover:shadow-md sm:p-5"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white sm:h-14 sm:w-14 sm:text-lg">
                  {getInitials(client.client_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-brand-600 sm:text-base">
                    {client.client_name}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                    {client.event_count} event{client.event_count !== 1 ? "s" : ""} booked
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 sm:text-sm">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span>{client.phone_number}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 sm:text-sm">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                  <Phone className="h-3 w-3" /> Call
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                  <MessageSquare className="h-3 w-3" /> SMS
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
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
