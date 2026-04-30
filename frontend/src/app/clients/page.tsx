import { api } from "@/lib/api";
import AddClientButton from "@/components/forms/add-client-form";
import ClientsList from "./client-list";
import { getSession } from "@/lib/supabase.server";
import BulkOperationsWrapper from "@/components/ui/bulk-operations-wrapper";

export default async function ClientsPage() {
  const { data: { session } } = await getSession();
  const token = session?.access_token;
  
  const clients = await api.clients.list(token);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {clients.length} clients registered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BulkOperationsWrapper />
          <AddClientButton />
        </div>
      </div>

      <ClientsList initialClients={clients} />
    </div>
  );
}
