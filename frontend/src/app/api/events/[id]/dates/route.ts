import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { event_date } = body;

    if (!event_date) return NextResponse.json({ error: "Date is required" }, { status: 400 });

    const tenantId = await getDefaultTenantId();

    const { data: event, error: fetchErr } = await supabaseAdmin
      .from("events_master")
      .select("event_dates")
      .eq("id", eventId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchErr) throw fetchErr;

    const updatedDates = [...(event.event_dates ?? []), event_date];

    const { error: patchErr } = await supabaseAdmin
      .from("events_master")
      .update({ event_dates: updatedDates, updated_at: new Date().toISOString() })
      .eq("id", eventId)
      .eq("tenant_id", tenantId);

    if (patchErr) throw patchErr;
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
