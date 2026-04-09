import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string | null;
}

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  } satisfies AuthUser;
}

export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();

  if (!user) {
    if (redirectTo !== "/auth/post-login") {
      redirect(redirectTo);
    }

    return null;
  }

  return user;
}
