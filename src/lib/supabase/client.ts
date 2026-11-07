import { createBrowserClient } from "@supabase/ssr";

import { dbOptions, supabaseFetch } from "./fetch";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: dbOptions, global: { fetch: supabaseFetch } },
  );
}
