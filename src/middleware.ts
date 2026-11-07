import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { dbOptions, noStoreFetch } from "@/lib/supabase/fetch";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "samsul261103@gmail.com").toLowerCase();

/**
 * Refreshes the Supabase session cookie and gates every /admin route.
 * The admin layout performs the same check server-side — this is the first
 * line of defence, never the only one.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: dbOptions,
        global: { fetch: noStoreFetch },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL);

    if (!isLoginRoute && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (isLoginRoute && isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  } catch {
    // Network or auth failure: fall back to the login page rather than
    // exposing any admin surface. The admin layout re-verifies as well.
    if (!isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
