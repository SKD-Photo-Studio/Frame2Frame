import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function POST(request: Request) {
  try {
    const tenantId = await getDefaultTenantId();
    const { base64 } = await request.json();

    if (!base64) return NextResponse.json({ error: "Base64 image string is required" }, { status: 400 });

    const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return NextResponse.json({ error: "Invalid base64 format" }, { status: 400 });

    const mimeType = matches[1];
    const extension = mimeType.split("/")[1];
    const buffer = Buffer.from(matches[2], "base64");
    
    const fileName = `tenant_${tenantId}_logo_${Date.now()}.${extension}`;
    const filePath = fileName;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("logos")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("logos")
      .getPublicUrl(filePath);

    const { error: dbErr } = await supabaseAdmin
      .from("tenants")
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", tenantId);

    if (dbErr) throw dbErr;

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
