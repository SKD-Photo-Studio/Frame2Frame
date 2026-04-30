import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();

    const { data, error } = await supabaseAdmin
      .from("workspace_memberships")
      .select("role, users(*)")
      .eq("tenant_id", tenantId)
      .eq("role", "ADMIN")
      .eq("is_active", true);

    if (error) throw error;
    
    const admins = (data ?? []).map((m: any) => ({
      ...m.users,
      role: m.role
    }));

    return NextResponse.json(admins);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
