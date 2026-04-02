import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  DEMO_COOKIE_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  hasDemoCookie,
} from "@/lib/demo-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string | null;
  isDemo?: boolean;
}

export async function getCurrentUser() {
  const cookieStore = cookies();

  if (hasDemoCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value)) {
    return {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      isDemo: true,
    } satisfies AuthUser;
  }

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
