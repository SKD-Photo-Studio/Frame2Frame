export interface Client {
  id: string;
  display_id: string;
  client_name: string;
  phone_number: string;
  email: string;
  notes: string;
}

export interface EventMaster {
  id: string;
  display_id: string;
  client_id: string;
  event_type: EventType;
  venue: string;
  city: string;
  package_value: number;
  // Dynamic fields from API
  date_string?: string;
  total_collected?: number;
  client_balance?: number;
  total_expenses?: number;
  total_expenses_paid?: number;
  vendor_balance?: number;
}

export type EventType =
  | "Wedding"
  | "Pre-Wedding"
  | "Engagement"
  | "Birthday"
  | "Anniversary"
  | "Maternity";

export interface EventDate {
  id: string;
  event_id: string;
  event_date: string;
}

export interface ArtistExpense {
  id: string;
  event_id: string;
  user_id: string;
  member_name?: string; // from join
  assignment_role: ArtistRole;
  pay_type: "Lump Sum" | "Per Day";
  date_start: string;
  date_end: string;
  no_of_days: number;
  per_day_rate: number;
  total_amount: number;
  advance_paid: number;
  balance?: number;
  status?: PaidStatus;
}

export type ArtistRole =
  | "Traditional Photographer"
  | "Traditional Videographer"
  | "Cinematographer"
  | "Candid Photographer"
  | "Assistant"
  | "Choreographer"
  | "Director";

export interface OutputExpense {
  id: string;
  event_id: string;
  user_id: string;
  member_name?: string; // from join
  assignment_role: string;
  deliverable: DeliverableType;
  quantity: number;
  total_amount: number;
  advance_paid: number;
  balance?: number;
  status?: PaidStatus;
}

export type DeliverableType =
  | "Reel"
  | "Highlight"
  | "Teaser"
  | "Traditional Video"
  | "Album"
  | "Food & Travel"
  | "Miscellaneous";

export interface ClientPayment {
  id: string;
  event_id: string;
  installment_type: InstallmentType;
  amount: number;
  payment_method: "Cash" | "Online";
  transaction_id: string;
  payment_date: string;
}

export type InstallmentType =
  | "Booking Amount"
  | "Installment 1"
  | "Installment 2"
  | "Installment 3";

export interface TeamMember {
  id: string;
  display_id: string;
  full_name: string;
  usual_role: TeamRole | string;
  phone_number: string;
  email: string;
  // Dynamic fields from API
  assignment_count?: number;
  total_earnings?: number;
  total_paid?: number;
  balance_due?: number;
  pay_status?: string;
}

export type TeamRole =
  | "Traditional Photographer"
  | "Traditional Videographer"
  | "Cinematographer"
  | "Candid Photographer"
  | "Assistant"
  | "Choreographer"
  | "Director"
  | "Editor";

export type PaidStatus = "Paid" | "Partial" | "Unpaid" | "Overpaid" | "";

