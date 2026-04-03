import { redirect } from "next/navigation";

import { AuthSessionRedirect } from "@/features/auth/components/auth-session-redirect";
import { LandingPage } from "@/features/marketing/components/landing-page";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const code =
    typeof searchParams?.code === "string" ? searchParams.code : undefined;
  const next =
    typeof searchParams?.next === "string"
      ? searchParams.next
      : "/auth/post-login";

  if (code) {
    const callbackParams = new URLSearchParams({
      code,
      next,
    });

    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  const user = await getCurrentUser();

  if (user) {
    redirect("/auth/post-login");
  }

  return (
    <>
      <AuthSessionRedirect />
      <LandingPage />
    </>
  );
}
