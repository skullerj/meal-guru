import type { APIContext } from "astro";
import { supabase } from "./supabase";

export async function getUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  return user;
}

export async function getUserFromCookies(cookies: APIContext["cookies"]) {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error) {
    if (refreshToken) {
      const { data, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError || !data.session) return null;

      return data.user;
    }
    return null;
  }

  return user;
}

export function setAuthCookies(
  cookies: APIContext["cookies"],
  session: { access_token: string; refresh_token: string }
) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  cookies.set("sb-access-token", session.access_token, {
    path: "/",
    maxAge,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  cookies.set("sb-refresh-token", session.refresh_token, {
    path: "/",
    maxAge,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

export function clearAuthCookies(cookies: APIContext["cookies"]) {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
}
