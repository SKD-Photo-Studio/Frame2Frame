import Link from "next/link";
import {
  ArrowLeft, Phone, MessageSquare,
  IndianRupee, TrendingUp, Wallet, Briefcase,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getInitials, getPaidStatusColor, cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import EditTeamMemberButton from "@/components/forms/edit-team-form";

import { createClient } from "@/lib/supabase.server";

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  let data;
  try {
    data = await api.team.get(params.id, token);
  } catch {
    notFound();
  }

  const { member, artist_expenses, output_expenses, totals } = data;

  return (
    <div>
      <Link href="/team" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 sm:mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Team
      </Link>

      {/* Member Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
            {getInitials(member.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{member.full_name}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{member.usual_role}</p>
            <p className="mt-0.5 text-xs text-gray-400">Total Assignments: {totals.assignments}</p>

            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 sm:mt-3 sm:justify-start">
              <Phone className="h-4 w-4 text-gray-400" /> {member.phone_number}
            </div>

            <div className="mt-3 flex justify-center gap-2 sm:mt-4 sm:justify-start">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </button>
              <EditTeamMemberButton member={member} />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
        <SummaryCard label="Total Assignments" value={totals.assignments.toString()} icon={<Briefcase className="h-4 w-4" />} color="blue" />
        <SummaryCard label="Total Earnings" value={formatCurrency(totals.earnings)} icon={<IndianRupee className="h-4 w-4" />} color="emerald" />
        <SummaryCard label="Paid So Far" value={formatCurrency(totals.paid)} icon={<TrendingUp className="h-4 w-4" />} color="green" />
        <SummaryCard label="Yet to Pay" value={formatCurrency(totals.balance_due)} icon={<Wallet className="h-4 w-4" />} color="amber" />
      </div>

      {/* Artist Assignments */}
      {artist_expenses.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 className="section-title mb-3 sm:mb-4">
            Artist Assignments <span className="text-xs font-normal text-gray-400 sm:text-sm">({artist_expenses.length})</span>
          </h2>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-[640px] w-full text-sm sm:min-w-0">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Event</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Role</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Total</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Advance</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Balance</th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {artist_expenses.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3">
                          <Link href={`/events/${a.event_id}`} className="text-xs font-medium text-brand-600 hover:underline sm:text-sm">{a.event_name}</Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">{a.assignment_role}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-gray-900 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(a.total_amount)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(a.advance_paid)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-amber-600 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(a.balance)}</td>
                        <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", getPaidStatusColor(a.status))}>{a.status || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Assignments */}
      {output_expenses.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 className="section-title mb-3 sm:mb-4">
            Output Assignments <span className="text-xs font-normal text-gray-400 sm:text-sm">({output_expenses.length})</span>
          </h2>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-[700px] w-full text-sm sm:min-w-0">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Event</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Deliverable</th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Qty</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Total</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Advance</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Balance</th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {output_expenses.map((o) => (
                      <tr key={o.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3">
                          <Link href={`/events/${o.event_id}`} className="text-xs font-medium text-brand-600 hover:underline sm:text-sm">{o.event_name}</Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">{o.deliverable}</td>
                        <td className="px-3 py-2.5 text-center text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">{o.quantity}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-gray-900 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(o.total_amount)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(o.advance_paid)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-amber-600 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(o.balance)}</td>
                        <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", getPaidStatusColor(o.status))}>{o.status || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600",
    green: "bg-green-50 text-green-600", amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className={cn("mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg sm:mb-2 sm:h-8 sm:w-8", colors[color])}>{icon}</div>
      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400 sm:text-[10px]">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900 sm:text-lg">{value}</p>
    </div>
  );
}
