import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThesisOnboardingForm } from "@/features/auth/components/thesis-onboarding-form";
import { THESIS_SECTORS } from "@/lib/constants";

export default function OnboardingPage() {
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
