import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

const PUBLIC_PATHS = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const requestUrl = new URL(context.request.url);
  const rawPath = requestUrl.pathname;

  // Handle OAuth Protected Resource Metadata before anything else.
  // Astro may not route dot-prefixed directories, so we intercept here.
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

  const supabase = createSupabaseServerClient({
    headers: context.request.headers,
    cookies: context.cookies,
  });

  // Refresh session — this is required by @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  // Normalize trailing slashes so "/login/" matches "/login"
  const path = rawPath === "/" ? rawPath : rawPath.replace(/\/+$/, "");
  const isPublicPath =
    PUBLIC_PATHS.some((p) => path === p) || path.startsWith("/api/");

  if (!user && !isPublicPath) {
    const returnTo = requestUrl.pathname + requestUrl.search;
    return context.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (user && path === "/login") {
    return context.redirect("/");
  }

  return next();
});
