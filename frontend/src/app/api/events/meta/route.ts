import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();
    const { data } = await supabaseAdmin
      .from("events_master")
      .select("city, venue, event_type")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    const unique = (arr: (string | null | undefined)[]) =>
      Array.from(new Set(arr.filter(Boolean) as string[])).sort();

    return NextResponse.json({
      cities: unique((data ?? []).map((e) => e.city)),
      venues: unique((data ?? []).map((e) => e.venue)),
      event_types: unique((data ?? []).map((e) => e.event_type)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
