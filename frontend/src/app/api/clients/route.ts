import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { slugify } from "@/lib/trackable-id";

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();

    const { data: clients, error } = await supabaseAdmin
      .from("clients_master")
      .select("*, events_master(count)")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .eq("events_master.is_active", true)
      .order("display_id");

    if (error) throw error;

    const result = (clients ?? []).map((c) => ({
      ...c,
      event_count: (c.events_master as any)?.[0]?.count ?? 0,
      events_master: undefined,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await getDefaultTenantId();
    const body = await request.json();
    const { client_name, phone_number, email, notes } = body;

    if (!client_name || !phone_number) {
      return NextResponse.json({ error: "client_name and phone_number are required" }, { status: 400 });
    }

    // Generate trackable display_id
    let displayId = slugify(client_name);

    // Ensure uniqueness
    const { data: existing } = await supabaseAdmin
      .from("clients_master")
      .select("display_id")
      .eq("tenant_id", tenantId)
      .like("display_id", `${displayId}%`);

    if (existing && existing.length > 0) {
      displayId = `${displayId}_${existing.length + 1}`;
    }

    const { data, error } = await supabaseAdmin
      .from("clients_master")
      .insert({
        display_id: displayId,
        tenant_id: tenantId,
        client_name,
        phone_number,
        email: email ?? "",
        notes: notes ?? "",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
