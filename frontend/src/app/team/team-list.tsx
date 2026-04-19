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
      <div className="mb-6 max-w-md relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search team by name, role or phone..."
          className="block w-full rounded-lg border-0 bg-white shadow-sm ring-1 ring-inset ring-gray-300 py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-white">
          <p className="text-sm text-gray-500">No team members match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const gradient = roleColors[member.usual_role] || "from-gray-400 to-gray-500";

            return (
              <Link
                key={member.id}
                href={`/team/${member.id}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className={`relative h-20 bg-gradient-to-r sm:h-24 ${gradient}`}>
                  <div className="absolute -bottom-7 left-4 sm:-bottom-8 sm:left-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-white text-lg font-bold text-gray-400 shadow-sm sm:h-16 sm:w-16 sm:text-xl">
                      {getInitials(member.full_name)}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-9 sm:px-5 sm:pb-5 sm:pt-10">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 sm:text-base">
                    {member.full_name}
                  </h3>
                  <p className="text-xs text-gray-500 sm:text-sm">{member.usual_role}</p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 sm:mt-3 sm:text-sm">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    {member.phone_number}
                  </div>

                  <p className="mt-2 text-[11px] text-gray-400 sm:mt-3 sm:text-xs">
                    Total Assignments: {member.assignment_count}
                  </p>

                  <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2 sm:mt-3 sm:p-2.5">
                    <div>
                      <p className="text-[9px] font-medium uppercase text-gray-400 sm:text-[10px]">Earnings</p>
                      <p className="text-[11px] font-semibold text-gray-900 sm:text-xs">{formatCurrency(member.total_earnings)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase text-gray-400 sm:text-[10px]">Paid</p>
                      <p className="text-[11px] font-semibold text-emerald-600 sm:text-xs">{formatCurrency(member.total_paid)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase text-gray-400 sm:text-[10px]">Due</p>
                      <p className="text-[11px] font-semibold text-amber-600 sm:text-xs">{formatCurrency(member.balance_due)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                      <Phone className="h-3 w-3" /> Call
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
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
