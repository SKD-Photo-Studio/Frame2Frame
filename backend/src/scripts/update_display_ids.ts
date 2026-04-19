import { supabase } from '../DB/supabase';

async function updateIds() {
  const { data: events } = await supabase.from('events_master').select('id, event_type, clients_master(client_name)');
  if (!events) return;
  for (const e of events) {
    const cname = (e.clients_master as any)?.client_name || 'Unknown';
    const newId = `${cname} | ${e.event_type}`.trim();
    await supabase.from('events_master').update({ display_id: newId }).eq('id', e.id);
  }
}
updateIds();
