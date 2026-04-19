import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
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
// MVP: single-tenant (SKD Studios). Cached after first call.
let _cachedTenantId: string | null = null;

export async function getDefaultTenantId(): Promise<string> {
  if (_cachedTenantId) return _cachedTenantId;

  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('company_name', 'SKD Studios')
    .single();

  if (error || !data) {
    throw new Error(
      'SKD Studios tenant not found in DB. Run the seed script first: npx ts-node src/scripts/seed.ts'
    );
  }

  _cachedTenantId = data.id;
  return _cachedTenantId as string;
}
