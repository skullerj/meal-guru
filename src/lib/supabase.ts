import {
  createServerClient as createSSRServerClient,
  parseCookieHeader,
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

// Server client for Astro middleware/pages/API routes (auth-aware, uses request cookies)
export function createSupabaseServerClient(context: {
  headers: Headers;
  cookies: AstroCookies;
}) {
  return createSSRServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get("Cookie") ?? "").filter(
            (c): c is { name: string; value: string } => c.value !== undefined
          );
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            context.cookies.set(name, value, options);
          }
        },
      },
    }
  );
}

// Service role client for admin operations (bypasses RLS)
export function createServiceRoleClient() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
