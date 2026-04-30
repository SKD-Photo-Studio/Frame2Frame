import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { isUUID } from "@/lib/trackable-id";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getDefaultTenantId();
    const isUuid = isUUID(id);

    // 1. Fetch User first
    const userQuery = supabaseAdmin
      .from("users")
      .select("*");

    if (isUuid) {
      userQuery.eq("id", id);
    } else {
      userQuery.eq("display_id", id);
    }

    const { data: member, error: userErr } = await userQuery.single();
    if (userErr || !member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    // 1b. Verify membership in current tenant
    const { data: membership, error: memErr } = await supabaseAdmin
      .from("workspace_memberships")
      .select("*")
      .eq("user_id", member.id)
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .single();

    if (memErr || !membership) {
      return NextResponse.json({ error: "Access denied or member not in this workspace" }, { status: 404 });
    }

    const userId = member.id;

    // 2. Fetch assignments
    const [
      { data: artistExp },
      { data: outputExp },
    ] = await Promise.all([
      supabaseAdmin
        .from("artist_expenses")
        .select("*, events_master(event_type, display_id, clients_master(client_name))")
        .eq("user_id", userId)
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
      supabaseAdmin
        .from("output_expenses")
        .select("*, events_master(event_type, display_id, clients_master(client_name))")
        .eq("user_id", userId)
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
    ]);

    const formattedArtist = (artistExp ?? []).map((a: any) => ({
      ...a,
      event_name: a.events_master?.clients_master?.client_name + " | " + a.events_master?.event_type,
      event_display_id: a.events_master?.display_id,
      balance: (a.total_amount ?? 0) - (a.advance_paid ?? 0),
      status: (a.advance_paid ?? 0) >= (a.total_amount ?? 0) ? "Paid" : (a.advance_paid ?? 0) > 0 ? "Partial" : "Unpaid"
    }));

    const formattedOutput = (outputExp ?? []).map((o: any) => ({
      ...o,
      event_name: o.events_master?.clients_master?.client_name + " | " + o.events_master?.event_type,
      event_display_id: o.events_master?.display_id,
      balance: (o.total_amount ?? 0) - (o.advance_paid ?? 0),
      status: (o.advance_paid ?? 0) >= (o.total_amount ?? 0) ? "Paid" : (o.advance_paid ?? 0) > 0 ? "Partial" : "Unpaid"
    }));

    const totalEarnings = formattedArtist.reduce((s, a) => s + (a.total_amount ?? 0), 0) + 
                         formattedOutput.reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const totalPaid = formattedArtist.reduce((s, a) => s + (a.advance_paid ?? 0), 0) + 
                      formattedOutput.reduce((s, o) => s + (o.advance_paid ?? 0), 0);

    return NextResponse.json({
      member,
      artist_expenses: formattedArtist,
      output_expenses: formattedOutput,
      totals: {
        assignments: formattedArtist.length + formattedOutput.length,
        earnings: totalEarnings,
        paid: totalPaid,
        balance_due: totalEarnings - totalPaid
      }
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

    // 1. Resolve userId
    let userId = id;
    if (!isUuid) {
      const { data: user } = await supabaseAdmin.from("users").select("id").eq("display_id", id).single();
      if (!user) return NextResponse.json({ error: "Member not found" }, { status: 404 });
      userId = user.id;
    }

    // 2. Verify tenant membership (Security Check)
    const { data: membership } = await supabaseAdmin
      .from("workspace_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied or member not in this workspace" }, { status: 403 });
    }

    // 3. Perform update
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
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

    // Get user id first if using display_id
    let userId = id;
    if (!isUuid) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("display_id", id)
        .single();
      if (!user) return NextResponse.json({ error: "Member not found" }, { status: 404 });
      userId = user.id;
    }

    const { error } = await supabaseAdmin
      .from("workspace_memberships")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("tenant_id", tenantId);

    if (error) return NextResponse.json({ error: "Failed to remove member" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
