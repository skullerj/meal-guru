import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

const PUBLIC_PATHS = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient({
    headers: context.request.headers,
    cookies: context.cookies,
  });

  // Refresh session — this is required by @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  const rawPath = new URL(context.request.url).pathname;
  // Normalize trailing slashes so "/login/" matches "/login"
  const path = rawPath === "/" ? rawPath : rawPath.replace(/\/+$/, "");
  const isPublicPath =
    PUBLIC_PATHS.some((p) => path === p) || path.startsWith("/api/");

  if (!user && !isPublicPath) {
    return context.redirect("/login");
  }

  if (user && path === "/login") {
    return context.redirect("/");
  }

  return next();
});
