const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
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
  client_balance: number;
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
    client_balance: number;
    total_expenses: number;
    total_artist_expenses: number;
    total_output_expenses: number;
    total_expenses_paid: number;
    vendor_balance: number;
    savings: number;
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
  total_pending: number;
  total_expenses: number;
  total_artist_expenses: number;
  total_output_expenses: number;
  paid_to_team: number;
  yet_to_pay_team: number;
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
  dashboard: () => fetchAPI<DashboardResponse>("/dashboard"),
  search: (q: string) => fetchAPI<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),

  clients: {
    list: () => fetchAPI<ClientListItem[]>("/clients"),
    get: (id: string) => fetchAPI<ClientDetailResponse>(`/clients/${id}`),
    create: (data: Record<string, unknown>) =>
      fetchAPI<ClientListItem>("/clients", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI<ClientListItem>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/clients/${id}`, { method: "DELETE" }),
  },

  events: {
    list: () => fetchAPI<EventWithFinancials[]>("/events"),
    meta: () => fetchAPI<EventMetaResponse>("/events/meta"),
    get: (id: string) => fetchAPI<EventDetailResponse>(`/events/${id}`),
    create: (data: Record<string, unknown>) =>
      fetchAPI<EventWithFinancials>("/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI<EventWithFinancials>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/events/${id}`, { method: "DELETE" }),
  },

  team: {
    list: () => fetchAPI<TeamListItem[]>("/team"),
    get: (id: string) => fetchAPI<TeamDetailResponse>(`/team/${id}`),
    create: (data: Record<string, unknown>) =>
      fetchAPI<TeamListItem>("/team", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI<TeamListItem>(`/team/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<void>(`/team/${id}`, { method: "DELETE" }),
  },

  tenant: {
    get: () => fetchAPI<TenantResponse>("/tenant"),
    update: (data: Partial<TenantResponse>) =>
      fetchAPI<TenantResponse>("/tenant", { method: "PUT", body: JSON.stringify(data) }),
    uploadLogo: (base64: string) =>
      fetchAPI<{ url: string }>("/tenant/logo", {
        method: "POST",
        body: JSON.stringify({ base64 }),
      }),
  },
};
