export type UserRole = "user" | "staff" | "admin";

export type MachineType = "pc" | "ps5";
export type MachineStatus = "free" | "busy" | "reserved" | "maintenance";

export type ReservationStatus =
  | "pending"
  | "active"
  | "finished"
  | "cancelled";

export type TransactionType =
  | "credit_purchase"
  | "reservation"
  | "product"
  | "refund";

export type TicketStatus = "open" | "in_progress" | "closed";

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  credits_minutes: number;
  role: UserRole;
  created_at: string;
  email?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  price_per_hour: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  machine_id: string;
  start_at: string;
  end_at: string;
  duration_min: number;
  status: ReservationStatus;
  paid_via: string | null;
  total_price: number;
  created_at: string;
  machine?: Machine;
  profile?: Profile;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  image_url: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_type: "percent" | "minutes" | "fixed";
  value: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

export interface Event {
  id: string;
  title: string;
  type: "corujao" | "campeonato" | "evento";
  description: string;
  start_at: string;
  end_at: string;
  price: number;
  max_slots: number;
  slots_taken: number;
  requires_advance_payment: boolean;
  active: boolean;
  image_url: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  paid: boolean;
  paid_amount: number;
  status: "registered" | "confirmed" | "cancelled";
  created_at: string;
}

export interface Ranking {
  id: string;
  game: string;
  user_id: string;
  points: number;
  season: string;
  position: number;
  profile?: Profile;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
}

export interface CreditPackage {
  id: string;
  name: string;
  minutes: number;
  price_cents: number;
  bonus_minutes: number;
  popular: boolean;
}

export type ActionState = {
  error?: string;
  success?: string;
  data?: Record<string, unknown>;
};
