import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";
import { slugify } from "@/lib/trackable-id";

function groupExpenses(
  rows: { user_id: string; total_amount: number; advance_paid: number }[]
): Record<string, { earnings: number; paid: number; count: number }> {
  return rows.reduce((acc, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = { earnings: 0, paid: 0, count: 0 };
    acc[row.user_id].earnings += row.total_amount ?? 0;
    acc[row.user_id].paid += row.advance_paid ?? 0;
    acc[row.user_id].count += 1;
    return acc;
  }, {} as Record<string, { earnings: number; paid: number; count: number }>);
}

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();

    const { data: memberships, error: memErr } = await supabaseAdmin
      .from("workspace_memberships")
      .select("user_id, users(*)")
      .eq("tenant_id", tenantId)
      .eq("role", "MEMBER")
      .eq("is_active", true);

    if (memErr) throw memErr;

    const userIds = (memberships ?? []).map((m: any) => (m.users as any)?.id).filter(Boolean);

    const [{ data: artistExp }, { data: outputExp }] = await Promise.all([
      supabaseAdmin
        .from("artist_expenses")
        .select("user_id, total_amount, advance_paid")
        .in("user_id", userIds)
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
      supabaseAdmin
        .from("output_expenses")
        .select("user_id, total_amount, advance_paid")
        .in("user_id", userIds)
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
    ]);

    const artistByUser = groupExpenses(artistExp ?? []);
    const outputByUser = groupExpenses(outputExp ?? []);

    const result = (memberships ?? []).map((m: any) => {
      const user = m.users as any;
      const uid = user?.id;
      const aEarnings = artistByUser[uid]?.earnings ?? 0;
      const aPaid = artistByUser[uid]?.paid ?? 0;
      const aCount = artistByUser[uid]?.count ?? 0;
      const oEarnings = outputByUser[uid]?.earnings ?? 0;
      const oPaid = outputByUser[uid]?.paid ?? 0;
      const oCount = outputByUser[uid]?.count ?? 0;

      const totalEarnings = aEarnings + oEarnings;
      const totalPaid = aPaid + oPaid;
      const balanceDue = totalEarnings - totalPaid;
      const status =
        totalEarnings === 0
          ? "No Assignments"
          : totalPaid >= totalEarnings
          ? "Paid"
          : totalPaid > 0
          ? "Partial"
          : "Unpaid";

      return {
        ...user,
        id: uid, // Explicitly set ID as string
        assignment_count: aCount + oCount,
        total_earnings: totalEarnings,
        total_paid: totalPaid,
        balance_due: balanceDue,
        pay_status: status,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await getDefaultTenantId();
    const body = await request.json();
    const { full_name, usual_role, phone_number, email } = body;

    if (!full_name || !usual_role) {
      return NextResponse.json({ error: "full_name and usual_role are required" }, { status: 400 });
    }

    // Generate trackable display_id
    let displayId = slugify(full_name);

    // Ensure uniqueness
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("display_id")
      .like("display_id", `${displayId}%`);

    if (existing && existing.length > 0) {
      displayId = `${displayId}_${existing.length + 1}`;
    }

    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .insert({
        display_id: displayId,
        full_name,
        usual_role,
        phone_number: phone_number ?? "",
        email: email ?? "",
      })
      .select()
      .single();

    if (userErr || !user) throw userErr;

    // Add workspace membership
    await supabaseAdmin.from("workspace_memberships").insert({
      user_id: user.id,
      tenant_id: tenantId,
      role: "MEMBER",
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
