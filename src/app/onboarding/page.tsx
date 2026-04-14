import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThesisOnboardingForm } from "@/features/auth/components/thesis-onboarding-form";
import { getCurrentUser } from "@/lib/auth";
import { SECTORS } from "@/lib/constants";
import { loadDashboardData } from "@/lib/data";
import { ThesisProfile } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { thesis, usage } = await loadDashboardData();

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
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Investment thesis</CardTitle>
            <CardDescription>
              Your thesis shapes thesis-fit scoring for every deal you analyze. Keep it
              current as your strategy evolves.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThesisOnboardingForm sectors={[...SECTORS]} initialThesis={initialThesis} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
