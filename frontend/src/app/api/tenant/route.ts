import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .select("id, display_id, company_name, logo_url")
      .eq("id", tenantId)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const tenantId = await getDefaultTenantId();
    const body = await request.json();
    const { company_name, logo_url } = body;

    const { data, error } = await supabaseAdmin
      .from("tenants")
      .update({ company_name, logo_url, updated_at: new Date().toISOString() })
      .eq("id", tenantId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
