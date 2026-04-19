import { supabase } from './src/DB/supabase';

async function deleteEvent() {
    const id = 'e982a8d9-1bb1-4b0f-b76f-d54a54af9e4a';
    try {
        const { data, error } = await supabase
            .from('events_master')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting event:', error);
            return;
        }

        console.log('Successfully soft-deleted event:', id);
    } catch (err) {
        console.error('Catch error:', err);
    }
}

deleteEvent();
