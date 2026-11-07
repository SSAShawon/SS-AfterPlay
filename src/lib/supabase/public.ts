import { createClient } from "@supabase/supabase-js";

import { dbOptions, noStoreFetch } from "./fetch";

/**
 * Anonymous, cookie-free Supabase client used by public pages.
 * Everything it can read is constrained by the "public read" RLS policies.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      db: dbOptions,
      global: {
        fetch: noStoreFetch,
      },
    },
  );
}
