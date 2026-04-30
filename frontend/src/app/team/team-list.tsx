"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageSquare, Search } from "lucide-react";
import { TeamListItem } from "@/lib/api";
import { formatCurrency, getInitials } from "@/lib/utils";

const roleColors: Record<string, string> = {
  "Traditional Photographer": "from-amber-400 to-orange-500",
  "Traditional Videographer": "from-blue-400 to-indigo-500",
  Cinematographer: "from-purple-400 to-violet-500",
  "Candid Photographer": "from-rose-400 to-pink-500",
  Assistant: "from-teal-400 to-cyan-500",
  Choreographer: "from-emerald-400 to-green-500",
  Director: "from-red-400 to-rose-500",
  Editor: "from-slate-400 to-gray-600",
};

export default function TeamList({ initialMembers }: { initialMembers: TeamListItem[] }) {
  const [query, setQuery] = useState("");

  const filteredMembers = initialMembers.filter(m => 
    m.full_name.toLowerCase().includes(query.toLowerCase()) || 
    m.usual_role.toLowerCase().includes(query.toLowerCase()) ||
    m.phone_number?.includes(query)
  );

  return (
    <>
      <div className="search-card mb-6 max-w-md relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 opacity-40" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search team by name, role or phone..."
          className="block w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm focus:ring-0 sm:text-sm sm:leading-6"
          style={{ color: 'var(--foreground)' }}
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)', borderColor: 'var(--border)' }}>
          <p className="text-sm opacity-60">No team members match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const gradient = roleColors[member.usual_role] || "from-gray-400 to-gray-500";

            return (
              <Link
                key={member.id}
                href={`/team/${member.display_id || (typeof member.id === 'object' ? (member.id as any).id : member.id)}`}
                className="stat-card group overflow-hidden !p-0 transition-all hover:border-brand-400 hover:shadow-md"
              >
                <div className={`relative h-20 bg-gradient-to-r sm:h-24 ${gradient}`}>
                  <div className="absolute -bottom-7 left-4 sm:-bottom-8 sm:left-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 shadow-sm sm:h-16 sm:w-16 sm:text-xl" style={{ borderColor: 'transparent', backgroundColor: 'var(--card)', color: 'opacity-40' }}>
                      {getInitials(member.full_name)}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-9 sm:px-5 sm:pb-5 sm:pt-10">
                  <h3 className="text-sm font-semibold group-hover:text-brand-600 sm:text-base">
                    {member.full_name}
                  </h3>
                  <p className="text-xs opacity-60 sm:text-sm">{member.usual_role}</p>

                  <div className="mt-2 flex items-center gap-2 text-xs opacity-70 sm:mt-3 sm:text-sm">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                    {member.phone_number}
                  </div>

                  <p className="mt-2 text-[11px] opacity-40 sm:mt-3 sm:text-xs">
                    Total Assignments: {member.assignment_count}
                  </p>

                  <div className="card-inner mt-2 grid grid-cols-3 gap-2 p-2 sm:mt-3 sm:p-2.5">
                    <div>
                      <p className="text-[9px] font-medium uppercase opacity-50 sm:text-[10px]">Earnings</p>
                      <p className="text-[11px] font-semibold sm:text-xs">{formatCurrency(member.total_earnings)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase opacity-50 sm:text-[10px]">Paid</p>
                      <p className="text-[11px] font-semibold text-emerald-600 sm:text-xs">{formatCurrency(member.total_paid)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase opacity-50 sm:text-[10px]">Due</p>
                      <p className="text-[11px] font-semibold text-amber-600 sm:text-xs">{formatCurrency(member.balance_due)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <span className="card-inner inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium opacity-80 hover:opacity-100">
                      <Phone className="h-3 w-3" /> Call
                    </span>
                    <span className="card-inner inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium opacity-80 hover:opacity-100">
                      <MessageSquare className="h-3 w-3" /> SMS
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
