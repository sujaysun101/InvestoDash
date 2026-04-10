import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { LandingPage } from "@/features/marketing/components/landing-page";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/auth/post-login");
  }

  return <LandingPage />;
}
