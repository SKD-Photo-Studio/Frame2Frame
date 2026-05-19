import { NextResponse } from "next/server";
import { supabaseAdmin, getDefaultTenantId } from "@/lib/supabase.server";

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fy = searchParams.get('fy') || 'all';
    const tenantId = await getDefaultTenantId();
    const today = new Date().toISOString().split('T')[0];

    // Helper to determine if an event belongs to a financial year
    const isInFinancialYear = (eventDates: string[], targetFy: string) => {
      if (targetFy === 'all') return true;
      if (!eventDates || eventDates.length === 0) return false;
      const sorted = [...eventDates].sort();
      const startDate = sorted[0]; // earliest date of the event
      if (targetFy === '2025') {
        return startDate >= '2025-04-01' && startDate <= '2026-03-31';
      }
      if (targetFy === '2026') {
        return startDate >= '2026-04-01' && startDate <= '2027-03-31';
      }
      return true;
    };

    // Parallel fetch of all aggregates
    const [
      { count: rawTotalClients },
      { count: rawTotalEvents },
      { count: rawTotalTeamMembers },
      { data: allEvents },
      { data: artistExp },
      { data: outputExp },
      { data: clientPayments },
    ] = await Promise.all([
      supabaseAdmin.from('clients_master').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('events_master').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('workspace_memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('role', 'MEMBER').eq('is_active', true),
      supabaseAdmin.from('events_master').select('id, client_id, display_id, event_type, package_value, event_dates, created_at, clients_master(client_name)').eq('tenant_id', tenantId).eq('is_active', true).order('created_at', { ascending: false }),
      supabaseAdmin.from('artist_expenses').select('event_id, total_amount, advance_paid, user_id').eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('output_expenses').select('event_id, total_amount, advance_paid, user_id').eq('tenant_id', tenantId).eq('is_active', true),
      supabaseAdmin.from('client_payments').select('event_id, amount').eq('tenant_id', tenantId).eq('is_active', true),
    ]);

    // Filter events based on Financial Year
    const events = (allEvents ?? []).filter(e => isInFinancialYear(e.event_dates as string[] ?? [], fy));
    const totalEvents = events.length;

    // Filter secondary lists to only those events that match the financial year
    const filteredArtistExp = (artistExp ?? []).filter(a => events.some(e => e.id === a.event_id));
    const filteredOutputExp = (outputExp ?? []).filter(o => events.some(e => e.id === o.event_id));
    const filteredClientPayments = (clientPayments ?? []).filter(p => events.some(e => e.id === p.event_id));

    // Dynamic counts
    const uniqueClientIds = new Set(events.map(e => e.client_id).filter(Boolean));
    const totalClients = fy === 'all' ? (rawTotalClients ?? 0) : uniqueClientIds.size;

    const activeTeamIds = new Set([
      ...filteredArtistExp.map(a => a.user_id),
      ...filteredOutputExp.map(o => o.user_id),
    ].filter(Boolean));
    const totalTeamMembers = fy === 'all' ? (rawTotalTeamMembers ?? 0) : activeTeamIds.size;

    // Financial aggregates
    const totalRevenue = events.reduce((s, e) => s + (e.package_value ?? 0), 0);

    const paymentsByEvent: Record<string, number> = {};
    filteredClientPayments.forEach((p) => {
      paymentsByEvent[p.event_id] = (paymentsByEvent[p.event_id] ?? 0) + (p.amount ?? 0);
    });
    const totalCollected = Object.values(paymentsByEvent).reduce((s, v) => s + v, 0);

    const totalArtistExp  = filteredArtistExp.reduce((s, a) => s + (a.total_amount ?? 0), 0);
    const totalOutputExp  = filteredOutputExp.reduce((s, o) => s + (o.total_amount ?? 0), 0);
    const totalExpenses   = totalArtistExp + totalOutputExp;

    const totalArtistPaid = filteredArtistExp.reduce((s, a) => s + (a.advance_paid ?? 0), 0);
    const totalOutputPaid = filteredOutputExp.reduce((s, o) => s + (o.advance_paid ?? 0), 0);
    const totalExpPaid    = totalArtistPaid + totalOutputPaid;

    const artistExpByEvent: Record<string, number> = {};
    filteredArtistExp.forEach((a) => {
      artistExpByEvent[a.event_id] = (artistExpByEvent[a.event_id] ?? 0) + (a.total_amount ?? 0);
    });

    const outputExpByEvent: Record<string, number> = {};
    filteredOutputExp.forEach((o) => {
      outputExpByEvent[o.event_id] = (outputExpByEvent[o.event_id] ?? 0) + (o.total_amount ?? 0);
    });

    // Process all events to include financials and formatted dates
    const processedEvents = events.map((e) => {
      const collected = paymentsByEvent[e.id] ?? 0;
      const artistTotal = artistExpByEvent[e.id] ?? 0;
      const outputTotal = outputExpByEvent[e.id] ?? 0;
      const totalExpenses = artistTotal + outputTotal;

      const eventArtists = filteredArtistExp.filter(a => a?.event_id === e.id);
      const eventOutputs = filteredOutputExp.filter(o => o?.event_id === e.id);
      
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

    // Recent 5 events (sorted by event date descending - most recent/newest first)
    const recentEvents = [...processedEvents]
      .sort((a, b) => {
        const aDate = a.all_dates[0] || "";
        const bDate = b.all_dates[0] || "";
        return bDate.localeCompare(aDate);
      })
      .slice(0, 5);

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
    console.error("Dashboard error:", err);
    return NextResponse.json({
      total_clients:      0,
      total_events:       0,
      total_team_members: 0,
      total_revenue:      0,
      total_collected:    0,
      client_balance:     0,
      total_expenses:     0,
      total_artist_expenses: 0,
      total_output_expenses: 0,
      paid_to_team:       0,
      team_balance:       0,
      total_savings:      0,
      recent_events:      [],
      upcoming_events:    [],
    });
  }
}
