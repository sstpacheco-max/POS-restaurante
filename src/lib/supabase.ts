import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Wrapper for tenant-specific queries
export const getTenantQuery = (tenantId: string) => {
  return function<T>(query: (sb: typeof supabase) => T): T {
     // Currently Supabase RLS handles this primarily based on the logged-in user, 
     // but we can pass tenant_id explicitly if needed for certain admin queries.
     // By default, the JWT token from Auth will dictate the tenant_id through RLS.
     return query(supabase);
  }
}
