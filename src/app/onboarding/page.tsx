import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThesisOnboardingForm } from "@/features/auth/components/thesis-onboarding-form";
import { requireUser } from "@/lib/auth";
import { SECTORS } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ThesisProfile } from "@/lib/types";

export default async function OnboardingPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createServerSupabaseClient();
  let initialThesis: ThesisProfile | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("thesis")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      initialThesis = {
        sectors: (data as { sectors: string[] }).sectors ?? [],
        check_size_range:
          (data as { check_size_range?: string }).check_size_range ?? "",
        target_stage: (data as { target_stage?: string[] }).target_stage ?? [],
        geography_preference:
          (data as { geography_preference?: string }).geography_preference ?? "",
        custom_note: (data as { custom_note?: string | null }).custom_note ?? "",
      };
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
          <ThesisOnboardingForm sectors={[...SECTORS]} initialThesis={initialThesis} />
        </CardContent>
      </Card>
    </main>
  );
}
