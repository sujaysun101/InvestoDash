import { redirect } from "next/navigation";

import { LandingPage } from "@/features/marketing/components/landing-page";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/auth/post-login");
  }

  return <LandingPage />;
}
