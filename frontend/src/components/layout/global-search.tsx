"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Users, Calendar, UserCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { api, SearchResponse } from "@/lib/api";

export default function GlobalSearch({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults(null);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    const delayDebounceFn = setTimeout(() => {
      api.search(query)
        .then((res) => {
          setResults(res);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Global search..."
          className={`block w-full rounded-lg border-0 py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 transition-all ${
            variant === "light"
              ? "bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white"
              : "bg-white/10 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900"
          }`}
        />
        {loading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          </div>
        )}
      </div>

      {open && results && (
        <div className="absolute left-0 lg:left-auto lg:right-0 top-full z-50 mt-1 w-[calc(100vw-32px)] max-w-md md:w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="max-h-[80vh] overflow-y-auto p-2">
            {results.clients.length === 0 && results.events.length === 0 && results.team.length === 0 && !loading && (
              <div className="p-4 text-center text-sm text-gray-500">No results found for "{query}"</div>
            )}
            
            {results.clients.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Users className="h-3 w-3" />
                  Clients
                </div>
                {results.clients.map(c => (
                  <Link key={c.id} href={`/clients/${c.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gray-50 text-sm">
                    <div className="font-medium text-gray-900">{c.client_name}</div>
                    <div className="text-xs text-gray-500">{c.display_id} • {c.phone_number}</div>
                  </Link>
                ))}
              </div>
            )}

            {results.events.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />
                  Events
                </div>
                {results.events.map(e => (
                  <Link key={e.id} href={`/events/${e.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gray-50 text-sm">
                    <div className="font-medium text-gray-900">{e.event_type}</div>
                    <div className="text-xs text-gray-500">{e.display_id} • {e.client_name}</div>
                  </Link>
                ))}
              </div>
            )}

            {results.team.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <UserCircle className="h-3 w-3" />
                  Team
                </div>
                {results.team.map(t => (
                  <Link key={t.id} href={`/team/${t.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gray-50 text-sm">
                    <div className="font-medium text-gray-900">{t.full_name}</div>
                    <div className="text-xs text-gray-500">{t.display_id} • {t.usual_role}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
