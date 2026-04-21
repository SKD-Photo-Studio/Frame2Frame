import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, getInitials, getEventTypeColor, cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import EditClientButton from "@/components/forms/edit-client-form";

import { createClient } from "@/lib/supabase.server";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  let data;
  try {
    data = await api.clients.get(params.id, token);
  } catch {
    notFound();
  }

  const { client, events: clientEvents } = data;

  return (
    <div>
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
            {getInitials(client.client_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{client.client_name}</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">Client ID: {client.display_id}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-3 sm:mt-4 sm:justify-start sm:gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 sm:text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                {client.phone_number}
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-xs text-gray-600 sm:text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {client.email}
                </div>
              )}
            </div>

            {client.notes && (
              <p className="mt-2 text-sm italic text-gray-600 sm:mt-3">&ldquo;{client.notes}&rdquo;</p>
            )}

            <div className="mt-3 flex justify-center gap-2 sm:mt-4 sm:justify-start">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
              <EditClientButton client={client} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="section-title">Booked Events ({clientEvents.length})</h2>
        </div>

        {clientEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center sm:py-12">
            <Calendar className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No events booked yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {clientEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-brand-200 hover:shadow-md sm:p-5"
              >
                <div>
                  <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", getEventTypeColor(event.event_type))}>
                    {event.event_type}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-brand-600 sm:text-base">
                    {event.display_id}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">{event.venue}, {event.city}</p>
                  {event.date_string && <p className="mt-1 text-xs text-gray-500">{event.date_string}</p>}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2.5 sm:mt-4 sm:gap-3 sm:p-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Package</p>
                    <p className="text-xs font-semibold text-gray-900 sm:text-sm">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Expenses</p>
                    <p className="text-xs font-semibold text-red-600 sm:text-sm">{formatCurrency(event.total_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Savings</p>
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
