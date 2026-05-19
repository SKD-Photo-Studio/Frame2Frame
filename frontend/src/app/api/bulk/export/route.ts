import { ExcelService } from "@/lib/excel.server";
import { supabaseAdmin } from "@/lib/supabase.server";
import { calcBalance } from "@/lib/utils";
import { withApiWrapper } from "@/lib/api-utils";

export const runtime = 'edge';

export const GET = withApiWrapper(async (tenantId, request) => {
  const [
    { data: clients },
    { data: team },
    { data: events },
    { data: payments },
    { data: artistExpenses },
    { data: outputExpenses }
  ] = await Promise.all([
    supabaseAdmin.from("clients_master").select("*").eq("tenant_id", tenantId),
    supabaseAdmin.from("users").select("id, display_id, full_name, email, phone_number, usual_role"),
    supabaseAdmin.from("events_master").select("*").eq("tenant_id", tenantId),
    supabaseAdmin.from("client_payments").select("*").eq("tenant_id", tenantId),
    supabaseAdmin.from("artist_expenses").select("*").eq("tenant_id", tenantId),
    supabaseAdmin.from("output_expenses").select("*").eq("tenant_id", tenantId)
  ]);

  const clientLookup = new Map((clients || []).map(c => [c.id, c.client_name]));
  const userLookup = new Map((team || []).map(u => [u.id, u.full_name]));
  const eventLookup = new Map((events || []).map(e => [e.id, e.display_id]));

  const clientMap = new Map((clients || []).map(c => [c.id, c]));
  const paymentGroup = new Map<string, number>();
  (payments || []).forEach(p => {
    paymentGroup.set(p.event_id, (paymentGroup.get(p.event_id) || 0) + Number(p.amount));
  });

  const exportData = {
    team: (team || []).map(u => ({
      "Display ID": u.display_id,
      "Full Name": u.full_name,
      "Email": u.email || "",
      "Phone": u.phone_number || "",
      "Usual Role": u.usual_role || "",
    })),
    clients: (clients || []).map(c => ({
      "Display ID": c.display_id,
      "Client Name": c.client_name,
      "Phone": c.phone_number || "",
      "Email": c.email || "",
      "Notes": c.notes || "",
    })),
    events: (events || []).map(e => {
      const paid = paymentGroup.get(e.id) || 0;
      const { balance } = calcBalance(Number(e.package_value), paid);
      return {
        "Display ID": e.display_id,
        "Client Name": clientLookup.get(e.client_id) || "",
        "Event Type": e.event_type,
        "Venue": e.venue || "",
        "City": e.city || "",
        "Package Value": Number(e.package_value),
        "Paid": paid,
        "Balance": balance,
        "Dates": (e.event_dates || []).join(", "),
      };
    }),
    payments: (payments || []).map(p => ({
      "Event Display ID": eventLookup.get(p.event_id) || "",
      "Type": p.installment_type,
      "Amount": Number(p.amount),
      "Method": p.payment_method || "Cash",
      "Transaction ID": p.transaction_id || "",
      "Date": p.payment_date || "",
    })),
    artistExpenses: (artistExpenses || []).map(ae => ({
      "Event Display ID": eventLookup.get(ae.event_id) || "",
      "User Name": userLookup.get(ae.user_id) || "",
      "Role": ae.assignment_role,
      "Pay Type": ae.pay_type,
      "Start Date": ae.date_start || "",
      "End Date": ae.date_end || "",
      "Days": Number(ae.no_of_days || 1),
      "Rate": Number(ae.per_day_rate || 0),
      "Total": Number(ae.total_amount || 0),
      "Advance": Number(ae.advance_paid || 0),
    })),
    outputExpenses: (outputExpenses || []).map(oe => ({
      "Event Display ID": eventLookup.get(oe.event_id) || "",
      "User Name": userLookup.get(oe.user_id) || "",
      "Role": oe.assignment_role || "Editor",
      "Deliverable": oe.deliverable,
      "Quantity": Number(oe.quantity || 1),
      "Total": Number(oe.total_amount || 0),
      "Advance": Number(oe.advance_paid || 0),
    })),
  };

  const urlObj = new URL(request.url);
  if (urlObj.searchParams.get("format") === "json") {
    return exportData as any;
  }

  const buffer = ExcelService.generateMasterFile(exportData);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=Frame2Frame_Global_Report.xlsx",
    },
  });
});
