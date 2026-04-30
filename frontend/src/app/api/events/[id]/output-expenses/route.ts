import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { slugify, isUUID } from "@/lib/trackable-id";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { deliverable, ...rest } = body;
    const tenantId = await getDefaultTenantId();

    const isUuid = isUUID(id);
    const { data: event } = await supabaseAdmin
      .from("events_master")
      .select("id, display_id")
      .eq(isUuid ? "id" : "display_id", id)
      .single();

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const displayId = `${event.display_id}_${slugify(deliverable || "output")}`;

    const { data, error } = await supabaseAdmin
      .from("output_expenses")
      .insert({
        ...rest,
        deliverable,
        display_id: displayId,
        event_id: event.id,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
