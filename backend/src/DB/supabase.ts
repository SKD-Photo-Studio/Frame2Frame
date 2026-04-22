import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
}

/**
 * Service-role Supabase client.
 * Bypasses RLS — for backend use only. Never expose to the frontend.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Default Tenant Helper ────────────────────────────────────────────────────
// MVP: single-tenant (SKD Photo Studio). Cached after first call.
let _cachedTenantId: string | null = null;

export async function getDefaultTenantId(): Promise<string> {
  if (_cachedTenantId) return _cachedTenantId;

  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      'No tenant found in the database. Run the seed script first.'
    );
  }

  _cachedTenantId = data.id;
  return _cachedTenantId as string;
}
