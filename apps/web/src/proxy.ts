import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer the new publishable key (`sb_publishable_...`); fall back to the
// legacy anon JWT for older local stacks.
const publishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

// Next.js 16 renamed the middleware boundary to `proxy.ts`.
// Refreshes the Supabase session cookie on every request and optimistically
// gates /admin + /api/admin. Authoritative role checks happen in the /admin
// layout and the API handlers (which read the DB).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Apply cache headers (Cache-Control/Expires/Pragma) so CDNs never
        // cache a refreshed-session response and leak it to another user.
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        }
      },
    },
  });

  // getClaims() verifies the JWT signature and refreshes the token if needed.
  const { data: claims } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isProtected && !claims) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
