import { Router, Request, Response } from 'express';
import { supabase, getDefaultTenantId } from '../DB/supabase';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim() === '') {
      return res.json({ clients: [], events: [], team: [] });
    }

    const tenantId = await getDefaultTenantId();
    const searchTerm = `%${q}%`;

    // 1. Clients
    const clientsPromise = supabase
      .from('clients_master')
      .select('id, display_id, client_name, email, phone_number')
      .eq('tenant_id', tenantId)
      .ilike('client_name', searchTerm)
      .limit(5);

    // 2. Events (event_type or client_name match)
    // To search joined table, we use Supabase's embedded filter syntax
    // It's a bit tricky with OR across tables in PostgREST, so we'll fetch both matches
    const eventsPromise = supabase
      .from('events_master')
      .select('id, display_id, event_type, clients_master!inner(client_name)')
      .eq('tenant_id', tenantId);

    // 3. Team
    const memberships = await supabase
      .from('workspace_memberships')
      .select('user_id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);
    
    const userIds = memberships.data?.map(m => m.user_id) || [];

    let teamPromise = null;
    if (userIds.length > 0) {
      teamPromise = supabase
        .from('users')
        .select('id, display_id, full_name, usual_role')
        .in('id', userIds)
        .ilike('full_name', searchTerm)
        .limit(5);
    }

    const [clientsRes, eventsRes, teamRes] = await Promise.all([
      clientsPromise,
      eventsPromise,
      teamPromise ? teamPromise : Promise.resolve({ data: [] })
    ]);

    // For events, we do manual filtering if postgREST complex OR fails, 
    // but we can just filter in memory for this limit since events aren't millions yet.
    // However, it's better to let DB do it. Let's do memory filter for simplicity and robustness on joined OR.
    const allEvents = eventsRes.data || [];
    const matchedEvents = allEvents.filter(e => {
        const cName = (e.clients_master as any)?.client_name || '';
        return (e.event_type || '').toLowerCase().includes(q.toLowerCase()) || 
               cName.toLowerCase().includes(q.toLowerCase());
    }).slice(0, 5).map(e => ({
        id: e.id,
        display_id: e.display_id,
        event_type: e.event_type,
        client_name: (e.clients_master as any)?.client_name || ''
    }));

    res.json({
      clients: clientsRes.data || [],
      events: matchedEvents,
      team: teamRes?.data || []
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
