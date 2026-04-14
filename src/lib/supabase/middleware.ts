import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEMO_COOKIE_NAME, hasDemoCookie } from "@/lib/demo-auth";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const hasDemoSession = hasDemoCookie(request.cookies.get(DEMO_COOKIE_NAME)?.value);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const isProtectedPath =
      request.nextUrl.pathname.startsWith("/pipeline") ||
      request.nextUrl.pathname.startsWith("/compare") ||
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/deals") ||
      request.nextUrl.pathname.startsWith("/onboarding");

    const isAuthPage = request.nextUrl.pathname.startsWith("/login");

    if (isProtectedPath && !hasDemoSession) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthPage && hasDemoSession) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/post-login";
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedPath =
    request.nextUrl.pathname.startsWith("/pipeline") ||
    request.nextUrl.pathname.startsWith("/compare") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/deals") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (isProtectedPath && !user && !hasDemoSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && (user || hasDemoSession)) {
    const redirectUrl = request.nextUrl.clone();
    // Go through /auth/post-login so onboarding is applied for new users.
    redirectUrl.pathname = "/auth/post-login";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
