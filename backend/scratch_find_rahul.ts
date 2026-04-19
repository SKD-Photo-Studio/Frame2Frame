import { supabase, getDefaultTenantId } from './src/DB/supabase';

async function findEvents() {
    try {
        const tenantId = await getDefaultTenantId();
        const { data, error } = await supabase
            .from('events_master')
            .select('*, clients_master(client_name), client_payments(amount), artist_expenses(total_amount), output_expenses(total_amount)')
            .eq('tenant_id', tenantId)
            .eq('is_active', true);
        
        if (error) {
            console.error('Error fetching events:', error);
            return;
        }

        const rahulEvents = data.filter(e => 
            (e.clients_master?.client_name || '').toLowerCase().includes('rahul') ||
            (e.display_id || '').toLowerCase().includes('rahul')
        );

        const summary = rahulEvents.map(e => ({
            id: e.id,
            display_id: e.display_id,
            venue: e.venue,
            dates: e.event_dates,
            payments_count: e.client_payments?.length || 0,
            artist_expenses_count: e.artist_expenses?.length || 0,
            output_expenses_count: e.output_expenses?.length || 0
        }));

        console.log(JSON.stringify(summary, null, 2));
    } catch (err) {
        console.error('Catch error:', err);
    }
}

findEvents();
