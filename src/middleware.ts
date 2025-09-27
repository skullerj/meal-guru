import { defineMiddleware } from "astro:middleware";
import { getUserFromCookies } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Allow access to signin page, logout page, and auth API routes
  if (
    url.pathname === "/signin" ||
    url.pathname === "/logout" ||
    url.pathname.startsWith("/api/auth/")
  ) {
    return next();
  }

  // Check if user is authenticated
  const user = await getUserFromCookies(cookies);

  if (!user) {
    return redirect("/signin");
  }

  // User is authenticated, allow access
  return next();
});
