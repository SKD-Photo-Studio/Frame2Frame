import { Router, Request, Response } from 'express';
import { supabase, getDefaultTenantId } from '../DB/supabase';

const router = Router();

// ── GET / — Dashboard summary ─────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
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
      supabase.from('clients_master').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('events_master').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('workspace_memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('role', 'MEMBER').eq('is_active', true),
      supabase.from('events_master').select('id, display_id, event_type, package_value, event_dates, clients_master(client_name)').eq('tenant_id', tenantId).eq('is_active', true).order('display_id', { ascending: false }),
      supabase.from('artist_expenses').select('event_id, total_amount, advance_paid').eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('output_expenses').select('event_id, total_amount, advance_paid').eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('client_payments').select('event_id, amount').eq('tenant_id', tenantId).eq('is_active', true),
    ]);

    // ── Financial aggregates ──────────────────────────────────────────────────
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

    // ── Recent 5 events ───────────────────────────────────────────────────────
    const recentEvents = (events ?? []).slice(0, 5).map((e) => {
      const collected = paymentsByEvent[e.id] ?? 0;
      const artistTotal = artistExpByEvent[e.id] ?? 0;
      const outputTotal = outputExpByEvent[e.id] ?? 0;
      const totalExpenses = artistTotal + outputTotal;

      const dateString = (e.event_dates as string[] ?? [])
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
        clients_master:  undefined,
      };
    });

    // ── Upcoming 5 event dates ─────────────────────────────────────────────────
    type UpcomingDate = { date: string; event_id: string; event_type: string; display_id: string; client_name: string };
    const upcomingDates: UpcomingDate[] = [];

    (events ?? []).forEach((e) => {
      (e.event_dates as string[] ?? []).forEach((d) => {
        if (d >= today) {
          upcomingDates.push({
            date:        d,
            event_id:    e.id,
            event_type:  e.event_type,
            display_id:  e.display_id,
            client_name: (e.clients_master as any)?.client_name ?? 'Unknown',
          });
        }
      });
    });

    upcomingDates.sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      total_clients:      totalClients ?? 0,
      total_events:       totalEvents ?? 0,
      total_team_members: totalTeamMembers ?? 0,
      total_revenue:      totalRevenue,
      total_collected:    totalCollected,
      total_pending:      totalRevenue - totalCollected,
      total_expenses:     totalExpenses,
      total_artist_expenses: totalArtistExp,
      total_output_expenses: totalOutputExp,
      paid_to_team:       totalExpPaid,
      yet_to_pay_team:    totalExpenses - totalExpPaid,
      total_savings:      totalRevenue - totalExpenses,
      recent_events:      recentEvents,
      upcoming_dates:     upcomingDates.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
