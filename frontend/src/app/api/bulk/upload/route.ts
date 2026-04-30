import { NextResponse } from "next/server";
import { ExcelService } from "@/lib/excel.server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const tenantId = await getDefaultTenantId();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sheets = ExcelService.parseUploadedFile(buffer);
    const stats = { clients: 0, team: 0, events: 0, payments: 0, artistExpenses: 0, outputExpenses: 0 };

    // 1. Process Team
    const teamRows = sheets[ExcelService.SHEETS.TEAM] || [];
    if (teamRows.length > 0) {
      const teamUpdates = teamRows.map(row => ({
        display_id: String(row["Display ID"]).trim(),
        full_name: String(row["Full Name"]).trim(),
        email: String(row["Email"] || "").trim(),
        phone_number: String(row["Phone"] || "").trim(),
        usual_role: String(row["Usual Role"] || "").trim()
      }));
      
      const { data: upsertedUsers, error } = await supabaseAdmin
        .from("users")
        .upsert(teamUpdates, { onConflict: "display_id" })
        .select("id");

      if (!error && upsertedUsers) {
        stats.team = teamRows.length;
        const memberships = upsertedUsers.map(u => ({
          user_id: u.id,
          tenant_id: tenantId,
          role: "MEMBER"
        }));
        await supabaseAdmin.from("workspace_memberships").upsert(memberships, { onConflict: "user_id, tenant_id" });
      }
    }

    // 2. Process Clients
    const clientRows = sheets[ExcelService.SHEETS.CLIENTS] || [];
    if (clientRows.length > 0) {
      const clientUpdates = clientRows.map(row => ({
        tenant_id: tenantId,
        display_id: String(row["Display ID"]).trim(),
        client_name: String(row["Client Name"]).trim(),
        phone_number: String(row["Phone"] || "").trim(),
        email: String(row["Email"] || "").trim(),
        notes: String(row["Notes"] || "").trim()
      }));
      const { error } = await supabaseAdmin.from("clients_master").upsert(clientUpdates, { onConflict: "display_id, tenant_id" });
      if (!error) stats.clients = clientRows.length;
    }

    const [{ data: allClients }, { data: allUsers }] = await Promise.all([
      supabaseAdmin.from("clients_master").select("id, client_name").eq("tenant_id", tenantId),
      supabaseAdmin.from("users").select("id, full_name"),
    ]);
    
    const clientLookup = new Map(allClients?.map(c => [c.client_name.toLowerCase().trim(), c.id]));
    const userLookup = new Map(allUsers?.map(u => [u.full_name.toLowerCase().trim(), u.id]));

    // 3. Process Events
    const eventRows = sheets[ExcelService.SHEETS.EVENTS] || [];
    if (eventRows.length > 0) {
      const eventUpdates = eventRows.map(row => {
        const clientName = String(row["Client Name"] || "").toLowerCase().trim();
        const clientId = clientLookup.get(clientName);
        if (!clientId) return null;
        const dates = row["Dates"] ? String(row["Dates"]).split(",").map(d => d.trim()) : [];
        return {
          tenant_id: tenantId,
          display_id: String(row["Display ID"]).trim(),
          client_id: clientId,
          event_type: String(row["Event Type"]).trim(),
          venue: String(row["Venue"] || "").trim(),
          city: String(row["City"] || "").trim(),
          package_value: Number(row["Package Value"]) || 0,
          event_dates: dates
        };
      }).filter(Boolean);
      const { error } = await supabaseAdmin.from("events_master").upsert(eventUpdates as any, { onConflict: "display_id, tenant_id" });
      if (!error) stats.events = (eventUpdates as any[]).length;
    }

    const { data: allEvents } = await supabaseAdmin.from("events_master").select("id, display_id").eq("tenant_id", tenantId);
    const eventLookup = new Map(allEvents?.map(e => [e.display_id.toLowerCase().trim(), e.id]));

    // 4. Process Payments
    const paymentRows = (sheets[ExcelService.SHEETS.PAYMENTS] || []).map(row => {
      const eventId = eventLookup.get(String(row["Event Display ID"] || "").toLowerCase().trim());
      if (!eventId) return null;
      return {
        tenant_id: tenantId,
        event_id: eventId,
        installment_type: String(row["Type"]).trim(),
        amount: Number(row["Amount"]) || 0,
        payment_method: String(row["Method"] || "Cash").trim(),
        transaction_id: String(row["Transaction ID"] || "").trim(),
        payment_date: row["Date"]
      };
    }).filter(Boolean);
    if (paymentRows.length > 0) {
      const { error } = await supabaseAdmin.from("client_payments").insert(paymentRows as any);
      if (!error) stats.payments = (paymentRows as any[]).length;
    }

    // 5. Process Artist Expenses
    const artistRows = (sheets[ExcelService.SHEETS.ARTIST_EXPENSES] || []).map(row => {
      const eventId = eventLookup.get(String(row["Event Display ID"] || "").toLowerCase().trim());
      const userName = String(row["User Name"] || "").toLowerCase().trim();
      const userId = userLookup.get(userName);
      if (!eventId || !userId) return null;
      return {
        tenant_id: tenantId,
        event_id: eventId,
        user_id: userId,
        assignment_role: String(row["Role"] || "").trim(),
        pay_type: String(row["Pay Type"] || "").trim(),
        date_start: row["Start Date"],
        date_end: row["End Date"],
        no_of_days: Number(row["Days"]) || 1,
        per_day_rate: Number(row["Rate"]) || 0,
        total_amount: Number(row["Total"]) || 0,
        advance_paid: Number(row["Advance"]) || 0,
      };
    }).filter(Boolean);
    if (artistRows.length > 0) {
      const { error } = await supabaseAdmin.from("artist_expenses").insert(artistRows as any);
      if (!error) stats.artistExpenses = (artistRows as any[]).length;
    }

    // 6. Process Output Expenses
    const outputRows = (sheets[ExcelService.SHEETS.OUTPUT_EXPENSES] || []).map(row => {
      const eventId = eventLookup.get(String(row["Event Display ID"] || "").toLowerCase().trim());
      const userName = String(row["User Name"] || "").toLowerCase().trim();
      const userId = userLookup.get(userName);
      if (!eventId || !userId) return null;
      return {
        tenant_id: tenantId,
        event_id: eventId,
        user_id: userId,
        assignment_role: String(row["Role"] || "Editor").trim(),
        deliverable: String(row["Deliverable"] || "").trim(),
        quantity: Number(row["Quantity"]) || 1,
        total_amount: Number(row["Total"]) || 0,
        advance_paid: Number(row["Advance"]) || 0,
      };
    }).filter(Boolean);
    if (outputRows.length > 0) {
      const { error } = await supabaseAdmin.from("output_expenses").insert(outputRows as any);
      if (!error) stats.outputExpenses = (outputRows as any[]).length;
    }

    return NextResponse.json({ message: "Upload processed successfully", stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
