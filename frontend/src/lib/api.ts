import { createClient as createBrowserClient } from "./supabase.client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" ? "/api" : "http://localhost:5001/api");

async function getAuthToken() {
  if (typeof window !== 'undefined') {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }
  
  // Server-side: use a safe way to check cookies without breaking the client bundle
  return null;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit & { token?: string }): Promise<T> {
  const token = options?.token || await getAuthToken();
  const headers: Record<string, string> = { 
    "Content-Type": "application/json", 
    ...options?.headers as Record<string, string> 
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ── Response shapes ─────────────────────────────────────────

export interface ClientListItem {
  id: string;
  display_id: string;
  client_name: string;
  phone_number: string;
  email: string;
  notes: string;
  event_count: number;
}

export interface EventWithFinancials {
  id: string;
  display_id: string;
  client_id: string;
  event_type: string;
  venue: string;
  city: string;
  package_value: number;
  client_name: string;
  date_string: string;
  total_collected: number;
  payment_status: string;
  client_balance: number;
  total_expenses: number;
  savings: number;
  team_size: number;
}

export interface ClientDetailResponse {
  client: ClientListItem;
  events: EventWithFinancials[];
}

export interface EventDetailResponse {
  event: {
    id: string;
    display_id: string;
    client_id: string;
    event_type: string;
    venue: string;
    city: string;
    package_value: number;
    date_string: string;
  };
  client: { id: string; client_name: string } | null;
  dates: string[];
  payments: {
    id: string;
    installment_type: string;
    amount: number;
    payment_method: string;
    transaction_id: string;
    payment_date: string;
  }[];
  artist_expenses: {
    id: string;
    user_id: string;
    member_name: string;
    assignment_role: string;
    pay_type: string;
    no_of_days: number;
    per_day_rate: number;
    total_amount: number;
    advance_paid: number;
    status: string;
    balance: number;
  }[];
  output_expenses: {
    id: string;
    user_id: string;
    member_name: string;
    assignment_role: string;
    deliverable: string;
    quantity: number;
    total_amount: number;
    advance_paid: number;
    status: string;
    balance: number;
  }[];
  financials: {
    total_collected: number;
    payment_status: string;
    client_balance: number;
    total_expenses: number;
    total_artist_expenses: number;
    total_output_expenses: number;
    total_expenses_paid: number;
    team_balance: number;
    savings: number;
    team_size: number;
  };
}

export interface TeamListItem {
  id: string;
  display_id: string;
  full_name: string;
  usual_role: string;
  phone_number: string;
  email: string;
  assignment_count: number;
  total_earnings: number;
  total_paid: number;
  balance_due: number;
  pay_status: string;
}

export interface TeamDetailResponse {
  member: TeamListItem;
  artist_expenses: {
    id: string;
    event_id: string;
    event_name: string;
    event_display_id: string;
    assignment_role: string;
    total_amount: number;
    advance_paid: number;
    status: string;
    balance: number;
  }[];
  output_expenses: {
    id: string;
    event_id: string;
    event_name: string;
    event_display_id: string;
    deliverable: string;
    quantity: number;
    total_amount: number;
    advance_paid: number;
    status: string;
    balance: number;
  }[];
  totals: {
    assignments: number;
    earnings: number;
    paid: number;
    balance_due: number;
  };
}

export interface DashboardResponse {
  total_clients: number;
  total_events: number;
  total_team_members: number;
  total_revenue: number;
  total_collected: number;
  client_balance: number;
  total_expenses: number;
  total_artist_expenses: number;
  total_output_expenses: number;
  paid_to_team: number;
  team_balance: number;
  total_savings: number;
  recent_events: EventWithFinancials[];
  upcoming_dates: {
    date: string;
    event_id: string;
    event_type: string;
    display_id: string;
    client_name: string;
  }[];
}


export interface EventMetaResponse {
  cities: string[];
  venues: string[];
  event_types: string[];
}

export interface SearchResponse {
  clients: { id: string; display_id: string; client_name: string; email: string; phone_number: string }[];
  events: { id: string; display_id: string; event_type: string; client_name: string }[];
  team: { id: string; display_id: string; full_name: string; usual_role: string }[];
}

export interface TenantResponse {
  id: string;
  display_id: string;
  company_name: string;
  logo_url: string | null;
}

// ── API methods ─────────────────────────────────────────────

export const api = {
  dashboard: (token?: string) => fetchAPI<DashboardResponse>("/dashboard", { token }),
  me: (token?: string) => fetchAPI<any>("/me", { token }),
  search: (q: string, token?: string) => fetchAPI<SearchResponse>(`/search?q=${encodeURIComponent(q)}`, { token }),

  clients: {
    list: (token?: string) => fetchAPI<ClientListItem[]>("/clients", { token }),
    get: (id: string, token?: string) => fetchAPI<ClientDetailResponse>(`/clients/${id}`, { token }),
    create: (data: Record<string, unknown>) =>
      fetchAPI<ClientListItem>("/clients", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI<ClientListItem>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/clients/${id}`, { method: "DELETE" }),
  },

  events: {
    list: (token?: string) => fetchAPI<EventWithFinancials[]>("/events", { token }),
    meta: (token?: string) => fetchAPI<EventMetaResponse>("/events/meta", { token }),
    get: (id: string, token?: string) => fetchAPI<EventDetailResponse>(`/events/${id}`, { token }),
    create: (data: Record<string, unknown>) =>
      fetchAPI<EventWithFinancials>("/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI<EventWithFinancials>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/events/${id}`, { method: "DELETE" }),

    // ── Payments & Expenses ────────────────────────────────────
    addPayment: (eventId: string, data: Record<string, unknown>) =>
      fetchAPI<void>(`/events/${eventId}/payments`, { method: "POST", body: JSON.stringify(data) }),
    
    addArtistExpense: (eventId: string, data: Record<string, unknown>) =>
      fetchAPI<void>(`/events/${eventId}/artist-expenses`, { method: "POST", body: JSON.stringify(data) }),
    
    addOutputExpense: (eventId: string, data: Record<string, unknown>) =>
      fetchAPI<void>(`/events/${eventId}/output-expenses`, { method: "POST", body: JSON.stringify(data) }),
    
    addDate: (eventId: string, data: { event_date: string }) =>
      fetchAPI<void>(`/events/${eventId}/dates`, { method: "POST", body: JSON.stringify(data) }),
  },

  team: {
    list: (token?: string) => fetchAPI<TeamListItem[]>("/team", { token }),
    get: (id: string, token?: string) => fetchAPI<TeamDetailResponse>(`/team/${id}`, { token }),
    create: (data: Record<string, unknown>) =>
      fetchAPI<TeamListItem>("/team", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI<TeamListItem>(`/team/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/team/${id}`, { method: "DELETE" }),
  },

  tenant: {
    get: (token?: string) => fetchAPI<TenantResponse>("/tenant", { token }),
    listAdmins: (token?: string) => fetchAPI<any[]>("/tenant/admins", { token }),
    update: (data: Partial<TenantResponse>) =>
      fetchAPI<TenantResponse>("/tenant", { method: "PUT", body: JSON.stringify(data) }),
    uploadLogo: (base64: string) =>
      fetchAPI<{ url: string }>("/tenant/logo", {
        method: "POST",
        body: JSON.stringify({ base64 }),
      }),
  },

  bulk: {
    getTemplate: async (token?: string) => {
      const res = await fetch(`${API_BASE}/bulk/template`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download template");
      return res.blob();
    },
    upload: async (file: File, token?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/bulk/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload data");
      }
      return res.json();
    },
    exportAll: async (token?: string) => {
      const res = await fetch(`${API_BASE}/bulk/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export data");
      return res.blob();
    },
  },
};
