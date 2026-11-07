import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware server client. Uses the publishable/anon key plus the
 * administrator's auth cookie, so every statement is still governed by RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render — safe to ignore because
            // middleware refreshes the session cookie.
          }
        },
      },
    },
  );
}

/** Cookie-free client for public, cacheable reads. */
export { createPublicClient } from "./public";
