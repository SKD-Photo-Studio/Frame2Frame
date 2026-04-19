import { api } from "@/lib/api";
import AddClientButton from "@/components/forms/add-client-form";
import ClientsList from "./client-list";

export default async function ClientsPage() {
  const clients = await api.clients.list();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {clients.length} clients registered
          </p>
        </div>
        <AddClientButton />
      </div>

      <ClientsList initialClients={clients} />
    </div>
  );
}
