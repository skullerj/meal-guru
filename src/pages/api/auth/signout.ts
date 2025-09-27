import type { APIRoute } from "astro";
import { clearAuthCookies, getUserFromCookies } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const user = await getUserFromCookies(cookies);

  if (user) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  clearAuthCookies(cookies);

  return redirect("/signin");
};
