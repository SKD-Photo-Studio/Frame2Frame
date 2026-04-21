import { Request, Response } from "express";
import { ExcelService } from "../services/ExcelService";
import { supabase, getDefaultTenantId } from "../DB/supabase";

export class BulkController {
  static async getTemplate(req: Request, res: Response) {
    try {
      const buffer = ExcelService.generateMasterFile();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=Frame2Frame_Bulk_Template.xlsx");
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async exportAll(req: Request, res: Response) {
    try {
      const tenantId = await getDefaultTenantId();
      const [
        { data: clients },
        { data: team },
        { data: events },
        { data: payments },
        { data: artistExpenses },
        { data: outputExpenses }
      ] = await Promise.all([
        supabase.from("clients_master").select("*").eq("tenant_id", tenantId).eq("is_active", true),
        supabase.from("users").select("*"),
        supabase.from("events_master").select("*, clients_master(client_name)").eq("tenant_id", tenantId).eq("is_active", true),
        supabase.from("client_payments").select("*, events_master(display_id)").eq("tenant_id", tenantId).eq("is_active", true),
        supabase.from("artist_expenses").select("*, events_master(display_id), users(full_name)").eq("tenant_id", tenantId).eq("is_active", true),
        supabase.from("output_expenses").select("*, events_master(display_id), users(full_name)").eq("tenant_id", tenantId).eq("is_active", true),
      ]);

      const exportData = {
        [ExcelService.SHEETS.CLIENTS]: (clients ?? []).map(c => [c.display_id, c.client_name, c.phone_number, c.email, c.notes]),
        [ExcelService.SHEETS.TEAM]: (team ?? []).map(u => [u.display_id, u.full_name, u.email, u.phone_number, u.usual_role]),
        [ExcelService.SHEETS.EVENTS]: (events ?? []).map(e => [e.display_id, (e.clients_master as any)?.client_name, e.event_type, e.venue, e.city, e.package_value, e.event_dates?.join(", ")]),
        [ExcelService.SHEETS.PAYMENTS]: (payments ?? []).map(p => [(p.events_master as any)?.display_id, p.installment_type, p.amount, p.payment_method, p.transaction_id, p.payment_date]),
        [ExcelService.SHEETS.ARTIST_EXPENSES]: (artistExpenses ?? []).map(a => [(a.events_master as any)?.display_id, (a.users as any)?.full_name, a.assignment_role, a.pay_type, a.date_start, a.date_end, a.no_of_days, a.per_day_rate, a.total_amount, a.advance_paid, a.status]),
        [ExcelService.SHEETS.OUTPUT_EXPENSES]: (outputExpenses ?? []).map(o => [(o.events_master as any)?.display_id, (o.users as any)?.full_name, o.assignment_role, o.deliverable, o.quantity, o.total_amount, o.advance_paid, o.status]),
      };

      const buffer = ExcelService.generateMasterFile(exportData);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=Frame2Frame_Global_Report.xlsx");
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const tenantId = await getDefaultTenantId();
      const sheets = ExcelService.parseUploadedFile(req.file.buffer);
      const stats = { clients: 0, team: 0, events: 0, payments: 0, artistExpenses: 0, outputExpenses: 0 };

      // 1. Process Team
      const teamRows = sheets[ExcelService.SHEETS.TEAM] || [];
      if (teamRows.length > 0) {
        const teamUpdates = teamRows.map(row => ({
          display_id: row["Display ID"],
          full_name: row["Full Name"],
          email: row["Email"],
          phone_number: row["Phone"],
          usual_role: row["Usual Role"]
        }));
        const { error } = await supabase.from("users").upsert(teamUpdates, { onConflict: "display_id" });
        if (!error) stats.team = teamRows.length;
      }

      // 2. Process Clients
      const clientRows = sheets[ExcelService.SHEETS.CLIENTS] || [];
      if (clientRows.length > 0) {
        const clientUpdates = clientRows.map(row => ({
          tenant_id: tenantId,
          display_id: row["Display ID"],
          client_name: row["Client Name"],
          phone_number: row["Phone"],
          email: row["Email"],
          notes: row["Notes"]
        }));
        const { error } = await supabase.from("clients_master").upsert(clientUpdates, { onConflict: "display_id, tenant_id" });
        if (!error) stats.clients = clientRows.length;
      }

      const [{ data: allClients }, { data: allUsers }] = await Promise.all([
        supabase.from("clients_master").select("id, client_name").eq("tenant_id", tenantId),
        supabase.from("users").select("id, full_name"),
      ]);
      const clientLookup = new Map(allClients?.map(c => [c.client_name, c.id]));
      const userLookup = new Map(allUsers?.map(u => [u.full_name, u.id]));

      // 3. Process Events
      const eventRows = sheets[ExcelService.SHEETS.EVENTS] || [];
      if (eventRows.length > 0) {
        const eventUpdates = eventRows.map(row => {
          const clientId = clientLookup.get(row["Client Name"]);
          if (!clientId) return null;
          const dates = row["Dates"] ? String(row["Dates"]).split(",").map(d => d.trim()) : [];
          return {
            tenant_id: tenantId,
            display_id: row["Display ID"],
            client_id: clientId,
            event_type: row["Event Type"],
            venue: row["Venue"],
            city: row["City"],
            package_value: Number(row["Package Value"]) || 0,
            event_dates: dates
          };
        }).filter(Boolean);
        const { error } = await supabase.from("events_master").upsert(eventUpdates as any, { onConflict: "display_id, tenant_id" });
        if (!error) stats.events = (eventUpdates as any[]).length;
      }

      const { data: allEvents } = await supabase.from("events_master").select("id, display_id").eq("tenant_id", tenantId);
      const eventLookup = new Map(allEvents?.map(e => [e.display_id, e.id]));

      // 4. Process Payments
      const paymentRows = (sheets[ExcelService.SHEETS.PAYMENTS] || []).map(row => {
        const eventId = eventLookup.get(row["Event Display ID"]);
        if (!eventId) return null;
        return {
          tenant_id: tenantId,
          event_id: eventId,
          installment_type: row["Type"],
          amount: Number(row["Amount"]) || 0,
          payment_method: row["Method"] || "Cash",
          transaction_id: row["Transaction ID"],
          payment_date: row["Date"]
        };
      }).filter(Boolean);
      if (paymentRows.length > 0) {
        const { error } = await supabase.from("client_payments").insert(paymentRows as any);
        if (!error) stats.payments = (paymentRows as any[]).length;
      }

      // 5. Process Artist Expenses
      const artistRows = (sheets[ExcelService.SHEETS.ARTIST_EXPENSES] || []).map(row => {
        const eventId = eventLookup.get(row["Event Display ID"]);
        const userId = userLookup.get(row["User Name"]);
        if (!eventId || !userId) return null;
        return {
          tenant_id: tenantId,
          event_id: eventId,
          user_id: userId,
          assignment_role: row["Role"],
          pay_type: row["Pay Type"],
          date_start: row["Start Date"],
          date_end: row["End Date"],
          no_of_days: Number(row["Days"]) || 1,
          per_day_rate: Number(row["Rate"]) || 0,
          total_amount: Number(row["Total"]) || 0,
          advance_paid: Number(row["Advance"]) || 0,
          status: row["Status"] || "Unpaid"
        };
      }).filter(Boolean);
      if (artistRows.length > 0) {
        const { error } = await supabase.from("artist_expenses").insert(artistRows as any);
        if (!error) stats.artistExpenses = (artistRows as any[]).length;
      }

      // 6. Process Output Expenses
      const outputRows = (sheets[ExcelService.SHEETS.OUTPUT_EXPENSES] || []).map(row => {
        const eventId = eventLookup.get(row["Event Display ID"]);
        const userId = userLookup.get(row["User Name"]);
        if (!eventId || !userId) return null;
        return {
          tenant_id: tenantId,
          event_id: eventId,
          user_id: userId,
          assignment_role: row["Role"] || "Editor",
          deliverable: row["Deliverable"],
          quantity: Number(row["Quantity"]) || 1,
          total_amount: Number(row["Total"]) || 0,
          advance_paid: Number(row["Advance"]) || 0,
          status: row["Status"] || "Unpaid"
        };
      }).filter(Boolean);
      if (outputRows.length > 0) {
        const { error } = await supabase.from("output_expenses").insert(outputRows as any);
        if (!error) stats.outputExpenses = (outputRows as any[]).length;
      }

      res.json({ message: "Upload processed successfully", stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
