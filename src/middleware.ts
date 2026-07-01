import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const requestUrl = new URL(context.request.url);
  const rawPath = requestUrl.pathname;

  // Serve OAuth Protected Resource Metadata
  if (rawPath.startsWith("/.well-known/oauth-protected-resource")) {
    const metadata = {
      resource: `${requestUrl.origin}/api/mcp`,
      authorization_servers: [`${import.meta.env.PUBLIC_SUPABASE_URL}/auth/v1`],
      scopes_supported: ["openid", "email"],
    };
    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // API routes handle their own auth
  if (rawPath.startsWith("/api/")) {
    return next();
  }

  // OAuth routes need server-side auth protection
  if (rawPath.startsWith("/oauth/")) {
    const supabase = createSupabaseServerClient({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    context.locals.user = user;

    if (!user) {
      const returnTo = requestUrl.pathname + requestUrl.search;
      return context.redirect(
        `/login?returnTo=${encodeURIComponent(returnTo)}`
      );
    }

    return next();
  }

  // Everything else: serve the SPA shell (auth handled client-side by TanStack Router)
  return next();
});
