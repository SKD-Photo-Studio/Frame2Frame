import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export const runtime = 'edge';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing_url';
    const secretKey = process.env.NEXT_PRIVATE_SUPABASE_SECRET_KEY || 'missing_secret';
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'missing_publishable';

    return NextResponse.json({
      url,
      publishableKey,
      secretKeyMasked: secretKey ? `${secretKey.slice(0, 10)}...${secretKey.slice(-5)}` : 'none',
      secretKeyLength: secretKey ? secretKey.length : 0,
      hasTenant: false,
      diagnostics: true
    });
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
