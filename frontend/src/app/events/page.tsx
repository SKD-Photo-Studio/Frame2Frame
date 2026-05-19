export const runtime = 'edge';
import { api } from "@/lib/api";
import AddEventButton from "@/components/forms/add-event-form";
import EventsList from "./events-list";
import { getSession } from "@/lib/supabase.server";
import BulkOperationsWrapper from "@/components/ui/bulk-operations-wrapper";
import FinancialYearFilter from "@/components/ui/financial-year-filter";

interface PageProps {
  searchParams: Promise<{ fy?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const fy = sp.fy || "all";
  const { data: { session } } = await getSession();
  const token = session?.access_token;
  
  const events = await api.events.list(fy, token);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="mt-0.5 text-sm text-gray-500">{events.length} events tracked</p>
        </div>
        <div className="flex items-center gap-3">
          <FinancialYearFilter />
          <BulkOperationsWrapper />
          <AddEventButton />
        </div>
      </div>

      <EventsList initialEvents={events} />
    </div>
  );
}
