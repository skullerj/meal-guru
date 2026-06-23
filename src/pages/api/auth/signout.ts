export const prerender = false;

import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async (context) => {
  const supabase = createSupabaseServerClient({
    headers: context.request.headers,
    cookies: context.cookies,
  });

  await supabase.auth.signOut();

  return context.redirect("/login");
};
