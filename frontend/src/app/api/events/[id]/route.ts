import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { formatDates, calcBalance } from "@/lib/utils";
import { isUUID } from "@/lib/trackable-id";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getDefaultTenantId();
    const isUuid = isUUID(id);
    
    // 1. Fetch Event first to get UUID if needed
    const eventQuery = supabaseAdmin
      .from("events_master")
      .select("*, clients_master(*)")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (isUuid) {
      eventQuery.eq("id", id);
    } else {
      eventQuery.eq("display_id", id);
    }

    const { data: event, error: evtErr } = await eventQuery.single();
    if (evtErr || !event) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });

    const realId = event.id;

    // 2. Fetch related data using real UUID
    const [
      { data: artistExp },
      { data: outputExp },
      { data: payments },
    ] = await Promise.all([
      supabaseAdmin
        .from("artist_expenses")
        .select("*, users(full_name, usual_role)")
        .eq("tenant_id", tenantId)
        .eq("event_id", realId)
        .eq("is_active", true),
      supabaseAdmin
        .from("output_expenses")
        .select("*, users(full_name, usual_role)")
        .eq("tenant_id", tenantId)
        .eq("event_id", realId)
        .eq("is_active", true),
      supabaseAdmin
        .from("client_payments")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("event_id", realId)
        .eq("is_active", true),
    ]);

    const totalCollected = (payments ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
    const totalArtist = (artistExp ?? []).reduce((s, a) => s + (a.total_amount ?? 0), 0);
    const totalOutput = (outputExp ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const totalExpenses = totalArtist + totalOutput;
    const totalExpPaid =
      (artistExp ?? []).reduce((s, a) => s + (a.advance_paid ?? 0), 0) +
      (outputExp ?? []).reduce((s, o) => s + (o.advance_paid ?? 0), 0);

    const { status: paymentStatus, balance: clientBalance } = calcBalance(event.package_value ?? 0, totalCollected);

    const uniqueMembers = new Set([
      ...(artistExp ?? []).map((a: any) => a.user_id),
      ...(outputExp ?? []).map((o: any) => o.user_id)
    ].filter(Boolean));

    return NextResponse.json({
      event: {
        ...event,
        client: (event as any).clients_master ?? null,
        date_string: formatDates(event.event_dates ?? []),
        clients_master: undefined,
      },
      dates: event.event_dates ?? [],
      payments: payments ?? [],
      artist_expenses: (artistExp ?? []).map((a: any) => {
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
      output_expenses: (outputExp ?? []).map((o: any) => {
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
        payment_status: paymentStatus,
        client_balance: clientBalance,
        total_expenses: totalExpenses,
        total_artist_expenses: totalArtist,
        total_output_expenses: totalOutput,
        total_expenses_paid: totalExpPaid,
        team_balance: totalExpenses - totalExpPaid,
        savings: (event.package_value ?? 0) - totalExpenses,
        team_size: uniqueMembers.size,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getDefaultTenantId();
    const isUuid = isUUID(id);
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from("events_master")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq(isUuid ? "id" : "display_id", id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getDefaultTenantId();
    const isUuid = isUUID(id);
    const { error } = await supabaseAdmin
      .from("events_master")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq(isUuid ? "id" : "display_id", id);

    if (error) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
