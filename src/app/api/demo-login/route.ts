import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.ENABLE_INTERNAL_DEMO !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const demoEmail = process.env.INTERNAL_DEMO_EMAIL;
  const demoPassword = process.env.INTERNAL_DEMO_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!demoEmail || !demoPassword || !url || !anonKey) {
    return NextResponse.json({ error: "Demo login is misconfigured." }, { status: 500 });
  }

  const response = NextResponse.json({
    redirectTo: "/auth/post-login",
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get() {
        return undefined;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
