import { createClient as createSupabaseJSClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PRIVATE_SUPABASE_SECRET_KEY');
}

export const supabaseAdmin = createSupabaseJSClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const getSession = cache(async () => {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.getSession();
});

export const getUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.getUser();
});

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}

/**
 * Gets the active tenant ID for the current request.
 * 
 * TODO: For multi-tenant scaling, this should be refactored to look up the tenant 
 * based on the hostname or the user's specific session/workspace_id.
 * 
 * For the initial launch (Single Studio), it defaults to the primary tenant in the DB.
 */
export async function getDefaultTenantId(providedId?: string) {
  if (providedId) return providedId;

  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('No tenant found in the database. Ensure the primary studio record exists.');
  }

  return data.id;
}
