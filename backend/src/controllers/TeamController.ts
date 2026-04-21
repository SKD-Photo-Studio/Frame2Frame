import { Request, Response } from "express";
import { supabase, getDefaultTenantId } from "../DB/supabase";
import { ArtistExpenseWithUser, OutputExpenseWithUser, UserRow } from "../types";

export class TeamController {
  /**
   * GET / — All team members with unified balance
   */
  static async getAll(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      const { data: memberships, error: memErr } = await supabase
        .from("workspace_memberships")
        .select("user_id, users(*)")
        .eq("tenant_id", tenantId)
        .eq("role", "MEMBER")
        .eq("is_active", true);

      if (memErr) throw memErr;

      const userIds = (memberships ?? []).map((m) => (m.users as any)?.id).filter(Boolean);

      const [{ data: artistExp }, { data: outputExp }] = await Promise.all([
        supabase
          .from("artist_expenses")
          .select("user_id, total_amount, advance_paid")
          .in("user_id", userIds)
          .eq("tenant_id", tenantId)
          .eq("is_active", true),
        supabase
          .from("output_expenses")
          .select("user_id, total_amount, advance_paid")
          .in("user_id", userIds)
          .eq("tenant_id", tenantId)
          .eq("is_active", true),
      ]);

      const artistByUser = groupExpenses(artistExp ?? []);
      const outputByUser = groupExpenses(outputExp ?? []);

      const result = (memberships ?? []).map((m) => {
        const user = m.users as any;
        const uid = user?.id;
        const aEarnings = artistByUser[uid]?.earnings ?? 0;
        const aPaid = artistByUser[uid]?.paid ?? 0;
        const aCount = artistByUser[uid]?.count ?? 0;
        const oEarnings = outputByUser[uid]?.earnings ?? 0;
        const oPaid = outputByUser[uid]?.paid ?? 0;
        const oCount = outputByUser[uid]?.count ?? 0;

        const totalEarnings = aEarnings + oEarnings;
        const totalPaid = aPaid + oPaid;
        const balanceDue = totalEarnings - totalPaid;
        const status =
          totalEarnings === 0
            ? "No Assignments"
            : totalPaid >= totalEarnings
            ? "Paid"
            : totalPaid > 0
            ? "Partial"
            : "Unpaid";

        return {
          ...user,
          assignment_count: aCount + oCount,
          total_earnings: totalEarnings,
          total_paid: totalPaid,
          balance_due: balanceDue,
          pay_status: status,
        };
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /:id — Full team member detail
   */
  static async getById(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      // Verify membership first
      const { data: membership, error: memErr } = await supabase
        .from("workspace_memberships")
        .select("*")
        .eq("user_id", req.params.id)
        .eq("tenant_id", tenantId)
        .single();
      
      if (memErr || !membership) return res.status(404).json({ error: "Team member not found" });

      const { data: member, error: memberErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (memberErr || !member) return res.status(404).json({ error: "Team member details not found" });

      const [{ data: artistExp }, { data: outputExp }] = await Promise.all([
        supabase
          .from("artist_expenses")
          .select("*, events_master(display_id, event_type, clients_master(client_name))")
          .eq("user_id", req.params.id)
          .eq("tenant_id", tenantId)
          .eq("is_active", true),
        supabase
          .from("output_expenses")
          .select("*, events_master(display_id, event_type, clients_master(client_name))")
          .eq("user_id", req.params.id)
          .eq("tenant_id", tenantId)
          .eq("is_active", true),
      ]);

      const artistExpenses = (artistExp ?? []).map((a) => {
        const evt = a.events_master as any;
        const balance = (a.total_amount ?? 0) - (a.advance_paid ?? 0);
        const status = balance === 0 ? "Paid" : (a.advance_paid ?? 0) > 0 ? "Partial" : "Unpaid";
        return {
          ...a,
          event_name: evt ? `${evt.clients_master?.client_name ?? ""} | ${evt.event_type}` : "",
          event_display_id: evt?.display_id ?? "",
          balance,
          status,
          events_master: undefined,
        };
      });

      const outputExpenses = (outputExp ?? []).map((o) => {
        const evt = o.events_master as any;
        const balance = (o.total_amount ?? 0) - (o.advance_paid ?? 0);
        const status = balance === 0 ? "Paid" : (o.advance_paid ?? 0) > 0 ? "Partial" : "Unpaid";
        return {
          ...o,
          event_name: evt ? `${evt.clients_master?.client_name ?? ""} | ${evt.event_type}` : "",
          event_display_id: evt?.display_id ?? "",
          balance,
          status,
          events_master: undefined,
        };
      });

      const totalEarnings =
        artistExpenses.reduce((s, a) => s + (a.total_amount ?? 0), 0) +
        outputExpenses.reduce((s, o) => s + (o.total_amount ?? 0), 0);
      const totalPaid =
        artistExpenses.reduce((s, a) => s + (a.advance_paid ?? 0), 0) +
        outputExpenses.reduce((s, o) => s + (o.advance_paid ?? 0), 0);

      res.json({
        member,
        artist_expenses: artistExpenses,
        output_expenses: outputExpenses,
        totals: {
          assignments: artistExpenses.length + outputExpenses.length,
          earnings: totalEarnings,
          paid: totalPaid,
          balance_due: totalEarnings - totalPaid,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST / — Add a new team member
   */
  static async create(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();
      const { full_name, usual_role, phone_number, email } = req.body;

      if (!full_name || !usual_role) {
        return res.status(400).json({ error: "full_name and usual_role are required" });
      }

      // Generate next display_id
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true });

      const displayId = `USR-${1001 + (count ?? 0)}`;

      const { data: user, error: userErr } = await supabase
        .from("users")
        .insert({
          display_id: displayId,
          full_name,
          usual_role,
          phone_number: phone_number ?? "",
          email: email ?? "",
        })
        .select()
        .single();

      if (userErr || !user) throw userErr;

      // Add workspace membership
      await supabase.from("workspace_memberships").insert({
        user_id: user.id,
        tenant_id: tenantId,
        role: "MEMBER",
      });

      res.status(201).json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /:id — Update team member
   */
  static async update(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      // Verify membership
      const { data: membership } = await supabase
        .from("workspace_memberships")
        .select("id")
        .eq("user_id", req.params.id)
        .eq("tenant_id", tenantId)
        .single();

      if (!membership) return res.status(404).json({ error: "Team member not found" });

      const { data, error } = await supabase
        .from("users")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) return res.status(404).json({ error: "Team member not found" });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * DELETE /:id — Deactivate from workspace (soft)
   */
  static async delete(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();

      const { error } = await supabase
        .from("workspace_memberships")
        .update({ is_active: false })
        .eq("user_id", req.params.id)
        .eq("tenant_id", tenantId);

      if (error) return res.status(404).json({ error: "Team member not found" });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

// Helper
function groupExpenses(
  rows: { user_id: string; total_amount: number; advance_paid: number }[]
): Record<string, { earnings: number; paid: number; count: number }> {
  return rows.reduce((acc, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = { earnings: 0, paid: 0, count: 0 };
    acc[row.user_id].earnings += row.total_amount ?? 0;
    acc[row.user_id].paid += row.advance_paid ?? 0;
    acc[row.user_id].count += 1;
    return acc;
  }, {} as Record<string, { earnings: number; paid: number; count: number }>);
}
