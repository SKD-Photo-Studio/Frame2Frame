import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) throw new Error("Unauthorized");

    // Fetch profile info from the public.users table
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    // If ID match fails, try matching by email as a robust fallback
    let finalProfile = profile;
    if (!finalProfile) {
      const { data: emailProfile } = await supabaseAdmin
        .from("users")
        .select("full_name")
        .eq("email", user.email)
        .maybeSingle();
      finalProfile = emailProfile;
    }

    return NextResponse.json({
      ...user,
      full_name: finalProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
