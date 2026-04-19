/**
 * Database Table Definitions (Supabase)
 */

export interface TenantRow {
  id: string;
  display_id: string;
  company_name: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  display_id: string;
  tenant_id: string;
  client_name: string;
  phone_number: string;
  email: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  display_id: string;
  tenant_id: string;
  client_id: string;
  event_type: string;
  venue: string;
  city: string;
  package_value: number;
  event_dates: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  display_id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  usual_role: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistExpenseRow {
  id: string;
  tenant_id: string;
  event_id: string;
  user_id: string;
  assignment_role: string;
  pay_type: string;
  date_start: string | null;
  date_end: string | null;
  no_of_days: number | null;
  per_day_rate: number | null;
  total_amount: number;
  advance_paid: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutputExpenseRow {
  id: string;
  tenant_id: string;
  event_id: string;
  user_id: string;
  assignment_role: string;
  deliverable: string;
  quantity: number;
  total_amount: number;
  advance_paid: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPaymentRow {
  id: string;
  tenant_id: string;
  event_id: string;
  installment_type: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  payment_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Joined Query Interfaces
 */

export interface EventWithClient extends EventRow {
  clients_master: { client_name: string };
  client_payments: { amount: number }[];
}

export interface ArtistExpenseWithUser extends ArtistExpenseRow {
  users: { full_name: string; usual_role: string };
}

export interface OutputExpenseWithUser extends OutputExpenseRow {
  users: { full_name: string; usual_role: string };
}

/**
 * Legacy/UI Types (keeping for compatibility or mapping)
 */

export type EventType =
  | "Wedding"
  | "Pre-Wedding"
  | "Engagement"
  | "Birthday"
  | "Anniversary"
  | "Maternity";

export type ArtistRole =
  | "Traditional Photographer"
  | "Traditional Videographer"
  | "Cinematographer"
  | "Candid Photographer"
  | "Assistant"
  | "Choreographer"
  | "Director";

export type DeliverableType =
  | "Reel"
  | "Highlight"
  | "Teaser"
  | "Traditional Video"
  | "Album"
  | "Food & Travel"
  | "Miscellaneous";

export type PaidStatus = "Paid" | "Partial" | "Unpaid" | "";
