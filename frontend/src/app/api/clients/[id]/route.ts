import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { formatDates } from "@/lib/utils";
import { isUUID } from "@/lib/trackable-id";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getDefaultTenantId();

    const isUuid = isUUID(id);
    const query = supabaseAdmin
      .from("clients_master")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (isUuid) {
      query.eq("id", id);
    } else {
      query.eq("display_id", id);
    }

    const { data: client, error: clientErr } = await query.single();

    if (clientErr || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { data: events, error: eventsErr } = await supabaseAdmin
      .from("events_master")
      .select(`
        *, 
        client_payments(amount),
        artist_expenses(total_amount, user_id),
        output_expenses(total_amount, user_id)
      `)
      .eq("client_id", client.id)
      .eq("is_active", true);

    if (eventsErr) throw eventsErr;

    const typedEvents = events as unknown as any[];

    const clientEvents = (typedEvents ?? []).map((e) => {
      const totalCollected = (e.client_payments as any[])?.reduce(
        (sum: number, p: any) => sum + (p.amount ?? 0),
        0
      ) ?? 0;

      const totalArtist = (e.artist_expenses as any[])?.reduce(
        (sum: number, exp: any) => sum + (exp.total_amount ?? 0),
        0
      ) ?? 0;

      const totalOutput = (e.output_expenses as any[])?.reduce(
        (sum: number, exp: any) => sum + (exp.total_amount ?? 0),
        0
      ) ?? 0;

      const totalExpenses = totalArtist + totalOutput;

      const eventArtists = Array.isArray(e.artist_expenses) ? e.artist_expenses : [];
      const eventOutputs = Array.isArray(e.output_expenses) ? e.output_expenses : [];

      const uniqueMembers = new Set([
        ...eventArtists.map((a: any) => a?.user_id),
        ...eventOutputs.map((o: any) => o?.user_id)
      ].filter(Boolean));

      return {
        ...e,
        client_name: client.client_name,
        date_string: formatDates(e.event_dates ?? []),
        total_collected: totalCollected,
        client_balance: (e.package_value ?? 0) - totalCollected,
        total_expenses: totalExpenses,
        savings: (e.package_value ?? 0) - totalExpenses,
        team_size: uniqueMembers.size,
        client_payments: undefined,
        artist_expenses: undefined,
        output_expenses: undefined,
      };
    });

    return NextResponse.json({ client, events: clientEvents });
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
      .from("clients_master")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq(isUuid ? "id" : "display_id", id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: "Client not found or access denied" }, { status: 404 });
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
      .from("clients_master")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq(isUuid ? "id" : "display_id", id);

    if (error) return NextResponse.json({ error: "Client not found or access denied" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
