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

    // 1. Clients (Optimized)
    const clientsPromise = supabase
      .from('clients_master')
      .select('id, display_id, client_name, email, phone_number')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .ilike('client_name', searchTerm)
      .limit(5);

    // 2. Events (Database-level filtering on event_type or joined client_name)
    // Note: PostgREST 9+ supports or across joined tables with !inner
    const eventsPromise = supabase
      .from('events_master')
      .select('id, display_id, event_type, clients_master!inner(client_name)')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .or(`event_type.ilike.${searchTerm},clients_master.client_name.ilike.${searchTerm}`)
      .limit(5);

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

    const formattedEvents = (eventsRes.data || []).map(e => ({
        id: e.id,
        display_id: e.display_id,
        event_type: e.event_type,
        client_name: (e.clients_master as any)?.client_name || ''
    }));

    res.json({
      clients: clientsRes.data || [],
      events: formattedEvents,
      team: teamRes?.data || []
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
