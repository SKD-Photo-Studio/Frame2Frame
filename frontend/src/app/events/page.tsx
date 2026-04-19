import { api } from "@/lib/api";
import AddEventButton from "@/components/forms/add-event-form";
import EventsList from "./events-list";

export default async function EventsPage() {
  const events = await api.events.list();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="mt-0.5 text-sm text-gray-500">{events.length} events tracked</p>
        </div>
        <AddEventButton />
      </div>

      <EventsList initialEvents={events} />

    </div>
  );
}
