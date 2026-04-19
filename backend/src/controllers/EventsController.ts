import { Request, Response } from "express";
import { supabase, getDefaultTenantId } from "../DB/supabase";
import { formatDates } from "../utils/date";
import { calcBalance } from "../utils/math";
import { 
  EventWithClient, 
  ArtistExpenseWithUser, 
  OutputExpenseWithUser, 
  ClientPaymentRow 
} from "../types";

export class EventsController {
  /**
   * GET / — All events with computed financials
   */
  static async getAll(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      const { data: events, error } = await supabase
        .from("events_master")
        .select("*, clients_master(client_name), client_payments(amount)")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_id");

      if (error) throw error;

      const typedEvents = events as unknown as EventWithClient[];

      const result = (typedEvents ?? []).map((e) => {
        const totalCollected = (e.client_payments as any[])?.reduce(
          (sum: number, p: any) => sum + (p.amount ?? 0),
          0
        ) ?? 0;

        return {
          ...e,
          client_name: e.clients_master?.client_name ?? "Unknown",
          date_string: formatDates(e.event_dates ?? []),
          total_collected: totalCollected,
          client_balance: (e.package_value ?? 0) - totalCollected,
          clients_master: undefined,
          client_payments: undefined,
        };
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /meta — Unique cities, venues, event_types
   */
  static async getMeta(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();
      const { data } = await supabase
        .from("events_master")
        .select("city, venue, event_type")
        .eq("tenant_id", tenantId)
        .eq("is_active", true);

      const unique = (arr: (string | null | undefined)[]) =>
        [...new Set(arr.filter(Boolean) as string[])].sort();

      res.json({
        cities: unique((data ?? []).map((e) => e.city)),
        venues: unique((data ?? []).map((e) => e.venue)),
        event_types: unique((data ?? []).map((e) => e.event_type)),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /:id — Full event detail
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [
        { data: event, error: evtErr },
        { data: artistExp },
        { data: outputExp },
        { data: payments },
      ] = await Promise.all([
        supabase
          .from("events_master")
          .select("*, clients_master(*)")
          .eq("id", id)
          .eq("is_active", true)
          .single(),
        supabase
          .from("artist_expenses")
          .select("*, users(full_name, usual_role)")
          .eq("event_id", id)
          .eq("is_active", true),
        supabase
          .from("output_expenses")
          .select("*, users(full_name, usual_role)")
          .eq("event_id", id)
          .eq("is_active", true),
        supabase
          .from("client_payments")
          .select("*")
          .eq("event_id", id)
          .eq("is_active", true),
      ]);

      if (evtErr || !event) return res.status(404).json({ error: "Event not found" });

      const typedArtistExp = artistExp as unknown as ArtistExpenseWithUser[];
      const typedOutputExp = outputExp as unknown as OutputExpenseWithUser[];
      const typedPayments = payments as unknown as ClientPaymentRow[];

      const totalCollected = (typedPayments ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
      const totalArtist = (typedArtistExp ?? []).reduce((s, a) => s + (a.total_amount ?? 0), 0);
      const totalOutput = (typedOutputExp ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);
      const totalExpenses = totalArtist + totalOutput;
      const totalExpPaid =
        (typedArtistExp ?? []).reduce((s, a) => s + (a.advance_paid ?? 0), 0) +
        (typedOutputExp ?? []).reduce((s, o) => s + (o.advance_paid ?? 0), 0);

      res.json({
        event: {
          ...event,
          client: (event as any).clients_master ?? null,
          date_string: formatDates(event.event_dates ?? []),
          clients_master: undefined,
        },
        dates: event.event_dates ?? [],
        payments: typedPayments ?? [],
        artist_expenses: (typedArtistExp ?? []).map((a) => {
          const { balance, status } = calcBalance(a.total_amount ?? 0, a.advance_paid ?? 0);
          return {
            ...a,
            member_name: a.users?.full_name ?? "",
            default_role: a.users?.usual_role ?? "",
            balance,
            status,
            users: undefined,
          };
        }),
        output_expenses: (typedOutputExp ?? []).map((o) => {
          const { balance, status } = calcBalance(o.total_amount ?? 0, o.advance_paid ?? 0);
          return {
            ...o,
            member_name: o.users?.full_name ?? "",
            default_role: o.users?.usual_role ?? "",
            balance,
            status,
            users: undefined,
          };
        }),
        financials: {
          total_collected: totalCollected,
          client_balance: (event.package_value ?? 0) - totalCollected,
          total_expenses: totalExpenses,
          total_artist_expenses: totalArtist,
          total_output_expenses: totalOutput,
          total_expenses_paid: totalExpPaid,
          vendor_balance: totalExpenses - totalExpPaid,
          savings: (event.package_value ?? 0) - totalExpenses,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST / — Create event
   */
  static async create(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();
      const { client_id, event_type, venue, city, package_value, event_dates } = req.body;

      if (!client_id || !event_type) {
        return res.status(400).json({ error: "client_id and event_type are required" });
      }

      // Create robust display_id: Client Name + Event Type
      const { data: clientData } = await supabase
        .from("clients_master")
        .select("client_name")
        .eq("id", client_id)
        .single();

      const clientName = clientData?.client_name ?? "Unknown Client";
      let displayId = `${clientName} | ${event_type}`.trim();

      // Ensure uniqueness
      const { data: existing } = await supabase
        .from("events_master")
        .select("id")
        .eq("tenant_id", tenantId)
        .like("display_id", `${displayId}%`);

      if (existing && existing.length > 0) {
        displayId = `${displayId} (${existing.length + 1})`;
      }

      const { data, error } = await supabase
        .from("events_master")
        .insert({
          display_id: displayId,
          tenant_id: tenantId,
          client_id,
          event_type,
          venue: venue ?? "",
          city: city ?? "",
          package_value: package_value ?? 0,
          event_dates: event_dates ?? [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /:id — Update event
   */
  static async update(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from("events_master")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) return res.status(404).json({ error: "Event not found" });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * DELETE /:id — Soft delete event
   */
  static async delete(req: Request, res: Response) {
    try {
      const { error } = await supabase
        .from("events_master")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", req.params.id);

      if (error) return res.status(404).json({ error: "Event not found" });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  
  // Helper methods for sub-routes would go here too if we want full refactor
}
