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

import { createClient } from "@/lib/supabase.server";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  let data;
  try {
    data = await api.events.get(params.id, token);
  } catch {
    notFound();
  }

  const { event, client, dates, payments, artist_expenses, output_expenses, financials } = data;

  return (
    <div>
      <Link href="/events" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 sm:mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      {/* Event Header */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
              <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">{event.display_id}</h1>
              <div className="mt-1.5 flex flex-wrap gap-3 sm:mt-2 sm:gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                  <MapPin className="h-4 w-4" /> {event.venue}, {event.city}
                </div>
                {dates.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                    <CalendarDays className="h-4 w-4" /> {event.date_string}
                  </div>
                )}
              </div>
              {client && (
                <Link href={`/clients/${client.id}`} className="mt-1.5 inline-flex items-center gap-2 text-sm text-brand-600 hover:underline sm:mt-2">
                  <Users className="h-3.5 w-3.5" /> {client.client_name}
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
        <FinanceCard label="Pending from Client" value={formatCurrency(financials.client_balance)} icon={<Wallet className="h-4 w-4" />} color="amber" />
        
        <FinanceCard label="Total Expenses" value={formatCurrency(financials.total_expenses)} icon={<TrendingDown className="h-4 w-4" />} color="red" />
        <FinanceCard label="Total Artist Expenses" value={formatCurrency(financials.total_artist_expenses)} icon={<Users className="h-4 w-4" />} color="red" />
        <FinanceCard label="Total Output Expenses" value={formatCurrency(financials.total_output_expenses)} icon={<CreditCard className="h-4 w-4" />} color="red" />

        <FinanceCard label="Paid to Team" value={formatCurrency(financials.total_expenses_paid)} icon={<CreditCard className="h-4 w-4" />} color="purple" />
        <FinanceCard label="Yet to Pay to Team" value={formatCurrency(financials.vendor_balance)} icon={<Wallet className="h-4 w-4" />} color="orange" />
        <FinanceCard label="Savings" value={formatCurrency(financials.savings)} icon={<TrendingUp className="h-4 w-4" />} color="brand" />
      </div>



      {/* Client Payments */}
      <Section title={client ? `${client.client_name}'s Payments` : "Client Payments"} count={payments.length} action={<AddPaymentButton eventId={event.id} />}>
        {payments.length === 0 ? <EmptyState text="No payments recorded yet" /> : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-[580px] w-full text-sm sm:min-w-0">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Installment</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Mode</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Txn ID</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Date</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-gray-900 sm:px-4 sm:py-3 sm:text-sm">{p.installment_type}</td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", p.payment_method === "Online" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700")}>{p.payment_method}</span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500 sm:px-4 sm:py-3 sm:text-xs">{p.transaction_id || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">{formatDate(p.payment_date)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold text-gray-900 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                      <td className="px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm" colSpan={4}>Total Collected</td>
                      <td className="px-3 py-2.5 text-right text-xs text-emerald-600 sm:px-4 sm:py-3 sm:text-sm">{formatCurrency(financials.total_collected)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Artist Expenses */}
      <Section title="Artist Expenses" count={artist_expenses.length} action={<AddArtistExpenseButton eventId={event.id} />}>
        {artist_expenses.length === 0 ? <EmptyState text="No artist expenses added yet" /> : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-[640px] w-full text-sm sm:min-w-0">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Artist</th>
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
                          <Link href={`/team/${a.user_id}`} className="text-xs font-medium text-brand-600 hover:underline sm:text-sm">{a.member_name}</Link>
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
        )}
      </Section>

      {/* Output Expenses */}
      <Section title="Output Expenses" count={output_expenses.length} action={<AddOutputExpenseButton eventId={event.id} />}>
        {output_expenses.length === 0 ? <EmptyState text="No output expenses added yet" /> : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-[700px] w-full text-sm sm:min-w-0">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-4 sm:py-3 sm:text-sm">Editor / Vendor</th>
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
                          <Link href={`/team/${o.user_id}`} className="text-xs font-medium text-brand-600 hover:underline sm:text-sm">{o.member_name}</Link>
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
        )}
      </Section>

    </div>
  );
}

function Section({ title, count, action, children }: { title: string; count: number; action: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-6 sm:mt-8">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="section-title">{title} <span className="ml-1 text-xs font-normal text-gray-400 sm:text-sm">({count})</span></h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-gray-300 bg-white py-6 text-center text-sm text-gray-400 sm:py-8">{text}</div>;
}
