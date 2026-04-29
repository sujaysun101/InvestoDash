import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThesisOnboardingForm } from "@/features/auth/components/thesis-onboarding-form";
import { THESIS_SECTORS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { DEMO_COOKIE_NAME, hasDemoCookie } from "@/lib/demo-auth";
import { THESIS_PROFILE_COOKIE, parseThesisProfileCookie } from "@/lib/thesis-cookie";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = cookies();
  if (
    hasDemoCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value) &&
    parseThesisProfileCookie(cookieStore.get(THESIS_PROFILE_COOKIE)?.value)
  ) {
    redirect("/pipeline");
  }

  const supabase = createServerSupabaseClient();

  if (supabase) {
    const { data: existingThesis } = await supabase
      .from("thesis")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingThesis) {
      redirect("/pipeline");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Complete your investment thesis</CardTitle>
          <CardDescription>
            This profile shapes thesis-fit scoring for every new deal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThesisOnboardingForm sectors={THESIS_SECTORS} />
        </CardContent>
      </Card>
    </main>
  );
}
