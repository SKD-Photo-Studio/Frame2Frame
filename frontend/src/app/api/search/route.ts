import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim() === "") {
      return NextResponse.json({ clients: [], events: [], team: [] });
    }

    const tenantId = await getDefaultTenantId();
    const searchTerm = `%${q}%`;

    const clientsPromise = supabaseAdmin
      .from("clients_master")
      .select("id, display_id, client_name, email, phone_number")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .ilike("client_name", searchTerm)
      .limit(5);

    const eventsPromise = supabaseAdmin
      .from("events_master")
      .select("id, display_id, event_type, clients_master!inner(client_name)")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .or(`event_type.ilike.${searchTerm},clients_master.client_name.ilike.${searchTerm}`)
      .limit(5);

    const { data: memberships } = await supabaseAdmin
      .from("workspace_memberships")
      .select("user_id")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);
    
    const userIds = memberships?.map(m => m.user_id) || [];

    let teamPromise = null;
    if (userIds.length > 0) {
      teamPromise = supabaseAdmin
        .from("users")
        .select("id, display_id, full_name, usual_role")
        .in("id", userIds)
        .ilike("full_name", searchTerm)
        .limit(5);
    }

    const [clientsRes, eventsRes, teamRes] = await Promise.all([
      clientsPromise,
      eventsPromise,
      teamPromise ? teamPromise : Promise.resolve({ data: [] })
    ]);

    const formattedEvents = (eventsRes.data || []).map((e: any) => ({
        id: e.id,
        display_id: e.display_id,
        event_type: e.event_type,
        client_name: (e.clients_master as any)?.client_name || ""
    }));

    return NextResponse.json({
      clients: clientsRes.data || [],
      events: formattedEvents,
      team: teamRes?.data || []
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
