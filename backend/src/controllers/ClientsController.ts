import { Request, Response } from "express";
import { supabase, getDefaultTenantId } from "../DB/supabase";
import { formatDates } from "../utils/date";
import { EventWithClient } from "../types";

export class ClientsController {
  /**
   * GET / — All clients with their event count
   */
  static async getAll(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      const { data: clients, error } = await supabase
        .from("clients_master")
        .select("*, events_master(count)")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_id");

      if (error) throw error;

      const result = (clients ?? []).map((c) => ({
        ...c,
        event_count: (c.events_master as any)?.[0]?.count ?? 0,
        events_master: undefined,
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /:id — Single client detail with events + financials
   */
  static async getById(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      const { data: client, error: clientErr } = await supabase
        .from("clients_master")
        .select("*")
        .eq("id", req.params.id)
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .single();

      if (clientErr || !client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const { data: events, error: eventsErr } = await supabase
        .from("events_master")
        .select("*, client_payments(amount)")
        .eq("client_id", client.id)
        .eq("is_active", true);

      if (eventsErr) throw eventsErr;

      const typedEvents = events as unknown as EventWithClient[];

      const clientEvents = (typedEvents ?? []).map((e) => {
        const totalCollected = (e.client_payments as any[])?.reduce(
          (sum: number, p: any) => sum + (p.amount ?? 0),
          0
        ) ?? 0;

        return {
          ...e,
          client_name: client.client_name,
          date_string: formatDates(e.event_dates ?? []),
          total_collected: totalCollected,
          client_balance: (e.package_value ?? 0) - totalCollected,
          client_payments: undefined,
        };
      });

      res.json({ client, events: clientEvents });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST / — Create a new client
   */
  static async create(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();
      const { client_name, phone_number, email, notes } = req.body;

      if (!client_name || !phone_number) {
        return res.status(400).json({ error: "client_name and phone_number are required" });
      }

      // Generate next display_id
      const { count } = await supabase
        .from("clients_master")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      const displayId = `CLI-${1001 + (count ?? 0)}`;

      const { data, error } = await supabase
        .from("clients_master")
        .insert({
          display_id: displayId,
          tenant_id: tenantId,
          client_name,
          phone_number,
          email: email ?? "",
          notes: notes ?? "",
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
   * PUT /:id — Update a client
   */
  static async update(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from("clients_master")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) return res.status(404).json({ error: "Client not found" });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * DELETE /:id — Soft delete
   */
  static async delete(req: Request, res: Response) {
    try {
      const { error } = await supabase
        .from("clients_master")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", req.params.id);

      if (error) return res.status(404).json({ error: "Client not found" });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
