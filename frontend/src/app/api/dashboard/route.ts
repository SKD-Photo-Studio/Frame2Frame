import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId();
    const today = new Date().toISOString().split('T')[0];

    // Parallel fetch of all aggregates
    const [
      { count: totalClients },
      { count: totalEvents },
      { count: totalTeamMembers },
      { data: events },
      { data: artistExp },
      { data: outputExp },
      { data: clientPayments },
    ] = await Promise.all([
      supabaseAdmin.from('clients_master').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('events_master').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('workspace_memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('role', 'MEMBER').eq('is_active', true),
      supabaseAdmin.from('events_master').select('id, display_id, event_type, package_value, event_dates, clients_master(client_name)').eq('tenant_id', tenantId).eq('is_active', true).order('display_id', { ascending: false }),
      supabaseAdmin.from('artist_expenses').select('event_id, total_amount, advance_paid, user_id').eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('output_expenses').select('event_id, total_amount, advance_paid, user_id').eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('client_payments').select('event_id, amount').eq('tenant_id', tenantId).eq('is_active', true),
    ]);

    // Financial aggregates
    const totalRevenue = (events ?? []).reduce((s, e) => s + (e.package_value ?? 0), 0);

    const paymentsByEvent: Record<string, number> = {};
    (clientPayments ?? []).forEach((p) => {
      paymentsByEvent[p.event_id] = (paymentsByEvent[p.event_id] ?? 0) + (p.amount ?? 0);
    });
    const totalCollected = Object.values(paymentsByEvent).reduce((s, v) => s + v, 0);

    const totalArtistExp  = (artistExp ?? []).reduce((s, a) => s + (a.total_amount ?? 0), 0);
    const totalOutputExp  = (outputExp ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const totalExpenses   = totalArtistExp + totalOutputExp;

    const totalArtistPaid = (artistExp ?? []).reduce((s, a) => s + (a.advance_paid ?? 0), 0);
    const totalOutputPaid = (outputExp ?? []).reduce((s, o) => s + (o.advance_paid ?? 0), 0);
    const totalExpPaid    = totalArtistPaid + totalOutputPaid;

    const artistExpByEvent: Record<string, number> = {};
    (artistExp ?? []).forEach((a) => {
      artistExpByEvent[a.event_id] = (artistExpByEvent[a.event_id] ?? 0) + (a.total_amount ?? 0);
    });

    const outputExpByEvent: Record<string, number> = {};
    (outputExp ?? []).forEach((o) => {
      outputExpByEvent[o.event_id] = (outputExpByEvent[o.event_id] ?? 0) + (o.total_amount ?? 0);
    });

    // Process all events to include financials and formatted dates
    const processedEvents = (events ?? []).map((e) => {
      const collected = paymentsByEvent[e.id] ?? 0;
      const artistTotal = artistExpByEvent[e.id] ?? 0;
      const outputTotal = outputExpByEvent[e.id] ?? 0;
      const totalExpenses = artistTotal + outputTotal;

      const eventArtists = Array.isArray(artistExp) ? artistExp.filter(a => a?.event_id === e.id) : [];
      const eventOutputs = Array.isArray(outputExp) ? outputExp.filter(o => o?.event_id === e.id) : [];
      
      const uniqueMembers = new Set([
        ...eventArtists.map(a => a?.user_id),
        ...eventOutputs.map(o => o?.user_id)
      ].filter(Boolean));

      const allDates = (e.event_dates as string[] ?? []).sort();
      const dateString = allDates
        .map((d) =>
          new Date(d).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
          })
        )
        .join(', ');

      return {
        ...e,
        client_name:     (e.clients_master as any)?.client_name ?? 'Unknown',
        date_string:     dateString,
        total_collected: collected,
        client_balance:  (e.package_value ?? 0) - collected,
        total_expenses:  totalExpenses,
        savings:         (e.package_value ?? 0) - totalExpenses,
        team_size:       uniqueMembers.size,
        clients_master:  undefined,
        all_dates:       allDates,
      };
    });

    // Recent 5 events (sorted by display_id desc from DB)
    const recentEvents = processedEvents.slice(0, 5);

    // Upcoming 5 events (filtered by dates >= today, sorted by soonest date)
    const upcomingEvents = processedEvents
      .filter(e => e.all_dates.some(d => d >= today))
      .sort((a, b) => {
        const aSoonest = a.all_dates.find(d => d >= today) || '9999-12-31';
        const bSoonest = b.all_dates.find(d => d >= today) || '9999-12-31';
        return aSoonest.localeCompare(bSoonest);
      })
      .slice(0, 5);

    return NextResponse.json({
      total_clients:      totalClients ?? 0,
      total_events:       totalEvents ?? 0,
      total_team_members: totalTeamMembers ?? 0,
      total_revenue:      totalRevenue,
      total_collected:    totalCollected,
      client_balance:     totalRevenue - totalCollected,
      total_expenses:     totalExpenses,
      total_artist_expenses: totalArtistExp,
      total_output_expenses: totalOutputExp,
      paid_to_team:       totalExpPaid,
      team_balance:       totalExpenses - totalExpPaid,
      total_savings:      totalRevenue - totalExpenses,
      recent_events:      recentEvents,
      upcoming_events:    upcomingEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
