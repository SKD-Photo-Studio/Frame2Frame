import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getInitials, getEventTypeColor, getPaidStatusColor, cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import EditClientButton from "@/components/forms/edit-client-form";
import AddEventButton from "@/components/forms/add-event-form";

import { createServerSupabaseClient, getSession } from "@/lib/supabase.server";

export default async function ClientDetailPage({
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
    data = await api.clients.get(id, token);
  } catch {
    notFound();
  }

  const { client, events: clientEvents } = data;

  // Determine back link
  let backHref = "/clients";
  let backLabel = "Back to Clients";

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

      <div className="stat-card">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
            {getInitials(client.client_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl">{client.client_name}</h1>
            <p className="mt-0.5 text-xs opacity-60 sm:mt-1 sm:text-sm">Client ID: {client.display_id}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-3 sm:mt-4 sm:justify-start sm:gap-4">
              <div className="flex items-center gap-2 text-xs opacity-70 sm:text-sm">
                <Phone className="h-4 w-4 opacity-40" />
                {client.phone_number}
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-xs opacity-70 sm:text-sm">
                  <Mail className="h-4 w-4 opacity-40" />
                  {client.email}
                </div>
              )}
            </div>

            {client.notes && (
              <p className="mt-2 text-sm italic opacity-70 sm:mt-3">&ldquo;{client.notes}&rdquo;</p>
            )}

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
              <button 
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors opacity-80 hover:opacity-100"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
              <EditClientButton client={client} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6">
        <div className="stat-card !p-3.5 !mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title !mb-0 text-base sm:text-lg">Booked Events ({clientEvents.length})</h2>
          <AddEventButton initialClientId={client.id} />
        </div>

        {clientEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center sm:py-12" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)', borderColor: 'var(--border)' }}>
            <Calendar className="mx-auto h-10 w-10 opacity-20" />
            <p className="mt-2 text-sm opacity-50">No events booked yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {clientEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${(event as any).display_id || (event as any).id}?from=client&clientId=${(client as any).display_id || (client as any).id}&fromName=${(client as any).client_name}`}
                className="stat-card group transition-all hover:border-brand-400 hover:shadow-md"
              >
                  <div className="flex items-start justify-between">
                    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", getEventTypeColor(event.event_type))}>
                      {event.event_type}
                    </span>
                    {event.payment_status && (
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        getPaidStatusColor(event.payment_status)
                      )}>
                        {event.payment_status}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold group-hover:text-brand-600 sm:text-base">
                    {event.display_id}
                  </h3>
                  <p className="mt-1 text-xs opacity-60 sm:text-sm">{event.venue}, {event.city}</p>
                  <div className="mt-1 flex items-center justify-between">
                    {event.date_string && <p className="text-xs opacity-60">{event.date_string}</p>}
                    <span className="text-[10px] font-medium opacity-50">
                      Team Size: <span className="font-semibold opacity-100">{event.team_size || 0}</span>
                    </span>
                  </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg p-2.5 sm:mt-4 sm:gap-3 sm:p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--foreground), transparent 95%)' }}>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Package</p>
                    <p className="text-xs font-semibold sm:text-sm">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Expenses</p>
                    <p className="text-xs font-semibold text-red-600 sm:text-sm">{formatCurrency(event.total_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Savings</p>
                    <p className={cn("text-xs font-semibold sm:text-sm", event.savings >= 0 ? "text-brand-600" : "text-red-600")}>
                      {formatCurrency(event.savings)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
