import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";
import { formatDates, calcBalance } from "@/lib/utils";
import { slugify } from "@/lib/trackable-id";
import { withApiWrapper } from "@/lib/api-utils";

export const runtime = 'edge';

export const GET = withApiWrapper(async (tenantId, request) => {
  const { searchParams } = new URL(request.url);
  const fy = searchParams.get('fy') || 'all';

  // Helper to determine if an event belongs to a financial year
  const isInFinancialYear = (eventDates: string[], targetFy: string) => {
    if (targetFy === 'all') return true;
    if (!eventDates || eventDates.length === 0) return false;
    const sorted = [...eventDates].sort();
    const startDate = sorted[0];
    if (targetFy === '2025') {
      return startDate >= '2025-04-01' && startDate <= '2026-03-31';
    }
    if (targetFy === '2026') {
      return startDate >= '2026-04-01' && startDate <= '2027-03-31';
    }
    return true;
  };

  // 1. Fetch active events
  const { data: allEvents, error: evtErr } = await supabaseAdmin
    .from("events_master")
    .select("*, clients_master(client_name)")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (evtErr) throw evtErr;

  const events = (allEvents ?? []).filter((e: any) => isInFinancialYear(e.event_dates as string[] ?? [], fy));

  // 2. Fetch all related data in parallel for performance
  const [
    { data: allArtistExp },
    { data: allOutputExp },
    { data: allPayments },
  ] = await Promise.all([
    supabaseAdmin.from("artist_expenses").select("event_id, total_amount, advance_paid, user_id").eq("is_active", true),
    supabaseAdmin.from("output_expenses").select("event_id, total_amount, user_id").eq("is_active", true),
    supabaseAdmin.from("client_payments").select("event_id, amount").eq("is_active", true),
  ]);

  // Pre-calculate aggregates using dictionaries for O(N) lookup instead of O(N^2)
  const paymentsByEvent: Record<string, number> = {};
  (allPayments ?? []).forEach(p => {
    paymentsByEvent[p.event_id] = (paymentsByEvent[p.event_id] || 0) + (p.amount ?? 0);
  });

  const artistExpByEvent: Record<string, { total: number, userIds: string[], expenses: { total_amount: number, advance_paid: number }[] }> = {};
  (allArtistExp ?? []).forEach(a => {
    if (!artistExpByEvent[a.event_id]) artistExpByEvent[a.event_id] = { total: 0, userIds: [], expenses: [] };
    artistExpByEvent[a.event_id].total += (a.total_amount ?? 0);
    artistExpByEvent[a.event_id].userIds.push(a.user_id);
    artistExpByEvent[a.event_id].expenses.push({
      total_amount: a.total_amount ?? 0,
      advance_paid: a.advance_paid ?? 0
    });
  });

  const outputExpByEvent: Record<string, { total: number, userIds: string[] }> = {};
  (allOutputExp ?? []).forEach(o => {
    if (!outputExpByEvent[o.event_id]) outputExpByEvent[o.event_id] = { total: 0, userIds: [] };
    outputExpByEvent[o.event_id].total += (o.total_amount ?? 0);
    outputExpByEvent[o.event_id].userIds.push(o.user_id);
  });

  return (events ?? []).map((e: any) => {
    const totalCollected = paymentsByEvent[e.id] || 0;
    const packageValue = e.package_value ?? 0;
    const { status: paymentStatus, balance: clientBalance } = calcBalance(packageValue, totalCollected);

    const artistData = artistExpByEvent[e.id] || { total: 0, userIds: [], expenses: [] };
    const outputData = outputExpByEvent[e.id] || { total: 0, userIds: [] };
    const totalExpenses = artistData.total + outputData.total;

    const uniqueMembers = new Set([
      ...artistData.userIds,
      ...outputData.userIds
    ].filter(Boolean));

    // Calculate team payment status based on whether all crew members are fully paid
    const crewExpenses = artistData.expenses;
    let teamPaymentStatus = "Paid";
    if (crewExpenses.length === 0) {
      teamPaymentStatus = "Paid";
    } else {
      const allUnpaid = crewExpenses.every(x => x.advance_paid === 0);
      const anyUnpaid = crewExpenses.some(x => x.advance_paid < x.total_amount);
      if (allUnpaid) {
        teamPaymentStatus = "Unpaid";
      } else if (anyUnpaid) {
        teamPaymentStatus = "Partial";
      } else {
        teamPaymentStatus = "Paid";
      }
    }

    return {
      ...e,
      client_name: e.clients_master?.client_name ?? "Unknown",
      date_string: formatDates(e.event_dates ?? []),
      total_collected: totalCollected,
      payment_status: paymentStatus,
      client_balance: clientBalance,
      total_expenses: totalExpenses,
      savings: packageValue - totalExpenses,
      team_size: uniqueMembers.size,
      team_payment_status: teamPaymentStatus,
      clients_master: undefined,
    };
  });
});

export const POST = withApiWrapper(async (tenantId, request) => {
  const body = await request.json();
  const { client_id, event_type, venue, city, package_value, event_dates } = body;

  if (!client_id || !event_type) {
    return NextResponse.json({ error: "client_id and event_type are required" }, { status: 400 });
  }

  const { data: clientData } = await supabaseAdmin
    .from("clients_master")
    .select("client_name")
    .eq("id", client_id)
    .single();

  const clientName = clientData?.client_name ?? "Unknown Client";
  // Generate trackable display_id: client_name + event_type
  let displayId = `${slugify(clientName)}_${slugify(event_type)}`;

  // Ensure uniqueness
  const { data: existing } = await supabaseAdmin
    .from("events_master")
    .select("display_id")
    .eq("tenant_id", tenantId)
    .like("display_id", `${displayId}%`);

  if (existing && existing.length > 0) {
    displayId = `${displayId}_${existing.length + 1}`;
  }

  const { data, error } = await supabaseAdmin
    .from("events_master")
    .insert({
      display_id: displayId,
      tenant_id: tenantId,
      client_id,
      event_type,
      venue: venue ?? "",
      city: city ?? "",
      package_value: package_value ?? 0,
      event_dates: event_dates ?? [],
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(data, { status: 201 });
});
