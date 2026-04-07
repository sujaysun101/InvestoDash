import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string | null;
}

/**
 * Returns the currently authenticated user, or null if not signed in.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress ?? null,
  };
}

/**
 * Returns the current user or redirects. Always returns a non-null AuthUser.
 */
export async function requireUser(redirectTo = "/login"): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
