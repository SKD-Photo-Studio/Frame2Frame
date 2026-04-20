import { api } from "@/lib/api";
import AddClientButton from "@/components/forms/add-client-form";
import ClientsList from "./client-list";

import { createClient } from "@/lib/supabase.server";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
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
        <AddClientButton />
      </div>

      <ClientsList initialClients={clients} />
    </div>
  );
}
