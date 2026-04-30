// Triggering fresh sync to mirror
import Link from "next/link";
import {
  ArrowLeft, MapPin, CalendarDays,
  IndianRupee, TrendingUp, TrendingDown,
  Wallet, CreditCard, Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, getEventTypeColor, getPaidStatusColor, cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import EditEventButton from "@/components/forms/edit-event-form";
import AddEventDateButton from "@/components/forms/add-event-date-form";
import AddPaymentButton from "@/components/forms/add-payment-form";
import AddArtistExpenseButton from "@/components/forms/add-artist-expense-form";
import AddOutputExpenseButton from "@/components/forms/add-output-expense-form";
import { FinanceCard } from "@/components/ui/stat-card";

import { createServerSupabaseClient, getSession } from "@/lib/supabase.server";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; clientId?: string; memberId?: string; fromName?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { data: { session } } = await getSession();
  const token = session?.access_token;

  let data;
  try {
    data = await api.events.get(id, token);
  } catch {
    notFound();
  }

  const { event, client, dates, payments, artist_expenses, output_expenses, financials } = data;

  // Determine back link
  let backHref = "/events";
  let backLabel = "Back to Events";

  if (sp.from === "client" && sp.clientId) {
    backHref = `/clients/${sp.clientId}`;
    backLabel = sp.fromName ? `Back to ${sp.fromName} Client Page` : "Back to Client";
  } else if (sp.from === "team" && sp.memberId) {
    backHref = `/team/${sp.memberId}`;
    backLabel = sp.fromName ? `Back to ${sp.fromName}` : "Back to Member";
  } else if (sp.from === "dashboard") {
    backHref = "/";
    backLabel = "Back to Dashboard";
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

      {/* Event Header */}
      <div className="stat-card !p-0 overflow-hidden">
        <div className="relative h-24 bg-gradient-to-r from-brand-600 to-purple-600 sm:h-32">
          <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold sm:px-3 sm:py-1", getEventTypeColor(event.event_type))}>
              {event.event_type}
            </span>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold sm:text-2xl">{event.display_id}</h1>
                {financials.payment_status && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    getPaidStatusColor(financials.payment_status)
                  )}>
                    {financials.payment_status}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 sm:mt-2 sm:gap-4">
                <div className="flex items-center gap-1.5 text-xs opacity-70 sm:text-sm">
                  <MapPin className="h-4 w-4 opacity-40" /> {event.venue}, {event.city}
                </div>
                {dates.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs opacity-70 sm:text-sm">
                    <CalendarDays className="h-4 w-4 opacity-40" /> {event.date_string}
                  </div>
                )}
              </div>
              {client && (
                <Link href={`/clients/${(client as any).display_id || (client as any).id}?from=event&eventId=${(event as any).display_id || (event as any).id}&fromName=${(event as any).display_id}`} className="mt-1.5 inline-flex items-center gap-2 text-sm text-brand-600 hover:underline sm:mt-2">
                  <Users className="h-3.5 w-3.5" /> {(client as any).client_name}
                </Link>
              )}
            </div>
            <EditEventButton event={{ ...event, dates }} />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
        <FinanceCard label="Package Value" value={formatCurrency(event.package_value)} icon={<IndianRupee className="h-4 w-4" />} color="blue" />
        <FinanceCard label="Collected from Client" value={formatCurrency(financials.total_collected)} icon={<TrendingUp className="h-4 w-4" />} color="emerald" />
        <FinanceCard label="Client Balance" value={formatCurrency(financials.client_balance)} icon={<Wallet className="h-4 w-4" />} color="amber" />
        
        <FinanceCard label="Total Expenses" value={formatCurrency(financials.total_expenses)} icon={<TrendingDown className="h-4 w-4" />} color="red" />
        <FinanceCard label="Paid to Team" value={formatCurrency(financials.total_expenses_paid)} icon={<CreditCard className="h-4 w-4" />} color="purple" />
        <FinanceCard label="Team Balance" value={formatCurrency(financials.team_balance)} icon={<Wallet className="h-4 w-4" />} color="orange" />

        <FinanceCard label="Savings" value={formatCurrency(financials.savings)} icon={<TrendingUp className="h-4 w-4" />} color="brand" />
        <FinanceCard label="Team Size" value={(financials.team_size || 0).toString()} icon={<Users className="h-4 w-4" />} color="indigo" />
      </div>



      {/* Client Payments */}
      <Section title={client ? `${client.client_name}'s Payments` : "Client Payments"} count={payments.length} action={<AddPaymentButton eventId={event.id} />}>
        {payments.length === 0 ? <div className="p-6"><EmptyState text="No payments recorded yet" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Installment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Txn ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium sm:text-sm">{p.installment_type}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", p.payment_method === "Online" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300")}>{p.payment_method}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] opacity-50 sm:text-xs">{p.transaction_id || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs opacity-70 sm:text-sm">{formatDate(p.payment_date)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold sm:text-sm">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-slate-800/30 font-semibold">
                  <td className="px-4 py-4 text-xs sm:text-sm" colSpan={4}>Total Collected</td>
                  <td className="px-4 py-4 text-right text-xs text-emerald-600 sm:text-sm">{formatCurrency(financials.total_collected)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Artist Expenses */}
      <Section title="Artist Expenses" count={artist_expenses.length} action={<AddArtistExpenseButton eventId={event.id} />}>
        {artist_expenses.length === 0 ? <div className="p-6"><EmptyState text="No artist expenses recorded" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Artist</th>
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium opacity-60 sm:text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {artist_expenses.map((ae) => (
                  <tr key={ae.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link 
                        href={`/team/${(ae as any).display_id || (ae as any).user_id}?from=event&eventId=${(event as any).display_id || (event as any).id}&fromName=${(event as any).display_id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {ae.member_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs opacity-70 sm:text-sm">{ae.assignment_role}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium sm:text-sm">{formatCurrency(ae.total_amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-gray-600 dark:text-gray-400 sm:text-sm">{formatCurrency(ae.advance_paid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-amber-600 sm:text-sm">{formatCurrency(ae.balance)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", getPaidStatusColor(ae.status))}>{ae.status || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Deliverables / Output Expenses */}
      <Section title="Deliverables / Output Expenses" count={output_expenses.length} action={<AddOutputExpenseButton eventId={event.id} />}>
        {output_expenses.length === 0 ? <div className="p-6"><EmptyState text="No deliverables recorded" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium opacity-60 sm:text-sm">Item / Vendor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium opacity-60 sm:text-sm">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-medium opacity-60 sm:text-sm">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium opacity-60 sm:text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {output_expenses.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium">{o.deliverable}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-300 sm:text-sm">{o.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium sm:text-sm">{formatCurrency(o.total_amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-gray-600 dark:text-gray-400 sm:text-sm">{formatCurrency(o.advance_paid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-amber-600 sm:text-sm">{formatCurrency(o.balance)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", getPaidStatusColor(o.status))}>{o.status || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

    </div>
  );
}

function Section({ title, count, action, children }: { title: string; count: number; action: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-6 sm:mt-8 stat-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 40%)' }}>
        <h2 className="section-title !mb-0 text-base sm:text-lg">{title} <span className="ml-1 text-xs font-normal opacity-40 sm:text-sm">({count})</span></h2>
        {action}
      </div>
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed py-6 text-center text-sm opacity-40 sm:py-8" style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)' }}>{text}</div>;
}
