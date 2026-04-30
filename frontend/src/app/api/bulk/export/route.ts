import { NextResponse } from "next/server";
import { ExcelService } from "@/lib/excel.server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { calcBalance } from "@/lib/utils";

export async function GET() {
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
      supabaseAdmin.from("clients_master").select("*").eq("tenant_id", tenantId).eq("is_active", true),
      supabaseAdmin.from("users").select("*"),
      supabaseAdmin.from("events_master").select("*, clients_master(client_name)").eq("tenant_id", tenantId).eq("is_active", true),
      supabaseAdmin.from("client_payments").select("*, events_master(display_id)").eq("tenant_id", tenantId).eq("is_active", true),
      supabaseAdmin.from("artist_expenses").select("*, events_master(display_id), users(full_name)").eq("tenant_id", tenantId).eq("is_active", true),
      supabaseAdmin.from("output_expenses").select("*, events_master(display_id), users(full_name)").eq("tenant_id", tenantId).eq("is_active", true),
    ]);

    const exportData = {
      [ExcelService.SHEETS.CLIENTS]: (clients ?? []).map(c => [c.display_id, c.client_name, c.phone_number, c.email, c.notes]),
      [ExcelService.SHEETS.TEAM]: (team ?? []).map(u => [u.display_id, u.full_name, u.email, u.phone_number, u.usual_role]),
      [ExcelService.SHEETS.EVENTS]: (events ?? []).map(e => {
        const totalCol = (payments ?? []).filter(p => p.event_id === e.id).reduce((s, p) => s + (p.amount ?? 0), 0);
        const { balance: clientBal, status: payStat } = calcBalance(e.package_value ?? 0, totalCol);
        
        const eventArtist = (artistExpenses ?? []).filter(a => a.event_id === e.id);
        const eventOutput = (outputExpenses ?? []).filter(o => o.event_id === e.id);
        const totalExp = eventArtist.reduce((s,a) => s + (a.total_amount ?? 0), 0) + eventOutput.reduce((s,o) => s + (o.total_amount ?? 0), 0);
        const totalPaid = eventArtist.reduce((s,a) => s + (a.advance_paid ?? 0), 0) + eventOutput.reduce((s,o) => s + (o.advance_paid ?? 0), 0);
        
        return [e.display_id, (e.clients_master as any)?.client_name, e.event_type, e.venue, e.city, e.package_value, e.event_dates?.join(", "), clientBal, totalExp - totalPaid, payStat];
      }),
      [ExcelService.SHEETS.PAYMENTS]: (payments ?? []).map(p => [p.display_id, (p.events_master as any)?.display_id, p.installment_type, p.amount, p.payment_method, p.transaction_id, p.payment_date]),
      [ExcelService.SHEETS.ARTIST_EXPENSES]: (artistExpenses ?? []).map(a => {
        const { status } = calcBalance(a.total_amount ?? 0, a.advance_paid ?? 0);
        return [a.display_id, (a.events_master as any)?.display_id, (a.users as any)?.full_name, a.assignment_role, a.pay_type, a.date_start, a.date_end, a.no_of_days, a.per_day_rate, a.total_amount, a.advance_paid, status];
      }),
      [ExcelService.SHEETS.OUTPUT_EXPENSES]: (outputExpenses ?? []).map(o => {
        const { status } = calcBalance(o.total_amount ?? 0, o.advance_paid ?? 0);
        return [o.display_id, (o.events_master as any)?.display_id, (o.users as any)?.full_name, o.assignment_role, o.deliverable, o.quantity, o.total_amount, o.advance_paid, status];
      }),
    };

    const buffer = ExcelService.generateMasterFile(exportData);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Frame2Frame_Global_Report.xlsx",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
