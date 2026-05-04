import Link from "next/link";

export const runtime = 'edge';
import {
  ArrowLeft, Phone, MessageSquare,
  IndianRupee, TrendingUp, Wallet, Briefcase,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getInitials, getPaidStatusColor, cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { notFound } from "next/navigation";
import EditTeamMemberButton from "@/components/forms/edit-team-form";

import { createServerSupabaseClient, getSession } from "@/lib/supabase.server";

export default async function TeamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; eventId?: string; fromName?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { data: { session } } = await getSession();
  const token = session?.access_token;

  let data;
  try {
    data = await api.team.get(id, token);
  } catch {
    notFound();
  }

  const { member, artist_expenses, output_expenses, totals } = data;

  // Determine back link
  let backHref = "/team";
  let backLabel = "Back to Team";

  if (sp.from === "event" && sp.eventId) {
    backHref = `/events/${sp.eventId}`;
    backLabel = sp.fromName ? `Back to ${sp.fromName}` : "Back to Event";
  }

  return (
    <div>
      <Link
        href={backHref}
        className="stat-card !p-2.5 !mb-5 inline-flex items-center gap-2 text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {backLabel}
      </Link>

      {/* Member Header */}
      <div className="stat-card">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
            {getInitials(member.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl">{member.full_name}</h1>
            <p className="mt-0.5 text-sm opacity-70">{member.usual_role}</p>
            <p className="mt-0.5 text-xs opacity-50">Total Assignments: {totals.assignments}</p>

            <div className="mt-2 flex items-center justify-center gap-2 text-sm opacity-80 sm:mt-3 sm:justify-start">
              <Phone className="h-4 w-4 opacity-40" /> {member.phone_number}
            </div>

            <div className="mt-3 flex justify-center gap-2 sm:mt-4 sm:justify-start">
              <button 
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors opacity-80 hover:opacity-100"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
              <button 
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors opacity-80 hover:opacity-100"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </button>
              <EditTeamMemberButton member={member} />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
        <StatCard label="Total Assignments" value={totals.assignments.toString()} icon={<Briefcase className="h-4 w-4" />} color="blue" />
        <StatCard label="Total Earnings" value={formatCurrency(totals.earnings)} icon={<IndianRupee className="h-4 w-4" />} color="emerald" />
        <StatCard label="Paid So Far" value={formatCurrency(totals.paid)} icon={<TrendingUp className="h-4 w-4" />} color="green" />
        <StatCard label="Yet to Pay" value={formatCurrency(totals.balance_due)} icon={<Wallet className="h-4 w-4" />} color="amber" />
      </div>

      {/* Artist Assignments */}
      {artist_expenses.length > 0 && (
        <div className="mt-6 sm:mt-8 stat-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 40%)' }}>
            <h2 className="section-title !mb-0 text-base sm:text-lg">
              Artist Assignments <span className="ml-1 text-xs font-normal opacity-40 sm:text-sm">({artist_expenses.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Advance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium opacity-60 sm:text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {artist_expenses.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link href={`/events/${(a as any).event_display_id || (a as any).event_id}?from=team&memberId=${(member as any).display_id || (member as any).id}&fromName=${(member as any).full_name}`} className="font-medium text-brand-600 hover:underline">{(a as any).event_name}</Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs opacity-70 sm:text-sm">{a.assignment_role}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium sm:text-sm">{formatCurrency(a.total_amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs opacity-70 sm:text-sm">{formatCurrency(a.advance_paid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-amber-600 sm:text-sm">{formatCurrency(a.balance)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", getPaidStatusColor(a.status))}>{a.status || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Output Assignments */}
      {output_expenses.length > 0 && (
        <div className="mt-6 sm:mt-8 stat-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 40%)' }}>
            <h2 className="section-title !mb-0 text-base sm:text-lg">
              Output Assignments <span className="ml-1 text-xs font-normal opacity-40 sm:text-sm">({output_expenses.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Deliverable</th>
                  <th className="px-4 py-3 text-center text-xs font-medium opacity-60 sm:text-sm">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Advance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium opacity-60 sm:text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {output_expenses.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link href={`/events/${(o as any).event_display_id || (o as any).event_id}?from=team&memberId=${(member as any).display_id || (member as any).id}&fromName=${(member as any).full_name}`} className="font-medium text-brand-600 hover:underline">{(o as any).event_name}</Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs opacity-70 sm:text-sm">{o.deliverable}</td>
                    <td className="px-4 py-3 text-center text-xs opacity-70 sm:text-sm">{o.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium sm:text-sm">{formatCurrency(o.total_amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs opacity-70 sm:text-sm">{formatCurrency(o.advance_paid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-amber-600 sm:text-sm">{formatCurrency(o.balance)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", getPaidStatusColor(o.status))}>{o.status || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
